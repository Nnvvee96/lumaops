/**
 * Framework sync runner — TDD §7 + IMPLEMENTATION_PLAN §S4E.
 *
 * Reads a pending/live/stale/error integration row, calls its adapter,
 * persists events under `ON CONFLICT DO NOTHING`, and transitions the
 * integration's `state` per the state machine.
 *
 * Discipline:
 * - **One shared abort token, threaded through every call** ([LL §6.4]).
 *   Caller passes `signal`; the runner does not create its own.
 * - **Single-flight per integration** is the caller's responsibility,
 *   not the runner's — the runner has no global state. The freshness
 *   scheduler enforces this via a per-id `inFlight: Set<string>`.
 * - **DB writes are last.** The adapter call happens first, then a
 *   single state-update + events-insert pair. If the runner crashes
 *   between adapter return and DB write, the next manual sync recovers.
 * - **Token injection happens here.** Adapters receive a config bag
 *   that includes the token; the bag does NOT persist back to DB
 *   (caller's responsibility to strip it before any logging).
 * - **`since` cursor** comes from `integration.last_sync_at`, with a
 *   far-past fallback for first-time syncs.
 */

import type { ConnectorAdapter, ConnectorError } from "../connectors/contract";
import type { Integration, IntegrationState } from "../db/schema";

import type { AdapterRegistry } from "./registry";
import { nextState, type SyncEvent } from "./state-machine";
import type { SyncStore, InsertEventsResult } from "./store";

// ============================================================
// Public API
// ============================================================

export interface RunSyncOptions {
  readonly registry: AdapterRegistry;
  readonly store: SyncStore;
  /**
   * Resolve the token for a given integration. Kept as a callback so
   * the runner never sees raw process.env — the caller can read
   * LUMAOPS_GITHUB_TOKEN (or future per-provider env vars) and return
   * the right secret. Returning null means "no credential available";
   * the runner then short-circuits to `error`.
   */
  readonly resolveToken: (integration: Integration) => string | null;
  readonly signal?: AbortSignal;
  readonly now?: () => Date;
}

export interface RunSyncResult {
  readonly ok: boolean;
  readonly state: IntegrationState;
  readonly events: InsertEventsResult;
  readonly adapterErrors: readonly ConnectorError[];
  /** Set when the runner itself failed (lookup, classification, abort). */
  readonly fatalError: string | null;
}

const FAR_PAST = new Date("2020-01-01T00:00:00Z");

