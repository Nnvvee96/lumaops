/**
 * LumaOps Drizzle schema. Implements TDD §3 Data Model.
 *
 * Six tables in MVP:
 *   workspace, product, integration, event,
 *   note, decision_log_entry
 *
 * Phase 5 adds the cohort table (TDD §3.5) — schema sketched in the
 * TDD but intentionally NOT enforced in MVP migrations to keep the
 * surface minimal.
 *
 * All times are timestamptz. Postgres `uuid` is used; defaults use
 * gen_random_uuid() (UUID v4). UUID v7 sortable IDs are noted in
 * TDD §3 as a future preference once Postgres 18 lands; MEMORY notes
 * the deferral.
 */

import { sql } from "drizzle-orm";
import {
  pgEnum,
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  date,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

// ============================================================
// Enums — match TDD §3 exactly. Names quoted to avoid Postgres
// renaming kebab-case values.
// ============================================================

export const dateRangeEnum = pgEnum("date_range", [
  "today",
  "7d",
  "30d",
  "90d",
  "custom",
]);

export const productStatusEnum = pgEnum("product_status", [
  "idea",
  "pre-launch",
  "beta",
  "live",
  "active",
  "paused",
  "archived",
]);

export const productTypeEnum = pgEnum("product_type", [
  "web-app",
  "saas",
  "desktop-app",
  "mobile-app",
  "api",
  "library",
  "research-system",
]);

export const iconSourceEnum = pgEnum("icon_source", [
  "auto-favicon",
  "uploaded",
  "fallback",
]);

export const integrationProviderEnum = pgEnum("integration_provider", [
  "github",
  "cloudflare",
  "stripe",
  "tracking-api",
  "app-telemetry",
  "support",
  "email",
  "custom",
]);

export const integrationStateEnum = pgEnum("integration_state", [
  "pending",
  "syncing",
  "live",
  "stale",
  "error",
  "planned",
]);

export const credentialStatusEnum = pgEnum("credential_status", [
  "missing",
  "present",
  "invalid",
  "revoked",
]);

export const eventSourceEnum = pgEnum("event_source", [
  "github",
  "cloudflare",
  "stripe",
  "tracking-api",
  "app-telemetry",
  "support",
  "email",
  "custom",
  "manual",
  "seed",
]);

// ============================================================
// Tables
// ============================================================

// 3.1 Workspace — the private operating space ("Studio" publicly)
export const workspace = pgTable("workspace", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  studioName: text("studio_name"),
  studioLogoUrl: text("studio_logo_url"),
  timezone: text("timezone").notNull().default("Europe/Berlin"),
  defaultCurrency: text("default_currency").notNull().default("EUR"),
  defaultDateRange: dateRangeEnum("default_date_range")
    .notNull()
    .default("7d"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// 3.2 Product — the core domain object
export const product = pgTable(
  "product",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    status: productStatusEnum("status").notNull().default("idea"),
    productType: productTypeEnum("product_type").notNull(),
    websiteDomain: text("website_domain"),
    githubOwnerRepo: text("github_owner_repo"),
    releaseChannel: text("release_channel"),
    primaryMetricKey: text("primary_metric_key").notNull(),
    iconUrl: text("icon_url"),
    iconSource: iconSourceEnum("icon_source").notNull().default("fallback"),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("product_workspace_slug_idx").on(t.workspaceId, t.slug)]
);

// 3.3 Integration — attaches an external system to a workspace or product
export const integration = pgTable(
  "integration",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    productId: uuid("product_id").references(() => product.id, {
      onDelete: "cascade",
    }),
    provider: integrationProviderEnum("provider").notNull(),
    variant: text("variant").notNull().default("public"),
    displayName: text("display_name").notNull(),
    state: integrationStateEnum("state").notNull().default("pending"),
    credentialStatus: credentialStatusEnum("credential_status")
      .notNull()
      .default("missing"),
    credentialFingerprint: text("credential_fingerprint"),
    scopes: jsonb("scopes").notNull().default([]),
    freshnessThresholdSeconds: integer("freshness_threshold_seconds")
      .notNull()
      .default(900), // 15 min default
    lastSyncAt: timestamp("last_sync_at", { withTimezone: true }),
    lastSyncError: text("last_sync_error"),
    config: jsonb("config").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("integration_workspace_idx").on(t.workspaceId),
    index("integration_product_idx").on(t.productId),
  ]
);

// 3.4 Event — generic tracking unit
export const event = pgTable(
  "event",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    eventName: text("event_name").notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    ingestedAt: timestamp("ingested_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    source: eventSourceEnum("source").notNull(),
    sourceEventId: text("source_event_id"),
    anonymousId: text("anonymous_id"),
    userIdentifier: text("user_identifier"), // sha256(email) per TDD §6
    sessionId: text("session_id"),
    properties: jsonb("properties").notNull().default({}),
  },
  (t) => [
    // TDD §3.4 — UNIQUE(source, source_event_id) WHERE source_event_id IS NOT NULL.
    // Drizzle expresses partial unique indexes via `.where()`.
    uniqueIndex("event_source_dedupe_idx")
      .on(t.source, t.sourceEventId)
      .where(sql`source_event_id IS NOT NULL`),
    index("event_product_occurred_idx").on(t.productId, t.occurredAt),
    index("event_workspace_occurred_idx").on(t.workspaceId, t.occurredAt),
  ]
);

// 3.5 Operator-Surface Modules (broad scope per Decision E)

export const note = pgTable("note", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => product.id, { onDelete: "cascade" }),
  bodyMd: text("body_md").notNull(),
  pinned: boolean("pinned").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const decisionLogEntry = pgTable("decision_log_entry", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => product.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  bodyMd: text("body_md").notNull(),
  decidedOn: date("decided_on").notNull(),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ============================================================
// Inferred TypeScript types — for the rest of the codebase
// ============================================================

export type Workspace = typeof workspace.$inferSelect;
export type WorkspaceInsert = typeof workspace.$inferInsert;

export type Product = typeof product.$inferSelect;
export type ProductInsert = typeof product.$inferInsert;

export type Integration = typeof integration.$inferSelect;
export type IntegrationInsert = typeof integration.$inferInsert;

export type Event = typeof event.$inferSelect;
export type EventInsert = typeof event.$inferInsert;

export type Note = typeof note.$inferSelect;
export type NoteInsert = typeof note.$inferInsert;

export type DecisionLogEntry = typeof decisionLogEntry.$inferSelect;
export type DecisionLogEntryInsert = typeof decisionLogEntry.$inferInsert;

// ============================================================
// Schema bag for the Drizzle client factory
// ============================================================

export const schema = {
  workspace,
  product,
  integration,
  event,
  note,
  decisionLogEntry,
} as const;
