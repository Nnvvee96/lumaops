/**
 * `SyncStore` is the persistence surface the runner depends on.
 *
 * Defining it as an interface keeps the runner unit-testable without a
 * real Postgres + drizzle stack. The production implementation lives
 * in apps/web (because that's where the drizzle client + secrets are);
 * tests inject an in-memory mock.
 */

import type { NormalizedEvent } from "../connectors/contract";
import type {
  Integration,
  IntegrationProvider,
  IntegrationState,
} from "../db/schema";

export interface SyncStore {
  /** Look up the integration row by id. Returns null if not found. */
  loadIntegration(id: string): Promise<Integration | null>;

  /**
   * Apply a state transition + sync-result metadata to the integration
   * row in a single update. Returns the updated row (or the same shape)
   * so the caller can persist it back to the UI cache.
   */
  updateIntegrationState(
    id: string,
    patch: IntegrationStatePatch,
  ): Promise<void>;

  /**
   * Insert events with `ON CONFLICT (source, source_event_id) DO NOTHING`.
   * Returns counts: how many rows were attempted, how many actually inserted,
   * how many were deduped against existing rows.
   */
  insertEvents(events: readonly NormalizedEvent[]): Promise<InsertEventsResult>;

  /**
   * Load all integrations across the workspace — used by the freshness
   * timer to decide which rows need a tick.
   */
  listIntegrations(): Promise<readonly Integration[]>;
}

export interface IntegrationStatePatch {
  readonly state: IntegrationState;
  readonly lastSyncAt?: Date | null;
  readonly lastSyncError?: string | null;
}

export interface InsertEventsResult {
  readonly attempted: number;
  readonly inserted: number;
  readonly deduped: number;
}

/**
 * Helper for tests + small consumers: build a `loadIntegration` lookup
 * keyed by `(provider, variant)` from a list of rows. Not used by the
 * runner directly — exposed because the freshness scheduler also wants
 * to walk integrations by provider.
 */
export function indexByProviderVariant(
  rows: readonly Integration[],
): Map<string, Integration> {
  const map = new Map<string, Integration>();
  for (const r of rows) {
    map.set(`${r.provider as IntegrationProvider}::${r.variant}`, r);
  }
  return map;
}
