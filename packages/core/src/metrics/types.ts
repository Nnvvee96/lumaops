/**
 * MetricDefinition contract — TDD §5.1.
 *
 * Every value on screen flows through a MetricDefinition. The
 * definition carries enough metadata for the UI to render source +
 * freshness honestly without the cockpit code needing to know what
 * the metric "is" — only how to read it.
 */

import type { Freshness } from "../freshness/types";
import type {
  IntegrationProvider,
  ProductStatus,
  ProductType,
} from "../db/schema";

export type MetricCategory =
  | "growth"
  | "revenue"
  | "release"
  | "support"
  | "development";

export type MetricSource =
  | "computed_from_events"
  | "derived_from_integration"
  | "manual";

export type MetricAggregation =
  | "sum"
  | "count"
  | "distinct_count"
  | "rate"
  | "latest_value"
  | "formula";

export type MetricValueType =
  | "number"
  | "percentage"
  | "currency"
  | "duration_ms";

export interface MetricFreshnessSpec {
  readonly depends_on: "event_age" | "integration_id";
  readonly threshold_seconds: number;
}

/**
 * The runtime payload a MetricDefinition.computation returns.
 * Always carries freshness — the UI cannot render without it.
 */
export interface MetricValue {
  readonly freshness: Freshness;
  /** Raw numeric value (null when freshness.kind === "missing"). */
  readonly value: number | null;
  /** Human-readable display string (currency-formatted, %, etc.). */
  readonly display: string;
}

/**
 * ComputeContext is the bag passed to every MetricDefinition.computation.
 * S3E ships stubs that don't use the bag; S3G + Phase 4 wire it to
 * real DB / event reads.
 */
export interface ComputeContext {
  readonly workspaceId: string;
  readonly productId: string;
  readonly productType: ProductType;
  readonly productStatus: ProductStatus;
  readonly dateRange: { readonly from: Date; readonly to: Date };
  readonly now: Date;
}

export interface MetricDefinition {
  readonly key: string;
  readonly label: string;
  readonly category: MetricCategory;
  readonly source: MetricSource;
  readonly aggregation: MetricAggregation;
  readonly value_type: MetricValueType;
  readonly freshness: MetricFreshnessSpec;
  readonly required_integrations: readonly IntegrationProvider[];
  readonly computation: (ctx: ComputeContext) => Promise<MetricValue>;
}
