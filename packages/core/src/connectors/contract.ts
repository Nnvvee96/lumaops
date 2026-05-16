/**
 * ConnectorAdapter contract — TDD §7 (locked spec).
 *
 * Every connector implementation (GitHub, Cloudflare, Stripe, custom
 * tracking, app telemetry, support) implements this interface.
 * Implementations live in `packages/connectors/<provider>/`. The
 * framework-level sync runner (Phase 4 S4E) consumes them
 * polymorphically.
 *
 * Cross-references:
 * - TDD §3.3 — integration row that stores config + state per adapter
 * - TDD §4   — event_name taxonomy that NormalizedEvent.event_name lives in
 * - TDD §6   — PII hashing rules adapters MUST honour before emitting events
 * - TDD §8   — error classification (`ErrorClass`) — adapters surface raw
 *              kinds via ConnectorError.kind which the runner maps to
 *              the framework ErrorClass.
 * - [LL §6.4] — sync must be cancellable; signal threaded through.
 * - [LL §7.3] — classify errors by intent, not by message string.
 * - [LL §8.1] / [LL §8.5] — variant is structural, not stylistic.
 */

import type { IntegrationProvider, EventSource } from "../db/schema";

// ============================================================
// Config (per-provider, opaque to the framework)
// ============================================================

/**
 * Provider-specific configuration. The integration table stores this
 * as jsonb. Each adapter parses it with a provider-local Zod schema
 * at the boundary before consuming it (per [LL §1.5] — physical
 * identity over implicit shape).
 */
export type ConnectorConfig = Record<string, unknown>;

// ============================================================
// validateCredentials
// ============================================================

export type CredentialValidation =
  | {
      readonly ok: true;
      readonly scopes: readonly string[];
      readonly fingerprint: string;
    }
  | {
      readonly ok: false;
      readonly reason:
        | "missing"
        | "invalid"
        | "insufficient_scope"
        | "revoked";
      readonly message: string;
    };

// ============================================================
// health
// ============================================================

export interface ConnectorHealth {
  readonly reachable: boolean;
  readonly latency_ms: number;
  readonly rate_limit_remaining: number | null;
  readonly rate_limit_reset_at: Date | null;
}

// ============================================================
// sync return shape
// ============================================================

export interface NormalizedEvent {
  readonly workspace_id: string;
  readonly product_id: string;
  readonly event_name: string;
  readonly occurred_at: Date;
  readonly source: EventSource;
  readonly source_event_id?: string;
  readonly anonymous_id?: string;
  /** Pre-hashed at the adapter boundary per TDD §6. */
  readonly user_identifier?: string;
  readonly session_id?: string;
  readonly properties: Readonly<Record<string, unknown>>;
}

export interface MetricSample {
  readonly metric_key: string;
  readonly value: number;
  readonly source_id: string;
  readonly observed_at: Date;
}

export type ConnectorErrorKind =
  | "auth"
  | "rate_limit"
  | "schema_drift"
  | "network"
  | "permission"
  | "not_found"
  | "unknown";

export interface ConnectorError {
  readonly kind: ConnectorErrorKind;
  readonly message: string;
  readonly retry_after_ms: number | null;
  readonly affected_scope: string | null;
}

export interface SyncResult {
  readonly events: readonly NormalizedEvent[];
  readonly metrics_pull: readonly MetricSample[];
  /** Cursor for the next sync — adapters must always return one. */
  readonly next_since: Date;
  readonly errors: readonly ConnectorError[];
}

// ============================================================
// capabilities
// ============================================================

export interface RateLimitWindow {
  readonly window: "hour" | "minute";
  readonly limit: number;
}

export interface ConnectorCapabilities {
  readonly supports_realtime: boolean;
  readonly supports_backfill: boolean;
  readonly required_scopes: readonly string[];
  readonly rate_limits: readonly RateLimitWindow[];
  /**
   * "local" — adapter executes on the operator's machine, data never
   * leaves the device. "hosted" — adapter calls a third-party API and
   * the payload is in transit. Operator UI surfaces this distinction
   * before any sync runs ([LL §8.1] structural, not soft flag).
   */
  readonly privacy_class: "local" | "hosted";
}

// ============================================================
// The adapter
// ============================================================

export interface ConnectorAdapter {
  readonly provider: IntegrationProvider;
  readonly variant: string;

  validateCredentials(config: ConnectorConfig): Promise<CredentialValidation>;

  health(
    config: ConnectorConfig,
    signal?: AbortSignal,
  ): Promise<ConnectorHealth>;

  sync(
    config: ConnectorConfig,
    since: Date,
    signal?: AbortSignal,
  ): Promise<SyncResult>;

  capabilities(): ConnectorCapabilities;
}
