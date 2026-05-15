---
system: Atlas Vault OS
version: 2.0
date: May 15, 2026
status: ACTIVE / EXECUTION_MAP
project: LumaOps
references:
  - "../../MD-Files/MD-Files Templates/LESSONS_LEARNED.md"
---
# IMPLEMENTATION_PLAN.md — Execution Map
# PROJECT: LumaOps

## 0. How to read this plan

Each phase is an independent ship unit. Order is strict — gates of phase *N* must pass before phase *N+1* opens.

Per phase you'll find:

- **Goal** — what this phase makes true.
- **Scope-in / Scope-out** — explicit boundaries to prevent drift.
- **Tasks** — concrete, ordered, executable.
- **Risks From Experience** — bullets that reference the cross-project ledger at `MD-Files/MD-Files Templates/LESSONS_LEARNED.md`. Each reference (`[LL §N.M]`) names a lesson distilled from prior projects that applies to this phase. Do not start the phase without re-reading the linked lessons.
- **Verification** — machine-verifiable evidence the phase passes its gate.
- **Definition of Done** — what must be true to move on.

The plan is locked once approved. Re-opening a phase requires an explicit `/REPLAN`.

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

## 2. Phase Sequence

### Phase 0 — Repository Bootstrap

**Goal.** A public, accurately-positioned repository with the docs baseline in place.

**Scope-in.**
- Docs alignment to LumaOps product identity.
- Git remote: `https://github.com/Nnvvee96/lumaops.git`.
- README, LICENSE (MIT), `.gitignore`, `docs/` baseline.
- Marketing landing under `apps/landing/` (already shipped — `lumaops.app`).

**Scope-out.**
- App scaffold (phase 2).
- Any TDD or schema work (phase 1).

**Tasks.**
1. Public repo created and pushed.
2. README states product stance.
3. `docs/` contains CONCEPT, TECHSTACK, IMPLEMENTATION_PLAN, TDD, MEMORY, SESSION_LOGS, SKILLS_COMPOUNDING, RECOVERY_KIT, CONSTRAINTS, PATTERNS, PLAYBOOKS, AGENT, AUDIT, AGILE_CYCLES, PROJECT_HYGIENE_PLAYBOOK, PROJECT_INSTRUCTION.
4. `apps/landing/` deployed via Cloudflare Pages, custom domain `lumaops.app` attached.

**Risks From Experience.**
- Docs drift creates contradictory instructions. Lock canonical MD-Files at bootstrap time. `[LL §1.1]`, `[LL §2.3]`.
- Documentation update is part of the ship, not an afterthought. `[LL §2.3]`.

**Verification.**
- `gh repo view` returns the public repo with accurate description.
- `apps/landing/index.html` resolves over HTTPS at `lumaops.app`.
- Facebook Sharing Debugger renders the OG card from `https://lumaops.app/`.

**Definition of Done.**
Repository, license, README, docs baseline, landing all live. **STATUS: DONE.**

---

### Phase 1 — Technical Spec Lock

**Goal.** A locked written contract for the data model, connector adapter interface, and freshness/error states — before any app code is written.

**Scope-in.**
- Finalise `docs/TDD.md` with: data model schema (workspace / product / integration / event / metric), GitHub connector contract, freshness/staleness states, event schema, error classification.
- Pick **Prisma vs Drizzle** with a written decision. Pick the runtime backend shape (Node API routes vs Cloudflare Workers/D1) with a written decision.
- Lock the open connector adapter interface: input shape, output shape, error contract, freshness contract. This is the public spec community connectors will be written against.

**Scope-out.**
- Any implementation code.
- Any non-GitHub connector (deferred to phase 6).

**Tasks.**
1. Draft data-model schema in TDD.md. Walk every relation through a "what does this look like when the data is stale / missing / inferred" exercise (see CONCEPT §13 Metrics Philosophy).
2. Pick Prisma vs Drizzle. Record the decision and the rejected option in `docs/MEMORY.md` with the reason.
3. Pick backend shape (Node + Postgres locally; Cloudflare Workers + D1 if hosted later). Record decision.
4. Define `Connector` adapter interface (TypeScript): `auth`, `health`, `sync`, `events`, `metrics`, `freshness`. This becomes the open framework from CONCEPT §9.
5. Define event schema (workspace_id, product_id, event_name, occurred_at, source, anonymous_id, optional user/lead identifier, session_id, properties).
6. Define error/state taxonomy: `live | syncing | pending | planned | stale` for connectors (CONCEPT §9); `observed | derived | inferred | mock | stale` for metrics (CONCEPT §13).
7. Resolve six open scope questions from CONCEPT §17 explicitly before locking the spec (operator-cockpit scope, support native vs surfaced, studio identity, hosted pricing model, connector marketplace, brand-asset upload). Record each decision in MEMORY.md.

