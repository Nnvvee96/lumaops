---
system: Atlas Vault OS
version: 1.1
date: May 15, 2026
status: ACTIVE / STRATEGIC_BLUEPRINT
project: LumaOps
---
# CONCEPT.md - Strategic Blueprint
# PROJECT: LumaOps

## 0. Executive Summary
LumaOps is an open-source launch operations dashboard for indie software products.

The product starts as an internal control room for the operator's own products, with NOESIS.Tools as the first connected product. The larger direction is a reusable self-hostable dashboard where a founder can connect GitHub, Cloudflare, Stripe, app telemetry, support tickets, and custom funnel events, then see product health in one clean cockpit.

LumaOps is not just "analytics." It is an operating layer for small product teams: what shipped, what converted, what earned, what broke, what users did, and what needs attention next.

Core promise:

> Connect your repo, website, payments, funnel, and app telemetry. LumaOps shows what is shipping, converting, earning, breaking, and growing across every product.

Initial product stance:

- Internal-first.
- Open-source first.
- Self-hosted/local first.
- Hosted app later, if the open-source core proves useful.
- Founder/operator focused.
- Multi-product by design.
- NOESIS.Tools is the first real proving ground.
- GitHub provides product structure and development signals.
- Cloudflare, Stripe, app telemetry, and custom events provide business truth.

## 1. Product Thesis
Indie founders increasingly launch multiple software products using lightweight infrastructure: GitHub for code and releases, Cloudflare for websites and workers, Stripe for payments, email providers for lead capture, and scattered logs or dashboards for telemetry.

Each system has a partial truth. None of them answers the founder's actual daily question:

> Is this product alive, converting, shipping, earning, and healthy?

LumaOps exists to answer that question.

The product should feel like a private operations room, not a generic marketing analytics tool. The interface should be dense, modern, sharp, and useful. The first screen should be the working dashboard, not a landing page.

## 2. Pain Amplification
### Current Pain
For a solo founder or small product studio, product data is fragmented:

- GitHub knows repos, releases, issues, commits, CI, tags, and changelogs.
- Cloudflare knows website traffic, referrers, page views, routes, workers, and edge activity.
- Stripe knows customers, subscriptions, revenue, MRR, ARR, refunds, and churn.
- App telemetry knows installs, first launches, active versions, feature usage, errors, and retention.
- Support systems know complaints, bugs, feature requests, and user pressure.
- Custom launch funnels know button clicks, email captures, download-link clicks, and conversion steps.

The founder has to mentally stitch these signals together.

### Specific NOESIS Pain
NOESIS already has useful launch infrastructure:

- Public website under `noesis.tools`.
- Cloudflare Pages / Worker setup.
- Beta signup endpoint.
- Private beta email flow.
- Download links with magic tokens.
- Download count per email.
- Support/feedback ingest through Worker into GitHub Issues.
- GitHub releases as release source.

But there is no central dashboard that shows:

- How many people visited the website.
- How many reached the download/beta section.
- How many submitted an email.
- How many emails were sent successfully.
- How many opened a private download link.
- How many downloads started.
- Which download links expired or failed.
- How support tickets are trending.
- Whether the current release is healthy.
- How NOESIS compares against future products.

### Strategic Gap
The missing layer is not another isolated metric board. The missing layer is a product-aware operating dashboard that understands products, launches, integrations, funnels, releases, support, telemetry, and revenue as one system.

## 3. Value Proposition
### One-Instruction
Connect your product stack. LumaOps builds the cockpit.

### Promise
LumaOps gives an indie founder one place to see product health across traffic, funnel, downloads, revenue, releases, support, and telemetry.

### User-Facing Copy Direction
Keep copy direct and operational:

- "Your product command room."
- "See what shipped, converted, earned, and broke."
- "Connect GitHub, Cloudflare, Stripe, and telemetry."
- "Turn scattered product signals into one launch dashboard."
- "Run it yourself. Connect your own accounts. Keep your product data under your control."
- "Built for indie products, beta launches, and small software studios."

Avoid weak generic positioning:

- Do not call it only an analytics dashboard.
- Do not imply GitHub alone can produce business metrics.
- Do not overpromise automatic truth from source code.
- Do not make it feel enterprise-heavy.

### Public Narrative Arc
The public-facing story is now crystallized as five messages, in order:

1. **Five signals. One room.** — hero punchline.
2. **Each system knows a partial truth.** — problem framing.
3. **What you see: shipped, converted, earned, broke, growing.** — product surface.
4. **Every product. One studio.** — multi-product framing.
5. **Stop stitching. Start operating.** — closing call.

