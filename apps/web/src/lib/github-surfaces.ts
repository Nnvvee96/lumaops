import "server-only";

import { and, desc, eq, sql } from "drizzle-orm";

import {
  event as eventTable,
  integration as integrationTable,
  type Integration,
} from "@lumaops/core";
import {
  integrationFreshness,
  type Freshness,
} from "@lumaops/core";

import { getDb } from "./db";

/**
 * Server-side reads for the `/releases` and `/support` pages.
 *
 * Discipline:
 * - We never invent data. Every metric on screen has a Freshness,
 *   computed from `integration.last_sync_at` + `freshness_threshold_seconds`.
 * - When no GitHub integration is connected for a product, we return
 *   `freshness: {kind: "missing", reason: "no_integration"}` rather
 *   than a fake zero — honest empty states ([LL §8.4]).
 * - PII does not enter these queries — issue titles + tag names are
 *   the only string content rendered, and they're already free of
 *   email / user-id payloads by the time S4C's adapter persists them.
 *
 * Queries are intentionally narrow: each page does one read pass.
 * Phase 5 may add aggregates and indexes once we have real volume.
 */

// ============================================================
// Release surface
// ============================================================

export interface ReleaseAssetRow {
  readonly name: string;
  readonly sizeBytes: number;
  readonly downloadCount: number;
  readonly createdAt: Date;
}

export interface LatestReleaseRow {
  readonly productId: string;
  readonly tagName: string;
  readonly name: string | null;
  readonly prerelease: boolean;
  readonly publishedAt: Date;
  readonly assets: readonly ReleaseAssetRow[];
}

export interface ReleaseSurface {
  readonly productId: string;
  readonly productName: string;
  readonly productSlug: string;
  readonly latest: LatestReleaseRow | null;
  readonly freshness: Freshness;
  readonly integration: Integration | null;
}

/**
 * Per-product summary for `/releases`. Joins the latest
 * `release_published` event with its asset events (filtered by
 * release_tag) and packages an honest Freshness for each row.
 */
export async function listReleaseSurfaces(
  workspaceId: string,
): Promise<readonly ReleaseSurface[]> {
  const db = getDb();

  // 1) Products + their GitHub integrations (left join — products with
  //    no integration still surface with Missing freshness).
  const rows = await db
    .select({
      productId: sql<string>`p.id`,
      productName: sql<string>`p.name`,
      productSlug: sql<string>`p.slug`,
      integration: integrationTable,
    })
    .from(sql`product p`)
    .leftJoin(
      integrationTable,
      and(
        eq(integrationTable.productId, sql`p.id`),
        eq(integrationTable.provider, "github"),
      ),
    )
    .where(and(eq(sql`p.workspace_id`, workspaceId), sql`p.archived_at is null`))
    .orderBy(sql`p.name asc`);

  // 2) For each product, fetch latest release + assets.
  const out: ReleaseSurface[] = [];
  for (const r of rows) {
    const productId = r.productId;
    const latest = await loadLatestRelease(productId);
    out.push({
      productId,
      productName: r.productName,
      productSlug: r.productSlug,
      latest,
      freshness: integrationFreshness(r.integration),
      integration: r.integration,
    });
  }
  return out;
}

async function loadLatestRelease(
  productId: string,
): Promise<LatestReleaseRow | null> {
  const db = getDb();
  const releaseRows = await db
    .select()
    .from(eventTable)
    .where(
      and(
        eq(eventTable.productId, productId),
        eq(eventTable.eventName, "release_published"),
      ),
    )
    .orderBy(desc(eventTable.occurredAt))
    .limit(1);

  const rel = releaseRows[0];
  if (!rel) return null;

  const tagName = (rel.properties as Record<string, unknown>)["tag_name"];
  if (typeof tagName !== "string") return null;

  const assetRows = await db
    .select()
    .from(eventTable)
    .where(
      and(
        eq(eventTable.productId, productId),
        eq(eventTable.eventName, "release_asset_uploaded"),
      ),
    )
    .orderBy(desc(eventTable.occurredAt));

  const assets: ReleaseAssetRow[] = [];
  for (const a of assetRows) {
    const props = a.properties as Record<string, unknown>;
    if (props["release_tag"] !== tagName) continue;
    const name = typeof props["asset_name"] === "string" ? props["asset_name"] : null;
    const size = typeof props["size_bytes"] === "number" ? props["size_bytes"] : null;
    const downloads =
      typeof props["download_count"] === "number" ? props["download_count"] : 0;
    if (name === null || size === null) continue;
    assets.push({
      name,
      sizeBytes: size,
      downloadCount: downloads,
      createdAt: a.occurredAt,
    });
  }

  const name = (rel.properties as Record<string, unknown>)["name"];
  const prerelease = Boolean(
    (rel.properties as Record<string, unknown>)["prerelease"],
  );

  return {
    productId,
    tagName,
    name: typeof name === "string" ? name : null,
    prerelease,
    publishedAt: rel.occurredAt,
    assets,
  };
}

// ============================================================
// Support surface
// ============================================================

export interface SupportLabelBreakdown {
  readonly bug: number;
  readonly support: number;
}

export interface SupportSurface {
  readonly productId: string;
  readonly productName: string;
  readonly productSlug: string;
  readonly openCount: number;
  readonly closedCount: number;
  readonly labels: SupportLabelBreakdown;
  readonly freshness: Freshness;
  readonly integration: Integration | null;
}

/** Per-product roll-up of `support_ticket_created` events. */
export async function listSupportSurfaces(
  workspaceId: string,
): Promise<readonly SupportSurface[]> {
  const db = getDb();

  const productRows = await db
    .select({
      productId: sql<string>`p.id`,
      productName: sql<string>`p.name`,
      productSlug: sql<string>`p.slug`,
      integration: integrationTable,
    })
    .from(sql`product p`)
    .leftJoin(
      integrationTable,
      and(
        eq(integrationTable.productId, sql`p.id`),
        eq(integrationTable.provider, "github"),
      ),
    )
    .where(and(eq(sql`p.workspace_id`, workspaceId), sql`p.archived_at is null`))
    .orderBy(sql`p.name asc`);

  const surfaces: SupportSurface[] = [];
  for (const r of productRows) {
    const tickets = await db
      .select()
      .from(eventTable)
      .where(
        and(
          eq(eventTable.productId, r.productId),
          eq(eventTable.eventName, "support_ticket_created"),
        ),
      );

    let openCount = 0;
    let closedCount = 0;
    const labels: SupportLabelBreakdown = { bug: 0, support: 0 };
    for (const t of tickets) {
      const props = t.properties as Record<string, unknown>;
      const state = typeof props["state"] === "string" ? props["state"] : "open";
      if (state === "closed") closedCount += 1;
      else openCount += 1;
      const raw = props["labels"];
      if (Array.isArray(raw)) {
        for (const l of raw) {
          if (typeof l !== "string") continue;
          const norm = l.toLowerCase();
          if (norm === "bug") (labels as { bug: number; support: number }).bug += 1;
          else if (norm === "support")
            (labels as { bug: number; support: number }).support += 1;
        }
      }
    }

    surfaces.push({
      productId: r.productId,
      productName: r.productName,
      productSlug: r.productSlug,
      openCount,
      closedCount,
      labels,
      freshness: integrationFreshness(r.integration),
      integration: r.integration,
    });
  }
  return surfaces;
}

// ============================================================
// Shared: integration → Freshness
// ============================================================

// Re-exported from core so callers in apps/web can import it from this
// module alongside the surface readers. Keeps the import surface tight.
export { integrationFreshness };
