/**
 * ============================================================
 *  ⚠️  LumaOps MAINTAINER DEMO DATA — NOT FOR END-USERS  ⚠️
 * ============================================================
 *
 * This file is for the LumaOps maintainer's own development workflow.
 * It populates the canonical Studio example from CONCEPT §5.3
 * (Navyug — Indie Studio with four real proving-ground products:
 * NOESIS.Tools, ApplyIQ, Planora, OHARA) plus an example NOESIS
 * funnel of seeded events.
 *
 * Anyone running their own LumaOps instance — whether self-hosted,
 * cloned for personal use, or running it in the hosted Phase B/C
 * beta — should NOT execute this. A fresh clone gives an empty
 * cockpit; the operator creates their own Studio + products via
 * the first-run UI (EXPANSION_BACKLOG E-011) once that lands.
 *
 * Idempotent — running it twice is a no-op. Restricted to the
 * `seed:demo` script (intentionally not the default `seed`) so the
 * filename + invocation both make the maintainer-only intent
 * unmistakable.
 *
 * Run:  pnpm --filter @lumaops/core seed:demo
 * Pre:  docker compose up -d  &&  pnpm --filter @lumaops/core db:migrate
 */

import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { sql } from "drizzle-orm";

import { createClient } from "./client";
import { event, integration, product, workspace } from "./schema";
import type { ProductInsert, IntegrationInsert, EventInsert } from "./schema";

// ============================================================
// Env bootstrap — find .env at the repo root (3 levels up from this
// file: src/db/seed.ts → packages/core/src/db → packages/core →
// packages → repo root).
// ============================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
loadEnv({ path: resolve(__dirname, "..", "..", "..", "..", ".env") });

function requireDatabaseUrl(): string {
  const url = process.env["DATABASE_URL"];
  if (!url) {
    console.error(
      "[seed] DATABASE_URL is not set. Did you copy .env.example to .env and run `docker compose up -d`?",
    );
    process.exit(1);
  }
  return url;
}
const DATABASE_URL = requireDatabaseUrl();

// ============================================================
// Deterministic UUIDs — keep seed entities at known IDs so re-runs
// upsert the same rows.
// ============================================================

const NAVYUG_WORKSPACE_ID = "00000000-0000-0000-0000-000000000001";
const NOESIS_PRODUCT_ID =   "00000000-0000-0000-0000-000000000010";
const APPLYIQ_PRODUCT_ID =  "00000000-0000-0000-0000-000000000011";
const PLANORA_PRODUCT_ID =  "00000000-0000-0000-0000-000000000012";
const OHARA_PRODUCT_ID =    "00000000-0000-0000-0000-000000000013";
const NOESIS_GITHUB_INTEGRATION_ID = "00000000-0000-0000-0000-000000000100";

// ============================================================
// Seed data
// ============================================================

const SEEDED_PRODUCTS: readonly ProductInsert[] = [
  {
    id: NOESIS_PRODUCT_ID,
    workspaceId: NAVYUG_WORKSPACE_ID,
    name: "NOESIS.Tools",
    slug: "noesis-tools",
    status: "beta",
    productType: "desktop-app",
    websiteDomain: "noesis.tools",
    githubOwnerRepo: "Nnvvee96/NOESIS",
    primaryMetricKey: "downloads_weekly",
    iconSource: "auto-favicon",
  },
  {
    id: APPLYIQ_PRODUCT_ID,
    workspaceId: NAVYUG_WORKSPACE_ID,
    name: "ApplyIQ",
    slug: "applyiq",
    status: "beta",
    productType: "web-app",
    websiteDomain: "applyiq.app",
    githubOwnerRepo: "Nnvvee96/ApplyIQ",
    primaryMetricKey: "weekly_visits",
    iconSource: "auto-favicon",
  },
  {
    id: PLANORA_PRODUCT_ID,
    workspaceId: NAVYUG_WORKSPACE_ID,
    name: "Planora",
    slug: "planora",
    status: "pre-launch",
    productType: "web-app",
    websiteDomain: "getplanora.app",
    githubOwnerRepo: "Nnvvee96/getplanora",
    primaryMetricKey: "waitlist_count",
    iconSource: "auto-favicon",
  },
  {
    id: OHARA_PRODUCT_ID,
    workspaceId: NAVYUG_WORKSPACE_ID,
    name: "OHARA",
    slug: "ohara",
    status: "active",
    productType: "research-system",
    websiteDomain: "ohara-labs.com",
    githubOwnerRepo: "Nnvvee96/OHARA-Library",
    primaryMetricKey: "entries_weekly",
    iconSource: "auto-favicon",
  },
];

