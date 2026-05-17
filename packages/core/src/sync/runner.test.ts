/**
 * S4E runner tests — exercise every branch with a fake store + fake
 * adapter, no Postgres in sight.
 */

import { describe, expect, it } from "vitest";

import type {
  ConnectorAdapter,
  ConnectorError,
  NormalizedEvent,
  SyncResult,
} from "../connectors/contract";
import type { Integration, IntegrationState } from "../db/schema";
import { MutableAdapterRegistry } from "./registry";
import { runSync } from "./runner";
import type {
  InsertEventsResult,
  IntegrationStatePatch,
  SyncStore,
} from "./store";

// ============================================================
// Test doubles
// ============================================================

const WORKSPACE_ID = "11111111-1111-1111-1111-111111111111";
const PRODUCT_ID = "22222222-2222-2222-2222-222222222222";
const INTEGRATION_ID = "33333333-3333-3333-3333-333333333333";

function makeIntegration(patch: Partial<Integration> = {}): Integration {
  return {
    id: INTEGRATION_ID,
    workspaceId: WORKSPACE_ID,
    productId: PRODUCT_ID,
    provider: "github",
    variant: "public",
    displayName: "NOESIS",
    state: "pending",
    credentialStatus: "present",
    credentialFingerprint: "sha:abc",
    scopes: ["repo", "read:user"],
    freshnessThresholdSeconds: 900,
    lastSyncAt: null,
    lastSyncError: null,
    config: { owner_repo: "Nnvvee96/NOESIS" },
    createdAt: new Date("2026-05-01T00:00:00Z"),
    updatedAt: new Date("2026-05-01T00:00:00Z"),
    ...patch,
  } as Integration;
}

interface FakeStoreState {
  rows: Map<string, Integration>;
  insertedEvents: NormalizedEvent[];
  patches: IntegrationStatePatch[];
}

function makeStore(initial: Integration[]): { store: SyncStore; state: FakeStoreState } {
  const state: FakeStoreState = {
    rows: new Map(initial.map((r) => [r.id, { ...r }])),
    insertedEvents: [],
    patches: [],
  };
  const store: SyncStore = {
    async loadIntegration(id) {
      return state.rows.get(id) ?? null;
    },
    async updateIntegrationState(id, patch) {
      state.patches.push(patch);
      const row = state.rows.get(id);
      if (row) {
        state.rows.set(id, {
          ...row,
          state: patch.state,
          lastSyncAt:
            patch.lastSyncAt !== undefined ? patch.lastSyncAt : row.lastSyncAt,
          lastSyncError:
            patch.lastSyncError !== undefined
              ? patch.lastSyncError
              : row.lastSyncError,
        });
      }
    },
    async insertEvents(events) {
      // Simulate ON CONFLICT (source, source_event_id) DO NOTHING:
      // check against what's ALREADY persisted, then insert the new ones.
      const known = new Set(
        state.insertedEvents
          .map((e) => e.source_event_id)
          .filter((id): id is string => id != null),
      );
      let inserted = 0;
      let deduped = 0;
      for (const ev of events) {
        if (ev.source_event_id && known.has(ev.source_event_id)) {
          deduped += 1;
        } else {
          inserted += 1;
          state.insertedEvents.push(ev);
          if (ev.source_event_id) known.add(ev.source_event_id);
        }
      }
      const result: InsertEventsResult = {
        attempted: events.length,
        inserted,
        deduped,
      };
      return result;
    },
    async listIntegrations() {
      return [...state.rows.values()];
    },
  };
  return { store, state };
}

function fakeAdapter(result: SyncResult | (() => Promise<SyncResult>)): ConnectorAdapter {
  return {
    provider: "github",
    variant: "public",
    async validateCredentials() {
      return { ok: false, reason: "missing", message: "" };
    },
    async health() {
      return {
        reachable: false,
        latency_ms: 0,
        rate_limit_remaining: null,
        rate_limit_reset_at: null,
      };
    },
    async sync() {
      return typeof result === "function" ? result() : result;
    },
    capabilities() {
      return {
        supports_realtime: false,
        supports_backfill: true,
        required_scopes: [],
        rate_limits: [],
        privacy_class: "hosted",
      };
    },
  };
}