The five public verbs LumaOps owns: **shipped, converted, earned, broke, growing.** They map to the five integration categories (GitHub releases, Cloudflare/tracking funnel, Stripe revenue, support/telemetry errors, telemetry/usage growth).

### Conceptual Anchor: Einklang
LumaOps does not just *aggregate* signals — it brings them into one rhythm (*Einklang* / harmony / coherence). The "One X" construction (one room, one rhythm, one studio, one cockpit, one step at a time) is the LumaOps copy fingerprint and should be carried into onboarding, empty states, and section headings — not only marketing surfaces.

### The Operator's Daily Question
The literal copy anchor of the brand:

> Is this product alive, converting, shipping, earning, healthy?

This is the question every indie operator asks every morning. LumaOps is the answer.

## 4. Target Users
### Primary User
Solo founder / indie hacker shipping one or more software products.

Needs:

- Fast setup.
- Product overview.
- Launch funnel clarity.
- Revenue movement.
- Release readiness.
- Support pressure.
- No enterprise analytics ceremony.

### Secondary User
Small product studio with several lightweight products.

Needs:

- Multi-product overview.
- Per-product detail pages.
- Shared integrations.
- Team access later.
- Product health comparison.

### Internal First User
The operator uses LumaOps for own products first:

- NOESIS.Tools as first connected product.
- Future products added as they launch.
- Internal dashboard should be genuinely useful before SaaS packaging is considered.

## 5. Product Architecture Concept
LumaOps is organized around five major entities:

### Workspace
The private operating space. Internally referred to as `workspace`; in public-facing copy framed as **Studio** because it carries the right craft connotation for indie founders shipping multiple products.

Examples:

- Operator profile.
- Studio name (public identity, e.g. "Navyug — Indie Studio").
- Timezone.
- Currency.
- Default date range.
- Connected accounts.
- Future team/member settings.

### Product
A product is the core object.

Fields:

- Name.
- Slug.
- Status: `idea`, `pre-launch`, `beta`, `live`, `active`, `paused`, `archived`.
- Website domain.
- GitHub repo.
- Release channel.
- Product type: desktop app, SaaS, website, API, mobile app, library, research system.
- Primary metric (defaulted by product type — see below).
- Health score.
- Integration status.

Status semantics:

- `idea` — captured but not in build.
- `pre-launch` — waitlist phase, no live product yet.
- `beta` — live with restricted/private access.
- `live` — public, customer-facing.
- `active` — ongoing internal system, not yet customer-facing (e.g. research/internal-tool products).
- `paused` — intentionally on hold.
- `archived` — wound down, kept for record.

Primary metric defaults by product type:

| Product type            | Default primary metric                                |
|-------------------------|-------------------------------------------------------|
| Web app — pre-launch    | Waitlist count                                        |
| Web app — beta          | Weekly visits + conversion                            |
| Web app — live (SaaS)   | MRR + active customers                                |
| Desktop app             | Downloads + first-launch activations                  |
| Mobile app              | Installs + first-launch activations                   |
| API / library           | API calls + active integrations                       |
| Research system / internal | Knowledge entries / domain coverage / internal velocity |

The primary metric is what the product card surfaces by default; full detail lives in the product cockpit.

Initial product:

- `NOESIS.Tools`
- Status: beta.
- Website: `noesis.tools`
- GitHub repo: `Nnvvee96/NOESIS`
- Product type: desktop app with public website and private beta download flow.

#### Studio example: Navyug (proving-ground)
The operator's own Studio used as the canonical multi-product example. Demonstrates that LumaOps is product-type-agnostic from day one:

| Product       | Domain              | Type             | Status      |
|---------------|---------------------|------------------|-------------|
| ApplyIQ       | `applyiq.app`       | Web app          | beta        |
| Planora       | `getplanora.app`    | Web app          | pre-launch  |
| OHARA         | `ohara-labs.com`    | Research system  | active      |
| NOESIS.Tools  | `noesis.tools`      | Desktop app      | beta        |

### Integration
Integrations attach external systems to a product or workspace.

Initial integration categories:

- GitHub.
- Cloudflare.
- Stripe.
- Custom Tracking API.
- App Telemetry.
- Support/Tickets.
- Email Provider.

Each integration has:

- Provider.
- Status.
- Last sync time.
- Credential health.
- Scopes.
- Product mappings.
- Error state.

### Event
Events are the generic tracking unit.

Event examples:

