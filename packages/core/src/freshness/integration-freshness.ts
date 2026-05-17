/**
 * Build a Freshness from an Integration row.
 *
 * Pure mapping function. Encodes the "what does this integration
 * mean for the data we're about to render?" decision in one place so
 * /releases, /support, and any future GitHub-surfaced page reach the
 * same Freshness regardless of who calls.
 *
 * Decision rules:
 *   1. No integration row              → missing(no_integration)
 *   2. No credential / never synced    → missing(integration_not_connected)
 *   3. Integration in error state      → stale (threshold_seconds = 0 forces
 *                                          the calculator to flip, so the
 *                                          UI freezes pre-error data under
 *                                          a clearly-stale overlay)
 *   4. Otherwise                       → observed(last_sync_at) with the
 *                                          integration's threshold; the
 *                                          calculator auto-flips to stale
 *                                          when last_sync_at is too old
 */

import type { Integration } from "../db/schema";
import { calculateFreshness } from "./calculate";
import type { Freshness } from "./types";

export function integrationFreshness(
  integration: Integration | null,
  options: { now?: Date } = {},
): Freshness {
  const now = options.now ?? new Date();

  if (!integration) {
    return { kind: "missing", reason: "no_integration" };
  }

  if (
    integration.credentialStatus !== "present" ||
    integration.lastSyncAt === null
  ) {
    return { kind: "missing", reason: "integration_not_connected" };
  }

  if (integration.state === "error") {
    return calculateFreshness(
      {
        kind: "observe",
        last_observed_at: new Date(integration.lastSyncAt),
        source_id: `${integration.provider}:${integration.id}`,
        threshold_seconds: 0,
      },
      { now },
    );
  }

  return calculateFreshness(
    {
      kind: "observe",
      last_observed_at: new Date(integration.lastSyncAt),
      source_id: `${integration.provider}:${integration.id}`,
      threshold_seconds: integration.freshnessThresholdSeconds,
    },
    { now },
  );
}
