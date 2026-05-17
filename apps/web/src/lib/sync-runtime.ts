import "server-only";

/**
 * Wires `@lumaops/core/sync` to the actual database + adapter
 * implementations. Imported by every server action that triggers a
 * sync. The registry is built once per process (module-scope cache)
 * so connectors register exactly once across hot reloads.
 */

import { eq } from "drizzle-orm";

import {
  event as eventTable,
  integration as integrationTable,
  type Integration,
  type NormalizedEvent,
  MutableAdapterRegistry,
  type SyncStore,
  type IntegrationStatePatch,
  type InsertEventsResult,
} from "@lumaops/core";
import { createGitHubAdapter } from "@lumaops/connectors";

import { getDb } from "./db";

declare global {
  // eslint-disable-next-line no-var
  var __lumaopsSyncRegistry: MutableAdapterRegistry | undefined;
  // eslint-disable-next-line no-var
  var __lumaopsInFlight: Map<string, AbortController> | undefined;
}

/**
 * In-flight sync controllers, keyed by integration id. Used so a
 * client-side Cancel button can abort a running sync via a separate
 * server action. The process-scope map is safe under MVP single-user;
 * Phase B (hosted) replaces this with a per-tenant signal table.
 */
function getInFlight(): Map<string, AbortController> {
  if (!globalThis.__lumaopsInFlight) {
    globalThis.__lumaopsInFlight = new Map<string, AbortController>();
  }
  return globalThis.__lumaopsInFlight;
}

export function registerInFlight(id: string, controller: AbortController): void {
  const map = getInFlight();
  // If a sync was already in flight for this id, abort the old one —
  // the new sync supersedes it. Guards against double-click races.
  map.get(id)?.abort();
  map.set(id, controller);
}

export function clearInFlight(id: string): void {
  getInFlight().delete(id);
}

export function abortInFlight(id: string): boolean {
  const map = getInFlight();
  const c = map.get(id);
  if (!c) return false;
  c.abort();
  map.delete(id);
  return true;
}

export function getRegistry(): MutableAdapterRegistry {
  if (globalThis.__lumaopsSyncRegistry) return globalThis.__lumaopsSyncRegistry;
  const r = new MutableAdapterRegistry();
  r.register(createGitHubAdapter());
  globalThis.__lumaopsSyncRegistry = r;
  return r;
}

/**
 * Resolve the token for an integration row. MVP single-user / single-env:
 * tokens are env vars named `LUMAOPS_<PROVIDER>_TOKEN`.
 */
export function resolveTokenFromEnv(row: Integration): string | null {
  const envName = `LUMAOPS_${row.provider.toUpperCase()}_TOKEN`;
  const v = process.env[envName];
  return v && v.length > 0 ? v : null;
}

/**
 * SyncStore implementation backed by drizzle. Wrapped in a single
 * function so callers can pass `getSyncStore()` to `runSync` without
 * thinking about lifecycle.
 */
export function getSyncStore(): SyncStore {
  const db = getDb();
  return {
    async loadIntegration(id: string): Promise<Integration | null> {
      const rows = await db
        .select()
        .from(integrationTable)
        .where(eq(integrationTable.id, id))
        .limit(1);
      return rows[0] ?? null;
    },

    async listIntegrations(): Promise<readonly Integration[]> {
      return db.select().from(integrationTable);
    },

    async updateIntegrationState(
      id: string,
      patch: IntegrationStatePatch,
    ): Promise<void> {
      const update: Record<string, unknown> = {
        state: patch.state,
        updatedAt: new Date(),
      };
      if (patch.lastSyncAt !== undefined) update["lastSyncAt"] = patch.lastSyncAt;
      if (patch.lastSyncError !== undefined)
        update["lastSyncError"] = patch.lastSyncError;
      await db
        .update(integrationTable)
        .set(update)
        .where(eq(integrationTable.id, id));
    },

    async insertEvents(
      events: readonly NormalizedEvent[],
    ): Promise<InsertEventsResult> {
      if (events.length === 0) {
        return { attempted: 0, inserted: 0, deduped: 0 };
      }
      const values = events.map((e) => ({
        workspaceId: e.workspace_id,
        productId: e.product_id,
        eventName: e.event_name,
        occurredAt: e.occurred_at,
        source: e.source,
        sourceEventId: e.source_event_id ?? null,
        anonymousId: e.anonymous_id ?? null,
        userIdentifier: e.user_identifier ?? null,
        sessionId: e.session_id ?? null,
        properties: e.properties,
      }));
      const inserted = await db
        .insert(eventTable)
        .values(values)
        .onConflictDoNothing({
          // Partial unique index — drizzle expects the columns.
          target: [eventTable.source, eventTable.sourceEventId],
        })
        .returning({ id: eventTable.id });
      return {
        attempted: events.length,
        inserted: inserted.length,
        deduped: events.length - inserted.length,
      };
    },
  };
}