- `page_view`
- `download_section_view`
- `beta_email_submitted`
- `beta_email_sent`
- `download_link_opened`
- `download_started`
- `download_failed`
- `release_published`
- `support_ticket_created`
- `app_first_launch`
- `app_active`
- `checkout_started`
- `subscription_created`

Events should include:

- `workspace_id`
- `product_id`
- `event_name`
- `occurred_at`
- `source`
- `anonymous_id`
- `user_id` or lead/email hash when allowed
- `session_id`
- `properties`

### Metric
Metrics are derived from events and integrations.

Examples:

- Total visits.
- Unique visitors.
- Signup leads.
- Download requests.
- Download starts.
- Conversion rate.
- MRR.
- ARR.
- New customers.
- Refunds.
- Open support tickets.
- Release freshness.
- Active versions.
- Crash/error rate.

## 6. Dashboard Information Architecture
### Global Shell
The application shell should be consistent:

- Left sidebar.
- Topbar.
- Main content area.
- Product switcher/list.
- Date range control.
- Environment/channel control.
- Export action.
- Integration health indicator.

### Left Sidebar
Primary navigation:

- Overview.
- Products.
- Funnels.
- Revenue.
- Releases.
- Support.
- Telemetry.
- Integrations.
- Settings.

Product list section:

- NOESIS.Tools.
- Future product entries.
- Add Product button.

### Topbar
Controls:

- Date range: today, 7d, 30d, 90d, custom.
- Channel/environment: beta, public, live, staging.
- Revenue currency.
- Export.
- Sync status.
- Profile/settings access.

### Global Overview
The global overview combines all products.

Core cards:

- Total Visits.
- Unique Visitors.
- Leads.
- Download Starts / Activations.
- Revenue.
- Conversion Rate.
- Active Products.
- Launch Health.

Secondary sections:

- Product performance table.
- Cross-product funnel comparison.
- Revenue movement.
- Recent releases.
- Support pressure.
- Integration warnings.
- Alerts / attention queue.

### Products View
Purpose:

- Show every product as an operational asset.

Each product row/card:

- Product name.
- Status.
- Website.
- Repo.
- Last release.
- Visits.
- Leads.
- Revenue.
- Downloads/activations.
- Support load.
- Integration completeness.
- Health score.

Actions:

- Open product.
- Connect integrations.
- Edit settings.
- Archive/pause.

### Product Detail View
Each product has its own cockpit.

Tabs:

- Overview.
- Funnel.
- Traffic.
- Downloads / Installs.
- Revenue.
- Releases.
- Users / Leads.
- Support.
- Telemetry.
- Settings / Integrations.

### Overview ↔ Product-Level Duality
Every metric surface has two reading levels:

- **Overview level (cross-product, Studio-wide).** Aggregates the five verbs across the whole Studio — combined visits, combined leads, combined revenue, open issues across all products, etc.
- **Product level (single product).** Same five verbs scoped to one product, with that product's specific funnels, releases, support, telemetry.

The five verbs (shipped/converted/earned/broke/growing) are the same at both levels; only the aggregation changes.

### Operator-Surface Modules (decision pending)
Beyond data-driven tabs, the per-product cockpit could host lightweight operator tools:

- **Notes** — per-product scratchpad / running notes.
- **Brainstorm** — capture future ideas tied to that product.
- **Calendar / Launch plan** — release dates, milestones, beta cohorts, marketing moments.
- **Decision log** — explicit "decided X on date Y because Z" — invaluable for solo founders rebuilding context.
- **Cohort tracker** — for beta products: which leads got the link, who installed, who churned.

This expands LumaOps from "metric cockpit" toward "operator cockpit" — the single per-product surface for the founder. Decision required (tracked in §17): broad operator scope or narrow metrics-only? Working recommendation: **broad**, because the differentiating value vs. PostHog/Plausible is the operator surface, not just metrics.

## 7. NOESIS Product Detail Concept
NOESIS.Tools is the first concrete implementation target.

### NOESIS Overview
Cards:

- Website Visits.
- Beta Leads.
- Emails Sent.
- Download Link Opens.
- Download Starts.
- Download Conversion Rate.
- Current Release.
- Open Support Tickets.

Charts:

- Funnel over time.
- Leads per day.
- Downloads per day.
- Support tickets by category.
- Release/download activity.

### NOESIS Funnel
Initial funnel:

1. Website visit.
2. Download section viewed.
3. Beta email submitted.
4. Beta access email sent.
5. Private download link opened.
6. Download stream started.
7. App first launch, future telemetry.

Known truth boundary:

- The current Worker can count signup, email status, and download stream start.
- Full completed browser download is not guaranteed without extra confirmation.
- A future app telemetry event can confirm first launch/install activation.

