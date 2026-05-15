---
system: Atlas Vault OS
version: 1.0
date: May 15, 2026
status: LOCKED / TECHNICAL_DESIGN
project: LumaOps
risk_tier: MEDIUM
dependencies: [[CONCEPT.md]], [[TECHSTACK.md]], [[IMPLEMENTATION_PLAN.md]], [[AUDIT.md]], [[CONSTRAINTS.md]], [[LESSONS_LEARNED.md]], [[MEMORY.md]]
---
# TDD.md — Technical Design Blueprint
# PROJECT: LumaOps  |  RISK TIER: Medium

This document is the locked technical contract for LumaOps. It binds CONCEPT (the what) to IMPLEMENTATION_PLAN (the how-order). Any drift between this contract and the code is the bug — fix the code or `/REPLAN` to update this contract, never let the two drift silently ([[LESSONS_LEARNED.md]] §1.1).

## 1. Harness Contract

**Risk tier**: Medium. MVP is read-only against external systems, but touches operator credentials and product/business signals.

**Risk paths**:
- Connector credential handling (token storage, scope verification, key rotation).
- External API sync (rate limits, schema drift, error classification).
- Metric derivation (source attribution, freshness, no fake confidence).
- Event ingest (PII handling, dedup, ordering).
- Hosted-mode auth (out of MVP scope; separate spec when Phase 4 opens).

**Verification gates** (every phase close):
- `pnpm typecheck` green.
- `pnpm lint` green.
- `pnpm test` green — unit tests on freshness calculator, source-label, error classifier, connector adapters (happy path + 401/403/429/network/schema-drift).
- Browser smoke: every route renders on 375 / 768 / 1440 widths without console errors.
- No secrets in repo (gitleaks or equivalent in CI).
- Every metric on screen carries source + freshness label (manual visual gate per phase).

**Docs drift trigger**: any change to stack, schema, connector contract, event schema, error taxonomy, freshness model, or auth model requires a TDD update in the same commit ([[LESSONS_LEARNED.md]] §2.3).

## 2. Shred (red-team findings — must be addressed before/during implementation)

- **Failure A — GitHub-as-truth confusion.** GitHub data mistaken for business truth. Mitigation: every GitHub-derived metric carries `source: github` label at the schema level (§4), not at the UI layer. Mixing GitHub-derived and business-truth values in the same aggregate is rejected at the type level.
- **Failure B — Silent connector failures.** A connector fails to sync and the dashboard keeps showing the last value as if it were fresh. Mitigation: explicit `state` + `last_sync_at` + `freshness_threshold_seconds` on every integration (§3); freshness flip is computed, not eyeballed (§5).
- **Failure C — Hosted-SaaS scope pollution.** Hosted concerns (multi-tenant auth, billing, OAuth marketplace) leak into MVP. Mitigation: `workspace_id` is present in the data model from day one for forward-compat, but only one workspace exists in MVP (single-user, no login per Decision O). No auth middleware. Hosted-mode gets its own TDD section in Phase 4+.
- **Failure D — Secrets in repo.** Operator commits `.env` or hardcodes a token. Mitigation: `.env` in `.gitignore`, `.env.example` committed instead; gitleaks scan in CI; token storage via env, not via files in `apps/web/`.
- **Failure E — Decorative dashboard.** Cockpit drifts into card-heavy marketing aesthetic. Mitigation: design gates enforce CONCEPT §12 (signal palette only in data contexts, three-font rule, no marketing-template shadows). First screen is the dashboard, not a splash.
- **Failure F — Local-vs-cloud connector confusion.** A "GitHub" connector entry could mean public api.github.com or a self-hosted GitHub Enterprise — wire-protocol-identical, privacy-distinct. Mitigation: `Integration.variant` field at the schema level (§3) makes the distinction structural, not a soft flag ([[LESSONS_LEARNED.md]] §8.1, §8.5).
- **Failure G — Schema drift from upstream APIs.** GitHub renames a field; Stripe deprecates a value. Mitigation: every adapter does Zod-validated normalization at its boundary; raw API responses never reach the domain layer.

## 3. Data Model

Drizzle schema lives in `packages/core/db/schema.ts`. PostgreSQL primary; SQL-compatible enough to migrate to Cloudflare D1 (SQLite) if Phase 4 ships an edge-hosted variant.

All times are `timestamptz` (UTC at storage, presented in workspace timezone at the UI). All IDs are `uuid v7` (sortable). All names referenced in code are stable identifiers — display labels live in a separate locale layer if introduced later.