function registryWith(adapter: ConnectorAdapter): MutableAdapterRegistry {
  const r = new MutableAdapterRegistry();
  r.register(adapter);
  return r;
}

const event = (id: string): NormalizedEvent => ({
  workspace_id: WORKSPACE_ID,
  product_id: PRODUCT_ID,
  event_name: "release_published",
  occurred_at: new Date("2026-05-10T12:00:00Z"),
  source: "github",
  source_event_id: id,
  properties: {},
});

// ============================================================
// Happy path
// ============================================================

describe("runSync — happy path", () => {
  it("transitions pending → syncing → live and persists events", async () => {
    const { store, state } = makeStore([makeIntegration()]);
    const nextSince = new Date("2026-05-16T10:00:00Z");
    const r = await runSync(INTEGRATION_ID, {
      registry: registryWith(
        fakeAdapter({
          events: [event("release:1"), event("release:2")],
          metrics_pull: [],
          next_since: nextSince,
          errors: [],
        }),
      ),
      store,
      resolveToken: () => "ghp_test",
    });
    expect(r.ok).toBe(true);
    expect(r.state).toBe("live");
    expect(r.events.attempted).toBe(2);
    expect(r.events.inserted).toBe(2);
    expect(r.fatalError).toBeNull();

    // Two patches: syncing then live with cursor.
    expect(state.patches.map((p) => p.state)).toEqual(["syncing", "live"]);
    expect(state.patches[1]?.lastSyncAt).toEqual(nextSince);
    expect(state.patches[1]?.lastSyncError).toBeNull();
    expect(state.insertedEvents).toHaveLength(2);
  });

  it("transitions live → syncing → live on re-sync without events", async () => {
    const { store, state } = makeStore([makeIntegration({ state: "live" })]);
    const r = await runSync(INTEGRATION_ID, {
      registry: registryWith(
        fakeAdapter({
          events: [],
          metrics_pull: [],
          next_since: new Date("2026-05-16T11:00:00Z"),
          errors: [],
        }),
      ),
      store,
      resolveToken: () => "ghp_test",
    });
    expect(r.ok).toBe(true);
    expect(r.state).toBe("live");
    expect(state.insertedEvents).toHaveLength(0);
  });
});

// ============================================================
// Partial failure
// ============================================================

describe("runSync — partial failures", () => {
  it("persists events AND flips to error when adapter reports any error", async () => {
    const { store, state } = makeStore([makeIntegration()]);
    const adapterError: ConnectorError = {
      kind: "rate_limit",
      message: "API rate limit exceeded",
      retry_after_ms: 60_000,
      affected_scope: "issues",
    };
    const r = await runSync(INTEGRATION_ID, {
      registry: registryWith(
        fakeAdapter({
          events: [event("release:1")],
          metrics_pull: [],
          next_since: new Date("2026-05-16T11:00:00Z"),
          errors: [adapterError],
        }),
      ),
      store,
      resolveToken: () => "ghp_test",
    });
    expect(r.ok).toBe(false);
    expect(r.state).toBe("error");
    expect(r.adapterErrors).toEqual([adapterError]);
    expect(state.insertedEvents).toHaveLength(1);
    expect(state.patches.at(-1)?.lastSyncError).toMatch(/rate_limit.*issues/);
  });
});

// ============================================================
// Adapter throws (unclassified)
// ============================================================

