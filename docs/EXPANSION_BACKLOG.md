---
system: Atlas Vault OS
version: 1.0
date: May 15, 2026
status: ACTIVE / EXPANSION_BACKLOG
project: LumaOps
dependencies: [[CONCEPT.md]], [[TECHSTACK.md]], [[MEMORY.md]], [[IMPLEMENTATION_PLAN.md]]
---
# EXPANSION_BACKLOG.md — Strategic Backlog
# PROJECT: LumaOps

The deliberately-parked list. Things we know we want to revisit, evaluate, or potentially ship — but **not now**.

Each entry has:

- **State** — one of: `parked`, `evaluating`, `ready-to-pick`, `declined`. `declined` entries stay here so the same proposal doesn't recur every six months.
- **Trigger** — what would make us pick this entry up.
- **Notes** — what we already know.

Entries are numbered (`E-001`, `E-002`, …) and never renumbered. New entries get the next free number.

---

## E-001 — AGPL License Upgrade Option

**State**: parked.

**Trigger**: A competitor company clones the LumaOps codebase, launches a competing hosted service under their own brand without contributing back, and starts winning material customer share. In other words: only if our open-source generosity gets weaponized against us in a way the OSS narrative can't otherwise defend.

**Notes**:
- LumaOps is MIT-licensed today (CONCEPT §18.2 Promise #1). That maximizes adoption + community contribution + Plausible-like trust signaling.
- AGPL (Affero General Public License) would close the "cloud loophole": anyone running LumaOps as a network service must release their modifications under AGPL. Effectively prevents a closed-source competing hosted service.
- License change is **reversible only forward in time** — every commit under MIT remains MIT, but new contributions can be AGPL. Historic MIT-licensed code can be forked and re-licensed by anyone.
- Migration path if we ever pull this trigger:
  1. New CONTRIBUTING.md requires AGPL CLA for new contributions.
  2. New LICENSE file in repo root (kept alongside MIT-history-LICENSE).
  3. README headline updated.
  4. Re-announce on the blog with rationale and grandfather clauses for existing forks.
- Risk: AGPL has stigma in some enterprise circles. Some users won't touch AGPL code. Mitigated by the fact that LumaOps's target audience is indie founders, not enterprise legal departments.
- Reference: Cal.com (AGPL), Plausible (AGPL since 2021 — was MIT before), Sentry (BSL/FSL hybrid).

---

## E-002 — Payment Vendor Selection (Polar.sh vs Lemon Squeezy vs Paddle vs Stripe-direct)

**State**: evaluating.

**Trigger**: Phase B opens (closed hosted beta starts taking signups — even if free, the eventual transition needs a vendor decision).

**Notes**:

| Vendor | Per-tx cost on $7 | MoR (handles EU VAT)? | Notes |
|---|---|---|---|
| **Polar.sh** | $0.68 (4% + $0.40) | yes | Built for OSS founders, native subscription, transparent, smaller ecosystem |
| **Lemon Squeezy** | $0.85 (5% + $0.50) | yes | Larger ecosystem, recently acquired by Stripe (future direction unclear) |
| **Paddle** | $0.85 (5% + $0.50) | yes | US-focused, established, slightly heavier UX |
| **Stripe direct** | $0.50 (2.9% + $0.30) | **no** | Cheapest fee but operator must register for EU OSS-Verfahren, file quarterly EU VAT returns, possibly hire accountant. Real cost likely higher than Polar after Tax Stack overhead. |

- For a German-domiciled solo founder selling to international users, MoR vendors are dramatically less operational overhead than Stripe-direct + Stripe Tax + own VAT registration.
- **Working pick**: Polar.sh. Cheapest of the three MoR options, OSS-friendly positioning, built on Stripe under the hood so payment reliability matches.
- Reconsider if Polar's MoR coverage has gaps for any target country we care about.

---

## E-003 — Database Final Pick (Supabase / Turso / CockroachDB Serverless / Xata)

**State**: evaluating.

**Trigger**: End of Phase B beta — we know real usage shape, latency requirements, and connection patterns.

**Notes**:

| DB | Free tier | Idle pause | Wire protocol | Reason to consider |
|---|---|---|---|---|
| **Supabase** (default) | 500 MB | 1 week | Postgres | Bundles Auth + Storage; one vendor |
| **Turso** (libSQL) | 9 GB | none | SQLite | No cold starts; edge-distributed; massive free quota |
| **CockroachDB Serverless** | 10 GB | none | Postgres-wire | No cold starts; horizontal scale path |
| **Xata** | 15 GB | none | Postgres-based | No cold starts; built-in branching |

- TDD §3 schema uses Postgres-native features (jsonb operators, partial unique indexes with `WHERE`, daterange for cohort). Turso/SQLite would require schema adaptations. Postgres-compatible options (Supabase, CockroachDB, Xata) drop in cleanly.
- **Working pick**: Supabase, for the auth + storage bundling. Re-evaluate if cold-start latency from 1-week pause becomes a real operator-facing issue in Phase B.

---

## E-004 — Team Plan / Multi-Operator Pricing Tier

**State**: parked.

**Trigger**: ≥3 paying Phase-C users actively requesting "I want my co-founder / contractor to also see this Studio."

**Notes**:
- MVP is single-operator per Studio (Decision G — Public Studio Identity with optional name + logo, no public URL).
- A Team plan would add: per-operator seats, role-based access (Admin / Viewer), audit log of who-did-what.
- Likely price point: $14/month for up to 3 seats, $5/seat above 3. Or simpler: $14/month flat for unlimited team within one Studio.
- Adds real complexity: auth (multi-user), session management, RBAC, audit logging. Not a one-week slice.

---

## E-005 — Premium Features Declined Park

**State**: parked-with-strong-no.

**Trigger**: Multiple paying Phase-C users explicitly say "I would pay more for X" — AND X has been considered + ruled out here.

**This entry exists to prevent feature-gating drift.** Per CONCEPT §18.2 Promise #7, self-hosted is feature-identical to hosted forever. The items below are features that could plausibly be marketed as "Premium-Hosted" — and we explicitly **will not** OSS-gate them.

- **Alerts / notifications** — implement in OSS or not at all. If we add it, it goes in `packages/core/alerts/`.
- **SSO (SAML/OIDC)** — same. Goes in OSS auth layer or not at all.
- **Audit log** — same. We surface activity in OSS or not at all.
- **Custom domains** — for hosted users, a `your-studio.lumaops.app` subdomain is free. A "use your own domain (`studio.your-company.com`)" feature could be a hosted-only **convenience** (DNS routing is genuinely a hosting concern). Acceptable as hosted-only because self-hosted users already own their own DNS.
- **White-labeling** — never. Would compromise the "audit our code" trust signal.
- **Priority support** — acceptable as hosted-only convenience (it's a service, not a feature).

The distinction: anything that's a **feature** of the product stays OSS-feature-identical. Anything that's a **service** around the product can be hosted-only convenience.

---

## E-006 — ApplyIQ / Planora / OHARA as GitHub-Connector Real-Repo Test Targets

**State**: ready-to-pick (waits on IMPLEMENTATION_PLAN Phase 4 close).

**Trigger**: GitHub Connector ships (Phase 4 closes).

**Notes**:
- LumaOps's first real connector test is against NOESIS.Tools per Phase 4. Once the adapter works end-to-end there, the second pass tests it against the operator's other three products to verify the "adapter must work for repo shapes beyond the first example" rule (LESSONS_LEARNED §1.3).
- Each product to test: ApplyIQ (web-app, beta), Planora (web-app, pre-launch), OHARA (research system, active).
- Expected findings: differences in release-channel taxonomy, label conventions for support issues, PR/issue ratio differences. Each finding either feeds into the adapter (if generic) or into per-product configuration (if intentional).

---

## E-007 — Phase B Hosted Closed-Beta Launch Plan

**State**: ready-to-pick (waits on IMPLEMENTATION_PLAN Phase 5 close).

**Trigger**: Phase 5 (Visual Hardening) closes — cockpit feels real on real data.

**Steps**:
1. Spin up `app.lumaops.app` subdomain on Cloudflare Pages.
2. Provision Supabase project (free tier).
3. Provision Supabase Auth with magic-link sign-in (no passwords).
4. Wire `apps/web` to multi-tenant mode (workspace-id from auth claim instead of `.env`).
5. Build a `/signup` flow with invite codes (20–50 codes generated).
6. Invite-code outreach: Indie Hackers, X/Twitter, ProductHunt makers, friends-of-friends.
7. 8-week feedback loop. Weekly retros on what's working / breaking.
8. Decision gate at week 8: ≥10 active beta users + ≥4 of them say "I'd pay $7/mo" → Phase C green-lit. Otherwise: extend beta or close hosted variant entirely.

---

## E-008 — Phase C Public Hosted Launch

**State**: parked (waits on E-007 success).

**Trigger**: E-007 gate passes.

**Steps**:
1. Pick final payment vendor (E-002).
2. Pricing page added to `apps/landing/` — only at this step does the landing site mention hosted.
3. Hero copy gains one-line: "Open source, self-hosted — or hosted for $7/month."
4. Subscription wiring via vendor API.
5. Email onboarding sequence via Resend (welcome, integration setup, first-week check-in).
6. ProductHunt launch.
7. Show HN: "LumaOps — operations cockpit for indie founders. Open source + $7/mo hosted."
8. Cliff monitoring: Supabase rows, Cloudflare req/day, Resend volume. First cliff (~50 users) → upgrade DB to Supabase Pro.

---

## E-009 — Daily-Ritual Morning View (CONCEPT §19)

**State**: parked.

**Trigger**: Phase 5 closes + operator has used the cockpit for ≥4 weeks against real data and reports that the implicit-via-Overview ritual is friction-heavy.

**Notes**:
- Decision I (CONCEPT §17) currently has this as "implicit in Overview" for MVP, "explicit Morning view in Phase 5". This entry is the parking spot for the explicit-Morning-view design once Phase 5 user testing decides the question.
- If the implicit ritual works (Overview is dense enough that the 16-min flow happens naturally), this entry stays parked indefinitely. If real use reveals friction, this opens.

---

## E-010 — Native Cohort Tracking Engine (CONCEPT §17 Decision J)

**State**: parked.

**Trigger**: Phase 5 — explicit decision to open.

**Notes**:
- TDD §3.5 sketches the `cohort` table; it's not in the MVP migration on purpose.
- Engine work: identity resolution across events (hashed email → anonymous_id mapping), funnel-stage joining with time windows, retention calc, drop-off attribution per stage.
- Major differentiator vs. PostHog/Plausible — none of them treat cohorts as first-class for beta-product founders specifically.

---

## How to use this file

- When evaluating a feature request or scope question, **check here first**. If it's already an entry, read the trigger + notes before acting.
- When a Phase closes and an entry's trigger fires: change state to `ready-to-pick`, then open a new IMPLEMENTATION_PLAN slice for it.
- When something is genuinely rejected: change state to `declined` and add the rationale. Don't delete — the entry persists so the same idea doesn't get proposed again later.
- New entries get the next free number (`E-N+1`). Number never gets reused.
- This file is part of the canonical doc set referenced by `AGENT.md` Index MOC and `IMPLEMENTATION_PLAN.md` §5 References.
