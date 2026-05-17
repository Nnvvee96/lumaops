"use server";

import { revalidatePath } from "next/cache";

import { runSync, type RunSyncResult } from "@lumaops/core";

import {
  getRegistry,
  getSyncStore,
  resolveTokenFromEnv,
  registerInFlight,
  clearInFlight,
  abortInFlight,
} from "./sync-runtime";

/**
 * Public server-action surface for the `/integrations` page.
 *
 * `syncNowAction` is what the SyncNowButton client component invokes.
 * Returns a serialisable subset of `RunSyncResult` — the client uses it
 * to render the post-run toast / inline status.
 */

export interface SyncNowResult {
  readonly ok: boolean;
  readonly state: string;
  readonly inserted: number;
  readonly deduped: number;
  readonly attempted: number;
  readonly errorSummary: string | null;
  readonly affectedScopes: readonly string[];
}

export async function syncNowAction(
  integrationId: string,
): Promise<SyncNowResult> {
  const registry = getRegistry();
  const store = getSyncStore();
  const controller = new AbortController();
  registerInFlight(integrationId, controller);
  let result: RunSyncResult;
  try {
    result = await runSync(integrationId, {
      registry,
      store,
      resolveToken: resolveTokenFromEnv,
      signal: controller.signal,
    });
  } finally {
    clearInFlight(integrationId);
  }

  revalidatePath("/integrations");

  const scopes = Array.from(
    new Set(
      result.adapterErrors
        .map((e) => e.affected_scope)
        .filter((s): s is string => s != null),
    ),
  );

  const errorSummary =
    result.fatalError ??
    (result.adapterErrors.length > 0
      ? result.adapterErrors
          .map((e) => `${e.kind}${e.affected_scope ? ` (${e.affected_scope})` : ""}`)
          .join(", ")
      : null);

  return {
    ok: result.ok,
    state: result.state,
    inserted: result.events.inserted,
    deduped: result.events.deduped,
    attempted: result.events.attempted,
    errorSummary,
    affectedScopes: scopes,
  };
}

/**
 * Operator-triggered cancel. Looks up the in-flight controller for the
 * integration and aborts it. Returns true if a controller was found.
 * The actual state cleanup happens inside `syncNowAction`'s finally +
 * the runner's abort path (sync_aborted → pending).
 */
export async function cancelSyncAction(integrationId: string): Promise<boolean> {
  return abortInFlight(integrationId);
}
