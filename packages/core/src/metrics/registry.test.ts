import { describe, expect, it } from "vitest";

import {
  getDefaultMetricForType,
  getMetricDefinition,
  listMetricDefinitions,
} from "./registry";
import type { ProductStatus, ProductType } from "../db/schema";

const PRODUCT_TYPES: readonly ProductType[] = [
  "web-app",
  "saas",
  "desktop-app",
  "mobile-app",
  "api",
  "library",
  "research-system",
];

const EXPECTED_KEYS = [
  "waitlist_count",
  "weekly_visits",
  "mrr",
  "downloads_weekly",
  "installs_weekly",
  "api_calls_weekly",
  "weekly_active_integrations",
  "entries_weekly",
] as const;

describe("metric registry — coverage", () => {
  it("ships exactly 8 metric definitions", () => {
    expect(listMetricDefinitions()).toHaveLength(8);
  });

  for (const key of EXPECTED_KEYS) {
    it(`registers ${key}`, () => {
      const def = getMetricDefinition(key);
      expect(def).toBeDefined();
      expect(def?.key).toBe(key);
      expect(def?.label.length).toBeGreaterThan(0);
    });
  }

  it("returns undefined for unknown keys", () => {
    expect(getMetricDefinition("does_not_exist")).toBeUndefined();
  });
});

describe("metric stubs — every computation returns honest freshness", () => {
  for (const key of EXPECTED_KEYS) {
    it(`${key}.computation returns missing freshness in MVP`, async () => {
      const def = getMetricDefinition(key);
      expect(def).toBeDefined();
      const result = await def!.computation({
        workspaceId: "ws-x",
        productId: "prod-x",
        productType: "web-app",
        productStatus: "beta",
        dateRange: {
          from: new Date("2026-05-01"),
          to: new Date("2026-05-15"),
        },
        now: new Date("2026-05-15T12:00:00Z"),
      });
      expect(result.freshness.kind).toBe("missing");
      expect(result.value).toBeNull();
    });
  }
});

describe("getDefaultMetricForType — TDD §3.2", () => {
  const expected: Record<ProductType, string> = {
    "web-app": "weekly_visits",
    saas: "mrr",
    "desktop-app": "downloads_weekly",
    "mobile-app": "installs_weekly",
    api: "api_calls_weekly",
    library: "weekly_active_integrations",
    "research-system": "entries_weekly",
  };

  for (const type of PRODUCT_TYPES) {
    it(`${type} → ${expected[type]}`, () => {
      expect(getDefaultMetricForType(type)).toBe(expected[type]);
    });
  }

  it("web-app + pre-launch → waitlist_count override", () => {
    expect(getDefaultMetricForType("web-app", "pre-launch")).toBe(
      "waitlist_count",
    );
  });

  it("web-app + beta → weekly_visits (status doesn't override)", () => {
    expect(getDefaultMetricForType("web-app", "beta")).toBe("weekly_visits");
  });

  it("non-web-app + pre-launch → type-default still applies", () => {
    // Pre-launch is only a web-app-specific override; non-web-app
    // products with pre-launch status fall through to their type default.
    const status: ProductStatus = "pre-launch";
    expect(getDefaultMetricForType("desktop-app", status)).toBe(
      "downloads_weekly",
    );
  });
});

describe("metric definitions — TDD §5.1 contract shape", () => {
  for (const def of listMetricDefinitions()) {
    it(`${def.key} has all required fields and a valid value_type`, () => {
      expect(def.key.length).toBeGreaterThan(0);
      expect(def.label.length).toBeGreaterThan(0);
      expect([
        "growth",
        "revenue",
        "release",
        "support",
        "development",
      ]).toContain(def.category);
      expect([
        "computed_from_events",
        "derived_from_integration",
        "manual",
      ]).toContain(def.source);
      expect([
        "sum",
        "count",
        "distinct_count",
        "rate",
        "latest_value",
        "formula",
      ]).toContain(def.aggregation);
      expect(["number", "percentage", "currency", "duration_ms"]).toContain(
        def.value_type,
      );
      expect(def.freshness.threshold_seconds).toBeGreaterThan(0);
      expect(["event_age", "integration_id"]).toContain(
        def.freshness.depends_on,
      );
    });
  }
});