### 3.1 Workspace
The private operating space. Internally `workspace`, publicly framed as **Studio**.

```ts
workspace {
  id:                  uuid (pk)
  name:                text                  // internal label
  studio_name:         text | null           // public-facing Studio name (Decision G)
  studio_logo_url:     text | null           // operator-uploaded studio logo
  timezone:            text                  // IANA, e.g. "Europe/Berlin"
  default_currency:    text                  // ISO-4217, e.g. "EUR"
  default_date_range:  enum('today','7d','30d','90d','custom')
  created_at:          timestamptz
  updated_at:          timestamptz
}
```

MVP invariant: exactly one row exists. Hosted-mode multi-tenancy may relax this; not in scope here.

### 3.2 Product
The core domain object. Every operationally-managed thing in the Studio is a Product.

```ts
product {
  id:                  uuid (pk)
  workspace_id:        uuid (fk → workspace.id, cascade)
  name:                text
  slug:                text                  // unique within workspace
  status:              enum('idea','pre-launch','beta','live','active','paused','archived')
  product_type:        enum('web-app','saas','desktop-app','mobile-app','api','library','research-system')
  website_domain:      text | null
  github_owner_repo:   text | null           // format: "owner/repo"
  release_channel:     text | null           // e.g. "stable" | "beta" | "nightly" | custom
  primary_metric_key:  text                  // refers to MetricDefinition (§5.1); defaulted by product_type
  icon_url:            text | null
  icon_source:         enum('auto-favicon','uploaded','fallback')   // Decision H
  archived_at:         timestamptz | null
  created_at:          timestamptz
  updated_at:          timestamptz
  unique(workspace_id, slug)
}
```

**Primary-metric defaults by product_type** (set at product creation, operator can override):

| product_type        | default primary_metric_key                |
|---------------------|-------------------------------------------|
| web-app (pre-launch)| `waitlist_count`                          |
| web-app (beta)      | `weekly_visits`                           |
| web-app (saas/live) | `mrr`                                     |
| desktop-app         | `downloads_weekly`                        |
| mobile-app          | `installs_weekly`                         |
| api                 | `api_calls_weekly`                        |
| library             | `weekly_active_integrations`              |
| research-system     | `entries_weekly`                          |

### 3.3 Integration
Attaches an external system to a workspace or a specific product.

```ts
integration {
  id:                          uuid (pk)
  workspace_id:                uuid (fk)
  product_id:                  uuid | null (fk)            // null = workspace-wide
  provider:                    enum('github','cloudflare','stripe','tracking-api','app-telemetry','support','email','custom')
  variant:                     text                        // e.g. "public" | "enterprise" | "cloud" | "self-hosted"
  display_name:                text                        // operator-friendly label
  state:                       enum('pending','syncing','live','stale','error','planned')
  credential_status:           enum('missing','present','invalid','revoked')
  credential_fingerprint:      text | null                 // masked preview, last 4 chars + hash
  scopes:                      jsonb                       // array of strings (provider-specific)
  freshness_threshold_seconds: int                         // when state flips live → stale
  last_sync_at:                timestamptz | null
  last_sync_error:             text | null
  config:                      jsonb                       // provider-specific config (rate limits, repo selection, etc.)
  created_at:                  timestamptz
  updated_at:                  timestamptz
}
```

**Variant rationale** ([[LESSONS_LEARNED.md]] §8.1, §8.5): `provider='github'` is not enough to distinguish public GitHub from Enterprise; `provider='stripe'` is not enough to distinguish test mode from live. `variant` is structural, not stylistic — it changes auth scope, rate limit, and what data is allowed to leave the local environment.

**`credential_status` is separate from `state`** ([[LESSONS_LEARNED.md]] §10.8): "I have a credential but it's revoked" is a different operator action than "I haven't started syncing yet" or "I'm rate-limited right now".

### 3.4 Event
Generic tracking unit. Every observable thing — a release, a sync, a funnel step, an error, a ticket — is an Event.

```ts
event {
  id:                  uuid v7 (pk)              // sortable by occurred_at when possible
  workspace_id:        uuid (fk)
  product_id:          uuid (fk)
  event_name:          text                       // see §4 Event Schema
  occurred_at:         timestamptz                // when the event actually happened (source of truth)
  ingested_at:         timestamptz                // when LumaOps recorded it
  source:              enum('github','cloudflare','stripe','tracking-api','app-telemetry','support','email','custom','manual','seed')
  source_event_id:     text | null                // provider-side ID for dedup; UNIQUE per (source, source_event_id)
  anonymous_id:        text | null                // for funnel join across sessions
  user_identifier:     text | null                // already-hashed (sha256) by adapter — see §6 PII
  session_id:          text | null
  properties:          jsonb                      // provider-specific payload
  unique(source, source_event_id) where source_event_id is not null
}
```