describe("runSync — adapter throws", () => {
  it("flips to error with the throw message", async () => {
    const { store, state } = makeStore([makeIntegration()]);
    const r = await runSync(INTEGRATION_ID, {
      registry: registryWith(
        fakeAdapter(async () => {
          throw new Error("boom");
        }),
      ),
      store,
      resolveToken: () => "ghp_test",
    });
    expect(r.ok).toBe(false);
    expect(r.state).toBe("error");
    expect(r.fatalError).toBe("boom");
    expect(state.patches.at(-1)?.state).toBe("error");
    expect(state.patches.at(-1)?.lastSyncError).toMatch(/boom/);
  });
});

// ============================================================
// Abort
// ============================================================

describe("runSync — abort", () => {
  it("returns to the resting state on abort and reports fatalError=aborted", async () => {
    const { store, state } = makeStore([makeIntegration({ state: "live" })]);
    const controller = new AbortController();
    const r = await runSync(INTEGRATION_ID, {
      registry: registryWith(
        fakeAdapter(async () => {
          controller.abort();
          throw new DOMException("aborted", "AbortError");
        }),
      ),
      store,
      resolveToken: () => "ghp_test",
      signal: controller.signal,
    });
    expect(r.fatalError).toBe("aborted");
    // Last patch should be pending (sync_aborted transitions to pending).
    expect(state.patches.at(-1)?.state).toBe("pending");
  });
});

// ============================================================
// Lookup + config errors
// ============================================================

describe("runSync — config / lookup errors", () => {
  it("returns fatal when integration not found", async () => {
    const { store } = makeStore([]);
    const r = await runSync("does-not-exist", {
      registry: registryWith(
        fakeAdapter({
          events: [],
          metrics_pull: [],
          next_since: new Date(),
          errors: [],
        }),
      ),
      store,
      resolveToken: () => "ghp_test",
    });
    expect(r.ok).toBe(false);
    expect(r.fatalError).toMatch(/integration_not_found/);
  });

  it("returns fatal when no adapter is registered for the provider/variant", async () => {
    const { store, state } = makeStore([makeIntegration()]);
    const emptyRegistry = new MutableAdapterRegistry();
    const r = await runSync(INTEGRATION_ID, {
      registry: emptyRegistry,
      store,
      resolveToken: () => "ghp_test",
    });
    expect(r.fatalError).toMatch(/no_adapter/);
    expect(state.patches.at(-1)?.state).toBe("error");
  });

  it("returns fatal when no token can be resolved", async () => {
    const { store, state } = makeStore([makeIntegration()]);
    const r = await runSync(INTEGRATION_ID, {
      registry: registryWith(
        fakeAdapter({
          events: [],
          metrics_pull: [],
          next_since: new Date(),
          errors: [],
        }),
      ),
      store,
      resolveToken: () => null,
    });
    expect(r.fatalError).toMatch(/missing_credential/);
    expect(state.patches.at(-1)?.state).toBe("error");
  });

  it("refuses to start sync from planned state (illegal transition)", async () => {
    const { store } = makeStore([makeIntegration({ state: "planned" })]);
    const r = await runSync(INTEGRATION_ID, {
      registry: registryWith(
        fakeAdapter({
          events: [],
          metrics_pull: [],
          next_since: new Date(),
          errors: [],
        }),
      ),
      store,
      resolveToken: () => "ghp_test",
    });
    expect(r.fatalError).toMatch(/illegal_start/);
  });
});

// ============================================================
// since cursor
// ============================================================