### NOESIS Support
Current support flow:

- NOESIS app sends support/feedback payload to Cloudflare Worker.
- Worker creates GitHub Issues.

LumaOps support view can show:

- Open tickets.
- New tickets.
- Ticket category.
- Intent: support or feedback.
- Error code.
- Time since last ticket.
- GitHub issue links.
- Status mapping.

Future direction:

- Support can become native in LumaOps while still syncing to GitHub Issues.

### NOESIS Releases
Release data can come from GitHub:

- Latest beta release.
- Release assets.
- Version.
- Published date.
- Asset availability.
- Download asset health.

NOESIS-specific release tracking:

- Current beta version.
- macOS Apple Silicon availability.
- Windows/macOS Intel planned status.
- Failed asset lookups.
- Download endpoint health.

### NOESIS Telemetry
Initial telemetry is not fully available.

Future telemetry events:

- App first launch.
- App active.
- Version active.
- Provider configured.
- Role created.
- Ticket submitted.
- Local-only privacy-safe feature usage.
- Crash/error events.

Telemetry principle:

- No transcripts, provider keys, private user content, or sensitive app content.
- Product-health metadata only.

## 8. Add Product Flow
The core product creation flow:

1. Click `Add Product`.
2. Connect GitHub or choose an existing connected GitHub account.
3. Select a repository.
4. LumaOps analyzes the repo.
5. Product profile is proposed.
6. User confirms or edits.
7. User connects optional integrations.

### GitHub Analysis
GitHub can inspect:

- README.
- Package manifests.
- Config files.
- Release tags.
- GitHub Releases.
- Issues.
- Pull requests.
- Stars.
- Forks.
- CI status.
- Changelog.
- Docs.
- Known framework files.

It can infer:

- Product name.
- Product type.
- Tech stack.
- Development activity.
- Release maturity.
- Possible website/domain references.
- Support/issue volume.
- Active release channel.

It cannot infer:

- Real website visits.
- Funnel conversions.
- Button clicks.
- Email submissions.
- Real users.
- Revenue.
- Completed downloads.

Rule:

- GitHub is the product index and development signal source, not the business truth source.

### Product Profile Suggestion
LumaOps proposes:

- Name.
- Slug.
- Type.
- Status.
- Website.
- Repo.
- Release channel.
- Suggested metrics.
- Suggested funnels.
- Missing integrations.

### Post-Creation Integration Setup
Suggested next steps:

- Connect Cloudflare for traffic.
- Add Tracking API snippet/SDK for funnel events.
- Connect Stripe for revenue.
- Connect telemetry endpoint for app usage.
- Connect GitHub Issues or native Support.
- Connect email provider for lead/delivery metrics.

## 9. Integration Concepts

### Connector Status Taxonomy
Every connector tile in the UI must always show one of:

- `live` — connected and syncing successfully.
- `syncing` — fetch in progress.
- `pending` — credentials present, first sync not yet completed.
- `planned` — slot reserved in the UI, integration not yet implemented.
- `stale` — last successful sync older than the freshness threshold for this connector.

This operationalizes the §2 rule that missing integrations must not fake truth: state is always visible on the connector itself, not hidden behind a card or chart.

### Open Connector Framework
LumaOps is explicitly extensible from day one. The connector grid surfaces a **"Build your own"** tile inviting community-authored connectors against a public adapter API.

Implications:

- A public connector spec (event schema + adapter interface) must exist before Phase 3 (Connector Framework) starts.
- Connectors ship as PRs against the open-source repo initially; a hosted marketplace is deferred (see §17).

### GitHub
Purpose:

- Product import.
- Repo metadata.
- Releases.
- Issues.
- CI/development signals.

Initial MVP:

- Manual repo config or GitHub token later.
- For NOESIS, manually configure repo.

Future:

- GitHub OAuth/App.
- Repo picker.
- Automated product import.
- Issue sync.
- Release health checks.

### Cloudflare
Purpose:

- Website analytics.
- Worker logs/metrics.
- Routes.
- Edge traffic.
- Domains.

Initial MVP:

- Use existing NOESIS Worker export for beta signups.
- Prepare Cloudflare integration UI as planned state.

Future:

- Cloudflare API connector.
- Zone/page analytics.
- Worker analytics.
- Referrers.
- Route-level page views.

### Stripe
Purpose:

- Revenue truth.
- MRR/ARR.
- Customers.
- Subscriptions.
- Refunds.
- Churn.

Initial MVP:

- Mock or empty revenue state for NOESIS.
- Revenue dashboard structure exists.

