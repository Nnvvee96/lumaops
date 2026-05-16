/**
 * GitHub ConnectorAdapter — S4A scaffold.
 *
 * Capabilities() is final (locked from TDD §7 + GitHub REST v3 rate
 * limits). validateCredentials, health, and sync are stubbed to throw
 * — they ship in S4B (auth/health) and S4C (sync).
 *
 * The factory returns a frozen object that satisfies ConnectorAdapter,
 * so the type signature is exercised at compile time today even
 * though the runtime calls land in the next slices.
 */

import type {
  ConnectorAdapter,
  ConnectorCapabilities,
  ConnectorConfig,
  ConnectorHealth,
  CredentialValidation,
  SyncResult,
} from "@lumaops/core";

import { GitHubConfigSchema } from "./schemas";

const CAPABILITIES: ConnectorCapabilities = {
  supports_realtime: false,
  supports_backfill: true,
  required_scopes: ["repo", "read:user"],
  rate_limits: [{ window: "hour", limit: 5000 }],
  // GitHub public API — payload leaves the device. "hosted" makes the
  // privacy class structural per [LL §8.1].
  privacy_class: "hosted",
};

const NOT_YET_IMPLEMENTED = (method: string): Error =>
  new Error(
    `[github] ${method}() not yet implemented — S4A scaffolds only the contract + capabilities + Zod schemas. ` +
      `auth/health ship in S4B; sync ships in S4C.`,
  );

export interface GitHubAdapterOptions {
  /**
   * Override fetch for tests / non-Node environments. Defaults to
   * globalThis.fetch which is available in Node 22 LTS and all
   * modern browsers / runtimes.
   */
  readonly fetch?: typeof globalThis.fetch;
}

export function createGitHubAdapter(
  _options: GitHubAdapterOptions = {},
): ConnectorAdapter {
  return Object.freeze({
    provider: "github" as const,
    variant: "public",

    async validateCredentials(
      _config: ConnectorConfig,
    ): Promise<CredentialValidation> {
      throw NOT_YET_IMPLEMENTED("validateCredentials");
    },

    async health(
      _config: ConnectorConfig,
      _signal?: AbortSignal,
    ): Promise<ConnectorHealth> {
      throw NOT_YET_IMPLEMENTED("health");
    },

    async sync(
      _config: ConnectorConfig,
      _since: Date,
      _signal?: AbortSignal,
    ): Promise<SyncResult> {
      throw NOT_YET_IMPLEMENTED("sync");
    },

    capabilities(): ConnectorCapabilities {
      return CAPABILITIES;
    },
  });
}

/**
 * Parse + validate a raw integration.config bag into a typed GitHubConfig.
 * Adapters MUST call this before consuming config (no-implicit-shape rule).
 * Throws if the config is malformed — caller catches and reports as
 * ConnectorError.kind="schema_drift" or "missing".
 */
export function parseGitHubConfig(raw: ConnectorConfig): {
  ok: true;
  config: ReturnType<typeof GitHubConfigSchema.parse>;
} | { ok: false; message: string } {
  const result = GitHubConfigSchema.safeParse(raw);
  if (result.success) return { ok: true, config: result.data };
  return {
    ok: false,
    message: `[github] integration config invalid: ${result.error.errors
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join("; ")}`,
  };
}
