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

## E-001 — AGPL License Upgrade

**State**: **done (2026-05-15)**.

**Outcome**: License switched from MIT to **AGPL-3.0-only** proactively, before Phase B opens. Operator decided not to wait for a competitor incident — wants the protection from day one.

**What changed in the repo**:
- `LICENSE` file replaced with canonical GNU AGPL-3.0 text (from `gh api /licenses/agpl-3.0`).
- All `package.json` files: `"license": "AGPL-3.0-only"`.
- `docs/CONCEPT.md` §17 Decision K + §18.2 Promise #1 reflect AGPL.
- `docs/MEMORY.md` Decision K updated.
- `docs/TECHSTACK.md` §7 Hosted Infrastructure Stack notes AGPL.
- README headline shows AGPL.

**What this means in practice**:
- Repo stays **public** on GitHub. Anyone can clone, modify, run, self-host — that's still true.
- The new constraint: **anyone who runs LumaOps as a network service must release their modifications under AGPL too.** This closes the "cloud loophole" — a competitor cannot take the code, modify it, host it as a closed-source SaaS, and not contribute back.
- Closed-source self-hosting for personal/internal use stays fine. The AGPL trigger is *offering it as a network service to third parties*.
- Pre-2026-05-15 commits remain MIT in their historical form. Anyone who forked LumaOps before this date keeps the MIT rights for that snapshot. New commits from this date forward are AGPL.

**Why proactive rather than reactive**:
- Standard pattern for indie OSS founders monetising hosting: lock in protection before any visible traction makes the codebase a target. Cal.com / Plausible / Grafana all did the same migration. None of them suffered adoption loss.
- Pricing model is locked (Decision K, $7/mo hosted), so the OSS-vs-hosted economic logic exists — AGPL just protects it structurally rather than relying on goodwill.

**Risk reminders**:
- Enterprise legal departments are sometimes wary of AGPL. Mitigated by LumaOps's audience being indie founders, not Fortune-500 procurement.
- If we ever want enterprise adoption that's blocked by AGPL fear, we can offer a commercial license via CLA (Contributor License Agreement) — keeps the OSS path open while allowing paid relicensing for those who need it. Deferred until anyone actually asks.
- Reference: Cal.com (AGPL since launch), Plausible (AGPL since 2021 — also a MIT→AGPL migration), Ghost (MIT but uses other defenses), Sentry (BSL/FSL hybrid — more aggressive than AGPL).

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

## E-013 — Connector Family Expansion: Social / SEO / Marketing Analytics

**State**: parked (post-Phase-6).

**Trigger**: Phase 6 closes with the foundational connectors (Cloudflare / Stripe / Custom-Tracking / App-Telemetry) — at which point the ConnectorAdapter contract has proven across enough providers to confidently extend into a broader provider family.

**Why this exists**: Operator vision is that LumaOps is "allgegenwärtig" — every signal a founder cares about converges into the cockpit, not just product-code signals (GitHub) + revenue (Stripe). For an indie founder shipping a consumer-facing product, **marketing signals are often the higher-value half**. SEO performance, social reach, content velocity, ad spend — those are the daily-ritual signals as much as releases and revenue.

**Candidate providers** (each follows the per-connector template from IMPLEMENTATION_PLAN §Phase-6):

Search / SEO:
- Google Search Console (impressions, clicks, position, indexed pages)
- Plausible Analytics
- Google Analytics 4
- Ahrefs / SEMrush (if their API costs make sense)

Social organic:
- Instagram Graph API (reels insights: plays, engagement, reach per post)
- TikTok for Developers (video views, engagement rate, follower growth)
- YouTube Data API (channel + per-video performance)
- X / Twitter API v2 (tweet impressions, engagement)
- LinkedIn API (company-page + post analytics)
- Bluesky AT Protocol (early-stage, narrow scope, OSS-friendly)

Social paid (later):
- Meta Marketing API (Facebook + Instagram ads)
- TikTok Ads API
- Google Ads API
- X Ads API

Content velocity / dev-tangent:
- Substack (if they expose API by then)
- ConvertKit / Beehiiv (newsletter open rates)
- YouTube creator dashboard for long-form
- Discord / Slack analytics for community-led products

**Critical constraint** ([LL §8.4]): each social platform has its own credential model + ToS + rate limits + freshness windows. Some (Instagram Graph) require a Facebook Business account. Some (TikTok) have notoriously restrictive APIs. The per-connector template must be honest about each platform's coverage and limits in the UI tile — "Plausible: every page view, refreshed hourly" vs "Instagram Graph: 24-hour delay, weekly aggregate only" are very different operational realities.

**Sequencing within E-013**:
1. **Search Console** first — high signal, easy API, free for indie scale
2. **Plausible / GA4** — analytics primary
3. **Instagram Graph + TikTok** — visual content metrics
4. **YouTube / X / LinkedIn** — secondary social
5. **Paid ads** — last, because ad-spend without product-market-fit is a known anti-pattern