Future:

- Stripe OAuth/API key.
- Product mapping.
- Subscription/customer metrics.

### Custom Tracking API
Purpose:

- Funnel events not available from GitHub/Cloudflare alone.

Example events:

- CTA clicked.
- Download section viewed.
- Email form submitted.
- Download link opened.
- Checkout started.

Initial MVP:

- Event schema defined.
- NOESIS Worker can later emit events into LumaOps.

Future:

- Tiny JS snippet.
- Server-side event endpoint.
- Privacy-aware anonymous IDs.

### App Telemetry
Purpose:

- Confirm product usage after download or signup.

Example events:

- First launch.
- Active user heartbeat.
- Version adoption.
- Feature usage.
- Error reports.

NOESIS privacy constraints:

- No transcripts.
- No role content.
- No provider keys.
- No local documents.
- No sensitive clipboard content.

### Support
Purpose:

- Show product friction.
- Tie user issues to release/funnel health.

Initial NOESIS:

- GitHub Issues created via Cloudflare Worker.

Future:

- Native support inbox.
- GitHub sync.
- Ticket tags.
- Error category trend.

## 10. MVP Scope
The first build should prove LumaOps as an internal dashboard.

### MVP Must-Haves
- Project scaffold.
- Strong dashboard UI.
- Left sidebar.
- Global overview.
- Products list.
- NOESIS.Tools product detail.
- Date range controls.
- Product status/channel controls.
- Integration status surfaces.
- NOESIS beta funnel metrics, initially from existing Worker export or mocked until auth/data pipe is connected.
- Support/release sections prepared.
- Clean internal design system.

### MVP Data Strategy
Use three layers:

1. Mock/sample data for UI completeness.
2. Live NOESIS Worker data where already accessible.
3. Clear "not connected" states for future integrations.

### MVP Should Avoid
- Building custom password authentication from scratch.
- Multi-tenant SaaS complexity.
- Full OAuth suite.
- Premature billing.
- Pretending inferred data is real data.
- Overbuilding admin settings before the core cockpit feels useful.

### Recommended MVP Auth
For internal use:

- Cloudflare Access preferred.
- Alternatively local/private auth only for development.

Reason:

- Avoid password storage and auth risk.
- Move faster with safer access control.

## 11. Open Source And Hosted Direction
LumaOps is open source first. The first public version should be useful without a hosted account, paid plan, or central LumaOps server.

What open source means here:

- Users can run LumaOps locally or self-host it.
- Users bring their own provider credentials.
- Product data stays in their own environment by default.
- Community users can add connectors, improve the UI, and audit the code.
- `lumaops.app` can host docs and later a managed version, but it is not required for MVP usage.

### Hosted variant: pure-convenience tier (locked 2026-05-15)

LumaOps will offer a hosted variant for users who don't want to manage their own infrastructure. The hosted variant is **feature-identical** to the OSS self-hosted build — the only thing we sell is the running of LumaOps on someone else's behalf. (See `MEMORY.md` Decision K for the full reasoning.)

Pricing model: **$7/month or $60/year** via Polar.sh or Lemon Squeezy (vendor pick deferred — `EXPANSION_BACKLOG.md` E-002).

Cookbook-vs-Restaurant analogy: OSS = the cookbook, hosted = the restaurant. Same recipes, two different ways to consume them.

### Sequencing — Phase A / B / C

These are launch phases for the **hosted commercial layer**. They run alongside (and after) the engineering phases in `IMPLEMENTATION_PLAN.md`. The OSS product itself is built phase-by-phase per the IMPLEMENTATION_PLAN.

**Phase A — OSS-only (today through IMPLEMENTATION_PLAN Phase 5).**
- GitHub repo + self-hostable cockpit only.
- No hosted variant exists. No pricing on the landing.
- Marketing focus: GitHub stars, ProductHunt, Show HN, indie-hacker outreach.
- Operator cash cost: **$0/month** (no infrastructure being run).
- Goal: discovery + community trust before commercial layer.

**Phase B — Closed Hosted Beta (opens after IMPLEMENTATION_PLAN Phase 5 closes).**
- 20–50 invite-only free seats on `app.lumaops.app`.
- Infrastructure live: Cloudflare Pages + Supabase + Cloudflare Workers Cron + Resend + UptimeRobot (see `TECHSTACK.md` §7 Hosted Infrastructure Stack).
- Payment vendor (Polar.sh vs Lemon Squeezy) chosen here.
- Goal: validation that operators will pay $7/month for managed hosting.
- Operator cash cost: **$0–25/month** depending on which free-tier cliffs the beta crosses.