**Risks From Experience.**
- Spec drift behind code is worse than no spec. Lock TDD before writing app code. `[LL §1.1]`.
- Examples in the spec become accidental scope limits. Phrase the contract generically, never in terms of the first example. `[LL §1.3]`.
- A connector interface designed against one example provider (GitHub) silently won't fit the others. Walk the interface against Cloudflare, Stripe, and a hypothetical custom-tracking provider before locking. `[LL §1.4]`, `[LL §5.1]`.
- Single source of truth for cross-cutting policy: freshness and source labelling are not per-connector concerns, they are framework concerns. `[LL §1.2]`, `[LL §8.4]`.
- Researching availability before catalog edits applies to *every* future connector. Document the rule in the connector spec itself. `[LL §8.2]`.
- "Local vs hosted under one descriptor is a lie" — the connector spec must distinguish local-executing vs hosted/cloud-executing variants even when the wire protocol is identical. `[LL §8.1]`, `[LL §8.5]`.
- For every metric, mandate source + freshness labels at the schema level — not as a UI afterthought. `[LL §8.4]`.

**Verification.**
- TDD.md complete with all sections above and reviewed top-to-bottom.
- A reviewer (or `/AUDIT`) walks the connector interface against three sketch implementations (GitHub, Cloudflare, Stripe) without finding mandatory fields missing.
- The six CONCEPT §17 questions all have a documented decision (or an explicit "deferred to phase X").

**Definition of Done.**
TDD locked. Decisions recorded in MEMORY. No code yet.

---

### Phase 2 — App Skeleton

**Goal.** A running Next.js app with the layout shell, design tokens, and placeholder routes. No real data. No connectors. The cockpit chrome exists; the meat comes in phase 3.

**Scope-in.**
- Next.js App Router monorepo (`apps/web` next to existing `apps/landing`).
- TypeScript strict, Tailwind, shadcn/ui, lucide-react.
- Layout shell: left sidebar, topbar (date range, channel, sync status), main content area, product switcher.
- Placeholder routes: `/overview`, `/products`, `/products/[slug]`, `/funnels`, `/revenue`, `/releases`, `/support`, `/telemetry`, `/integrations`, `/settings`.
- Design tokens from CONCEPT §12 (Lumi, signal colours, three-font rule, dark default).
- Light/dark theme toggle, persisted, first-paint-safe.

**Scope-out.**
- Domain logic (phase 3).
- GitHub connector (phase 4).
- Visual hardening / micro-polish (phase 5).

**Tasks.**
1. Scaffold `apps/web` under the existing monorepo. Configure pnpm workspace.
2. Install Next.js, TypeScript (strict), Tailwind, shadcn/ui, lucide-react.
3. Implement design tokens (`tailwind.config.ts` + CSS custom properties) per CONCEPT §12.1: `--paper`, `--ink`, `--lumi`, signal-palette tokens, font families.
4. Theme toggle with first-paint persistence (read `localStorage` in a pre-paint inline script — mirror the pattern already used in `apps/landing/index.html`).
5. Layout shell: sidebar, topbar, content area. Sidebar carries primary nav (CONCEPT §6 Left Sidebar) + product list section.
6. Placeholder routes returning labelled empty states ("Not connected" / "No data yet" — never fake metrics).
7. Smoke test: every route renders without console errors on desktop (1440px) and mobile (375px).

