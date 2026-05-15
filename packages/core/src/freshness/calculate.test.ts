/**
 * Freshness calculator — table-driven tests.
 * Covers the 6-state discriminated union from TDD §5.2 plus the
 * production guard against `mock` leaking.
 */

import { describe, expect, it } from "vitest";

import { calculateFreshness } from "./calculate";
import type { Freshness, FreshnessInput } from "./types";

const NOW = new Date("2026-05-15T12:00:00.000Z");
const ONE_HOUR_AGO = new Date("2026-05-15T11:00:00.000Z");
const ONE_DAY_AGO = new Date("2026-05-14T12:00:00.000Z");
const TEN_SECONDS_AGO = new Date("2026-05-15T11:59:50.000Z");

interface TableCase {
  readonly name: string;
  readonly input: FreshnessInput;
  readonly expected: Freshness;
}

const CASES: readonly TableCase[] = [
  // ---------------------------------------------- observed
  {
    name: "observe within threshold → observed",
    input: {
      kind: "observe",
      last_observed_at: TEN_SECONDS_AGO,
      source_id: "github:repo-123",
      threshold_seconds: 900,
    },
    expected: {
      kind: "observed",
      last_observed_at: TEN_SECONDS_AGO,
      source_id: "github:repo-123",
    },
  },
  {
    name: "observe exactly at threshold → observed (boundary inclusive)",
    input: {
      kind: "observe",
      last_observed_at: new Date(NOW.getTime() - 900_000), // exactly 900s ago
      source_id: "cloudflare:zone-x",
      threshold_seconds: 900,
    },
    expected: {
      kind: "observed",
      last_observed_at: new Date(NOW.getTime() - 900_000),
      source_id: "cloudflare:zone-x",
    },
  },

  // ---------------------------------------------- derived
  {
    name: "derive within threshold → derived",
    input: {
      kind: "derive",
      last_observed_at: ONE_HOUR_AGO,
      source_id: "github:repo-123",
      derivation: "weekly_visits = sum(page_view events in 7d)",
      threshold_seconds: 86_400,
    },
    expected: {
      kind: "derived",
      last_observed_at: ONE_HOUR_AGO,
      source_id: "github:repo-123",
      derivation: "weekly_visits = sum(page_view events in 7d)",
    },
  },
  {
    name: "derive past threshold → stale (boundary check)",
    input: {
      kind: "derive",
      last_observed_at: ONE_DAY_AGO,
      source_id: "cloudflare:zone-x",
      derivation: "conversion_rate = signups / visits",
      threshold_seconds: 3_600, // 1h — overdue by ~23h
    },
    expected: {
      kind: "stale",
      last_observed_at: ONE_DAY_AGO,
      threshold_seconds: 3_600,
      actual_age_seconds: 86_400,
    },
  },

  // ---------------------------------------------- inferred
  {
    name: "infer within threshold → inferred",
    input: {
      kind: "infer",
      last_observed_at: ONE_HOUR_AGO,
      source_id: "github:repo-123",
      confidence: 0.72,
      threshold_seconds: 86_400,
    },
    expected: {
      kind: "inferred",
      last_observed_at: ONE_HOUR_AGO,
      source_id: "github:repo-123",
      confidence: 0.72,
    },
  },
  {
    name: "infer past threshold → stale",
    input: {
      kind: "infer",
      last_observed_at: ONE_DAY_AGO,
      source_id: "github:repo-123",
      confidence: 0.5,
      threshold_seconds: 3_600,
    },
    expected: {
      kind: "stale",
      last_observed_at: ONE_DAY_AGO,
      threshold_seconds: 3_600,
      actual_age_seconds: 86_400,
    },
  },

  // ---------------------------------------------- stale (via observe past threshold)
  {
    name: "observe past threshold → stale with computed age",
    input: {
      kind: "observe",
      last_observed_at: ONE_HOUR_AGO,
      source_id: "github:repo-123",
      threshold_seconds: 60, // overdue by 59 min
    },
    expected: {
      kind: "stale",
      last_observed_at: ONE_HOUR_AGO,
      threshold_seconds: 60,
      actual_age_seconds: 3_600,
    },
  },
  {
    name: "observe one second past threshold → stale (off-by-one safety)",
    input: {
      kind: "observe",
      last_observed_at: new Date(NOW.getTime() - 901_000), // 901s ago
      source_id: "github:repo-123",
      threshold_seconds: 900,
    },
    expected: {
      kind: "stale",
      last_observed_at: new Date(NOW.getTime() - 901_000),
      threshold_seconds: 900,
      actual_age_seconds: 901,
    },
  },

  // ---------------------------------------------- missing
  {
    name: "missing no_integration",
    input: { kind: "missing", reason: "no_integration" },
    expected: { kind: "missing", reason: "no_integration" },
  },
  {
    name: "missing integration_not_connected",
    input: { kind: "missing", reason: "integration_not_connected" },
    expected: { kind: "missing", reason: "integration_not_connected" },
  },
  {
    name: "missing no_data_yet",
    input: { kind: "missing", reason: "no_data_yet" },
    expected: { kind: "missing", reason: "no_data_yet" },
  },

  // ---------------------------------------------- mock (dev only)
  {
    name: "mock kind passes through in non-production",
    input: { kind: "mock", until: new Date("2026-12-31T23:59:59.000Z") },
    expected: { kind: "mock", until: new Date("2026-12-31T23:59:59.000Z") },
  },
];

