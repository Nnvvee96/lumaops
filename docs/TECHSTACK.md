---
system: Atlas Vault OS
version: 1.0
date: May 15, 2026
status: ACTIVE / TECH_STACK
project: LumaOps
dependencies: [[AGENT.md]], [[CONSTRAINTS.md]], [[PATTERNS.md]], [[LESSONS_LEARNED.md]], [[CONCEPT.md]]
---
# TECHSTACK.md - LumaOps Technical Baseline
# PROJECT: LumaOps

## 1. Product Mode
Primary mode: open-source, self-hostable browser application.

Distribution:
- GitHub public repository first.
- `lumaops.app` reserved for docs, product presence, and later hosted app.
- No hosted SaaS requirements in the MVP.
- No desktop shell in the MVP. Tauri remains a Phase 2 wrapper option.

## 2a. Marketing Site Stack (`lumaops.app` landing)
The public landing at `lumaops.app` is a separate concern from the product cockpit. It is intentionally lightweight and decoupled from the application stack.

- Static HTML/CSS, no build step.
- React 18 + Babel Standalone via CDN (in-browser JSX).
- Hosted on Cloudflare Pages.
- Location: `apps/landing/`.
- Source: handoff from Claude Design.

Rationale:
- Marketing/product-presence content changes on a different cadence than the cockpit.
- No reason to drag the product's Next.js build pipeline into a static page.
- Porting to Next.js becomes an option only once `apps/web` exists and a unified pipeline pays for itself.

## 2b. Application Stack
Decisions below were locked in the 2026-05-15 Phase-1 Spec-Lock pass (MEMORY §1.1).

Frontend/app:
- Next.js App Router (locked — MEMORY Decision N).
- React 18+.
- TypeScript strict.
- Tailwind CSS.
- shadcn/ui.
- lucide-react.

Data and validation:
- PostgreSQL (locked).
- **Drizzle** ORM (locked — MEMORY Decision M). Rationale: TS-first, no engine binary, no code-gen step, clean Cloudflare D1 migration path for a later hosted edge variant.
- Zod for boundary validation at every external surface (HTTP request bodies, connector responses, env parsing).

API layer:
- Next.js Route Handlers + Server Actions (locked — MEMORY Decision N).
- No separate Express/Hono service in the MVP.
- Cloudflare Workers+D1 adapter is an explicit future option; Drizzle keeps that door open without schema rewrite.

Auth (MVP):
- Single-user, no login (locked — MEMORY Decision O).
- Operator identity defined in `.env` (e.g. `LUMAOPS_OPERATOR_NAME`).
- Cloudflare Access documented as optional protection layer for public-facing self-hosted deployments.
- Hosted variant gets its own auth/tenancy spec when Phase 4 opens.

Charts:
- Recharts for MVP charts unless a stronger local pattern emerges.

Runtime & toolchain:
- Node.js 22.x LTS.
- pnpm workspaces (monorepo).
- Docker Compose for local Postgres in self-hosted setups.

## 3. Architecture Shape
Planned monorepo:
- `apps/web` - Next.js dashboard.
- `packages/core` - product model, signal normalization, freshness logic.
- `packages/connectors` - GitHub, Cloudflare, Stripe, telemetry adapters.
- `packages/ui` - reusable dashboard UI components.
- `docs` - concept, TDD, implementation plan, decisions, session logs.

Future optional app:
- `apps/desktop` - Tauri wrapper around the web app after the core is proven.

## 4. Integration Policy
MVP connector:
- GitHub.

Phase 2 connectors:
- Cloudflare.
- Stripe.
- Custom telemetry ingest.
- Support/ticket sources.
- Privacy-safe app telemetry.

Credential rule:
- Users bring their own tokens/keys.
- Secrets stay local or self-hosted by default.
- Hosted LumaOps requires a separate security and tenancy spec before implementation.

Truth boundary:
- GitHub provides product structure, releases, issues, and development signals.
- Cloudflare, Stripe, telemetry, and custom events provide business truth.
- Stale or missing data must be visible in the UI.

## 5. Auth And Hosting
MVP:
- No forced auth for local development.
- Single workspace mode.
- Local `.env` configuration.

Self-hosted:
- Docker support later.
- Optional auth only after the core dashboard works.

Hosted app:
- Separate phase.
- Requires workspace tenancy, OAuth, encrypted secrets, rate limits, audit logs, billing, and abuse controls.

## 6. Design System
Direction:
- Minimal, calm, premium dashboard.
- Dense but readable.
- First screen is the working cockpit, not a landing page.
- Inspired by restrained personal-site aesthetics like `navyug.me`, but adapted to an operational product interface.

UI rules:
- Left sidebar.
- Product switcher.
- Date range control.
- Integration/freshness status visible.
- No decorative marketing hero in the app.
- No card-heavy landing-page composition inside the product.