describe("runSync — since cursor", () => {
  it("passes last_sync_at to the adapter as the since parameter", async () => {
    const lastSync = new Date("2026-05-15T08:00:00Z");
    const { store } = makeStore([makeIntegration({ lastSyncAt: lastSync, state: "live" })]);
    let seenSince: Date | null = null;
    const adapter: ConnectorAdapter = {
      ...fakeAdapter({
        events: [],
        metrics_pull: [],
        next_since: new Date(),
        errors: [],
      }),
      async sync(_cfg, since) {
        seenSince = since;
        return {
          events: [],
          metrics_pull: [],
          next_since: new Date("2026-05-16T08:00:00Z"),
          errors: [],
        };
      },
    };
    await runSync(INTEGRATION_ID, {
      registry: registryWith(adapter),
      store,
      resolveToken: () => "ghp_test",
    });
    expect(seenSince).toEqual(lastSync);
  });

  it("uses a far-past fallback when last_sync_at is null", async () => {
    const { store } = makeStore([makeIntegration({ lastSyncAt: null })]);
    let seenSince: Date | null = null;
    const adapter: ConnectorAdapter = {
      ...fakeAdapter({
        events: [],
        metrics_pull: [],
        next_since: new Date(),
        errors: [],
      }),
      async sync(_cfg, since) {
        seenSince = since;
        return {
          events: [],
          metrics_pull: [],
          next_since: new Date("2026-05-16T08:00:00Z"),
          errors: [],
        };
      },
    };
    await runSync(INTEGRATION_ID, {
      registry: registryWith(adapter),
      store,
      resolveToken: () => "ghp_test",
    });
    // Far-past is 2020-01-01 in the runner constants.
    expect(seenSince).toBeInstanceOf(Date);
    expect((seenSince as unknown as Date).getUTCFullYear()).toBe(2020);
  });
});

// ============================================================
// Token never persists
// ============================================================

describe("runSync — token hygiene", () => {
  it("never includes the token in any persisted patch", async () => {
    const { store, state } = makeStore([makeIntegration()]);
    let seenConfig: Record<string, unknown> | null = null;
    const adapter: ConnectorAdapter = {
      ...fakeAdapter({
        events: [],
        metrics_pull: [],
        next_since: new Date(),
        errors: [],
      }),
      async sync(cfg) {
        seenConfig = cfg as Record<string, unknown>;
        return {
          events: [],
          metrics_pull: [],
          next_since: new Date(),
          errors: [],
        };
      },
    };
    await runSync(INTEGRATION_ID, {
      registry: registryWith(adapter),
      store,
      resolveToken: () => "ghp_secret_token",
    });

    // Adapter sees the token …
    expect((seenConfig as Record<string, unknown> | null)?.["token"]).toBe(
      "ghp_secret_token",
    );

    // … but persisted patches must not.
    for (const patch of state.patches) {
      expect(JSON.stringify(patch)).not.toContain("ghp_secret_token");
    }
  });

  it("injects workspace_id + product_id into the adapter config", async () => {
    const { store } = makeStore([makeIntegration()]);
    let seenConfig: Record<string, unknown> | null = null;
    const adapter: ConnectorAdapter = {
      ...fakeAdapter({
        events: [],
        metrics_pull: [],
        next_since: new Date(),
        errors: [],
      }),
      async sync(cfg) {
        seenConfig = cfg as Record<string, unknown>;
        return {
          events: [],
          metrics_pull: [],
          next_since: new Date(),
          errors: [],
        };
      },
    };
    await runSync(INTEGRATION_ID, {
      registry: registryWith(adapter),
      store,
      resolveToken: () => "ghp_test",
    });
    expect(seenConfig).toMatchObject({
      workspace_id: WORKSPACE_ID,
      product_id: PRODUCT_ID,
      owner_repo: "Nnvvee96/NOESIS",
    });
  });
});

// ============================================================
// Smoke: every state arrives at a coherent terminal
// ============================================================

describe("runSync — every reachable starting state lands on a terminal", () => {
  for (const start of [
    "pending",
    "live",
    "stale",
    "error",
  ] as IntegrationState[]) {
    it(`${start} → syncing → live on success`, async () => {
      const { store, state } = makeStore([makeIntegration({ state: start })]);
      await runSync(INTEGRATION_ID, {
        registry: registryWith(
          fakeAdapter({
            events: [],
            metrics_pull: [],
            next_since: new Date(),
            errors: [],
          }),
        ),
        store,
        resolveToken: () => "ghp_test",
      });
      expect(state.patches.map((p) => p.state)).toEqual(["syncing", "live"]);
    });
  }
});