describe("calculateFreshness — table-driven", () => {
  for (const tc of CASES) {
    it(tc.name, () => {
      const result = calculateFreshness(tc.input, {
        now: NOW,
        isProduction: false,
      });
      expect(result).toEqual(tc.expected);
    });
  }
});

describe("calculateFreshness — production guard", () => {
  it("throws when mock is requested with isProduction=true", () => {
    expect(() =>
      calculateFreshness(
        { kind: "mock", until: new Date("2026-12-31T00:00:00.000Z") },
        { now: NOW, isProduction: true },
      ),
    ).toThrowError(/mock kind is not permitted in production/);
  });

  it("does NOT throw for non-mock inputs in production", () => {
    const result = calculateFreshness(
      {
        kind: "observe",
        last_observed_at: TEN_SECONDS_AGO,
        source_id: "github:repo-123",
        threshold_seconds: 900,
      },
      { now: NOW, isProduction: true },
    );
    expect(result.kind).toBe("observed");
  });

  it("still flips stale in production (auto-flip is not gated)", () => {
    const result = calculateFreshness(
      {
        kind: "observe",
        last_observed_at: ONE_DAY_AGO,
        source_id: "github:repo-123",
        threshold_seconds: 60,
      },
      { now: NOW, isProduction: true },
    );
    expect(result.kind).toBe("stale");
  });
});

describe("calculateFreshness — discriminant exhaustiveness", () => {
  it("returns kind matching the requested live-input kind when fresh", () => {
    const observe = calculateFreshness(
      {
        kind: "observe",
        last_observed_at: TEN_SECONDS_AGO,
        source_id: "x",
        threshold_seconds: 900,
      },
      { now: NOW, isProduction: false },
    );
    expect(observe.kind).toBe("observed");

    const derive = calculateFreshness(
      {
        kind: "derive",
        last_observed_at: TEN_SECONDS_AGO,
        source_id: "x",
        derivation: "y",
        threshold_seconds: 900,
      },
      { now: NOW, isProduction: false },
    );
    expect(derive.kind).toBe("derived");

    const infer = calculateFreshness(
      {
        kind: "infer",
        last_observed_at: TEN_SECONDS_AGO,
        source_id: "x",
        confidence: 0.9,
        threshold_seconds: 900,
      },
      { now: NOW, isProduction: false },
    );
    expect(infer.kind).toBe("inferred");
  });
});
