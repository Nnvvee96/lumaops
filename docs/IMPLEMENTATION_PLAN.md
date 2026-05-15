---
system: Atlas Vault OS
version: 2.1
date: May 15, 2026
status: ACTIVE / EXECUTION_MAP
project: LumaOps
references:
  - "../../MD-Files/MD-Files Templates/LESSONS_LEARNED.md"
dependencies: [[CONCEPT.md]], [[TDD.md]], [[TECHSTACK.md]], [[AUDIT.md]], [[LESSONS_LEARNED.md]], [[MEMORY.md]], [[SESSION_LOGS.md]], [[SKILLS_COMPOUNDING.md]]
---
# IMPLEMENTATION_PLAN.md — Execution Map
# PROJECT: LumaOps

## 0. How to read this plan

Each phase is an independent ship unit. Order is strict — gates of phase *N* must pass before phase *N+1* opens.

Inside each phase, work is broken into **sub-slices** — the smallest independently shippable unit. One sub-slice = one PR. Sub-slices have a stable ID (e.g. `S2A`, `S3D`) used in branch names, commit prefixes, and cross-references.

Per phase you'll find:

- **Goal** — what this phase makes true.
- **Scope-in / Scope-out** — explicit boundaries to prevent drift.
- **Sub-Slices** — ordered, executable; each with concrete steps + DoD.
- **Risks From Experience** — bullets referencing `[[LESSONS_LEARNED.md]]` cross-project ledger by stable §N.M ID.
- **Verification** — machine-verifiable evidence the phase passes its gate.
- **Definition of Done** — what must be true to move on.

The plan is locked once approved. Re-opening a closed phase requires an explicit `/REPLAN`.

## 1. Overview

Goal: Build LumaOps as an open-source, self-hostable product operations cockpit for indie software.

Initial proving ground: NOESIS.Tools.

Risk Tier: Medium. The MVP is read-only, but it touches external credentials and product/business signals.

Locked stance (do not relitigate inside a phase):

- Browser-based web app first.
- Open-source core first.
- Hosted app later.
- Desktop wrapper later, if needed.
- No registration/account system in the MVP unless the hosted phase is explicitly approved.
- Marketing site (`lumaops.app`) is a separate ship from the app itself (see `docs/TECHSTACK.md` §2a).

## 1.1 Slice IDs, Branch Naming, PR Discipline

### Slice IDs
- Format: `S<phase><letter>` — e.g. `S2A` is the first sub-slice of Phase 2.
- IDs are stable for the life of the plan. New slices get the next free letter; they are never renumbered.
- IDs appear in: branch names, commit subject prefixes, PR titles, sub-slice DoD checklists, SESSION_LOGS checkpoints.

### Branch naming
- Format: `slice/S<phase><letter>-<kebab-summary>` — e.g. `slice/S2A-monorepo-pnpm`.
- One branch = one sub-slice = one PR.
- Branches are deleted on merge.
- Hot fixes outside the slice plan: `hotfix/<kebab-summary>` — must be tiny, no scope creep.

### Commit discipline
- Subject prefix: `[<slice-id>] <imperative summary>` — e.g. `[S2A] add pnpm workspace + apps/web stub`.
- One PR may contain multiple commits but every commit references the same slice ID.
- Conventional-commit verbs accepted but not required: `add / fix / update / remove / refactor / docs / test / chore`.

### PR Discipline
- Title: `[S<id>] <summary>`.
- Body must include: **Goal**, **What changed**, **DoD checklist** (copied from the sub-slice in this plan, ticked), **Test plan**, **Lessons applied** (which `[LL §N.M]` IDs were checked).
- Merge strategy: squash merge (one slice = one commit on `main`).
- Auto-delete branch on merge.
- Required CI checks before merge: typecheck, lint, build, tests, gitleaks (see §1.2).

### Out-of-band changes
- Documentation-only commits that don't fit a slice: prefix `[docs]`, no slice ID required.
- Trivial config changes (CI tweak, dependency bump): prefix `[chore]`, no slice ID required, but must still pass CI.

## 1.2 CI/CD Pipeline

CI runs in GitHub Actions, triggered on every PR + every push to `main`. Cockpit (`apps/web`) and landing (`apps/landing`) have separate workflows; shared packages run on both.

### Required checks (block merge if any fail)

| Check        | Command                              | Surface                  |
|--------------|--------------------------------------|--------------------------|
| typecheck    | `pnpm -r typecheck`                  | every TS package         |
| lint         | `pnpm -r lint`                       | every package + apps/web |
| build        | `pnpm -r build`                      | every buildable package  |
| unit tests   | `pnpm -r test`                       | packages with tests      |
| gitleaks     | `gitleaks detect --staged`           | repo-wide                |

### Optional / soft checks (warning only)
- Lighthouse on `apps/web` preview deploys (a11y ≥ 95, perf budgets).
- Playwright visual regression (introduced in Phase 5).
- Bundle-size diff (introduced when `apps/web` ships first feature).

### Deploy targets
- `apps/landing` → Cloudflare Pages, auto-deploy on `main` (already live at `lumaops.app`).
- `apps/web` → no auto-deploy in MVP (self-hosted target). Docker image builds on `main` push as a downstream artefact; tagged releases publish to GHCR when Phase 6 closes.

### Branch protection on `main`
- Linear history (no merge commits).
- Required signed commits: off in MVP, on when hosted-mode opens (Phase 4+).
- Required PR review: self-merge allowed in solo phase, mandated when team mode opens.

## 2. Phase Sequence

### Phase 0 — Repository Bootstrap

**STATUS: DONE (2026-05-15).**

