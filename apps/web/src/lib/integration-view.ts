import type { Integration, IntegrationState } from "@lumaops/core";

/**
 * UI-side derivation: if the row says `live` but the freshness window
 * has expired, surface as `stale` without touching the DB. The next
 * sync run authoritatively updates the row.
 *
 * Other states pass through unchanged — `error`, `pending`, `syncing`
 * carry their own semantics and stale doesn't override them.
 */
export function effectiveState(
  row: Integration,
  now: Date = new Date(),
): IntegrationState {
  if (row.state !== "live") return row.state;
  if (!row.lastSyncAt) return "stale";
  const ageMs = now.getTime() - new Date(row.lastSyncAt).getTime();
  const thresholdMs = row.freshnessThresholdSeconds * 1000;
  return ageMs > thresholdMs ? "stale" : "live";
}

export function withEffectiveState<T extends Integration>(
  rows: readonly T[],
  now: Date = new Date(),
): readonly (T & { effectiveState: IntegrationState })[] {
  return rows.map((r) => ({ ...r, effectiveState: effectiveState(r, now) }));
}
