/**
 * MetricDefinition registry — TDD §3.2 primary-metric defaults
 * + TDD §5.1 contract.
 *
 * Eight initial metrics, one per primary product-type slot. All
 * computations stub `missing` for now — S3G + Phase 4 connectors wire
 * them to real DB / event reads. The MVP cockpit consumes these
 * definitions today so source + freshness labelling is plumbed
 * end-to-end before a single number is real.
 */

import type {
  ComputeContext,
  MetricDefinition,
  MetricValue,
} from "./types";
import type { ProductStatus, ProductType } from "../db/schema";

// ============================================================
// Helpers
// ============================================================

/** Default no-data response — every stub returns this until S3G/S4. */
function missingValue(reason: "no_integration" | "no_data_yet"): MetricValue {
  return {
    freshness: { kind: "missing", reason },
    value: null,
    display: "—",
  };
}

// ============================================================
// The eight initial metrics
// ============================================================

const waitlist_count: MetricDefinition = {
  key: "waitlist_count",
  label: "Waitlist",
  category: "growth",
  source: "computed_from_events",
  aggregation: "count",
  value_type: "number",
  freshness: { depends_on: "event_age", threshold_seconds: 3600 },
  required_integrations: ["tracking-api"],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async computation(_ctx: ComputeContext) {
    return missingValue("no_integration");
  },
};

const weekly_visits: MetricDefinition = {
  key: "weekly_visits",
  label: "Weekly visits",
  category: "growth",
  source: "derived_from_integration",
  aggregation: "sum",
  value_type: "number",
  freshness: { depends_on: "integration_id", threshold_seconds: 3600 },
  required_integrations: ["cloudflare"],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async computation(_ctx: ComputeContext) {
    return missingValue("no_integration");
  },
};

const mrr: MetricDefinition = {
  key: "mrr",
  label: "MRR",
  category: "revenue",
  source: "derived_from_integration",
  aggregation: "latest_value",
  value_type: "currency",
  freshness: { depends_on: "integration_id", threshold_seconds: 900 },
  required_integrations: ["stripe"],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async computation(_ctx: ComputeContext) {
    return missingValue("no_integration");
  },
};

const downloads_weekly: MetricDefinition = {
  key: "downloads_weekly",
  label: "Weekly downloads",
  category: "growth",
  source: "computed_from_events",
  aggregation: "sum",
  value_type: "number",
  freshness: { depends_on: "event_age", threshold_seconds: 3600 },
  required_integrations: ["tracking-api"],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async computation(_ctx: ComputeContext) {
    return missingValue("no_integration");
  },
};

const installs_weekly: MetricDefinition = {
  key: "installs_weekly",
  label: "Weekly installs",
  category: "growth",
  source: "computed_from_events",
  aggregation: "sum",
  value_type: "number",
  freshness: { depends_on: "event_age", threshold_seconds: 3600 },
  required_integrations: ["app-telemetry"],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async computation(_ctx: ComputeContext) {
    return missingValue("no_integration");
  },
};

const api_calls_weekly: MetricDefinition = {
  key: "api_calls_weekly",
  label: "Weekly API calls",
  category: "growth",
  source: "computed_from_events",
  aggregation: "sum",
  value_type: "number",
  freshness: { depends_on: "event_age", threshold_seconds: 3600 },
  required_integrations: ["app-telemetry"],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async computation(_ctx: ComputeContext) {
    return missingValue("no_integration");
  },
};

const weekly_active_integrations: MetricDefinition = {
  key: "weekly_active_integrations",
  label: "Active integrations",
  category: "growth",
  source: "computed_from_events",
  aggregation: "distinct_count",
  value_type: "number",
  freshness: { depends_on: "event_age", threshold_seconds: 3600 },
  required_integrations: ["app-telemetry"],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async computation(_ctx: ComputeContext) {
    return missingValue("no_integration");
  },
};

const entries_weekly: MetricDefinition = {
  key: "entries_weekly",
  label: "Weekly entries",
  category: "growth",
  source: "computed_from_events",
  aggregation: "count",
  value_type: "number",
  freshness: { depends_on: "event_age", threshold_seconds: 3600 },
  required_integrations: [],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async computation(_ctx: ComputeContext) {
    return missingValue("no_data_yet");
  },
};

// ============================================================
// Registry — keyed lookup
// ============================================================

const REGISTRY: Record<string, MetricDefinition> = {
  waitlist_count,
  weekly_visits,
  mrr,
  downloads_weekly,
  installs_weekly,
  api_calls_weekly,
  weekly_active_integrations,
  entries_weekly,
};

export type MetricKey = keyof typeof REGISTRY;

export function getMetricDefinition(key: string): MetricDefinition | undefined {
  return REGISTRY[key];
}

export function listMetricDefinitions(): readonly MetricDefinition[] {
  return Object.values(REGISTRY);
}

// ============================================================
// product_type / status → primary metric (TDD §3.2)
// ============================================================

/**
 * Returns the primary_metric_key for a product based on its type and
 * (optionally) status. Mirrors the table in TDD §3.2: pre-launch
 * web-apps default to waitlist; beta / live web-apps default to
 * weekly visits.
 */
export function getDefaultMetricForType(
  productType: ProductType,
  status?: ProductStatus,
): MetricKey {
  if (productType === "web-app") {
    if (status === "pre-launch") return "waitlist_count";
    return "weekly_visits";
  }
  switch (productType) {
    case "saas":
      return "mrr";
    case "desktop-app":
      return "downloads_weekly";
    case "mobile-app":
      return "installs_weekly";
    case "api":
      return "api_calls_weekly";
    case "library":
      return "weekly_active_integrations";
    case "research-system":
      return "entries_weekly";
  }
}
