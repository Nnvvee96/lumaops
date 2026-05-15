/**
 * Freshness taxonomy — TDD §5.2 locked.
 *
 * Every value rendered on screen carries a Freshness. The UI components
 * for metric / source-label / freshness-badge accept these shapes and
 * refuse to render without one. Honest data labels are a non-negotiable
 * (CONCEPT §18.2 Promise #4, [LL §8.4]).
 */

/** A value LumaOps actually observed from a source at a point in time. */
export interface FreshnessObserved {
  readonly kind: "observed";
  readonly last_observed_at: Date;
  readonly source_id: string;
}

/** A value computed from other observed values. */
export interface FreshnessDerived {
  readonly kind: "derived";
  readonly last_observed_at: Date;
  readonly source_id: string;
  readonly derivation: string;
}

/** A value guessed from heuristics. Confidence ∈ [0, 1]. */
export interface FreshnessInferred {
  readonly kind: "inferred";
  readonly last_observed_at: Date;
  readonly source_id: string;
  readonly confidence: number;
}

/** A value that was observed/derived/inferred but is now older than the freshness threshold. */
export interface FreshnessStale {
  readonly kind: "stale";
  readonly last_observed_at: Date;
  readonly threshold_seconds: number;
  readonly actual_age_seconds: number;
}

/** No value yet — surface this honestly instead of faking a zero. */
export interface FreshnessMissing {
  readonly kind: "missing";
  readonly reason: "no_integration" | "integration_not_connected" | "no_data_yet";
}

/** Dev/demo-only mock value. Never permitted in production at runtime. */
export interface FreshnessMock {
  readonly kind: "mock";
  readonly until: Date;
}

export type Freshness =
  | FreshnessObserved
  | FreshnessDerived
  | FreshnessInferred
  | FreshnessStale
  | FreshnessMissing
  | FreshnessMock;

export type FreshnessKind = Freshness["kind"];

// ============================================================
// Input shape — what the calculator accepts.
// ============================================================

/**
 * "Live" inputs carry a threshold and may auto-flip to `stale` when
 * `last_observed_at + threshold_seconds < now()`.
 */
export type FreshnessLiveInput =
  | {
      readonly kind: "observe";
      readonly last_observed_at: Date;
      readonly source_id: string;
      readonly threshold_seconds: number;
    }
  | {
      readonly kind: "derive";
      readonly last_observed_at: Date;
      readonly source_id: string;
      readonly derivation: string;
      readonly threshold_seconds: number;
    }
  | {
      readonly kind: "infer";
      readonly last_observed_at: Date;
      readonly source_id: string;
      readonly confidence: number;
      readonly threshold_seconds: number;
    };

/** Inputs that bypass the stale check entirely. */
export type FreshnessTerminalInput =
  | { readonly kind: "missing"; readonly reason: FreshnessMissing["reason"] }
  | { readonly kind: "mock"; readonly until: Date };

export type FreshnessInput = FreshnessLiveInput | FreshnessTerminalInput;
