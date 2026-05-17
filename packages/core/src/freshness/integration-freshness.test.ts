import { describe, expect, it } from "vitest";

import type { Integration } from "../db/schema";
import { integrationFreshness } from "./integration-freshness";

function row(patch: Partial<Integration> = {}): Integration {
  return {
    id: "00000000-0000-0000-0000-000000000100",
    workspaceId: "00000000-0000-0000-0000-000000000001",
    productId: "00000000-0000-0000-0000-000000000010",
    provider: "github",
    variant: "public",
    displayName: "GitHub",
    state: "live",
    credentialStatus: "present",
    credentialFingerprint: "sha:abc",
    scopes: ["repo"],
    freshnessThresholdSeconds: 900,
    lastSyncAt: new Date("2026-05-16T09:55:00Z"),
    lastSyncError: null,
    config: {},
    createdAt: new Date("2026-05-01T00:00:00Z"),
    updatedAt: new Date("2026-05-16T09:55:00Z"),
    ...patch,
  } as Integration;
}

const NOW = new Date("2026-05-16T10:00:00Z");

describe("integrationFreshness", () => {
  it("returns missing/no_integration when integration is null", () => {
    expect(integrationFreshness(null, { now: NOW })).toEqual({
      kind: "missing",
      reason: "no_integration",
    });
  });

  it("returns missing/integration_not_connected when credential is missing", () => {
    const f = integrationFreshness(
      row({ credentialStatus: "missing", lastSyncAt: null }),
      { now: NOW },
    );
    expect(f.kind).toBe("missing");
    if (f.kind === "missing") {
      expect(f.reason).toBe("integration_not_connected");
    }
  });

  it("returns missing/integration_not_connected when never synced", () => {
    const f = integrationFreshness(row({ lastSyncAt: null }), { now: NOW });
    expect(f.kind).toBe("missing");
  });

  it("returns observed when within the freshness window", () => {
    // 5 min since last sync, threshold = 15 min
    const f = integrationFreshness(row(), { now: NOW });
    expect(f.kind).toBe("observed");
    if (f.kind === "observed") {
      expect(f.source_id).toBe(
        "github:00000000-0000-0000-0000-000000000100",
      );
    }
  });

  it("returns stale when last_sync_at is older than threshold", () => {
    const f = integrationFreshness(
      row({
        lastSyncAt: new Date("2026-05-16T09:00:00Z"), // 1h old vs 15m threshold
      }),
      { now: NOW },
    );
    expect(f.kind).toBe("stale");
    if (f.kind === "stale") {
      expect(f.threshold_seconds).toBe(900);
      expect(f.actual_age_seconds).toBeGreaterThan(900);
    }
  });

  it("freezes data under stale overlay when integration is in error state", () => {
    const f = integrationFreshness(
      row({ state: "error", lastSyncError: "Bad credentials" }),
      { now: NOW },
    );
    expect(f.kind).toBe("stale");
  });

  it("uses the provider:id format for source_id", () => {
    const f = integrationFreshness(
      row({ provider: "stripe", id: "abc-123" } as Partial<Integration>),
      { now: NOW },
    );
    if (f.kind === "observed") {
      expect(f.source_id).toBe("stripe:abc-123");
    }
  });
});
