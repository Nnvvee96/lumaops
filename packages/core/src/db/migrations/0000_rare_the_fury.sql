CREATE TYPE "public"."credential_status" AS ENUM('missing', 'present', 'invalid', 'revoked');--> statement-breakpoint
CREATE TYPE "public"."date_range" AS ENUM('today', '7d', '30d', '90d', 'custom');--> statement-breakpoint
CREATE TYPE "public"."event_source" AS ENUM('github', 'cloudflare', 'stripe', 'tracking-api', 'app-telemetry', 'support', 'email', 'custom', 'manual', 'seed');--> statement-breakpoint
CREATE TYPE "public"."icon_source" AS ENUM('auto-favicon', 'uploaded', 'fallback');--> statement-breakpoint
CREATE TYPE "public"."integration_provider" AS ENUM('github', 'cloudflare', 'stripe', 'tracking-api', 'app-telemetry', 'support', 'email', 'custom');--> statement-breakpoint
CREATE TYPE "public"."integration_state" AS ENUM('pending', 'syncing', 'live', 'stale', 'error', 'planned');--> statement-breakpoint
CREATE TYPE "public"."product_status" AS ENUM('idea', 'pre-launch', 'beta', 'live', 'active', 'paused', 'archived');--> statement-breakpoint
CREATE TYPE "public"."product_type" AS ENUM('web-app', 'saas', 'desktop-app', 'mobile-app', 'api', 'library', 'research-system');--> statement-breakpoint
CREATE TABLE "decision_log_entry" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"title" text NOT NULL,
	"body_md" text NOT NULL,
	"decided_on" date NOT NULL,
	"reason" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"event_name" text NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"ingested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"source" "event_source" NOT NULL,
	"source_event_id" text,
	"anonymous_id" text,
	"user_identifier" text,
	"session_id" text,
	"properties" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "integration" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"product_id" uuid,
	"provider" "integration_provider" NOT NULL,
	"variant" text DEFAULT 'public' NOT NULL,
	"display_name" text NOT NULL,
	"state" "integration_state" DEFAULT 'pending' NOT NULL,
	"credential_status" "credential_status" DEFAULT 'missing' NOT NULL,
	"credential_fingerprint" text,
	"scopes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"freshness_threshold_seconds" integer DEFAULT 900 NOT NULL,
	"last_sync_at" timestamp with time zone,
	"last_sync_error" text,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "note" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"body_md" text NOT NULL,
	"pinned" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"status" "product_status" DEFAULT 'idea' NOT NULL,
	"product_type" "product_type" NOT NULL,
	"website_domain" text,
	"github_owner_repo" text,
	"release_channel" text,
	"primary_metric_key" text NOT NULL,
	"icon_url" text,
	"icon_source" "icon_source" DEFAULT 'fallback' NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workspace" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"studio_name" text,
	"studio_logo_url" text,
	"timezone" text DEFAULT 'Europe/Berlin' NOT NULL,
	"default_currency" text DEFAULT 'EUR' NOT NULL,
	"default_date_range" date_range DEFAULT '7d' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "decision_log_entry" ADD CONSTRAINT "decision_log_entry_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration" ADD CONSTRAINT "integration_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration" ADD CONSTRAINT "integration_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "note" ADD CONSTRAINT "note_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "event_source_dedupe_idx" ON "event" USING btree ("source","source_event_id") WHERE source_event_id IS NOT NULL;--> statement-breakpoint
CREATE INDEX "event_product_occurred_idx" ON "event" USING btree ("product_id","occurred_at");--> statement-breakpoint
CREATE INDEX "event_workspace_occurred_idx" ON "event" USING btree ("workspace_id","occurred_at");--> statement-breakpoint
CREATE INDEX "integration_workspace_idx" ON "integration" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "integration_product_idx" ON "integration" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "product_workspace_slug_idx" ON "product" USING btree ("workspace_id","slug");