Repository public at `github.com/Nnvvee96/lumaops`, MIT license, README states product stance, full `docs/` baseline in place, `apps/landing/` deployed to Cloudflare Pages with custom domain `lumaops.app`, favicons + OG meta verified.

**Risks From Experience (applied).**
- Docs drift creates contradictory instructions. `[LL §1.1]`, `[LL §2.3]`.
- Documentation update is part of the ship. `[LL §2.3]`.

---

### Phase 1 — Technical Spec Lock

**STATUS: DONE (2026-05-15).**

- 11 Decisions captured in `docs/MEMORY.md` §1.1 (E–O): 8 product-scope from CONCEPT §17 + 3 stack decisions (Drizzle, Next.js+Postgres, single-user `.env`).
- `docs/TECHSTACK.md` §2b locked.
- `docs/TDD.md` locked at 13 sections covering data model, event schema, metric/freshness model, PII rules, full ConnectorAdapter TypeScript contract, error classification, auth posture, observability.
- `docs/CONCEPT.md` §17 updated with resolved markers + pointers to MEMORY.

Phase 2 is now unblocked.

**Risks From Experience (applied).**
- Spec drift behind code is worse than no spec. `[LL §1.1]`.
- Examples are not scope boundaries. `[LL §1.3]`.
- Connector interface walked against three sketch providers before lock. `[LL §1.4]`, `[LL §5.1]`.
- Single source of truth for cross-cutting policy. `[LL §1.2]`, `[LL §8.4]`.
- Local-vs-cloud is structural (`variant` field), not a soft flag. `[LL §8.1]`, `[LL §8.5]`.

---

### Phase 2 — App Skeleton

**Goal.** A running Next.js cockpit at `apps/web` with layout shell, design tokens, and placeholder routes. No domain logic, no connectors. Same paper-and-Lumi visual identity as `apps/landing`.

**Scope-in.** Monorepo workspace, Next.js + TS strict + Tailwind + shadcn/ui + lucide-react, design tokens, theme toggle, layout shell, placeholder routes, CI pipeline.

**Scope-out.** Domain logic (Phase 3), connectors (Phase 4), real charts (Phase 5).

#### Sub-Slice S2A — Monorepo + pnpm workspace

**Steps.**
1. Create `pnpm-workspace.yaml` listing `apps/*` and `packages/*`.
2. Move `apps/landing/` into the workspace (already exists; just ensure it's a workspace member — `package.json` for landing is technically optional since it's static, add a minimal one).
3. Scaffold empty workspace members: `apps/web/`, `packages/core/`, `packages/ui/`, `packages/connectors/`.
4. Root `package.json` with `pnpm`-required `packageManager` field, scripts: `typecheck`, `lint`, `test`, `build` (all `pnpm -r ...`).
5. Add `.nvmrc` pinning Node 22.

**DoD.**
- `pnpm install` from clean state completes without errors.
- `pnpm -r typecheck` runs (against empty packages, succeeds).
- Repo tree matches TDD §11 layout.
- One PR titled `[S2A] add pnpm workspace + apps/web stub`.

#### Sub-Slice S2B — Next.js + TypeScript strict + Tailwind