**Phase C — Public Hosted launch (opens after Phase B shows ≥10 conversion-ready beta users).**
- Pricing page goes live on `lumaops.app`.
- $7/month and $60/year subscriptions live via the Phase-B-selected payment vendor.
- Hero copy gains the one-line addendum: "Open source, self-hosted — or hosted for $7/month."
- Operator cash cost: ~$0 for the first ~50–100 paying users (free tiers absorb it), ~$25–80/month thereafter, ~$200/month at 1000+ users.

### Engineering phases — see IMPLEMENTATION_PLAN.md

The detailed phase-by-phase engineering plan, including all sub-slices and verification gates, lives in `docs/IMPLEMENTATION_PLAN.md`. The seven phases there (Phase 0 Bootstrap → Phase 7 Intelligence Layer) build the product itself. The A/B/C phases above are the commercial-launch overlay.

## 12. Design Direction
LumaOps should look like a premium internal operations product.

### 12.1 Brand Identity (locked)

**Name semantics.** Luma (luminance, light, signal) + Ops (operations). LumaOps = the lit-up operations layer where scattered product signals converge into a single luminous view.

**The mark.** A *convergence glyph*: four signal lines flow from the cardinal edges of a frame into a single luminous center node. The mark IS the product story (fragmented sources → one room). The center node pulses softly in live contexts.

**Signature color — Lumi.** A luminous warm chartreuse, `oklch(0.84 0.19 110)`. One brand color, deeply identifying. Not blue, not violet, not standard SaaS green. Reads as "signal on / alive / ready". Pairs with deep warm black (dark mode) and warm paper-cream (light mode).

**Signal palette.** Distinct from the brand color — used **only** inside dashboard data contexts, never in marketing chrome or general copy:

- `growth` — Lumi (also the brand color).
- `revenue` — bronze (`oklch(0.78 0.13 80)`).
- `release` — violet (`oklch(0.74 0.14 285)`).
- `support` — red (`oklch(0.72 0.16 28)`).

**Typography (three-font rule, strict).**

- **Geist Sans** — body, UI, numerics.
- **Geist Mono** — labels, code, data, source attribution.
- **Instrument Serif (italic)** — one editorial accent word per major headline (e.g. *one*, *respects*, *today*).

**Theme.** Dark by default — signals "tool that works at any hour of the operator's day". Explicit light toggle, persisted per user. First paint must respect saved preference to avoid flash.

### 12.2 Hard rules

- **Dense, not loud.** Every pixel reports a fact.
- **One brand color, many signal colors.** Lumi is the brand color. Signal colors appear only in data contexts.
- **Source and freshness always visible.** Every metric carries its source line (e.g. "via Cloudflare · synced 14:32"). No fake confidence.
- **Mono for data, sans for prose, serif for emphasis.** Three-font rule.
- **Real signal, never decorative.** Status dots pulse only when truly live.
- **No** emojis, gradients-for-gradient's-sake, marketing-template shadows, or "card-with-left-border-stripe" tropes.
- **First screen of the app is the working dashboard, not a landing page.**

### 12.3 Feature-moment pattern

The marketing surface uses one anchor pattern: **a quiet section, then a dense operational moment, repeated.** The cockpit-mock section is the dramatic high point; the final CTA reuses the pattern at smaller scale. This should carry through to onboarding and in-product surfaces — quiet/dense/quiet/dense rhythm rather than uniformly dense.

### 12.4 Visual shell

- Left navigation with products.
- Topbar with time / channel / export.
- Main dashboard area with metric cards and charts.
- Product detail tabs.
- Integration health panel.
- Alert / attention queue.

## 13. Metrics Philosophy
LumaOps must distinguish:

- Observed metrics.
- Derived metrics.
- Inferred metadata.
- Mock/demo placeholders.
- Stale metrics.

Rules:

- Real data must show source and freshness.
- Stale data must be marked.
- Missing integrations must not fake truth.
- GitHub-derived guesses must be labeled as inferred.
- Funnel metrics must be event-based where possible.

Example:

- "Download started" is valid when the Worker starts streaming the installer.
- "Download completed" is not valid unless the browser/app confirms completion.
- "Activated install" is valid after first app launch telemetry.

## 14. Risks And Constraints
### Risk: Overbuilding Before Useful Dashboard
Mitigation:

- Start with NOESIS and one strong product detail cockpit.
- Keep connector UI prepared but not overbuilt.

### Risk: Authentication Complexity
Mitigation:

- Do not implement password auth in the open-source MVP.
- Use local access for development.
- Use Cloudflare Access or reverse-proxy auth for private self-hosted deployments if needed.
- Hosted auth requires a separate tenancy/security spec.

### Risk: False Analytics
Mitigation:

- Mark source/freshness.
- Separate inferred from observed.
- Define event contracts early.

### Risk: Privacy
Mitigation:

- No sensitive app content in telemetry.
- Hash or minimize identifiers.
- Keep raw PII limited and purposeful.
- Provide per-event data contracts.

### Risk: Connector Scope Explosion
Mitigation:

- GitHub first for product structure.
- NOESIS Worker first for real funnel.
- Cloudflare/Stripe later.

## 15. Naming
Chosen name:

- LumaOps
- Domain: `lumaops.app`

Semantics:

- **Luma** — luminance, light, signal.
- **Ops** — operations.
- **LumaOps** — the lit-up operations layer where scattered product signals converge into one luminous view. Name carries the product thesis.

Why it works:

- Broad enough for more than analytics.
- Suggests a control center for product launches.
- Founder-friendly.
- Fits internal dashboard and possible SaaS.

Alternatives considered:

- SignalDeck.
- Product Pulse.
- MetricOS.
- Controlroom.
- Operator.

Current decision:

- Use LumaOps unless a legal/domain conflict or stronger brand direction appears.

## 16. Initial Roadmap
### Slice 1: Project Baseline
- Create project folder.
- Add docs.
- Capture concept.
- Prepare implementation plan.
- Initialize public GitHub repository.

### Slice 2: App Scaffold
- Choose frontend stack.
- Create dashboard shell.
- Add sidebar/topbar.
- Add design tokens.
- Add sample data.

### Slice 3: Global Overview
- Metric cards.
- Product performance table.
- Cross-product activity.
- Alerts.

### Slice 4: NOESIS Product Detail
- Overview.
- Funnel.
- Downloads.
- Releases.
- Support.
- Integrations.

### Slice 5: Data Pipe
- Read existing NOESIS Worker export.
- Normalize into LumaOps metric model.
- Add freshness/source labels.

### Slice 6: Tracking Foundation
- Define event API.
- Add NOESIS website funnel events later.
- Prepare app telemetry endpoint.

### Slice 7: GitHub Product Import
- Manual repo config first.
- GitHub connector later.
- Analyze README, manifests, releases, issues.

## 17. Open Questions

Decisions resolved in the Phase-1 Spec-Lock pass (2026-05-15) are kept here as historical record. The lock entries live in `MEMORY.md` §1.1 with full reasoning; this section only marks status.

### Resolved (2026-05-15)
- ✅ **ORM** — Drizzle. (MEMORY Decision M)
- ✅ **Backend shape** — Next.js App Router + Postgres locally; Cloudflare adapter open for later. (Decision N)
- ✅ **Auth (Self-Hosted MVP)** — Single-user, no login, local `.env`. (Decision O)
- ✅ **Support surface** — Surface-only in MVP, native reply candidate Phase 4+. (Decision F)
- ✅ **Operator-cockpit scope** — Broad (notes, decision log, brainstorm, launch calendar, cohort tracker). (Decision E)
- ✅ **Studio identity** — Public Studio name + optional logo, no public URL in MVP. (Decision G)
- ✅ **Brand-asset upload** — Auto-favicon with manual override. (Decision H)
- ✅ **Daily-ritual surface** — Implicit via Overview in MVP, explicit Morning-View in Phase 5. (Decision I)
- ✅ **Native cohort tracking** — Native cohort engine, target Phase 5. (Decision J)
- ✅ **Hosted-phase pricing** — Pure-Convenience Tier @ $7/mo · $60/yr via Polar.sh or Lemon Squeezy. OSS stays MIT + feature-identical forever. Sequencing: Phase A (OSS-only) → Phase B (Closed Beta) → Phase C (Public). (Decision K, updated 2026-05-15)
- ✅ **Connector marketplace** — PR-only in MVP, hosted catalog candidate Phase 4. (Decision L)

### Still open

NOESIS-implementation specifics (resolve when Phase 4 GitHub-connector work for NOESIS opens):

- Should NOESIS Worker emit LumaOps events directly, or should LumaOps pull/export NOESIS data on schedule?
- Which metric is the primary north-star for NOESIS beta: beta leads, download starts, or first app launches?

Cross-cutting:

- How much PII should LumaOps store for leads and beta users? (Defer to event-schema lock in TDD §3 — current working answer: hash emails, no raw PII unless explicitly opted in by the operator at integration setup.)

## 18. Non-Negotiables