**Out of scope of this entry**:
- Posting / scheduling automation (LumaOps surfaces signals, doesn't publish — that's Buffer/Hootsuite territory; CONCEPT §21 anti-features applies)
- Influencer-tracking (single-domain product, not LumaOps's job)
- Sentiment analysis (derived; pushes back to Phase 7 Intelligence)

---

## E-012 — Token-via-Dashboard (replace .env workflow for end-users)

**State**: parked (mandatory before Phase B opens — same gate as E-011).

**Trigger**: Phase 4 closes OR Phase B prep starts.

**The gap**:
- Today, configuring the GitHub connector requires editing `.env` at the repo root and restarting `pnpm dev`. That works for a developer maintainer but is unacceptable for a closed-beta user, a hosted-variant user, or anyone setting up their own LumaOps instance who does NOT live in a terminal.
- The operator's explicit direction: "**alles über den dashboard testen, nichts über terminal**." Every connector — GitHub, Cloudflare, Stripe, social, SEO, anything later — must be wirable, testable, and revocable through the cockpit UI alone.

**What needs to ship**:
1. **Encrypted secret storage** in DB (or in a vault — depends on hosted-vs-local). For local self-hosted: encrypted-at-rest in Postgres using a key from `LUMAOPS_ENCRYPTION_KEY` env (one bootstrap secret, but exactly one — and it's not the integration token). For Phase B/C hosted: KMS-backed (AWS KMS or Cloudflare-secrets-style).
2. **Add Integration UI** — `/integrations/new` route. Connector picker, then a provider-specific form (e.g. for GitHub: paste token, paste owner/repo). Token gets encrypted server-side immediately on submit, fingerprint persists, plaintext never round-trips back to the client.
3. **Token rotation UI** — per integration tile, "Rotate token" button opens a modal, paste new token, validates against the provider, swaps the encrypted blob.
4. **Token revocation UI** — "Disconnect" button on each tile; clears the encrypted blob, sets state to "pending", credential_status to "missing".
5. **Audit log** — every secret access logged with timestamp + integration_id (NOT the token). Surfaced as a tab in Settings or per-integration.

**Why not in Phase 4**:
- S4B took the right MVP shortcut (read from .env) so the GitHub adapter could ship + be live-testable today without first building a secrets-vault.
- Adding encrypted DB storage + the AddIntegration UI is a real Phase-5 slice (or its own mini-phase between 4 and 5). Doing it inside S4B would have inflated the slice 3x and delayed working GitHub data.

**What E-012 does NOT include**:
- Multi-user secret sharing (Team Plan E-004 territory)
- HSM integration (overkill for an indie tool; KMS is enough)
- Token expiry monitoring (separate concern; could be a later sub-ticket)

**Connection to other backlog entries**:
- Hard prerequisite for E-013 (social/SEO connectors) — those provider tokens are even more sensitive than GitHub PATs (some grant ad-spend authority).
- Hard prerequisite for Phase B (closed beta) — beta testers cannot edit .env on the operator's machine.

---

## E-011 — First-Run Studio Onboarding (no hardcoded seed identity)

**State**: parked (mandatory before Phase B opens).

**Trigger**: Phase 4 closes OR Phase B prep starts — whichever comes first.

**The gap**:
- Today the only way to create a Workspace + Products is to run
  `pnpm --filter @lumaops/core seed`. The seed hardcodes "Navyug —
  Indie Studio" + four operator-specific products.
- A fresh clone with no seed shows honest empty states ("No studio
  configured — run pnpm core seed"). That works for developers.
- It does **not** work for any closed-beta user, hosted-variant user,
  or anyone who isn't the operator. A non-developer cloning the repo
  would have to edit `seed.ts` to use their own names.

**What needs to ship**:
1. **First-run setup screen** — when no Workspace row exists, the
   cockpit shows a setup form instead of the empty-states. Fields:
   studio name (required), timezone (defaults to browser locale),
   default currency (defaults to EUR for DE-shipped builds, USD
   otherwise), default date range. Form posts via Server Action to
   create the Workspace row.
2. **Add Product flow** — once a studio exists, an "Add product"
   button on `/products` opens a panel: name, slug (auto-derived
   from name with edit override), product_type, status, optional
   GitHub repo, optional website domain. Server Action creates the
   row + sets `primary_metric_key` via getDefaultMetricForType().
3. **Optional**: GitHub-import shortcut — paste a repo URL, LumaOps
   pre-fills name/slug/website/repo from the repo metadata (depends
   on Phase 4 GitHub adapter being live for the auth handshake).
4. **Seed becomes a dev convenience, not the default path.**
   `seed.ts` stays for local development to skip the manual steps.
   Documented as "for contributors, not for end-users."

**Why not in Phase 3**:
- Add-Product UI requires write paths from the UI (Server Actions
  against the schema). Phase 3 was explicitly read-only per the
  IMPLEMENTATION_PLAN scope.
- Smart UI flow benefits from real GitHub data (Phase 4 GitHub
  Connector) so the GitHub-import shortcut works end-to-end. Doing
  Add-Product UI now without GitHub auto-fill ships a worse version
  of the same feature.

**Out of scope for E-011**:
- Multi-user invitations (Phase 4+ if Team Plan E-004 opens)
- Studio renaming after creation (covered by basic edit panel; not
  novel UX)
- Public Studio URLs (Decision G — defer, see E-004 + Phase 4 spec)

**Risk**: leaving this parked too long means we cannot pilot Phase B
(closed hosted beta) — any beta user needs a way to create their
own Studio. Promote to `ready-to-pick` as soon as Phase 4 closes.

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