**Hash-at-the-adapter rule**: any PII (email, user ID, IP if relevant) is hashed inside the connector adapter before reaching the event table. Raw PII never persists. (See §6.)

### 3.5 Operator-Surface Modules (Decision E — broad scope)

Per-product surfaces beyond pure metrics. Minimal schema in MVP; UI polish in Phase 5.

```ts
note {
  id:           uuid (pk)
  product_id:   uuid (fk)
  body_md:      text                            // markdown
  pinned:       boolean
  created_at:   timestamptz
  updated_at:   timestamptz
}

decision_log_entry {
  id:           uuid (pk)
  product_id:   uuid (fk)
  title:        text
  body_md:      text
  decided_on:   date
  reason:       text
  created_at:   timestamptz
}

cohort {                                        // Phase 5 — schema sketched, not enforced in MVP migrations
  id:                uuid (pk)
  product_id:        uuid (fk)
  name:              text
  source_event_name: text                       // entry event ("waitlist_join", "beta_email_submitted")
  funnel_stages:     jsonb                      // ordered array of event_names with optional timeout windows
  cohort_window:     daterange                  // when cohort members were captured
  created_at:        timestamptz
}
```

Brainstorm + Launch Calendar share the `note` table with a `kind` discriminator added in Phase 5 (not in MVP migration to keep the table simple).

## 4. Event Schema

The naming convention is `verb_noun_qualifier` (snake_case), tied to the five public verbs from CONCEPT §3.

### 4.1 Canonical event names by category

**Release / shipping**:
- `release_published` (source: github)
- `release_asset_uploaded`
- `release_asset_downloaded`
- `release_failed`

**Funnel / converting**:
- `page_view` (source: cloudflare or tracking-api)
- `cta_clicked`
- `signup_form_viewed`
- `signup_submitted`
- `waitlist_join`
- `beta_email_submitted`
- `download_section_view`
- `download_link_opened`
- `download_started`

**Revenue / earning**:
- `checkout_started` (source: stripe)
- `subscription_created`
- `subscription_renewed`
- `subscription_cancelled`
- `refund_issued`

**Support / breaking**:
- `support_ticket_created` (source: support or github)
- `error_reported` (source: app-telemetry)
- `crash_reported`

**Telemetry / growing**:
- `app_first_launch`
- `app_active_session`
- `feature_used`
- `provider_configured`         // app internal — operator wired up something

**LumaOps-internal**:
- `connector_sync_started`
- `connector_sync_finished`
- `connector_sync_failed`
- `connector_state_changed`

New event names are added by adapter PRs against `packages/core/events/registry.ts`. Any event arriving with an unknown `event_name` is logged and ingested but does not contribute to derived metrics until registered.

### 4.2 Source labels

Every event carries an immutable `source` enum value. The mapping `source → "via X · synced HH:MM"` UI label is rendered at presentation time by `packages/ui/source-label`. The component refuses to render without a source ([[LESSONS_LEARNED.md]] §8.4).

### 4.3 PII / user identification — see §6 below for full rules.

## 5. Metric Model

Metrics are derived from Events and from Integration API data — they are not stored as a row unless explicitly cached. The MVP computes on read.

### 5.1 MetricDefinition (code-level registry, `packages/core/metrics/registry.ts`)

```ts
type MetricDefinition = {
  key:               string                          // e.g. "weekly_visits", "mrr"
  label:             string                          // operator-facing
  category:          'growth' | 'revenue' | 'release' | 'support' | 'development'
  source:            'computed_from_events' | 'derived_from_integration' | 'manual'
  aggregation:       'sum' | 'count' | 'distinct_count' | 'rate' | 'latest_value' | 'formula'
  value_type:        'number' | 'percentage' | 'currency' | 'duration_ms'
  freshness:         { depends_on: 'event_age' | 'integration_id'; threshold_seconds: number }
  computation:       (ctx: ComputeContext) => Promise<MetricValue>
  required_integrations: ProviderName[]              // empty if any source works
}
```

Every value rendered on screen passes through this contract; the UI component for a metric refuses to render without all required fields.

### 5.2 Freshness taxonomy

