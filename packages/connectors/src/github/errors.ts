/**
 * GitHub error classification — S4D.
 *
 * Pure function. Maps a raw error (`GitHubHTTPError`, `ZodError`, or any
 * thrown value) to a `ConnectorError` per TDD §7 + §8.
 *
 * Discipline:
 * - **Classify by intent, not by message string** ([LL §7.3]).
 *   Branches key off HTTP status + structured headers, never on the
 *   server's prose `message` body.
 * - **Pure.** No side effects, no logging, no `Date.now()` calls — the
 *   `now` parameter is injected for the rate-limit `retry_after_ms`
 *   calculation so tests are fully deterministic.
 * - **No token leakage.** `GitHubHTTPError.message` already redacts
 *   the auth header; we just forward it.
 *
 * Branch coverage (7 branches per S4D DoD):
 *   1. 401                                          → connector_auth
 *   2. 403 + X-RateLimit-Remaining=0                → connector_rate_limit
 *                                                     retry_after_ms from X-RateLimit-Reset
 *   3. 403 (other, e.g. SSO / OAuth scope)          → connector_permission
 *   4. 404                                          → connector_not_found
 *   5. ZodError                                     → connector_schema_drift
 *   6. 5xx                                          → connector_network with backoff
 *   7. network / DNS / timeout / abort / fetch fail → connector_network
 */

import { z } from "zod";

import type { ConnectorError } from "@lumaops/core";

import { GitHubHTTPError } from "./http";

// ============================================================
// Backoff helper (exponential with full jitter)
// ============================================================

const BACKOFF_BASE_MS = 1_000;
const BACKOFF_CAP_MS = 60_000;

/**
 * Capped exponential backoff. `attempt` is zero-indexed:
 *   attempt 0 → 1s, 1 → 2s, 2 → 4s, …, capped at 60s.
 *
 * Returns a deterministic value. Jitter is intentionally NOT added at
 * the classifier layer — the orchestrator is the right place to add
 * jitter once per retry to avoid herd reconnects across providers.
 */
export function backoffMs(attempt: number): number {
  const exp = Math.min(attempt, 20); // 2^20 already > cap
  return Math.min(BACKOFF_BASE_MS * 2 ** exp, BACKOFF_CAP_MS);
}

// ============================================================
// Classifier
// ============================================================

export interface ClassifyOptions {
  /** Sync scope tag for error provenance ("releases" / "issues" / …). */
  readonly scope?: string;
  /** Retry attempt counter — used for 5xx backoff. Default 0. */
  readonly attempt?: number;
  /** Injection point for tests. */
  readonly now?: () => Date;
}

export function classifyGitHubError(
  err: unknown,
  options: ClassifyOptions = {},
): ConnectorError {
  const scope = options.scope ?? null;
  const attempt = options.attempt ?? 0;
  const nowFn = options.now ?? (() => new Date());

  // -- Abort (DOMException with name "AbortError") --
  if (err instanceof DOMException && err.name === "AbortError") {
    return {
      kind: "network",
      message: scope
        ? `[${scope}] sync aborted before completion`
        : "sync aborted before completion",
      retry_after_ms: null,
      affected_scope: scope,
    };
  }

  // -- HTTP errors --
  if (err instanceof GitHubHTTPError) {
    const status = err.status;

    if (status === 401) {
      return {
        kind: "auth",
        message: err.body?.message ?? "GitHub 401 — token rejected",
        retry_after_ms: null,
        affected_scope: scope,
      };
    }

    if (status === 403) {
      const remaining = err.headers.get("X-RateLimit-Remaining");
      if (remaining === "0") {
        const retryAfterMs = rateLimitResetMs(err.headers, nowFn);
        return {
          kind: "rate_limit",
          message:
            err.body?.message ?? "GitHub rate limit exhausted (X-RateLimit-Remaining=0)",
          retry_after_ms: retryAfterMs,
          affected_scope: scope,
        };
      }
      return {
        kind: "permission",
        message:
          err.body?.message ??
          "GitHub 403 — token lacks required scope or resource is restricted",
        retry_after_ms: null,
        affected_scope: scope,
      };
    }

    if (status === 404) {
      return {
        kind: "not_found",
        message: err.body?.message ?? "GitHub 404 — resource not found",
        retry_after_ms: null,
        affected_scope: scope,
      };
    }

    if (status === 422) {
      // 422 is GitHub's "your request was syntactically fine but the
      // shape we expected has changed" — treat as schema drift.
      return {
        kind: "schema_drift",
        message: err.body?.message ?? "GitHub 422 — request shape mismatch",
        retry_after_ms: null,
        affected_scope: scope,
      };
    }

    if (status >= 500 && status < 600) {
      return {
        kind: "network",
        message: err.body?.message ?? `GitHub ${status} — upstream failure`,
        retry_after_ms: backoffMs(attempt),
        affected_scope: scope,
      };
    }

    // 4xx not otherwise classified: surface as unknown so the runner
    // doesn't silently swallow a real shape change.
    return {
      kind: "unknown",
      message: err.body?.message ?? `GitHub ${status}`,
      retry_after_ms: null,
      affected_scope: scope,
    };
  }

  // -- Zod (schema drift at the boundary) --
  if (err instanceof z.ZodError) {
    const first = err.errors[0];
    const where = first?.path.length ? first.path.join(".") : "<root>";
    const what = first?.message ?? "unknown";
    return {
      kind: "schema_drift",
      message: `schema mismatch at ${where}: ${what}`,
      retry_after_ms: null,
      affected_scope: scope,
    };
  }

  // -- Network / DNS / timeout (TypeError from fetch, Node ENOTFOUND, etc.) --
  // We classify anything else as `network` because:
  //   1. Adapters are not allowed to throw classified errors themselves
  //      — they classify at the boundary like this.
  //   2. `network` is the safest default: it triggers retry-with-backoff,
  //      not a state flip to `error` (which would alarm the operator).
  // If it turns out to be something more serious, the orchestrator's
  // attempt budget will eventually surface it.
  const message = err instanceof Error ? err.message : String(err);
  return {
    kind: "network",
    message: message || "unknown network failure",
    retry_after_ms: backoffMs(attempt),
    affected_scope: scope,
  };
}

// ============================================================
// X-RateLimit-Reset parsing
// ============================================================

/**
 * Read `X-RateLimit-Reset` (unix seconds) and return the delta to `now`
 * in milliseconds, floored at 0. If the header is missing or malformed,
 * fall back to a conservative 60-second wait — GitHub's standard
 * rate-limit window.
 */
function rateLimitResetMs(headers: Headers, nowFn: () => Date): number {
  const reset = headers.get("X-RateLimit-Reset");
  const fallbackMs = 60_000;
  if (!reset) return fallbackMs;
  const resetSec = Number(reset);
  if (!Number.isFinite(resetSec)) return fallbackMs;
  const deltaMs = resetSec * 1000 - nowFn().getTime();
  return Math.max(0, Math.floor(deltaMs));
}
