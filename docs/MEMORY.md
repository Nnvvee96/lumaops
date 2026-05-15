---
system: Atlas Vault OS
version: 1.0
date: May 15, 2026
status: ACTIVE / PROJECT_MEMORY
project: LumaOps
dependencies: [[AGENT.md]], [[CONSTRAINTS.md]], [[SESSION_LOGS.md]], [[SKILLS_COMPOUNDING.md]], [[LESSONS_LEARNED.md]]
---
# MEMORY.md - Project Knowledge Base
# PROJECT: LumaOps

## 1. Strategic Decisions
Decision A: Browser-based app first > fastest open-source/self-hosted onboarding; desktop wrapper can come later via Tauri.
Decision B: LumaOps name + `lumaops.app` > clean product-ops brand with app-domain fit.
Decision C: Open-source core before hosted SaaS > avoids premature auth, tenancy, billing, and secrets-management complexity.
Decision D: GitHub connector first > provides product structure and dev/release signals without pretending to provide business truth.

## 1.1 Phase-1 Spec-Lock Decisions (2026-05-15)

### Product-Scope Decisions (from CONCEPT §17)

Decision E — Operator-cockpit scope: **broad**.
Per-product cockpit includes Notes / Decision Log / Brainstorm / Launch-Calendar / Cohort-Tracker alongside the metric surfaces. Why: this is the actual differentiator vs. PostHog/Plausible — LumaOps becomes the single operator surface per product, not just another metric dashboard. Tradeoff: larger MVP scope, but the data model carries them cheaply (additional tables, no architectural disruption).

Decision F — Support surface: **surface-only in MVP, native reply ab Phase 4+**.
LumaOps surfaces tickets from GitHub Issues (and later other sources) but does not reply natively in the MVP. Why: native reply requires SMTP/auth/privacy plumbing that explodes MVP scope; surfacing tickets already closes the operator's "do I need to look at support today?" question. Native reply remains a Phase 4 candidate.

Decision G — Studio identity: **public Studio-Name + optional logo, no public URL**.
Operator can name their Studio (e.g. "Navyug Studio") with an optional logo. The name surfaces inside the cockpit (Studio switcher, doc handoffs) but does NOT mint a public URL like `lumaops.app/navyug`. Why: provides identity for multi-product indies without requiring multi-tenancy / public routes / auth in the MVP. Public URL becomes a Phase 4 decision if the hosted variant ships.

Decision H — Brand-asset per product: **auto-favicon from website_domain with manual override**.
Product object has `icon_url` + `icon_source` (`auto-favicon` | `uploaded` | `fallback`). On product creation, LumaOps fetches `/favicon.ico` (or `apple-touch-icon`) from `website_domain`. Operator can upload a custom logo any time. Why: 80% of products get an icon in zero clicks; the 20% without a usable favicon are not blocked.

Decision I — Daily Ritual surface: **implicit via Overview in MVP, explicit Morning-View in Phase 5**.
The 16-minute morning ritual (CONCEPT §19) is delivered by the Overview being designed to flow that way — not by a separate dedicated route. A literal Morning-View becomes Phase 5 scope. Why: avoids parallel-surface maintenance early; forces Overview to actually fulfil the promise by design rather than by a separate page.

Decision J — Native cohort tracking: **native cohort engine, target Phase 5**.
Per-product cohort tracker follows leads through Lead → Install → Activation → Retention as a first-class object with identity resolution and event-joining. Why: this is a Killer-Differential vs. PostHog/Plausible for beta launches — surface-only counts cannot answer "did this specific cohort retain?" Scope-heavy, hence Phase 5 rather than MVP.

Decision K — Hosted-phase pricing: **defer until Phase 4 opens**.
No pricing decision in MVP. Data model and architecture stay neutral so both "pure convenience layer" and "freemium with paid features" remain reachable. Why: deciding now wastes attention; locking in either direction changes how features are gated at a level we can't yet judge.

Decision L — Connector marketplace: **PR-only library in MVP, hosted catalog candidate for Phase 4**.
Community connectors land as PRs against the open-source repo and ship with the next LumaOps release. Why: zero distribution infrastructure to build; review tempo bottlenecks velocity but that's an OSS-maintainer problem, not a technical one. Hosted catalog reopens in Phase 4 if community volume justifies it.

### TECHSTACK Decisions

Decision M — ORM: **Drizzle**.
TypeScript-first, leichtgewichtig, SQL-near, exzellente Type-Inference; läuft sauber auf Postgres heute und auf Cloudflare D1 falls wir den Edge-Pfad später ziehen. Why over Prisma: kein Engine-Binary, kein Code-Gen-Schritt, Workers/Edge-Story bereits gut, kleinerer Maintenance-Footprint für ein OSS-Projekt. Tradeoff akzeptiert: kleineres Ökosystem als Prisma, Drizzle Studio noch jung.

Decision N — Backend-Shape: **Next.js App Router (Node) + Postgres lokal, Cloudflare-Adapter offen für später**.
Eine Box, ein Repo, ein Deploy. Server Actions / Route Handlers für API-Pfade, Postgres via Docker für Self-Hosting. Why: das "laptop-first / homelab" Self-Hosting-Versprechen aus CONCEPT §18.2 schließt Cloudflare-Workers-only aus. Drizzle hält den Migrationspfad zu Workers+D1 für eine spätere Hosted-Variante offen — kein Schema-Rewrite nötig.

Decision O — Auth (Self-Hosted MVP): **Single-User, kein Login, lokales `.env`**.
App startet ohne Login-Schirm. `.env` definiert den Operator. Cloudflare Access dokumentiert als optionale Schutzschicht für public-facing self-hosted Deployments. Why: CONCEPT §10 / §11 verlangen ausdrücklich kein Auth im MVP. Hosted-Mode bekommt eine eigene Auth/Tenancy-Spec wenn Phase 4 öffnet.

## 2. Flush Logs
Compaction: At 150k tokens (anecdotal), distill insights.
2026-05-15: Product direction locked as open-source, self-hostable product operations cockpit for indie software.
2026-05-15: Phase 1 Spec-Lock — 11 decisions captured (§1.1 above). Eight from CONCEPT §17 (operator-scope, support-surface, studio-identity, brand-assets, daily-ritual, cohort tracking, hosted pricing, connector marketplace), three TECHSTACK (Drizzle, Next.js App Router + Postgres, single-user .env auth). CONCEPT §17, TECHSTACK §2b, TDD.md updated in the same pass.

## 3. Locked Prompts
Visual Seed: Minimal, calm, premium operations cockpit inspired by restrained personal-site aesthetics, adapted for dense product dashboards.

## 4. Failure Lessons
Failure: `.com` availability over-optimized naming exploration.
Solution: Prefer strong brand plus `.app`/`.dev` over weak `.com` leftovers.

## 5. Harness Gap Loop
Incident: None yet.
Issue: None yet.
New Case: Add connector freshness tests before first external API implementation.
SLA: Pending first code scaffold.
Diagnostics: High uptime/low output = spec issue.
