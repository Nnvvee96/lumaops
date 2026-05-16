/**
 * GitHub ConnectorAdapter — S4B.
 *
 * validateCredentials and health now hit the real GitHub REST v3 API.
 * sync still throws "not yet implemented" — that lands in S4C.
 *
 * Token handling discipline ([LL §10.8]):
 * - Token never appears in any return value.
 * - Token never appears in any log line (caller's responsibility too).
 * - Only the fingerprint (sha256-prefix) leaves the adapter.
 */

import { createHash } from "node:crypto";

import type {
  ConnectorAdapter,
  ConnectorCapabilities,
  ConnectorConfig,
  ConnectorHealth,
  CredentialValidation,
  SyncResult,
} from "@lumaops/core";

import { apiGet, GitHubHTTPError } from "./http";
import {
  GitHubConfigSchema,
  GitHubRateLimitSchema,
  GitHubUserSchema,
} from "./schemas";
import { syncGitHub } from "./sync";

const CAPABILITIES: ConnectorCapabilities = {
  supports_realtime: false,
  supports_backfill: true,
  required_scopes: ["repo", "read:user"],
  rate_limits: [{ window: "hour", limit: 5000 }],
  privacy_class: "hosted",
};

const REQUIRED_SCOPES: readonly string[] = CAPABILITIES.required_scopes;

export interface GitHubAdapterOptions {
  /** Inject a fetch implementation — used in tests and non-Node runtimes. */
  readonly fetch?: typeof globalThis.fetch;
}

/**
 * The adapter expects config to be an object with at least:
 *   { owner_repo: string, token: string }
 * The framework reads `token` from env (LUMAOPS_GITHUB_TOKEN) and
 * merges it into the integration.config bag before calling. Storing
 * the token in DB is intentionally avoided — only the fingerprint
 * lands in `integration.credential_fingerprint`.
 */
type GitHubFullConfig = ConnectorConfig & { token?: unknown };

function extractToken(config: GitHubFullConfig): string | null {
  const t = config["token"];
  if (typeof t !== "string" || t.length === 0) return null;
  return t;
}

export function fingerprint(token: string): string {
  const hash = createHash("sha256").update(token).digest("hex").slice(0, 12);
  return `sha:${hash}`;
}

export function parseGitHubConfig(
  raw: ConnectorConfig,
): { ok: true; config: ReturnType<typeof GitHubConfigSchema.parse> } | { ok: false; message: string } {
  const result = GitHubConfigSchema.safeParse(raw);
  if (result.success) return { ok: true, config: result.data };
  return {
    ok: false,
    message: `[github] integration config invalid: ${result.error.errors
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join("; ")}`,
  };
}

export function createGitHubAdapter(
  options: GitHubAdapterOptions = {},
): ConnectorAdapter {
  const fetchImpl = options.fetch ?? globalThis.fetch;

  return Object.freeze({
    provider: "github" as const,
    variant: "public",

    async validateCredentials(
      config: ConnectorConfig,
    ): Promise<CredentialValidation> {
      const cfg = config as GitHubFullConfig;
      const token = extractToken(cfg);
      if (!token) {
        return {
          ok: false,
          reason: "missing",
          message:
            "No GitHub token provided. Set LUMAOPS_GITHUB_TOKEN in your .env.",
        };
      }

      try {
        const opts: { fetch?: typeof globalThis.fetch } = {};
        if (fetchImpl) opts.fetch = fetchImpl;
        const { headers } = await apiGet(
          "/user",
          token,
          GitHubUserSchema,
          opts,
        );

        const scopes = parseScopesHeader(headers.get("X-OAuth-Scopes"));
        const missing = REQUIRED_SCOPES.filter(
          (req) => !scopeSatisfied(scopes, req),
        );

        // Classic PATs expose X-OAuth-Scopes; fine-grained PATs return
        // an empty header. Only enforce the scope check when the
        // header actually says something.
        if (scopes.length > 0 && missing.length > 0) {
          return {
            ok: false,
            reason: "insufficient_scope",
            message: `Token is missing required scopes: ${missing.join(", ")}. Grant them in GitHub → Settings → Developer settings → Personal access tokens.`,
          };
        }

        return {
          ok: true,
          scopes,
          fingerprint: fingerprint(token),
        };
      } catch (err) {
        if (err instanceof GitHubHTTPError) {
          if (err.status === 401) {
            return {
              ok: false,
              reason: "invalid",
              message:
                err.body?.message ??
                "GitHub rejected the token (401 Unauthorized). The token may be expired or revoked.",
            };
          }
          if (err.status === 403) {
            const remaining = err.headers.get("X-RateLimit-Remaining");
            if (remaining === "0") {
              return {
                ok: false,
                reason: "invalid",
                message:
                  "Token validation hit the rate limit (X-RateLimit-Remaining=0). Wait for the reset and try again.",
              };
            }
            return {
              ok: false,
              reason: "insufficient_scope",
              message:
                err.body?.message ??
                "GitHub returned 403 Forbidden — token likely lacks required scopes.",
            };
          }
          if (err.status === 404) {
            return {
              ok: false,
              reason: "revoked",
              message:
                "GitHub returned 404 for /user — token may have been revoked at the GitHub side.",
            };
          }
          return {
            ok: false,
            reason: "invalid",
            message: `Unexpected GitHub response (${err.status}): ${err.message}`,
          };
        }
        return {
          ok: false,
          reason: "invalid",
          message: `Validation failed: ${(err as Error).message}`,
        };
      }
    },

    async health(
      config: ConnectorConfig,
      signal?: AbortSignal,
    ): Promise<ConnectorHealth> {
      const cfg = config as GitHubFullConfig;
      const token = extractToken(cfg) ?? undefined;
      try {
        const opts: { fetch?: typeof globalThis.fetch; signal?: AbortSignal } = {};
        if (fetchImpl) opts.fetch = fetchImpl;
        if (signal) opts.signal = signal;
        const { data, latencyMs } = await apiGet(
          "/rate_limit",
          token,
          GitHubRateLimitSchema,
          opts,
        );
        return {
          reachable: true,
          latency_ms: latencyMs,
          rate_limit_remaining: data.resources.core.remaining,
          rate_limit_reset_at: new Date(data.resources.core.reset * 1000),
        };
      } catch {
        return {
          reachable: false,
          latency_ms: 0,
          rate_limit_remaining: null,
          rate_limit_reset_at: null,
        };
      }
    },

    async sync(
      config: ConnectorConfig,
      since: Date,
      signal?: AbortSignal,
    ): Promise<SyncResult> {
      const syncOpts: {
        fetch?: typeof globalThis.fetch;
        signal?: AbortSignal;
      } = {};
      if (fetchImpl) syncOpts.fetch = fetchImpl;
      if (signal) syncOpts.signal = signal;
      return syncGitHub(config, since, syncOpts);
    },

    capabilities(): ConnectorCapabilities {
      return CAPABILITIES;
    },
  });
}

// ============================================================
// Scope-header parsing helpers
// ============================================================

function parseScopesHeader(value: string | null): readonly string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * GitHub scope check: a token with `repo` implicitly has the read
 * sub-scopes. We treat any scope matching `<required>` or starting
 * with `<required>:` as satisfying.
 */
function scopeSatisfied(
  granted: readonly string[],
  required: string,
): boolean {
  return granted.some((s) => s === required || s.startsWith(`${required}:`));
}
