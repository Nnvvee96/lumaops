# LumaOps

[![CI](https://github.com/Nnvvee96/lumaops/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/Nnvvee96/lumaops/actions/workflows/ci.yml)

Open-source product operations cockpit for indie software.

LumaOps helps founders connect product signals from GitHub, Cloudflare, Stripe, telemetry, support, and custom events into one clean launch dashboard.

## Product Stance

- Open-source first.
- Self-hostable before hosted.
- Browser-based app, not a marketing website.
- Built for indie products, beta launches, and small software studios.
- Domain reserved: `lumaops.app`.

The first proving ground is NOESIS.Tools. The hosted version can come later, but the core product should be useful as a local or self-hosted dashboard before SaaS concerns are added.

## Initial Scope

- Product and workspace model.
- Manual product setup.
- GitHub connector for product structure, releases, issues, and development signals.
- Integration health and freshness states.
- Clean dashboard shell with overview, products, releases, support, telemetry, and integrations sections.

## Non-Goals For The MVP

- No public marketing website.
- No paid hosted SaaS.
- No multi-tenant billing.
- No forced third-party auth.
- No claim that GitHub alone can provide revenue, traffic, or funnel truth.

## Repository Status

Phase 0 + Phase 1 closed. Phase 2 in flight — see `docs/IMPLEMENTATION_PLAN.md`.

## Local development

Requires Node 22, pnpm 10, and Docker (for the local Postgres).

```sh
nvm use                                           # picks up .nvmrc
cp .env.example .env                              # local environment
pnpm install
docker compose up -d                              # local Postgres on :5433
pnpm --filter @lumaops/core db:migrate            # apply Drizzle migrations
pnpm --filter @lumaops/web dev                    # cockpit on localhost:3000
```

Stop the local Postgres with `docker compose down`. Wipe its data with `docker compose down -v` (the named volume).

## Slice convention

Work ships in sub-slices per `docs/IMPLEMENTATION_PLAN.md`:

- Branch: `slice/S<id>-<kebab-summary>` (e.g. `slice/S2A-monorepo-pnpm`)
- Commit subject: `[S<id>] <imperative summary>`
- PR title: `[S<id>] <summary>` — squash-merge to main, branch auto-deleted
- One slice = one branch = one PR = one squashed commit on main

## CI

Every PR runs typecheck / lint / build / tests / gitleaks. See `.github/workflows/ci.yml`.

## Canonical docs

| File | Role |
|---|---|
| `docs/CONCEPT.md` | Strategic blueprint |
| `docs/TECHSTACK.md` | Technical baseline |
| `docs/TDD.md` | Locked technical design |
| `docs/IMPLEMENTATION_PLAN.md` | Phase / sub-slice execution map |
| `docs/MEMORY.md` | Decision log + edge cases |
| `docs/SESSION_LOGS.md` | Iterative session chronicle |
| `docs/SKILLS_COMPOUNDING.md` | Project-specific failure rules |
| `docs/LESSONS_LEARNED.md` | Cross-project canonical ledger |
| `docs/AGENT_CONTEXT_PACK.md` | NOESIS-consumable role context |