```ts
type Freshness =
  | { kind: 'observed';    last_observed_at: Date;    source_id: string }
  | { kind: 'derived';     last_observed_at: Date;    source_id: string;   derivation: string }
  | { kind: 'inferred';    last_observed_at: Date;    source_id: string;   confidence: number }
  | { kind: 'stale';       last_observed_at: Date;    threshold_seconds: number;   actual_age_seconds: number }
  | { kind: 'missing';     reason: 'no_integration' | 'integration_not_connected' | 'no_data_yet' }
  | { kind: 'mock';        until: Date }              // dev/demo only — never live
```

**Rule** ([[LESSONS_LEARNED.md]] §8.4): a value is `observed` only if its `last_observed_at + threshold_seconds > now()`. Otherwise it auto-flips to `stale`. The flip is computed at every read; no scheduled job needed for MVP.

**Rule**: `mock` freshness is never shipped in production builds — type-level guarded by build flag.

## 6. PII & Data Hygiene

**Hash-at-the-boundary**: every adapter takes raw external data and returns normalized events where PII fields are already hashed.
- Email → `sha256(lower(trim(email)))` stored in `event.user_identifier`.
- User IDs → `sha256(provider_id)`.
- IP addresses → not stored unless explicitly opted-in via integration config (`config.store_raw_ip = true`).

**Source-label hygiene** ([[LESSONS_LEARNED.md]] §13.5): any path-like string in events / metrics / source labels strips absolute filesystem paths and machine identifiers before persistence and before any clipboard / export surface.

**MVP working answer for the CONCEPT §17 PII question**: hash emails, no raw PII unless the operator explicitly opts in per-integration. Revisit when first hosted-mode discussion opens.

## 7. Connector Adapter Interface

`packages/connectors` exposes a single TypeScript interface every adapter implements. New connectors land as PRs against this contract.

```ts
export type ConnectorAdapter = {
  provider: ProviderName
  variant:  string

  // Auth & lifecycle
  validateCredentials(config: ConnectorConfig): Promise<CredentialValidation>
  health(config: ConnectorConfig):              Promise<ConnectorHealth>

  // Sync
  sync(config: ConnectorConfig, since: Date):   Promise<SyncResult>

  // Discovery
  capabilities():                                ConnectorCapabilities
}

type CredentialValidation =
  | { ok: true;  scopes: string[];  fingerprint: string }
  | { ok: false; reason: 'missing' | 'invalid' | 'insufficient_scope' | 'revoked';  message: string }

type ConnectorHealth = {
  reachable:              boolean
  latency_ms:             number
  rate_limit_remaining:   number | null
  rate_limit_reset_at:    Date   | null
}

type SyncResult = {
  events:        NormalizedEvent[]
  metrics_pull:  MetricSample[]            // for metrics retrieved directly from provider APIs
  next_since:    Date                       // pagination cursor for next sync
  errors:        ConnectorError[]
}

type ConnectorError = {
  kind:           'auth' | 'rate_limit' | 'schema_drift' | 'network' | 'permission' | 'not_found' | 'unknown'
  message:        string
  retry_after_ms: number | null
  affected_scope: string | null
}

type ConnectorCapabilities = {
  supports_realtime: boolean
  supports_backfill: boolean
  required_scopes:   string[]
  rate_limits:       { window: 'hour' | 'minute'; limit: number }[]
  privacy_class:     'local' | 'hosted'                // distinguishes self-executing from cloud-hosted ([[LESSONS_LEARNED.md]] §8.1)
}
```

**Adapter rules**:

1. **Zod-validate at the boundary.** Every external response is parsed by a Zod schema in the adapter; the rest of LumaOps consumes normalized types only.
2. **Hash PII before returning events** (§6).
3. **Classify errors by intent, not by message string** ([[LESSONS_LEARNED.md]] §7.3). Map upstream HTTP / SDK errors to one of the `ConnectorError.kind` values; the framework decides retry/backoff/state-flip from the kind.
4. **Respect `since` cursor.** Adapters never re-fetch the full history on routine sync; backfill is a separate explicit operation.
5. **Honor abort.** A long-running sync must be cancellable by the framework ([[LESSONS_LEARNED.md]] §6.4). Adapters take an `AbortSignal` (via the framework's `sync` invocation context) and respect it within ~1s.

## 8. Error Classification

The framework classifies any thrown error from any layer into one of:

```ts
type ErrorClass =
  | 'connector_auth'
  | 'connector_rate_limit'
  | 'connector_schema_drift'
  | 'connector_network'
  | 'connector_permission'
  | 'connector_not_found'
  | 'persistence_db'
  | 'persistence_constraint'
  | 'validation_input'
  | 'internal_bug'
```

Each class has a documented:
- Operator-visible message (specific, not generic).
- Recovery action (what the operator can do — verify token, wait N seconds, contact support).
- Auto-retry behaviour (yes / no / capped exponential).
- State machine impact (does this flip the integration state? to what?).

The classifier (`packages/core/errors/classify.ts`) is unit-tested for every class; new adapter error shapes route through it or fail review.

## 9. Auth & Security Posture (MVP, Decision O)

**MVP**: no auth.
- App starts without a login screen.
- `.env` defines `LUMAOPS_OPERATOR_NAME` and credential env vars per connector (`GITHUB_TOKEN`, etc.).
- All routes are unauthenticated locally.

**Self-hosted public deployment** (operator chooses):
- Cloudflare Access in front of the deployment is the recommended path; LumaOps does not implement its own auth in the MVP.
- Reverse-proxy auth (Caddy basic auth, oauth2-proxy, Tailscale Serve) are equivalent options.

**Secret rules**:
- `.env` lives in `.gitignore`; `.env.example` is committed.
- Secrets are read at process start; never written to disk by application code.
- No secret ever appears in a log line at any level (CI grep gate).
- gitleaks runs on every PR.

**Hosted mode**: out of MVP scope. When Phase 4 opens, a dedicated `docs/HOSTED_SECURITY.md` will own the multi-tenant auth, OAuth, KMS-backed secret storage, audit log, rate limit, and abuse-control specs. This TDD will not cover those.

## 10. Observability & Logging

- **Structured logs only.** JSON lines (or equivalent) in production builds. Free-form `console.log` is a lint failure outside `packages/dev-tools`.
- **No PII in logs.** Same rules as §6 — hashed or omitted at the call site, not stripped at the log handler.
- **Source-attributed errors.** Every logged error carries the adapter / module that produced it, the `ErrorClass`, and a stable error code.
- **Operator-visible activity log** (Phase 3): the cockpit has a Settings → Activity panel that shows the last N connector syncs with state transitions. This consumes the same `connector_sync_*` events from §4.

## 11. Monorepo Layout (locked from TECHSTACK §3)

```
apps/
  landing/        # Static marketing site, already shipped
  web/            # Next.js cockpit (Phase 2)
  desktop/        # Tauri wrapper, Phase 2 optional

packages/
  core/           # domain types, freshness logic, error classifier, metric registry
    db/           # Drizzle schema, migrations
    events/       # event-name registry, normalization helpers
    metrics/      # MetricDefinition registry, computation helpers
    errors/       # ErrorClass + classifier
  connectors/     # ConnectorAdapter implementations (one folder per provider)
    github/
    cloudflare/
    stripe/
    ...
  ui/             # shadcn-based components reused across apps/web (and later apps/desktop)
    source-label/
    freshness-badge/
    connector-tile/
    ...

docs/             # this canonical doc set
```

Workspaces: pnpm workspaces. Internal packages reference each other via `workspace:*` protocol.

## 12. Phase-1 Acceptance Criteria

This TDD is considered locked when:

- All sections above are reviewed top-to-bottom by the operator and `/SHRED` finds no HIGH-risk failure modes unaddressed.
- The 11 Phase-1 decisions in `MEMORY.md` §1.1 are all referenced from this TDD where they constrain technical choices.
- The connector adapter interface (§7) is walked against three sketch implementations (GitHub, Cloudflare, Stripe) without finding mandatory fields missing or contract gaps.
- The freshness taxonomy (§5.2) is walked against five real metric scenarios (live observed, stale, derived from another metric, inferred from heuristics, missing because no integration is connected) and produces the right rendering in each case.
- The PII rules (§6) are walked against three real event shapes (GitHub issue, Cloudflare page view, Stripe checkout) and produce no raw PII at rest.

Once locked, Phase 2 (App Skeleton) may begin. Any drift requires `/REPLAN` and a TDD version bump.

## 13. Out of Scope for this TDD

These deliberately do not live in this document and require their own spec when they open:

- **HOSTED_SECURITY.md** — multi-tenant auth, OAuth, KMS, audit log (Phase 4+).
- **DESKTOP_SHELL.md** — Tauri wrapper packaging, auto-update, OS integration (Phase 2 optional).
- **CONNECTOR_MARKETPLACE.md** — hosted catalog UX and review pipeline (Phase 4 candidate, Decision L).
- **COHORT_ENGINE.md** — identity resolution and event-join algorithms for native cohort tracking (Phase 5, Decision J).
- **MORNING_VIEW.md** — explicit Morning surface design (Phase 5, Decision I).