const NOESIS_GITHUB_INTEGRATION: IntegrationInsert = {
  id: NOESIS_GITHUB_INTEGRATION_ID,
  workspaceId: NAVYUG_WORKSPACE_ID,
  productId: NOESIS_PRODUCT_ID,
  provider: "github",
  variant: "public",
  displayName: "GitHub · Nnvvee96/NOESIS",
  state: "pending",
  credentialStatus: "missing",
  freshnessThresholdSeconds: 900,
  scopes: [],
  config: { owner_repo: "Nnvvee96/NOESIS" },
};

/** Build the small NOESIS funnel as seed events. */
function buildNoesisFunnelEvents(now: Date): readonly EventInsert[] {
  const events: EventInsert[] = [];
  const hourMs = 60 * 60 * 1000;
  const dayMs = 24 * hourMs;

  // 7 days, escalating funnel volumes — visit → download_section_view
  //  → beta_email_submitted → download_started.
  const volumes = [
    { eventName: "page_view",              count: 12 },
    { eventName: "download_section_view",  count: 6 },
    { eventName: "beta_email_submitted",   count: 3 },
    { eventName: "download_started",       count: 2 },
  ] as const;

  let sequence = 0;
  for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
    for (const { eventName, count } of volumes) {
      // Distribute `count` events across the day.
      for (let i = 0; i < count; i++) {
        const occurredAt = new Date(
          now.getTime() - dayOffset * dayMs - i * (hourMs / 2),
        );
        events.push({
          workspaceId: NAVYUG_WORKSPACE_ID,
          productId: NOESIS_PRODUCT_ID,
          eventName,
          occurredAt,
          source: "seed",
          sourceEventId: `seed-noesis-${eventName}-d${dayOffset}-${i}`,
          properties: { seeded: true, day_offset: dayOffset, sequence: sequence++ },
        });
      }
    }
  }

  return events;
}

// ============================================================
// Run
// ============================================================

async function main(): Promise<void> {
  const { db, pool } = createClient({ databaseUrl: DATABASE_URL });

  try {
    console.log("[seed] starting…");

    // Workspace — upsert by id (deterministic UUID).
    await db
      .insert(workspace)
      .values({
        id: NAVYUG_WORKSPACE_ID,
        name: "Navyug",
        studioName: "Navyug — Indie Studio",
        timezone: "Europe/Berlin",
        defaultCurrency: "EUR",
        defaultDateRange: "7d",
      })
      .onConflictDoUpdate({
        target: workspace.id,
        set: {
          name: sql`excluded.name`,
          studioName: sql`excluded.studio_name`,
          updatedAt: sql`now()`,
        },
      });
    console.log("[seed]   workspace: Navyug — Indie Studio");

    // Products — onConflict on (workspace_id, slug).
    for (const p of SEEDED_PRODUCTS) {
      await db
        .insert(product)
        .values(p)
        .onConflictDoNothing({
          target: [product.workspaceId, product.slug],
        });
      console.log(`[seed]   product:   ${p.name} (${p.status}, ${p.productType})`);
    }

    // NOESIS GitHub integration — upsert by id.
    await db
      .insert(integration)
      .values(NOESIS_GITHUB_INTEGRATION)
      .onConflictDoNothing({ target: integration.id });
    console.log(`[seed]   integration: ${NOESIS_GITHUB_INTEGRATION.displayName} (${NOESIS_GITHUB_INTEGRATION.state})`);

    // NOESIS funnel events — unique (source, source_event_id) per S3A migration.
    const seededEvents = buildNoesisFunnelEvents(new Date());
    await db
      .insert(event)
      .values([...seededEvents])
      .onConflictDoNothing({
        target: [event.source, event.sourceEventId],
      });
    console.log(`[seed]   events:    ${seededEvents.length} NOESIS funnel events`);

    console.log("[seed] done. Re-run is a no-op.");
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
