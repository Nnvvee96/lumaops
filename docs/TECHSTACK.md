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

## 7. Hosted Infrastructure Stack (Phase B + C only)

The OSS self-hosted variant runs wherever the user wants — Docker on a laptop, Hetzner, Vercel, anywhere. This section locks the stack **we** run for the hosted variant at `app.lumaops.app` once Phase B opens. (See CONCEPT §11 for Phase A/B/C sequencing and `MEMORY.md` Decision K for the pricing context.)

### 7.1 Design goal: $0 fixed monthly cost during Phase A and the start of Phase B

Every component below has a free tier that covers MVP-scale traffic. Operator cash outlay is $0/month until a cliff is hit (~50–100 paying users). The stack consolidates onto Cloudflare + Supabase + Resend to keep the vendor count low.

### 7.2 Locked components

| Concern | Service | Free tier ceiling | Cliff → next step |
|---|---|---|---|
| Cockpit hosting | Cloudflare Pages (Next.js via `@opennextjs/cloudflare`) | unlimited bandwidth, 100k req/day | Workers Paid ($5/mo) at >100k req/day |
| Database | Supabase Postgres | 500 MB, 1-week idle pause | Pro ($25/mo) for >500 MB or always-on |
| Auth | Supabase Auth (bundled with DB) | 50k MAU | included in Pro |
| Object storage (logos, exports) | Supabase Storage (bundled) | 1 GB | included in Pro |
| Background sync workers | Cloudflare Workers + Cron Triggers | 100k req/day, 5 cron triggers | Workers Paid ($5/mo) |
| Transactional email | Resend | 3,000/mo, 100/day | Pro ($20/mo) at >3k/mo |
| Uptime monitoring | UptimeRobot | 50 monitors, 5-min checks | Pro ($7/mo) for 1-min checks |
| DNS + SSL + CDN | Cloudflare | unlimited | n/a (free) |
| Payments | Polar.sh **or** Lemon Squeezy (E-002) | n/a | 4–5% + fixed fee per transaction |

### 7.3 Why this specific consolidation

- **Supabase replaces three vendors** (Neon for Postgres, Clerk for Auth, Cloudflare R2 for Storage) → one vendor relationship, one billing surface, one set of credentials, one client SDK.
- **Cloudflare Pages over Vercel** — Vercel free tier is generous but Cloudflare's free bandwidth is unlimited and the Workers runtime is what we want for the cron sync workers anyway. One ecosystem for compute + edge + DNS + CDN.
- **Supabase 1-week idle pause** (vs. Neon's 5-min) is acceptable because the cockpit is a daily-use tool. Even an inactive operator visits weekly; pause never fires in normal use.
- **Polar.sh or Lemon Squeezy as Merchant of Record** handles EU VAT compliance for a German-domiciled founder — `[LL §8.4]` honest-data discipline extended into tax reporting. Final pick deferred to Phase B (`EXPANSION_BACKLOG.md` E-002).

### 7.4 Components flagged for re-evaluation before Phase B

- **Database final pick** — Supabase is the default, but Turso (libSQL, no idle pause, 9 GB free), CockroachDB Serverless (Postgres-wire, 10 GB free, no pause), and Xata (15 GB free) remain on the eval list (`EXPANSION_BACKLOG.md` E-003). Decision when Phase B opens, based on schema-specific behaviour by then.
- **Payment vendor** — Polar.sh and Lemon Squeezy both viable; pick based on Phase-B feedback (`EXPANSION_BACKLOG.md` E-002).
- **License** — MIT today; AGPL upgrade is a strategic option if competitive hosting ever materialises (`EXPANSION_BACKLOG.md` E-001).

### 7.5 Unit economics at $7/month

- Per-user marginal cost (variable): ~$0.30/month at scale.
- Stripe-equivalent processing (via Polar/Lemon Squeezy MoR): ~$0.50–0.70 per $7 transaction (4–5% + fixed fee, all tax handled).
- Net per user: ~$6.20–6.50/month.
- Break-even: ~7–8 paying users to cover Phase B/C fixed costs at the first cliff (~$25/month).
- At 100 paying users: ~$700 gross, ~$60 fixed, ~$30 variable → ~$610/month net.

The hosted variant is a high-margin business once break-even is reached. The early phase (1–7 users) costs the operator ~$25–50/month out of pocket — explicit, bounded, recoverable.