### Internal (engineering)
- LumaOps must be useful as an open-source/self-hosted dashboard before it becomes a hosted product.
- Do not build fake confidence from GitHub-only analysis.
- Every metric needs a source and freshness.
- NOESIS privacy posture must be preserved.
- Do not build custom password auth unless there is a clear reason.
- Keep the first implementation tight: dashboard shell, global overview, products, NOESIS detail.
- Product-specific detail views must be first-class, not afterthoughts.
- The UI must feel like a real operations cockpit, not a generic template dashboard.

### Public (the six LumaOps promises)
The six hard claims made on the landing — public-facing, must be defensible by the implementation:

1. **Open source, by default.** MIT-licensed, full operations layer in your own repo.
2. **Self-hostable, first.** Laptop, Cloudflare tunnel, homelab — wherever your data lives.
3. **Bring your own tokens.** Every connector against your accounts. No LumaOps server holds secrets.
4. **Honest data, always.** Stale labelled stale. Inferred labelled inferred. Missing labelled missing.
5. **Multi-product, first-class.** Every product is a real object — pre-launch, beta, live, active, paused, idea, archived — with its own surface.
6. **Dense, not loud.** A real cockpit, not a marketing dashboard.
7. **Self-hosted is feature-identical. Always.** Hosted is convenience — managed infrastructure, nothing more. Features never get OSS-gated. If a hosted user has access to it, every self-hosted user has access to the same code. Locked 2026-05-15 (Decision K) to protect against future drift toward feature-gated premium tiers.

## 19. The Daily Ritual (UX target)
LumaOps is not a place you live. It is a place you **visit**. The product should be navigable, scannable, and decisive enough that the operator can complete a full studio check in ~16 minutes a morning.

The 16-minute promise is **a UX target, not only a marketing line.** If a typical morning session takes longer, the dashboard has failed its core job.

Canonical morning beats (used as the demo arc on the landing, also the design brief for the Overview):

1. **09:14** — Coffee in hand. All products green. Synced.
2. **09:16** — One product's leads spiked. Drill in. Funnel is healthy.
3. **09:18** — Two new support tickets with the same root cause. Note it.
4. **09:22** — One product crossed a milestone. Small celebration, fresh email.
5. **09:30** — Session closed. The operator knows what to do today.

Closing verb pair (reuse in onboarding copy, empty states, completion screens):

> Stop stitching. Start operating.

Whether the daily ritual gets an explicit "Morning" view or emerges naturally from the Overview is tracked as an open question in §17. Working recommendation: explicit Morning surface in Phase 5.

## 20. Public Voice & Copy Fingerprint
Adopt as the canonical LumaOps voice across all future surfaces (marketing, onboarding, empty states, error states).

### 20.1 Tagline (one line)
> The operations cockpit for indie founders. Open source, self-hosted.

### 20.2 Promise (one paragraph)
> LumaOps brings your repo, website, payments, funnel, and app telemetry into one self-hosted cockpit. What's shipping, converting, earning, breaking, growing — across every product you launch.

### 20.3 Section verbs (the "X. One Y." fingerprint)
- "Five signals. One room."
- "Many sources. One rhythm."
- "Every product. One studio."
- "Five phases. One step at a time."
- "Three commands. One cockpit."
- "Sixteen minutes. Everything you need."

The "X. One Y." construction is the LumaOps copy fingerprint. Prefer it for section headings, navigation hints, and empty-state titles whenever it fits honestly — never force it.

### 20.4 The five public verbs
Owned, repeated, never substituted: **shipped, converted, earned, broke, growing.**

## 21. What LumaOps Is NOT (anti-features)
Captured to prevent scope drift. LumaOps is explicitly **not**:

- **Not Plausible / Fathom.** Single-domain web analytics.
- **Not PostHog / Mixpanel.** Product analytics SDK focus.
- **Not Linear / Height.** Project management.
- **Not Vercel / Cloudflare.** Deployment / hosting.
- **Not a Notion replacement.** LumaOps has lightweight per-product notes (pending §17 decision on operator-cockpit scope), not a wiki.
- **Not a marketing CRM.** No email sequencing or lead nurturing.
- **Not a customer-support product.** LumaOps surfaces tickets; it does not reply to them — unless an explicit decision expands scope to native support (§17).
- **Not feature-gated against OSS.** The hosted variant has identical features to the OSS self-hosted build. The hosted variant sells managed infrastructure, never extra capability. (Locked 2026-05-15 as Promise #7 in §18.2.)

Any pull toward these adjacencies must go through §17 as an explicit scope decision, not in via feature creep.
