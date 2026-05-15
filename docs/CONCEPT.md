---
system: Atlas Vault OS
version: 1.0
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
The private operating space.

Examples:

- Operator profile.
- Studio name.
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
- Status: idea, beta, live, paused, archived.
- Website domain.
- GitHub repo.
- Release channel.
- Product type: desktop app, SaaS, website, API, mobile app, library.
- Primary metric.
- Health score.
- Integration status.

Initial product:

- `NOESIS.Tools`
- Status: beta.
- Website: `noesis.tools`
- GitHub repo: `Nnvvee96/NOESIS`
- Product type: desktop app with public website and private beta download flow.

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

Hosted LumaOps can become a real product if the open-source core proves useful.

Product phases:

### Phase 1: Internal Control Room
- Single workspace.
- NOESIS connected.
- Manual product config.
- Dashboard UI.
- Event schema.

### Phase 2: Multi-Product Internal
- Add more internal products.
- Shared overview.
- Product comparison.
- Better integration status.

### Phase 3: Connector Framework
- GitHub connect.
- Cloudflare connect.
- Stripe connect.
- Tracking API.
- App telemetry endpoint.

### Phase 4: External Founder Product
- Onboarding.
- Workspace/team model.
- Billing.
- OAuth marketplace.
- Template funnels.
- Public launch reports.

### Phase 5: Intelligence Layer
- Product health score.
- Launch readiness score.
- Drop-off diagnosis.
- Release risk detection.
- Support spike correlation.
- "What changed?" explanations.

## 12. Design Direction
LumaOps should look like a premium internal operations product.

Design principles:

- Dense but calm.
- Modern, sharp, and readable.
- No generic startup landing-page styling.
- No decorative hero page for the app itself.
- First screen is the actual dashboard.
- Product signals should be scannable.
- Use charts, tables, badges, segmented controls, and status indicators.
- Avoid oversized cards where tables/charts are better.
- Avoid one-color monotony.
- Avoid vague placeholder metrics.

Visual shell:

- Left navigation with products.
- Topbar with time/channel/export.
- Main dashboard area with metric cards and charts.
- Product detail tabs.
- Integration health panel.
- Alert/attention queue.

Possible tone:

- Dark, precise, high-contrast.
- Not too blue/slate dominated.
- Use restrained accent colors for signal types:
  - growth
  - revenue
  - support risk
  - release health
  - integration warnings

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
- Should the first app use Prisma or Drizzle for the database layer?
- Should Cloudflare Workers/D1 be the default backend because the operator already uses Cloudflare?
- Should NOESIS Worker emit LumaOps events directly, or should LumaOps pull/export NOESIS data on schedule?
- Which metric is the primary north-star for NOESIS beta: beta leads, download starts, or first app launches?
- How much PII should LumaOps store for leads and beta users?
- Should support live natively in LumaOps or remain GitHub-first with a LumaOps support lens?

## 18. Non-Negotiables
- LumaOps must be useful as an open-source/self-hosted dashboard before it becomes a hosted product.
- Do not build fake confidence from GitHub-only analysis.
- Every metric needs a source and freshness.
- NOESIS privacy posture must be preserved.
- Do not build custom password auth unless there is a clear reason.
- Keep the first implementation tight: dashboard shell, global overview, products, NOESIS detail.
- Product-specific detail views must be first-class, not afterthoughts.
- The UI must feel like a real operations cockpit, not a generic template dashboard.
