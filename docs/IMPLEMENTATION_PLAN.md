---
system: Atlas Vault OS
version: 1.0
date: May 15, 2026
status: ACTIVE / EXECUTION_MAP
project: LumaOps
---
# IMPLEMENTATION_PLAN.md - Execution Map
# PROJECT: LumaOps

## 1. Overview
Goal: Build LumaOps as an open-source, self-hostable product operations cockpit for indie software.

Initial proving ground: NOESIS.Tools.

Risk Tier: Medium. The MVP is read-only, but it touches external credentials and product/business signals.

Locked stance:
- Browser-based web app first.
- Open-source core first.
- Hosted app later.
- Desktop wrapper later, if needed.
- No registration/account system in the MVP unless the hosted phase is explicitly approved.

## 2. Sequence

### Phase 0: Repository Bootstrap
Tasks:
- Align active docs around the LumaOps product identity.
- Initialize Git repository.
- Connect remote `https://github.com/Nnvvee96/lumaops.git`.
- Add README, license, gitignore, and docs baseline.

Gate:
- Public repository has accurate product stance.
- Docs separate open-source core from later hosted app.

### Phase 1: Technical Spec Lock
Tasks:
- Finalize `TDD.md`.
- Choose Prisma vs Drizzle.
- Define product/workspace/integration/event/metric schema.
- Define GitHub connector contract.
- Define freshness/error states.

Gate:
- No code scaffolding before the data model and connector contract are locked.

### Phase 2: App Skeleton
Tasks:
- Create Next.js App Router monorepo.
- Add TypeScript, Tailwind, shadcn/ui, lucide-react.
- Add basic layout shell: sidebar, topbar, product switcher, content area.
- Add placeholder routes: overview, products, releases, support, telemetry, integrations, settings.

Gate:
- App runs locally.
- UI shell is clean, responsive, and not a marketing page.

### Phase 3: Core Domain
Tasks:
- Implement core product model.
- Implement integration status model.
- Implement freshness/trust model.
- Seed NOESIS.Tools manually.

Gate:
- Dashboard can render from local seeded data.
- Missing/stale data is visible.

### Phase 4: GitHub Connector
Tasks:
- Add GitHub token configuration.
- Fetch repository metadata, releases, issues, and basic activity.
- Map GitHub data into product signals.
- Show release/support/dev-signal views.

Gate:
- GitHub is treated as development signal only, not revenue/traffic truth.
- Connector errors are explicit.

### Phase 5: Visual Hardening
Tasks:
- Apply premium minimal design system.
- Add realistic empty/loading/error states.
- Add charts/tables for seeded and GitHub data.
- Browser-test desktop and mobile widths.

Gate:
- No overlap, no broken responsive layout, no fake business claims.

### Phase 6: Next Connectors
Candidates:
- Cloudflare analytics.
- Stripe revenue.
- Custom telemetry ingest.
- Support source mapping.

Gate:
- Add one connector at a time.
- Each connector must define cost, credential scope, data limits, and freshness behavior.

## 3. Verification Gates
Technical:
- Typecheck passes.
- Lint passes.
- Core mapping functions have tests.
- Connector error paths have tests.

Product:
- Dashboard answers: what shipped, converted, earned, broke, and needs attention.
- Metrics show source and freshness.
- No integration silently fails.

Security:
- No secrets committed.
- Local `.env` only.
- Hosted mode requires a separate security spec.

## 4. Rollback
Before each implementation phase:
- Commit docs/spec state.
- Keep changes scoped to the phase.

Rollback command:
- Use normal Git revert or branch reset only with explicit approval.
