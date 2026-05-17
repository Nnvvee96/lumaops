/**
 * Integration state machine — TDD §3.3 + plan §S4E.
 *
 * Pure function. Encodes the legal transitions of `integration.state`.
 * The runner consults this BEFORE writing any DB row so an illegal
 * transition fails loud at the boundary, not silently in the DB.
 *
 * States (from `IntegrationState` enum):
 *   pending   — credential present, never synced
 *   syncing   — sync currently in flight
 *   live      — last sync succeeded inside the freshness window
 *   stale     — last sync succeeded but freshness window expired
 *   error     — last sync failed (auth, rate limit, schema drift, …)
 *   planned   — placeholder; no credential yet (operator added the
 *               row but hasn't wired a token)
 *
 * Events:
 *   sync_started       — runner accepted the job and called the adapter
 *   sync_succeeded     — adapter returned (regardless of error count)
 *   sync_failed        — adapter threw / runner aborted with classified err
 *   sync_aborted       — operator cancelled the in-flight sync
 *   freshness_expired  — timer detected last_sync_at + threshold < now
 */

import type { IntegrationState } from "../db/schema";

export type SyncEvent =
  | "sync_started"
  | "sync_succeeded"
  | "sync_failed"
  | "sync_aborted"
  | "freshness_expired";

export interface IllegalTransitionError {
  readonly kind: "illegal_transition";
  readonly from: IntegrationState;
  readonly event: SyncEvent;
}

export type StateTransition =
  | { readonly ok: true; readonly next: IntegrationState }
  | { readonly ok: false; readonly error: IllegalTransitionError };

/**
 * Pure transition function. Defined per (state, event) cell — illegal
 * cells return `{ ok: false }` so the caller can decide whether to log,
 * throw, or no-op. Total over (state × event).
 */
export function nextState(
  current: IntegrationState,
  event: SyncEvent,
): StateTransition {
  switch (event) {
    case "sync_started":
      // Any state that has a credential can re-enter syncing. `planned`
      // means no credential yet — caller should reject before getting
      // here, but we encode it as illegal for safety.
      if (current === "planned") return illegal(current, event);
      return ok("syncing");

    case "sync_succeeded":
      // Only meaningful out of `syncing`. Re-entering live from live
      // would mask a runner bug.
      if (current !== "syncing") return illegal(current, event);
      return ok("live");

    case "sync_failed":
      if (current !== "syncing") return illegal(current, event);
      return ok("error");

    case "sync_aborted":
      // Operator cancelled — return to the pre-sync resting state. We
      // can't know what that was from `current` alone (it's now
      // "syncing"); the runner passes the pre-state via the row, so
      // here we fall back to `pending`. The runner overrides when it
      // has better information.
      if (current !== "syncing") return illegal(current, event);
      return ok("pending");

    case "freshness_expired":
      // Only `live` flips to `stale`. `error` and `pending` don't have
      // useful data to mark stale; `planned` has no credential.
      if (current === "live") return ok("stale");
      return illegal(current, event);
  }
}

function ok(next: IntegrationState): StateTransition {
  return { ok: true, next };
}

function illegal(
  from: IntegrationState,
  event: SyncEvent,
): StateTransition {
  return { ok: false, error: { kind: "illegal_transition", from, event } };
}