export async function runSync(
  integrationId: string,
  options: RunSyncOptions,
): Promise<RunSyncResult> {
  const { registry, store, resolveToken, signal } = options;
  const nowFn = options.now ?? (() => new Date());

  const row = await store.loadIntegration(integrationId);
  if (!row) {
    return fatal("integration_not_found", `integration ${integrationId} not found`);
  }

  // 1) Validate transition pending/live/stale/error → syncing
  const startTransition = nextState(row.state, "sync_started");
  if (!startTransition.ok) {
    return fatal(
      "illegal_start",
      `cannot start sync from state '${row.state}' (${integrationId})`,
    );
  }

  const adapter = registry.get(row.provider, row.variant);
  if (!adapter) {
    await store.updateIntegrationState(integrationId, {
      state: "error",
      lastSyncError: `no adapter registered for ${row.provider}/${row.variant}`,
      lastSyncAt: nowFn(),
    });
    return fatal(
      "no_adapter",
      `no adapter registered for ${row.provider}/${row.variant}`,
    );
  }

  const token = resolveToken(row);
  if (!token) {
    await store.updateIntegrationState(integrationId, {
      state: "error",
      lastSyncError: `missing credential — set the provider's env var`,
      lastSyncAt: nowFn(),
    });
    return fatal("missing_credential", `missing credential for ${integrationId}`);
  }

  // 2) Flip to syncing BEFORE calling the adapter so the UI can
  //    observe the in-flight state via revalidation.
  await store.updateIntegrationState(integrationId, {
    state: startTransition.next,
  });

  const since = row.lastSyncAt ?? FAR_PAST;
  const productId = row.productId;
  if (!productId) {
    // Workspace-level integrations are spec'd but Phase 4 only
    // ships product-scoped GitHub rows. Surface honestly.
    await applyTerminal(store, integrationId, "sync_failed", row.state, nowFn, {
      message: "integration has no product_id — workspace-scope sync unsupported in S4E",
    });
    return fatal("no_product", "integration has no product_id");
  }

  // 3) Call the adapter. Token injected here; never persisted.
  const adapterConfig = {
    ...(row.config as Record<string, unknown>),
    workspace_id: row.workspaceId,
    product_id: productId,
    token,
  };

  let adapterResult: Awaited<ReturnType<ConnectorAdapter["sync"]>>;
  try {
    adapterResult = await adapter.sync(adapterConfig, since, signal);
  } catch (err) {
    if (signal?.aborted) {
      await applyTerminal(store, integrationId, "sync_aborted", row.state, nowFn, {
        message: "sync aborted",
      });
      return {
        ok: false,
        state: "pending",
        events: emptyInsert(),
        adapterErrors: [],
        fatalError: "aborted",
      };
    }
    // Unclassified throw — adapter contract says it shouldn't, but be
    // defensive. Map to a generic failure.
    const message = err instanceof Error ? err.message : String(err);
    await applyTerminal(store, integrationId, "sync_failed", row.state, nowFn, {
      message: `adapter threw: ${message}`,
    });
    return {
      ok: false,
      state: "error",
      events: emptyInsert(),
      adapterErrors: [],
      fatalError: message,
    };
  }

  // 4) Persist events. We insert even if errors[] is non-empty —
  //    partial success is normal (one source failed, others returned
  //    rows). The state still reflects the failure.
  const insertResult =
    adapterResult.events.length > 0
      ? await store.insertEvents(adapterResult.events)
      : emptyInsert();

  // 5) Decide terminal state. Non-empty errors → error; empty → live.
  //    Adapter-reported partial errors still flip to error because the
  //    operator needs to see *something*. If every source returned no
  //    events AND no errors, that's still live (clean sync, no new data).
  const finalEvent: SyncEvent =
    adapterResult.errors.length > 0 ? "sync_failed" : "sync_succeeded";
  const finalTransition = nextState("syncing", finalEvent);
  const finalState: IntegrationState = finalTransition.ok
    ? finalTransition.next
    : "error";

  const errorMessage =
    adapterResult.errors.length > 0
      ? summarizeErrors(adapterResult.errors)
      : null;

  await store.updateIntegrationState(integrationId, {
    state: finalState,
    lastSyncAt: adapterResult.next_since,
    lastSyncError: errorMessage,
  });

  return {
    ok: adapterResult.errors.length === 0,
    state: finalState,
    events: insertResult,
    adapterErrors: adapterResult.errors,
    fatalError: null,
  };
}

// ============================================================
// Helpers
// ============================================================

function fatal(code: string, message: string): RunSyncResult {
  return {
    ok: false,
    state: "error",
    events: emptyInsert(),
    adapterErrors: [],
    fatalError: `${code}: ${message}`,
  };
}

function emptyInsert(): InsertEventsResult {
  return { attempted: 0, inserted: 0, deduped: 0 };
}

async function applyTerminal(
  store: SyncStore,
  id: string,
  event: SyncEvent,
  preState: IntegrationState,
  nowFn: () => Date,
  ctx: { message: string },
): Promise<void> {
  const t = nextState("syncing", event);
  const fallback: IntegrationState = event === "sync_aborted" ? preState : "error";
  await store.updateIntegrationState(id, {
    state: t.ok ? t.next : fallback,
    lastSyncAt: nowFn(),
    lastSyncError: ctx.message,
  });
}

function summarizeErrors(errors: readonly ConnectorError[]): string {
  if (errors.length === 1) {
    const e = errors[0]!;
    return `${e.kind}${e.affected_scope ? ` (${e.affected_scope})` : ""}: ${e.message}`;
  }
  const kinds = new Set(errors.map((e) => e.kind));
  return `${errors.length} errors across ${[...kinds].join(", ")}`;
}
