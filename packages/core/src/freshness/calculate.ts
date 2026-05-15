/**
 * Pure freshness calculator. TDD §5.2.
 *
 * Compute-on-read. No scheduled job needed; the auto-flip from
 * observed/derived/inferred → stale happens whenever a metric is
 * read, by comparing last_observed_at + threshold_seconds against
 * `now`. Caller may pass an explicit `now` for testability.
 *
 * Production guard: passing `kind: "mock"` throws when
 * `process.env.NODE_ENV === "production"`. Mock freshness is for
 * dev/demo surfaces only — never let it leak to a deployed cockpit.
 */

import type {
  Freshness,
  FreshnessInput,
  FreshnessLiveInput,
} from "./types";

export interface CalculateOptions {
  /** Override "now" for tests; defaults to `new Date()`. */
  readonly now?: Date;
  /**
   * Override the production check (for unit-testing the guard itself
   * without setting NODE_ENV). Defaults to
   * `process.env.NODE_ENV === "production"`.
   */
  readonly isProduction?: boolean;
}

export function calculateFreshness(
  input: FreshnessInput,
  options: CalculateOptions = {},
): Freshness {
  const now = options.now ?? new Date();
  const isProd =
    options.isProduction ?? process.env["NODE_ENV"] === "production";

  switch (input.kind) {
    case "observe":
      return liveOrStale(input, now, {
        kind: "observed",
        last_observed_at: input.last_observed_at,
        source_id: input.source_id,
      });
    case "derive":
      return liveOrStale(input, now, {
        kind: "derived",
        last_observed_at: input.last_observed_at,
        source_id: input.source_id,
        derivation: input.derivation,
      });
    case "infer":
      return liveOrStale(input, now, {
        kind: "inferred",
        last_observed_at: input.last_observed_at,
        source_id: input.source_id,
        confidence: input.confidence,
      });
    case "missing":
      return { kind: "missing", reason: input.reason };
    case "mock":
      if (isProd) {
        throw new Error(
          `[freshness] mock kind is not permitted in production. ` +
            `This is a structural guard: any metric reaching this code path ` +
            `in a deployed cockpit means an upstream component leaked a ` +
            `dev-only value. Fix the source, not this guard.`,
        );
      }
      return { kind: "mock", until: input.until };
  }
}

/** Given a live input, return the live shape OR flip to `stale`. */
function liveOrStale(
  input: FreshnessLiveInput,
  now: Date,
  live: Freshness,
): Freshness {
  const ageMs = now.getTime() - input.last_observed_at.getTime();
  const ageSeconds = Math.floor(ageMs / 1000);
  if (ageSeconds <= input.threshold_seconds) {
    return live;
  }
  return {
    kind: "stale",
    last_observed_at: input.last_observed_at,
    threshold_seconds: input.threshold_seconds,
    actual_age_seconds: ageSeconds,
  };
}
