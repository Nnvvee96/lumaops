import { describe, expect, it } from "vitest";

import type { IntegrationState } from "../db/schema";
import { nextState, type SyncEvent } from "./state-machine";

describe("nextState — happy transitions", () => {
  it("pending → syncing on sync_started", () => {
    expect(nextState("pending", "sync_started")).toEqual({
      ok: true,
      next: "syncing",
    });
  });

  it("live → syncing on sync_started (re-sync)", () => {
    expect(nextState("live", "sync_started")).toEqual({
      ok: true,
      next: "syncing",
    });
  });

  it("error → syncing on sync_started (retry)", () => {
    expect(nextState("error", "sync_started")).toEqual({
      ok: true,
      next: "syncing",
    });
  });

  it("stale → syncing on sync_started (refresh)", () => {
    expect(nextState("stale", "sync_started")).toEqual({
      ok: true,
      next: "syncing",
    });
  });

  it("syncing → live on sync_succeeded", () => {
    expect(nextState("syncing", "sync_succeeded")).toEqual({
      ok: true,
      next: "live",
    });
  });

  it("syncing → error on sync_failed", () => {
    expect(nextState("syncing", "sync_failed")).toEqual({
      ok: true,
      next: "error",
    });
  });

  it("syncing → pending on sync_aborted", () => {
    expect(nextState("syncing", "sync_aborted")).toEqual({
      ok: true,
      next: "pending",
    });
  });

  it("live → stale on freshness_expired", () => {
    expect(nextState("live", "freshness_expired")).toEqual({
      ok: true,
      next: "stale",
    });
  });
});

describe("nextState — illegal transitions", () => {
  it("planned cannot start a sync (no credential)", () => {
    const r = nextState("planned", "sync_started");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.kind).toBe("illegal_transition");
  });

  it("sync_succeeded outside syncing is illegal", () => {
    for (const s of ["pending", "live", "stale", "error", "planned"] as IntegrationState[]) {
      const r = nextState(s, "sync_succeeded");
      expect(r.ok).toBe(false);
    }
  });

  it("sync_failed outside syncing is illegal", () => {
    for (const s of ["pending", "live", "stale", "error", "planned"] as IntegrationState[]) {
      const r = nextState(s, "sync_failed");
      expect(r.ok).toBe(false);
    }
  });

  it("sync_aborted outside syncing is illegal", () => {
    expect(nextState("live", "sync_aborted").ok).toBe(false);
    expect(nextState("error", "sync_aborted").ok).toBe(false);
  });

  it("freshness_expired only applies to live state", () => {
    for (const s of ["pending", "syncing", "stale", "error", "planned"] as IntegrationState[]) {
      const r = nextState(s, "freshness_expired");
      expect(r.ok).toBe(false);
    }
  });
});

describe("nextState — totality", () => {
  it("returns a result for every (state, event) cell", () => {
    const states: IntegrationState[] = [
      "pending",
      "syncing",
      "live",
      "stale",
      "error",
      "planned",
    ];
    const events: SyncEvent[] = [
      "sync_started",
      "sync_succeeded",
      "sync_failed",
      "sync_aborted",
      "freshness_expired",
    ];
    for (const s of states) {
      for (const e of events) {
        const r = nextState(s, e);
        expect(typeof r.ok).toBe("boolean");
      }
    }
  });
});