**Steps.**
1. Scaffold `apps/web` with `pnpm create next-app --typescript --tailwind --app --src-dir --no-eslint` (we'll add our own eslint config).
2. Enable TypeScript strict mode (`tsconfig.json`: `strict: true`, `noUncheckedIndexedAccess: true`).
3. Install: `tailwindcss`, `lucide-react`, `clsx`, `tailwind-merge`.
4. Configure `next.config.mjs` (strict mode, typed routes if available).
5. Add eslint config — Next + TypeScript + tailwind ordering plugin.
6. Replace default `app/page.tsx` with a stub that says "LumaOps cockpit — shell scaffold" (no real content yet).
7. Confirm dev server boots on `http://localhost:3000`.

**DoD.**
- `pnpm --filter web dev` boots cleanly.
- `pnpm --filter web typecheck` and `lint` pass.
- `pnpm --filter web build` produces a production bundle.
- One PR titled `[S2B] scaffold Next.js cockpit (apps/web)`.

#### Sub-Slice S2C — shadcn/ui primitives

**Steps.**
1. Initialise shadcn (`pnpm dlx shadcn@latest init`) in `apps/web`. Configure base path `@/components/ui`.
2. Generate first batch of primitives: `Button`, `Card`, `Badge`, `DropdownMenu`, `Tabs`, `Tooltip`, `Sheet` (for the mobile-collapsing sidebar later).
3. Wrap them — keep shadcn's API but ensure they consume our design tokens (Phase 2D wires the tokens; primitives can reference token CSS vars eagerly).
4. Document the "extend before adding one-off" rule in `packages/ui/README.md` — direct cite to `[LL §10.4]`.

**DoD.**
- `apps/web` builds with all primitives importable.
- Stub demo page lists each primitive once to verify rendering.
- One PR titled `[S2C] add shadcn primitives (Button/Card/Badge/Dropdown/Tabs/Tooltip/Sheet)`.

#### Sub-Slice S2D — Design tokens + theme toggle

**Steps.**
1. Implement CSS custom properties for the full token palette from CONCEPT §12.1 in `apps/web/src/app/globals.css` (dark default + `:root[data-theme="light"]` override).
2. Tailwind `tailwind.config.ts` extends with token references: `paper`, `paper-1/2`, `ink`, `ink-mid/low/dim`, `lumi`, `lumi-dk/deep/soft`, signal palette (`growth`, `revenue`, `release`, `support`).
3. Configure font stack: Geist Sans + Geist Mono + Instrument Serif via `next/font`.
4. Theme toggle component: persisted to `localStorage` under key `lumaops-theme`, identical UX to `apps/landing` so cockpit and landing read as one identity.
5. First-paint script (inline in `app/layout.tsx` `<head>`) reads `localStorage` before paint to avoid flash.
6. Theme toggle visible in topbar (placeholder; full topbar in S2E).

**DoD.**
- Side-by-side: cockpit at `localhost:3000` and landing at `lumaops.app` have visually identical typography, paper, lumi tone.
- Theme persists across reloads.
- No flash of wrong theme on first paint.
- Apply `[LL §10.1]`: signal palette tokens exist but are not used in nav/chrome (only data contexts in later phases).
- One PR titled `[S2D] add design tokens + theme toggle with first-paint persistence`.

#### Sub-Slice S2E — Layout shell (sidebar + topbar + content)

**Steps.**
1. `apps/web/src/components/layout/AppShell.tsx`: top-level layout with sidebar (left, fixed width on desktop, collapses to Sheet on mobile), topbar (date range placeholder, channel placeholder, sync status placeholder, theme toggle), main content slot.
2. Sidebar nav from CONCEPT §6: Overview, Products, Funnels, Revenue, Releases, Support, Telemetry, Integrations, Settings — each as a `next/link` with active-route highlight.
3. Sidebar product list section (empty in this slice — populated in S3F).
4. Topbar `SyncStatusBadge` placeholder that renders nothing in S2E (component exists, no integrations yet).
5. Responsive: ≥1024px desktop layout; <1024px sidebar collapses to a Sheet behind a burger.

**DoD.**
- Shell renders without console errors at 375 / 768 / 1024 / 1440.
- Sidebar nav highlights active route.
- No fake data anywhere.
- One PR titled `[S2E] add AppShell with sidebar + topbar`.

#### Sub-Slice S2F — Placeholder routes

**Steps.**
1. Create `app/overview/`, `app/products/`, `app/products/[slug]/`, `app/funnels/`, `app/revenue/`, `app/releases/`, `app/support/`, `app/telemetry/`, `app/integrations/`, `app/settings/`.
2. Each route renders an `EmptyState` component with: route name, one-line description, and a status pill — either `Not connected` or `No data yet` depending on whether it's an integration-dependent surface or a data-dependent one. Apply `[LL §8.4]` — never fake numbers.
3. `EmptyState` lives in `packages/ui` so the cockpit and (later) admin surfaces share it.
4. Sanity: `pnpm --filter web build` includes all routes, no 404s.

**DoD.**
- Every route returns an `EmptyState` with no console error.
- No mocked metric numbers anywhere.
- Mobile + desktop screenshots reviewed against `apps/landing` for visual coherence.
- One PR titled `[S2F] add placeholder routes with EmptyState`.

#### Sub-Slice S2G — CI pipeline

**Steps.**
1. `.github/workflows/ci.yml`: trigger on PR + push to `main`. Jobs: `typecheck`, `lint`, `build`, `test`, `gitleaks` — see §1.2 for commands.
2. Use `pnpm/action-setup`, `actions/setup-node@v4` with Node 22, cache pnpm store.
3. Add `gitleaks.toml` (or use default config) — fail on any secret.
4. README badge for CI status.
5. Branch protection on `main`: require all CI checks green before merge.

**DoD.**
- A test PR opened on this branch shows all 5 checks running and passing.
- Branch protection rule is active on `main`.
- One PR titled `[S2G] add CI pipeline (typecheck/lint/build/test/gitleaks)`.

**Phase 2 Risks From Experience.**
- First screen of the app is the working dashboard, not a marketing splash. `[LL §4.1]`.
- Don't fake metric numbers in empty states. `[LL §8.4]`.
- Extend shadcn primitives before adding one-offs. `[LL §10.4]`.
- Content-sized chips need three CSS constraints. `[LL §10.5]`.
- Color is a semantic label; signal palette only in data contexts. `[LL §10.1]`.
- Auto-refresh-on-mount/focus hook wired even though placeholders. `[LL §10.2]`.

**Phase 2 Verification (gate).**
- All 7 sub-slices merged.
- `pnpm -r typecheck && pnpm -r lint && pnpm -r build && pnpm -r test && gitleaks detect` green.
- Manual: every route on 375 / 768 / 1024 / 1440 — no overflow, no console errors.
- Visual coherence with landing confirmed.

**Phase 2 Definition of Done.**
App runs. Shell is clean. CI green on `main`. Zero fake data. Phase 3 unblocked.

---

### Phase 3 — Core Domain (Local, Seeded)

**Goal.** Drizzle schema for TDD §3 implemented, freshness calculator + source-label primitive working, local Postgres up, seed populates NOESIS.Tools, `/overview` and `/products` render real DB reads with source + freshness labels.

**Scope-in.** Drizzle schema + migrations, Postgres via Docker, freshness calculator (pure fn + tests), source-label + freshness-badge primitives, metric registry, seed script, DB-backed reads for two routes.

**Scope-out.** Any external connector (Phase 4+), write paths from the UI (no Add-Product flow yet).

#### Sub-Slice S3A — Drizzle schema + migrations

**Steps.**
1. `packages/core/db/schema.ts`: all 8 tables from TDD §3 (workspace, product, integration, event, note, decision_log_entry, cohort, plus index/unique constraints).
2. Install `drizzle-orm`, `drizzle-kit`, `pg`. Configure `drizzle.config.ts`.
3. Generate initial migration: `pnpm --filter core drizzle-kit generate`.
4. Migration file committed alongside the schema.
5. Drizzle client factory in `packages/core/db/client.ts` reads `DATABASE_URL` from env.

**DoD.**
- Migration applies cleanly against an empty Postgres.
- Schema file matches TDD §3 exactly — same field names, same enum values.
- `pnpm --filter core typecheck` green.
- One PR titled `[S3A] add Drizzle schema and initial migration`.

#### Sub-Slice S3B — Local Postgres via Docker Compose

**Steps.**
1. Root `docker-compose.yml`: single `postgres:16` service, volume-mounted data dir, exposed on `localhost:5433` (avoid clashing with system Postgres).
2. `.env.example` at repo root with `DATABASE_URL=postgres://lumaops:lumaops@localhost:5433/lumaops`.
3. `README.md` (root) gets a "Local development" section with the 3-command boot: `cp .env.example .env`, `docker compose up -d`, `pnpm --filter core drizzle-kit migrate`.
4. `apps/web` reads `DATABASE_URL` from env on startup; fails loudly if missing in dev (per `[LL §10.2]` — silent failure is broken).

**DoD.**
- Fresh clone → 3 commands → Postgres + migrations running.
- `apps/web` boots and can connect.
- One PR titled `[S3B] add Postgres via Docker Compose`.

#### Sub-Slice S3C — Freshness calculator

**Steps.**
1. `packages/core/freshness/calculate.ts`: pure function with signature `(input: FreshnessInput) => Freshness` matching TDD §5.2.
2. Six discriminated-union return shapes: `observed | derived | inferred | stale | missing | mock`.
3. Vitest table-driven tests covering each shape (`packages/core/freshness/calculate.test.ts`). Minimum 12 test cases (2 per shape).
4. Type-level guard: production build flag rejects `mock` in `process.env.NODE_ENV === 'production'`.

**DoD.**
- All 12+ test cases pass.
- `mock` cannot be produced in production at runtime (type-level + runtime guard).
- One PR titled `[S3C] add freshness calculator with table-driven tests`.

#### Sub-Slice S3D — Source-label + freshness-badge primitives

**Steps.**
1. `packages/ui/source-label/SourceLabel.tsx`: required props `{ source: ProviderName | 'manual' | 'seed', syncedAt: Date }`. Renders `via <Provider> · synced HH:MM`.
2. `packages/ui/freshness-badge/FreshnessBadge.tsx`: required prop `{ freshness: Freshness }`. Renders the right variant per the 6 freshness states with the right color from the signal palette (stale=amber, error=support, observed=ink, etc.).
3. Both refuse to render at the type level without required props.
4. Storybook or a `/dev/primitives` route to visually verify all 6 freshness states + each source.
5. Apply `[LL §8.4]`, `[LL §10.1]`, `[LL §13.5]` (strip absolute paths from any path-bearing fields).

**DoD.**
- Type-error if either primitive is used without required props.
- All 6 freshness variants visually distinct on the dev page.
- One PR titled `[S3D] add SourceLabel and FreshnessBadge primitives`.

#### Sub-Slice S3E — Metric registry

**Steps.**
1. `packages/core/metrics/registry.ts`: `MetricDefinition` type from TDD §5.1.
2. Register 8 initial metrics: `waitlist_count`, `weekly_visits`, `mrr`, `downloads_weekly`, `installs_weekly`, `api_calls_weekly`, `weekly_active_integrations`, `entries_weekly` — all with `computation: async (ctx) => …` stub returning `freshness: missing` for now.
3. Map `product_type → primary_metric_key` per TDD §3.2.
4. Unit test: each metric returns a well-formed `Freshness` regardless of input.

**DoD.**
- Registry covers all 8 metrics.
- `getDefaultMetricForType(productType)` returns the right key for all 7 product types.
- One PR titled `[S3E] add MetricDefinition registry with initial 8 metrics`.

#### Sub-Slice S3F — Seed script

**Steps.**
1. `packages/core/db/seed.ts`: idempotent seed (safe to run multiple times — uses `ON CONFLICT DO NOTHING` or equivalent).
2. Creates: 1 Workspace ("Navyug Studio" — Decision G), 4 Products (NOESIS.Tools beta, ApplyIQ beta, Planora pre-launch, OHARA active), 1 Integration row for NOESIS GitHub in `pending` state, ~30 seeded `event` rows demonstrating a small funnel for NOESIS (page_view → download_section_view → beta_email_submitted → download_started).
3. Script callable via `pnpm --filter core seed`.
4. Sidebar product list (added in S2E placeholder) now reflects seeded products.

**DoD.**
- Running seed twice doesn't error or duplicate.
- `/products` shows the 4 seeded products with their statuses + product types.
- Sidebar product list mirrors them.
- One PR titled `[S3F] add seed script for NOESIS Studio (4 products)`.

#### Sub-Slice S3G — Wire reads to DB

**Steps.**
1. `apps/web/app/overview/page.tsx`: replace `EmptyState` with real reads — Studio summary (count of products, count of live integrations, etc.), all carrying `SourceLabel` + `FreshnessBadge`.
2. `apps/web/app/products/page.tsx`: product list table with name / status / type / primary metric / integration health. Each metric column renders its primary metric via the registry.
3. `apps/web/app/products/[slug]/page.tsx`: product detail with the 9 tabs from CONCEPT §6 (only Overview and Settings rendering real content in this slice; other tabs are placeholders).
4. Force-stale test path: a button in `/dev/freshness-toggle` that flips the workspace clock forward to demonstrate the freshness flip.

**DoD.**
- `/overview` and `/products` render from DB.
- Every visible number carries source + freshness.
- Force-stale toggle visibly flips the labels.
- One PR titled `[S3G] wire /overview and /products to DB reads with source+freshness`.

**Phase 3 Risks From Experience.**
- Lock the primary product contract (NOESIS) before hardening loops with secondary product types. `[LL §1.4]`.
- Don't collapse orthogonal axes (`Product.status` ≠ `Product.type`). `[LL §5.1]`.
- Different semantics need different methods on the state store. `[LL §6.3]`.
- Stale is its own state; don't show stale-as-observed. `[LL §8.4]`.
- Connector status taxonomy is a framework concern, not per-connector. `[LL §1.2]`.
- Strip absolute paths from any user-visible string. `[LL §13.5]`.

**Phase 3 Verification (gate).**
- Migrations apply cleanly on a fresh DB.
- Freshness calculator unit tests + Metric registry tests green.
- Seed populates without errors; running it twice is a no-op.
- `/overview` and `/products` render from DB with full source+freshness coverage.
- Force-stale toggle flips labels visibly.

**Phase 3 Definition of Done.**
Dashboard renders from local DB. Every visible number carries source + freshness. Missing data is visibly missing. Phase 4 unblocked.

---

### Phase 4 — GitHub Connector

**Goal.** Real GitHub data flows in via the locked ConnectorAdapter contract from TDD §7. Releases, issues, PRs, commit activity surface in the cockpit with `source: github · synced HH:MM`. Errors are explicit, never silent.

**Scope-in.** GitHub adapter (PAT auth), sync runner, error classification map, `/releases` + `/support` wired, freshness flip + error states visible.

**Scope-out.** GitHub OAuth / App install flow (PAT enough for MVP). Cloudflare / Stripe (Phase 6).

#### Sub-Slice S4A — GitHub adapter scaffold

**Steps.**
1. `packages/connectors/github/adapter.ts`: implements `ConnectorAdapter` from TDD §7.
2. Zod schemas for GitHub API response shapes (Repository, Release, Issue, PullRequest, Commit) in `packages/connectors/github/schemas.ts`.
3. HTTP client: `fetch` with auth header, structured error throw on non-2xx.
4. `capabilities()` returns `required_scopes: ['repo', 'read:user']`, rate limits, `privacy_class: 'hosted'` for `variant='public'`.

**DoD.**
- Adapter constructable; `capabilities()` returns correct shape.
- Zod schemas reject malformed payloads in tests.
- One PR titled `[S4A] scaffold GitHub adapter (interface + Zod schemas)`.

#### Sub-Slice S4B — Auth + health + validate

**Steps.**
1. `validateCredentials()`: hits `/user` with the PAT, returns `{ ok, scopes, fingerprint }` or one of the failure shapes from TDD §7.
2. `health()`: hits `/rate_limit`, returns `{ reachable, latency_ms, rate_limit_remaining, rate_limit_reset_at }`.
3. UI on `/integrations` page: integration tile for GitHub with "Test connection" button — calls validate + health, shows green / red banner with the explicit failure reason.
4. Token stored in `.env` as `LUMAOPS_GITHUB_TOKEN`. Fingerprint stored in `integration.credential_fingerprint` (last 4 chars of token + hash).
5. Apply `[LL §10.8]` — never display plaintext token; always show fingerprint.

**DoD.**
- Valid PAT: tile shows green + scopes + fingerprint.
- Invalid PAT: tile shows red + explicit reason (missing | invalid | insufficient_scope | revoked).
- Token never visible plaintext in UI or logs.
- One PR titled `[S4B] add GitHub auth/health/validate with masked fingerprint`.

#### Sub-Slice S4C — Sync (releases, issues, PRs, commits)

**Steps.**
1. `sync(config, since)`: paginated fetch of releases (with assets), issues (open + closed, with labels), PRs, commits. Each paginated via `Link` header.
2. Normalize to events: `release_published`, `release_asset_uploaded`, `support_ticket_created` (issue with label `bug` or `support`), `pr_merged` (custom event for dev signal), `commit_pushed` (rolled up to daily counts to avoid event flood).
3. Returns `SyncResult { events, metrics_pull, next_since, errors }` per TDD §7.
4. Tests: golden file tests — feed a fixed JSON payload, assert normalized event shape.

**DoD.**
- Sync against a fixture repo produces well-shaped events.
- `next_since` cursor moves forward correctly across runs.
- Test coverage: 1 test per event kind, 1 happy-path full sync.
- One PR titled `[S4C] implement GitHub sync (releases/issues/PRs/commits → events)`.

#### Sub-Slice S4D — Error classification map

**Steps.**
1. `packages/connectors/github/errors.ts`: maps GitHub HTTP responses → TDD §8 `ErrorClass`:
   - 401 → `connector_auth`
   - 403 (rate-limit subtype) → `connector_rate_limit` with `retry_after_ms` from `X-RateLimit-Reset` header
   - 403 (permission subtype) → `connector_permission`
   - 404 → `connector_not_found`
   - 422 / Zod validation failure → `connector_schema_drift`
   - network / DNS / timeout → `connector_network`
   - 5xx → `connector_network` with `retry_after_ms: exponential backoff`
2. Unit tests cover every branch.
3. Apply `[LL §7.3]` — classify by intent, not by message string.

**DoD.**
- All 7 error branches tested.
- Classifier is a pure function — no side effects.
- One PR titled `[S4D] add GitHub error classification map`.

#### Sub-Slice S4E — Sync orchestration + abort

**Steps.**
1. `packages/core/sync/runner.ts`: framework-level sync orchestrator. Reads pending integrations, calls adapter, persists events, updates `integration.state` + `last_sync_at`.
2. Trigger paths: (a) manual "Sync now" button in `/integrations`, (b) freshness-driven timer (`setInterval` per integration based on `freshness_threshold_seconds`).
3. `AbortSignal` plumbed through the call chain. Apply `[LL §6.4]`, `[LL §7.4]` — one shared abort token, not per-provider flags.
4. State transitions: `pending → syncing → live` (success) | `live → stale` (timeout-driven) | `* → error` (classifier-driven).
5. "Sync now" button labels resource cost: "1 API request, X remaining" — apply `[LL §9.1]`.

**DoD.**
- Manual sync visibly cycles `pending → syncing → live`.
- Stalling the response visibly leaves the tile in `syncing`, then abortable via cancel.
- Auto-refresh-on-focus runs (apply `[LL §10.2]`).
- One PR titled `[S4E] add sync orchestrator with abort + freshness-driven schedule`.

#### Sub-Slice S4F — Wire /releases + /support to GitHub data

**Steps.**
1. `app/releases/page.tsx`: latest release per product, asset list, freshness badge.
2. `app/support/page.tsx`: open / closed issue counts per product, category breakdown (by label), with `SourceLabel`.
3. Apply `[LL §8.4]` — GitHub-derived data carries `source: github` everywhere; revenue / traffic remain `missing` with reason `no_integration`.

**DoD.**
- `/releases` and `/support` render real GitHub data for NOESIS.Tools.
- Forcing the sync clock back by `freshness_threshold + 1s` flips all GitHub-derived metrics to `stale` visibly.
- Revoking the token mid-session flips the GitHub tile to `error: invalid token` and freezes GitHub-derived data with `stale` overlay.
- One PR titled `[S4F] wire /releases and /support to GitHub-derived events`.

#### Sub-Slice S4G — End-to-end + state-cycle verification

**Steps.**
1. End-to-end test using a real GitHub repo and a real test PAT (committed env var in CI under `LUMAOPS_GITHUB_TEST_TOKEN` — workflow-scoped, not at-rest).
2. Test plays the full state cycle: `pending → syncing → live → stale → error (token revoked) → live (new token)`.
3. Document the test pattern as the template for Phase 6 connectors.

**DoD.**
- E2E test passes in CI.
- State-cycle template documented at `docs/connectors/STATE_CYCLE_TEST.md`.
- One PR titled `[S4G] add GitHub connector E2E state-cycle test`.

**Phase 4 Risks From Experience.**
- GitHub-derived is `source: github` everywhere, never silently merged into "total". `[LL §8.4]`.
- Research scopes / rate limits / API version before adapter code. `[LL §8.2]`.
- One shared abort token, not per-connector. `[LL §7.4]`, `[LL §5.4]`.
- Classify errors by intent, not by message string. `[LL §7.2]`, `[LL §7.3]`.
- Auto-refresh-on-focus, not "click Detect". `[LL §10.2]`.
- Label resource cost on the sync button. `[LL §9.1]`.
- Three-pillar rate-limit resilience (throttle + cached + visible state). `[LL §8.3]`.
- Adapter must already work for `Nnvvee96/getplanora` and `Nnvvee96/ApplyIQ` shapes, not just NOESIS. `[LL §1.3]`.

**Phase 4 Verification (gate).**
- All 7 sub-slices merged.
- Adapter unit tests + classifier unit tests + sync runner tests + E2E state-cycle test all green.
- Manual: revoking token mid-sync flips state visibly within one refresh cycle.
- Manual: forcing sync timestamp back flips all GitHub-derived metrics to `stale`.

**Phase 4 Definition of Done.**
GitHub connector live for NOESIS.Tools (and at least one secondary product). All GitHub-derived metrics carry `source: github` + freshness. Error states are visible, never silent. Phase 5 unblocked.

---

### Phase 5 — Visual Hardening

**Goal.** Every state matrix is explicitly designed; charts ship; the operator can walk the daily ritual in <16 min on real NOESIS data; mobile + desktop both clean; operator-cockpit modules (Notes, Decision Log) shipped.

**Scope-in.** State catalog (empty/loading/partial/stale/error/full × every route), Recharts integration, Notes + Decision Log + Cohort skeleton, responsive sweep with Playwright, feature-moment rhythm.

**Scope-out.** New connectors (Phase 6), new domain entities.

#### Sub-Slice S5A — State catalog + design freeze

**Steps.**
1. For every route, enumerate the 6 states: `empty`, `loading`, `partial`, `stale`, `error`, `full`.
2. Implement explicit treatment for each — separate component / branch, not "the same component with a flag".
3. `apps/web/app/dev/states/` development-only catalog page renders the full matrix.
4. Apply `[LL §10.6]` — every backend classification has a matching visible state.

**DoD.**
- 9 routes × 6 states = 54 distinct treatments visually verified.
- Dev catalog page accessible (gated behind `NODE_ENV !== 'production'`).
- One PR titled `[S5A] add state catalog (6 states × every route)`.

#### Sub-Slice S5B — Recharts integration + theming

**Steps.**
1. `packages/ui/charts/Chart.tsx` wraps Recharts components with: Geist Mono labels, signal-coloured series, source line baked in below the chart.
2. Chart types: LineChart (time series), BarChart (categorical), Sparkline (compact inline), AreaChart (cumulative).
3. Each chart accepts `freshness: Freshness` and dims itself when stale.
4. Apply `[LL §10.1]` — signal palette only inside chart contexts.

**DoD.**
- Charts render with token-correct typography and colors.
- Stale charts visibly dim with a stale ribbon overlay.
- One PR titled `[S5B] add Recharts wrappers with source+freshness baked in`.

#### Sub-Slice S5C — Operator-cockpit modules (Notes + Decision Log)

**Steps.**
1. `app/products/[slug]/notes/page.tsx` + Server Actions for note CRUD against the `note` table (TDD §3.5).
2. `app/products/[slug]/decisions/page.tsx` + Server Actions for `decision_log_entry`.
3. Both modules pinned in the product-detail tab strip alongside Overview.
4. Cohort skeleton — `app/products/[slug]/cohorts/page.tsx` renders an empty-state explaining "Cohort engine ships in a later phase" (Decision J — Phase 5 cohort engine is itself a multi-slice future scope; this is just the surface).
5. Apply `[LL §10.7]` — flag controls (e.g. pin/unpin) live inside the entity's edit modal, not a global settings panel.

**DoD.**
- Create, edit, delete, pin notes works against DB.
- Decision log entries append-only by UX (no delete in MVP — apply `[LL §12.4]`).
- Cohort page shows the right empty-state with "coming soon" framing.
- One PR titled `[S5C] add Notes + Decision Log per product (Cohort skeleton)`.

#### Sub-Slice S5D — Responsive sweep + Playwright

**Steps.**
1. Playwright config: 4 viewport profiles (375 × 812, 768 × 1024, 1024 × 768, 1440 × 900).
2. Smoke test per route per viewport: page loads, no console errors, no horizontal overflow on body, key elements visible (sidebar / topbar / main content).
3. Visual snapshot baseline created for each route × viewport (`apps/web/tests/snapshots/`).
4. Add Playwright to CI as a soft check (non-blocking initially, becomes blocking when stable).

**DoD.**
- Playwright runs 9 routes × 4 viewports = 36 smoke tests, all green.
- Visual snapshots committed.
- CI runs Playwright on PR (soft check).
- One PR titled `[S5D] add Playwright responsive smoke matrix`.

#### Sub-Slice S5E — Feature-moment rhythm + Lighthouse pass + daily ritual

**Steps.**
1. Audit every major view for the "quiet → dense operational moment → quiet" rhythm from CONCEPT §12.3. Adjust spacing / section padding to enforce it.
2. Lighthouse: target a11y ≥ 95, perf sane for an authenticated dashboard SPA shell. Address any blockers.
3. Operator daily-ritual dry-run on real NOESIS data: 16-minute timer, walk the five beats from CONCEPT §19, log every friction note.
4. Back-propagate friction notes immediately. Apply `[LL §4.1]`, `[LL §4.2]`.

**DoD.**
- Lighthouse a11y ≥ 95 on `/overview` and `/products/<slug>`.
- No friction note from the daily-ritual walk-through remains unresolved.
- One PR titled `[S5E] feature-moment audit + Lighthouse pass + daily-ritual dry-run`.

**Phase 5 Risks From Experience.**
- Operator-visible behaviour is the spec. `[LL §4.1]`.
- Back-propagate cheap fixes in-phase. `[LL §4.2]`.
- Color is a semantic label. `[LL §10.1]`.
- Every action emits visible confirmation. `[LL §4.4]`.
- Latency is policy signal, not a "fast model" question. `[LL §4.3]`.
- Stale UI is broken — auto-refresh-on-focus always. `[LL §10.2]`.
- Extend primitives before adding one-offs. `[LL §10.4]`.

**Phase 5 Verification (gate).**
- All 5 sub-slices merged.
- Playwright matrix green.
- Lighthouse a11y ≥ 95.
- Friction notes from daily-ritual walk-through all resolved.

**Phase 5 Definition of Done.**
The dashboard feels like a real cockpit. No broken responsive layout. No fake business claims. No unresolved operator-friction note. Phase 6 unblocked.

---

### Phase 6 — Next Connectors

**Goal.** Extend connector coverage one connector at a time. Each new connector follows the locked per-connector template; one connector = one phase-6 mini-cycle.

**Scope-in (candidates, suggested order).**
1. **Cloudflare Analytics** — web traffic, Worker activity. Privacy-low, structurally similar to GitHub (token-auth + pull-based sync).
2. **Custom Tracking API** — defines the JS snippet + server endpoint for browser-side funnel events. Becomes the template for any future first-party event source.
3. **Stripe** — revenue, customers, subscriptions. Highest-stakes (variant: test vs live is critical, apply `[LL §8.1]`).
4. **App Telemetry endpoint** — privacy-safe events from clients like NOESIS. Privacy contract is the strictest, hence last.

**Scope-out.** Hosted-mode features (separate phase, separate spec). Connector marketplace UI (Decision L — PR-only in MVP, hosted catalog is a Phase 7+ candidate).

#### Per-Connector Sub-Slice Template

For each connector `X`, instantiate the template as `S6X-{a..g}`:

- **S6Xa — Spec addendum.** Add a section to `docs/TDD.md` (or `docs/connectors/<X>.md` if size warrants) covering: auth shape, sync triggers, freshness threshold, error states, rate-limit behaviour, privacy / PII boundaries, variant taxonomy. Lock before code.
- **S6Xb — Adapter scaffold.** `packages/connectors/<x>/adapter.ts` + Zod schemas.
- **S6Xc — Auth + health + validate.** UI tile on `/integrations` with Test-connection.
- **S6Xd — Sync implementation.** Normalize to events, return `SyncResult`.
- **S6Xe — Error classification map.** Maps provider-specific errors to TDD §8 `ErrorClass`.
- **S6Xf — Wire UI surfaces.** Route(s) that consume the new connector's data, all with `SourceLabel` + `FreshnessBadge`.
- **S6Xg — E2E state-cycle test.** Reuses the template from S4G.

#### Per-Connector Risks From Experience

- Variant taxonomy (test vs live, free vs enterprise) is structural, never a soft flag. `[LL §8.1]`, `[LL §8.5]`.
- Research scopes / tiers / region restrictions before adapter writes. `[LL §8.2]`.
- Three-pillar rate-limit resilience (throttle + cached + visible). `[LL §8.3]`.
- One shared abort token. `[LL §7.4]`.
- Adapter against the operator's primary product shape, also tested against secondary shapes. `[LL §1.3]`.
- Wire-protocol-identical local/remote endpoints get structural distinction. `[LL §8.5]`.
- Decline log for rejected providers in MEMORY. `[LL §13.4]`.
- Cost surfaced on the connector tile. `[LL §9.1]`.

#### Per-Connector Verification (gate)

- Spec addendum reviewed + locked before code.
- Adapter unit tests cover auth-ok / auth-fail / rate-limit / network / schema-drift.
- E2E state-cycle test passes: `pending → syncing → live → stale → error → live`.
- Revoking credentials surfaces visibly within one refresh cycle.
- Source label `via <provider>` appears on every metric consuming the new connector.

#### Per-Connector Definition of Done

One connector shipped, spec addendum locked, errors tested, decisions logged. Then the next.

---

### Phase 7 — Intelligence Layer (deferred candidate)

**Goal.** Once multiple connectors are live, layer-in derived intelligence: product health score, launch-readiness score, drop-off diagnosis, release-risk detection, support-spike correlation, "what changed?" explanations.

**Scope-out at this point.** Phase 7 does not open until Phase 6 has at least three connectors live and the operator has used the cockpit through at least one real product launch.

**Risks From Experience (when this phase opens).**
- Don't compensate at the framework layer for a tool that's unreliable — surface the unreliability. `[LL §9.4]`.
- Derived metrics annotate, they don't override operator interpretation. `[LL §13.3]`.
- Honest labels on inferred data — `source: derived | inferred` non-negotiable. `[LL §8.4]`.
- Don't expose user-facing controls for capabilities that aren't reliable. `[LL §13.6]`.

---

## 3. Cross-Phase Verification Gates

These apply to every phase in addition to the phase-specific gates.

**Technical.**
- `pnpm -r typecheck` green.
- `pnpm -r lint` green.
- `pnpm -r test` green.
- Freshness calculator, source-label primitive, error classifier, every connector adapter have unit tests.

**Shipping discipline.**
- Verify the deployed artefact, not the build-log success line. After every deploy, check artefact timestamp + a fresh-symbol grep. `[LL §3.1]`.
- Multi-step pipelines must be chained or documented end-to-end. `[LL §3.2]`.
- Sandbox gaps documented honestly; operator owns post-ship validation. `[LL §3.3]`.

**Product.**
- Dashboard answers the operator's five verbs: shipped / converted / earned / broke / growing (CONCEPT §3).
- Every metric shows source + freshness. `[LL §8.4]`.
- No integration silently fails. `[LL §10.2]`.

**Security.**
- No secrets committed (gitleaks gate).
- Local `.env` only for self-hosted MVP.
- Hosted mode requires a separate security and tenancy spec.

**Docs.**
- Phase-close updates: `TDD.md`, `MEMORY.md`, `SESSION_LOGS.md`, `SKILLS_COMPOUNDING.md` (project-specific) all sync in the same commit as the phase close. `[LL §2.3]`.
- Sub-slice close: append a checkpoint to `SESSION_LOGS.md` § Checkpoint Log.

## 4. Rollback

Before each sub-slice:
- The branch is the rollback surface. Discard the branch = rollback the slice.

After merge:
- One PR = one squashed commit on `main` = `git revert <sha>` undoes the slice cleanly.
- Destructive operations (DB schema rollback, dropped tables) require an explicit `/REPLAN` and a paired forward+reverse migration.

## 5. Commercial-Launch Overlay (Hosted Phase A / B / C)

These phases run **alongside and after** the engineering phases above. They're about commercial launch, not engineering. Engineering decisions are locked in §2; the hosted launch is sequenced separately so the engineering plan stays clean.

See `CONCEPT.md` §11 for the full sequencing narrative + `MEMORY.md` Decision K for the pricing decision.

| Phase | Engineering position | Hosted state | Operator cost |
|---|---|---|---|
| **A** | now → end of Phase 5 | OSS-only, no hosted variant | $0/month |
| **B** | post-Phase-5 | Closed Hosted Beta — 20–50 free invite seats on `app.lumaops.app` | $0–25/month |
| **C** | post-Phase-B validation (≥10 conversion-ready beta users + ≥4 say "I'd pay") | Public Hosted launch — $7/mo · $60/yr | $25/month → scales with revenue |

Detailed step-by-step playbooks for B and C live in `EXPANSION_BACKLOG.md` E-007 (Phase B Launch Plan) and E-008 (Phase C Launch). They are deliberately backlog-tracked rather than promoted into §2 phases until their triggers fire.

## 6. References

- `[[../../MD-Files/MD-Files Templates/LESSONS_LEARNED.md]]` — cross-project ledger; every `[LL §N.M]` reference resolves there.
- `[[CONCEPT.md]]` — strategic blueprint (esp. §11 Hosted Direction, §17 Decision K, §18.2 Promise #7, §21 anti-features).
- `[[TECHSTACK.md]]` — technical baseline (cockpit stack §2b, hosted infrastructure §7).
- `[[TDD.md]]` — locked spec (data model, adapter interface, freshness, errors, PII).
- `[[MEMORY.md]]` — Phase-1 decision log (§1.1) and project-specific edge cases.
- `[[AUDIT.md]]` — `/SHRED` red-team + `/AUDIT` hardening gate procedures.
- `[[EXPANSION_BACKLOG.md]]` — parked / evaluating / declined items; the strategic backlog.