**Risks From Experience.**
- First screen of the app is the working dashboard, not a marketing page. The empty/placeholder state for `/overview` must already look like a real cockpit, not a "welcome to LumaOps" splash. `[LL §4.1]`.
- Don't paint placeholder metrics with fake numbers. Empty state must say "not connected" or "no data yet", never a mocked "1,234 visits". `[LL §8.4]`.
- Reusable primitives before one-off classes: extend shadcn/ui components before adding bespoke ones. Three look-alike chips are three drift opportunities. `[LL §10.4]`.
- Content-sized chips/badges need `justify-self: start + width: fit-content + max-width: 100%` to behave consistently across grid and flex parents. Set these on the base primitive, not on each instance. `[LL §10.5]`.
- Color is a semantic label, not decoration. Allocate the signal palette only to data contexts (CONCEPT §12.1) — never to nav, chrome, or marketing. `[LL §10.1]`.
- Auto-refresh on mount/focus for any list that reflects external state — even at this phase, the placeholders should have the auto-refresh hook wired (it'll fire against empty data, which is fine). `[LL §10.2]`.

**Verification.**
- `pnpm run dev` boots `apps/web` without errors.
- `pnpm run typecheck` and `pnpm run lint` pass.
- Manual: visit every placeholder route on 1440px and 375px — no overflow, no broken layout, no console errors.
- Visual: the design tokens match `apps/landing` so the cockpit and landing read as one identity.

**Definition of Done.**
App runs. Shell is clean. No fake data. Typecheck + lint green.

---

### Phase 3 — Core Domain (Local, Seeded)

**Goal.** The data model from phase 1 is implemented and the dashboard renders from local seeded data — without any external connector wired in. NOESIS.Tools is seeded manually. Missing/stale data is visible.

**Scope-in.**
- Database (Postgres locally) + Prisma or Drizzle schema implemented per phase-1 lock.
- Domain types: Workspace, Product, Integration, Event, Metric (CONCEPT §5).
- Freshness/trust calculation in pure functions (testable).
- Seed script that creates one Workspace, NOESIS.Tools as a Product, placeholder Integration rows in `pending`/`planned` state, and a handful of seeded Events for funnel demonstration.
- Read paths: `/overview`, `/products`, `/products/[slug]` render from real DB queries.
- Source + freshness label on every metric, surfaced in the UI (CONCEPT §13).

**Scope-out.**
- Any real connector (phase 4 onwards).
- Writes from the UI (no add-product flow yet — seed only).

**Tasks.**
1. Stand up local Postgres (Docker or local install) + Prisma/Drizzle migrations.
2. Implement the domain types and the freshness calculator as pure functions in `packages/core`. Test the freshness calculator with table-driven tests.
3. Implement the metric source/freshness taxonomy (`observed | derived | inferred | mock | stale`) as a shared type and label component.
4. Seed: NOESIS.Tools Product, Workspace defaults, Integration rows in `pending` for GitHub and `planned` for the others.
5. Wire `/overview` and `/products` to real reads against the seeded DB.
6. Render every metric with its source + freshness label.

**Risks From Experience.**
- Lock the primary product contract before hardening loops — NOESIS is the proving ground, do not let secondary product types (web-app pre-launch, research system) drift the data model before NOESIS is end-to-end clean. `[LL §1.4]`.
- Don't collapse orthogonal axes into one enum — `Product.status` ≠ `Product.type`, and `Integration.state` ≠ `Metric.freshness`. These are independent. `[LL §5.1]`.
- Differential method semantics in the state store: "update product metadata" and "ingest sync result" are different operations; don't share one polymorphic setter. `[LL §6.3]`.
- The metric freshness model needs to handle `stale` honestly — the moment "we have a value but it's old" is treated as `observed`, the dashboard lies to the operator. `[LL §8.4]`.
- Connector status taxonomy (`live | syncing | pending | planned | stale`) is a framework concern, not a per-connector concern. Implement it once at the integration layer. `[LL §1.2]`.
- Source labels must strip absolute paths and machine identifiers if they ever surface in user-visible output. `[LL §13.5]`.

**Verification.**
- Migrations apply cleanly on a fresh DB.
- Freshness calculator unit tests pass (table-driven, includes the "value present but stale", "value missing", "value inferred from another source" cases).
- Seed script populates without errors.
- Manual: `/overview` and `/products` render real seeded data with visible source + freshness labels everywhere.
- Manual: forcing a metric's `last_updated_at` to be old visibly flips its label to `stale`.

**Definition of Done.**
Dashboard renders from local DB. Every visible number carries source + freshness. Missing data is visibly missing.

---

### Phase 4 — GitHub Connector

**Goal.** GitHub is connected; releases, issues, and dev-signal metrics flow into the dashboard. GitHub is treated as a *development signal source*, never as the truth for revenue or traffic.

**Scope-in.**
- Token-based GitHub connector (personal access token or GitHub App later — start with PAT).
- Adapter implementing the phase-1 connector interface.
- Sync of: repo metadata, releases (incl. assets), open/closed issues, PRs, basic commit activity.
- Mapping into LumaOps signals: release health, support pressure (from labelled issues), dev velocity.
- Explicit connector status transitions (`pending → syncing → live`, or `live → stale → live`).
- Connector errors are explicit and operator-visible — no silent failures.

**Scope-out.**
- Cloudflare / Stripe / telemetry (phase 6).
- GitHub OAuth / App install flow (PAT is enough for MVP).
- Multi-product GitHub import wizard (phase 6 candidate).

**Tasks.**
1. Implement the GitHub adapter against the connector interface from phase 1.
2. Secure token storage: local `.env` for self-hosted MVP. Document hosted-mode separately (CONCEPT §11 / TECHSTACK §5).
3. Implement sync: pull on demand + on a freshness timer (every N minutes).
4. Map GitHub data to LumaOps domain: releases → release-health signal, labelled issues → support-pressure signal, commit/PR activity → dev-signal.
5. Wire `/releases` and `/support` to the GitHub-derived data, marked with `source: github`.
6. Error paths: rate-limit hit, token invalid, repo not found, scope insufficient. Each surfaces as a visible connector-error state, not a silent fail.
7. Freshness: if last successful sync is older than threshold, flip the connector state to `stale` and label all GitHub-derived metrics accordingly.

**Risks From Experience.**
- Honest data labels are the whole point. Anything GitHub-derived is `source: github`, never silently merged into "total". Revenue, real visits, real users are NEVER inferable from GitHub. `[LL §8.4]`.
- Research availability before catalog/adapter edits — verify token scopes, rate limits, and API versions before writing adapter code. `[LL §8.2]`.
- Single physical bit for cross-cutting flags: rate-limit / abort / cancel on the GitHub adapter must use the same cross-cutting cancel mechanism the rest of the app uses, not its own per-connector flag. `[LL §7.4]`, `[LL §5.4]`.
- Sentinel error contracts: classify "GitHub returned 403" (auth) vs "GitHub returned 429" (rate limit) vs "network failed" via explicit error types or sentinel strings — never by string-matching error messages downstream. `[LL §7.2]`, `[LL §7.3]`.
- Connector statuses are auto-refresh on mount/focus, not "click here to sync". `[LL §10.2]`.
- Label resource cost: a "Sync now" button should label that it costs an API request against the user's rate limit. Don't hide cost. `[LL §9.1]`.
- Three-pillar problem: GitHub rate-limit resilience needs (a) request throttling, (b) cached responses with explicit `stale` labelling, (c) explicit user-visible state when limits are hit. Partial implementations look fine until the first rate-limit hit. `[LL §8.3]`.
- Examples are not the contract: implementing GitHub sync against NOESIS.Tools is the example, not the boundary. The adapter must already work for `Nnvvee96/getplanora` and `Nnvvee96/ApplyIQ` without GitHub-specific assumptions about repo shape. `[LL §1.3]`.

**Verification.**
- Adapter unit tests cover happy path, 401, 403, 404, 429, and network error.
- Integration test against a real (test) repo: token set in env, sync runs, releases and issues appear in the dashboard with `source: github · synced HH:MM`.
- Manual: revoking the token mid-sync visibly flips the connector state to `error: invalid token` — no silent fail.
- Manual: forcing the sync timestamp back by 1 hour visibly flips all GitHub-derived metrics to `stale`.

**Definition of Done.**
GitHub connector is live for NOESIS.Tools. All GitHub-derived metrics carry the `source: github` label and a freshness timestamp. Error states are visible, never silent.

---

### Phase 5 — Visual Hardening

**Goal.** The cockpit looks and feels like a premium operations product, on every realistic state — empty, partial, loading, stale, error, full. Mobile and desktop both clean.

**Scope-in.**
- Apply CONCEPT §12 brand identity end-to-end (three-font rule, signal palette only in data contexts, no marketing-template shadows).
- Empty / loading / error / stale states for every dashboard view.
- Charts and tables for seeded + GitHub data (Recharts per TECHSTACK §2b).
- Desktop and mobile (375 / 768 / 1024 / 1440) width hardening.
- Operator-cockpit modules (notes / decision log / cohort tracker per CONCEPT §6, if the §17 decision favoured the broad scope).

**Scope-out.**
- Any new connector.
- Any new domain entity.

**Tasks.**
1. Sweep every view: enumerate empty / loading / partial / stale / error / full. For each, define and implement the visible treatment.
2. Replace placeholder type/spacing with the three-font rule. Strict pass: no font outside Geist Sans / Geist Mono / Instrument Serif.
3. Charts: Recharts components with mono labels, signal-coloured series, source line baked in.
4. Responsive sweep: 375 / 768 / 1024 / 1440 widths on every route. Fix overflow, broken grids, table-on-mobile collapse.
5. If §17 chose broad operator-cockpit: implement Notes + Decision Log + Cohort tracker per product (write paths come in via the seed-extension API).
6. Feature-moment pattern: at least one section per major view follows the "quiet section → dense operational moment" rhythm from CONCEPT §12.3.

**Risks From Experience.**
- Operator-visible behaviour is the spec. Run the dashboard through a real morning ritual (CONCEPT §19 Daily Ritual) with NOESIS data; whatever feels wrong is wrong, regardless of the spec doc. `[LL §4.1]`.
- Back-propagate live findings immediately — if a 30-second walk-through surfaces three sharp edges, fix them in the same phase, not in a phase-6 polish backlog. `[LL §4.2]`.
- Color is a semantic label. The state progression (e.g. syncing → live → stale → error) must read as a coherent colour story, not random palette picks. `[LL §10.1]`.
- Visible confirmation on every initiated action. Every "Sync now", every filter change, every action with measurable latency emits an immediate visible signal. `[LL §4.4]`.
- Bake platform conformance into assets — favicons, OG images, apple-touch-icons are already in `apps/landing`; replicate per-route OG if route-specific previews are needed. `[LL §11.1]`, `[LL §11.2]`.
- Latency / cost surprises are policy signals. If `/overview` is slow under realistic data volumes, the answer is to fix the query / cache / pagination policy, not to ship a faster placeholder. `[LL §4.3]`.
- Stale UI is a broken contract. Even the visual-hardening phase keeps the auto-refresh-on-focus discipline. `[LL §10.2]`.
- Color, type, and spacing primitives in shadcn/ui must be extended before adding one-off classes. `[LL §10.4]`.

**Verification.**
- Manual matrix: every route × every state (empty / loading / partial / stale / error / full) — visually verified.
- Manual responsive sweep at 4 widths.
- Lighthouse on the local app: a11y ≥ 95, perf budgets sane for an SPA shell with real data.
- Operator daily-ritual walk-through completes in <16 minutes against NOESIS data with no friction note.

**Definition of Done.**
The dashboard feels like a real cockpit. No broken responsive layout. No fake business claims. No operator-friction note unresolved.

---

### Phase 6 — Next Connectors

**Goal.** Extend connector coverage one at a time. Each new connector must define its cost, credential scope, data limits, and freshness behaviour before any code is written.

**Scope-in (candidates, one per ship unit).**
- Cloudflare Analytics (web traffic, Worker activity).
- Stripe (revenue, customers, subscriptions).
- Custom Tracking API (funnel events; defines the JS snippet and server endpoint).
- Support sources (initially GitHub Issues via existing GitHub connector; native later).
- App telemetry endpoint (privacy-safe events from NOESIS-like clients).

**Scope-out.**
- Hosted-mode features (separate phase, separate spec).
- Connector marketplace UI (decision per CONCEPT §17 — if PR-only, deferred to phase 7).

**Tasks (per connector, one at a time).**
1. Write the connector spec addendum to TDD.md: auth shape, sync triggers, freshness threshold, error states, rate-limit behaviour, privacy/PII boundaries.
2. Implement the adapter against the locked connector interface.
3. Wire UI sources, source labels, error states.
4. Add the connector to the "Build your own" example list (CONCEPT §9.2 Open Connector Framework).
5. Lock the addendum, ship, log decisions.

**Risks From Experience.**
- Local vs hosted under one descriptor is a lie — Stripe Test vs Stripe Live, Cloudflare Free vs Enterprise, dev vs prod must be structurally distinct in the connector model, not just a flag. `[LL §8.1]`, `[LL §8.5]`.
- Research availability before adapter writes. Token scopes, plan tiers, region restrictions — verify before coding. `[LL §8.2]`.
- Three-pillar problems repeat per connector. Each connector has its own cold-start, rate-limit, and freshness model. Implement all three pillars together. `[LL §8.3]`.
- One physical bit for cancel across providers. Don't reinvent abort per connector. `[LL §7.4]`.
- Examples are not scope boundaries. The connector implemented against the operator's primary product type cannot quietly assume that shape for the next product type. `[LL §1.3]`.
- Wire-protocol transparency is the dangerous part. A custom-tracking-API endpoint that accepts the same payload locally and via a hosted relay must distinguish the two structurally. `[LL §8.5]`.
- Honest decline log: connectors evaluated and rejected (e.g. provider X declined due to pricing or fit) go in `docs/MEMORY.md` so future sessions don't re-propose. `[LL §13.4]`.
- Label resource cost at selection time — connectors that hit per-month API limits or paid tiers must surface that on the connector tile, not in a docs page. `[LL §9.1]`.

**Verification (per connector).**
- Spec addendum reviewed and locked before code.
- Adapter unit tests cover auth ok, auth fail, rate-limit, network error, schema drift on the upstream API.
- Manual: connector tile visible state cycles through `pending → syncing → live → stale → error → live` correctly.
- Manual: revoking credentials surfaces visibly within one refresh cycle.

**Definition of Done (per connector).**
One connector shipped, locked spec addendum, error paths tested, decisions logged. Then the next.

---

### Phase 7 — Intelligence Layer (deferred candidate)

**Goal.** Once multiple connectors are live, layer-in derived intelligence: product health score, launch readiness, drop-off diagnosis, release-risk detection, support-spike correlation, "what changed?" explanations.

**Scope-out at this point.** Phase 7 does not open until phase 6 has at least three connectors live and the operator has used the cockpit through a real launch.

**Risks From Experience (when this phase opens).**
- Don't compensate for the wrong tool at the framework layer — if an inference is unreliable, surface the unreliability, don't add scaffolding to paper over it. `[LL §9.4]`.
- Layer is data delivery, not a cage — derived metrics annotate, they don't override the operator's interpretation. `[LL §13.3]`.
- Honest labels on inferred data — `source: derived | inferred` is non-negotiable. `[LL §8.4]`.

---

## 3. Cross-Phase Verification Gates

These apply to every phase, in addition to the phase-specific gates.

**Technical.**
- Typecheck passes (`pnpm run typecheck`).
- Lint passes (`pnpm run lint`).
- Tests pass (`pnpm run test`).
- Core mapping functions and freshness calculators have unit tests.
- Connector error paths have tests.

**Shipping discipline.**
- Verify the deployed artefact, not the build-log success line. After every deploy, check artefact timestamp + a fresh-symbol grep. `[LL §3.1]`.
- Multi-step pipelines must be chained or documented end-to-end. `[LL §3.2]`.
- Sandbox gaps documented honestly; the operator owns the post-ship validation. `[LL §3.3]`.

**Product.**
- Dashboard answers the operator's five verbs: shipped / converted / earned / broke / growing (CONCEPT §3).
- Every metric shows source and freshness. `[LL §8.4]`.
- No integration silently fails. `[LL §10.2]`.

**Security.**
- No secrets committed.
- Local `.env` only for self-hosted MVP.
- Hosted mode requires a separate security and tenancy spec.

**Docs.**
- Phase-close updates: TDD.md, MEMORY.md, SESSION_LOGS.md, SKILLS_COMPOUNDING.md (project-specific) all sync in the same commit as the phase close. `[LL §2.3]`.

## 4. Rollback

Before each phase:
- Commit the docs/spec state.
- Keep changes scoped to the phase. No drive-by refactors.

Rollback command:
- `git revert` or branch reset only with explicit approval.

## 5. References

- `MD-Files/MD-Files Templates/LESSONS_LEARNED.md` — cross-project ledger; every `[LL §N.M]` reference above resolves there.
- `docs/CONCEPT.md` — strategic blueprint; every CONCEPT-section reference resolves there.
- `docs/TECHSTACK.md` — technical baseline; every TECHSTACK reference resolves there.
- `docs/TDD.md` — to be locked in phase 1.
