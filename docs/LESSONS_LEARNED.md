---
system: Atlas Vault OS
version: 1.1
date: May 15, 2026
status: ACTIVE / CANONICAL_LEDGER
scope: cross-project, generic, accumulating
dependencies: [[AGENT.md]], [[CONSTRAINTS.md]], [[PLAYBOOKS.md]], [[AUDIT.md]], [[SKILLS_COMPOUNDING.md]]
---
# LESSONS_LEARNED.md — Cross-Project Ledger

The canonical growing record of hard-won lessons from past projects, abstracted to be reusable on any new project.

## What this file is

Distilled, project-agnostic engineering and product rules. Every entry is the abstracted form of a real incident or success — the source-of-truth NOESIS / LumaOps / ApplyIQ / Planora / OHARA logs stay in their own `SKILLS_COMPOUNDING.md` and `MEMORY.md`. **This file is generic by design** — no "in NOESIS Bug X" anchors, just the rule, the reason, and the situation that triggers it.

The goal is compounding: each new project starts richer than the last, so the rate of new mistakes drops over time.

## How to use it

- **At project start.** Read top-to-bottom once. Reference the relevant categories when writing the project's `IMPLEMENTATION_PLAN.md` (each phase's "Risks From Experience" block links to lesson IDs here).
- **During work.** When a decision feels familiar, check the matching category first. Apply the rule directly — that's the whole point.
- **At project end.** Distill the project's new findings into generic form and propose additions back to this canonical file. Anything project-specific stays in the project's own `SKILLS_COMPOUNDING.md`.

## Entry format

Every entry is structured the same way:

- **Rule.** One-line directive. Imperative voice.
- **Why.** The underlying principle. Abstract, no project specifics.
- **Trigger.** The kind of situation that surfaces this lesson — recognisable in the wild.

Each entry has a stable ID (e.g. `§3.2`) so other documents can reference it.

---

## §1. Spec & Contract Discipline

### §1.1 Spec-first, code-second
- **Rule.** Lock a written contract before writing the implementation. When live findings contradict the spec, update the spec — not the code silently.
- **Why.** A contract that drifts behind code is worse than no contract: every later session reads the spec, trusts it, and builds on stale assumptions.
- **Trigger.** Any non-trivial behavioural change. Anything touching cross-module policy. Anything multiple people or sessions will read later.

### §1.2 Single source of truth for cross-cutting policy
- **Rule.** When the same policy applies in multiple places (providers, layers, modules), introduce one helper method that all sites consult. Never carry the same boolean flag in two implementations.
- **Why.** Independent implementations drift silently. A shared helper makes policy drift either impossible (by construction) or instantly visible at review.
- **Trigger.** Two or more call sites have to make the same decision. A "fourth provider added later" thought experiment is a hard signal.

### §1.3 Examples are not the contract
- **Rule.** Concrete examples explain a problem but never define its boundaries. Phrase the final contract in generic, identity-level terms.
- **Why.** Examples used to clarify scope quietly become scope limits, and the next case outside the examples ships broken.
- **Trigger.** A discussion that leans heavily on "for example, A or B" without a generic statement of the rule.

### §1.4 Lock the primary contract before hardening loops
- **Rule.** Identify the one path the user actually depends on. Lock that contract. Only then harden the secondary paths.
- **Why.** Hardening secondary paths while the primary contract is still drifting wastes the hardening — every primary-contract change re-breaks the secondaries.
- **Trigger.** Repeated regressions across superficially-different bug reports. The shared root is almost always contract drift on the primary path.

### §1.5 Physical identity over visible representation
- **Rule.** Phrase contracts in terms of the raw underlying identity (key codes, byte sequences, IDs), not the visible representation (rendered characters, display labels, localised strings).
- **Why.** Visible representation varies by locale, layout, font, OS, theme. Contracts written against representation break on every variant the original author didn't see.
- **Trigger.** Keyboard shortcuts, language-sensitive input, internationalisation, file-system paths, anything that renders differently across environments.

### §1.6 Coverage must match the full domain space, not the first slice
- **Rule.** When a feature dispatches across a domain (layers, modes, regions, tiers), its first implementation must cover the full domain space — not the two values that happened to be in scope when the feature was specified.
- **Why.** A dispatcher implemented for "L2 and L3" silently collapses L4–L8 onto L2/L3 when those values arrive later, losing the per-mode metadata. The full lattice is a correctness requirement, not a "nice to have later".
- **Trigger.** Any new feature with a routing/dispatch decision over an enum or table that already has more values than the first ticket considers.

---

## §2. Multi-Agent & Multi-Session Collaboration

### §2.1 Read the baton before acting
- **Rule.** Every session begins by reading the live baton/handoff file. If another agent or session holds a scope, either pick it up explicitly or work on an orthogonal scope.
- **Why.** Touching scope that another agent holds without a documented handoff is the single most common multi-agent failure mode. State that lives only in chat memory is lost on session reset.
- **Trigger.** Any session start. Any context switch between agents. Anything that touches scope another session was working on.

### §2.2 Mirror progress to disk, not just chat
- **Rule.** Every meaningful decision and progress checkpoint goes into the project's session log file before the session ends.
- **Why.** Chat memory is volatile. Compaction, fresh sessions, and tool resets erase context that wasn't persisted.
- **Trigger.** Approaching context limits. Closing a session. Handing off to another agent. Any decision that should outlive the current conversation.

### §2.3 Docs update is part of the slice, not after
- **Rule.** When a slice ships, the documentation update ships in the same coordinated change — TDD, implementation plan, memory, session log all updated together.
- **Why.** Skipping any of the canonical docs leaves the next session without the context it needs to continue cleanly. "Clean continuation" is the whole point of disciplined docs.
- **Trigger.** Any operator mandate of the form "do X, then update the MDs". Any phase close. Any contract change.

---

## §3. Shipping & Verification Discipline

### §3.1 Verify the artefact, not the log line
- **Rule.** After any deploy or install, verify the actual artefact (binary timestamp, deployed hash, symbol presence) — not the success line in the build log.
- **Why.** Pipelines silently install stale artefacts when an intermediate step is missing. Both the build log and the install log show "success" while the deployed bundle is from yesterday.
- **Trigger.** Multi-step build/install pipelines. Anything with intermediate copy/materialise steps. Any "looks the same as before" symptom after a fresh deploy.

### §3.2 Multi-step pipelines need explicit chaining
- **Rule.** If a pipeline has N necessary steps, do not document or invoke "N−1 steps and hope". Chain them, or document the full sequence prominently.
- **Why.** Skipped intermediate steps become permanent traps. The next session, the next agent, or the same operator in a hurry will skip the undocumented step and silently regress.
- **Trigger.** Any build/install/deploy with intermediate `cp`, `materialise`, `sync`, or `publish` actions that the wrapper script doesn't enforce.

### §3.3 Document sandbox gaps honestly
- **Rule.** When the local sandbox cannot run a required verification step (compile, test, lint), ship anyway but record the gap explicitly with the post-ship validation the operator now owns.
- **Why.** Letting a slice rot waiting for the sandbox to be fixed is worse than shipping with a documented gap. Silent gaps lead to false confidence.
- **Trigger.** Sandbox limitations on the agent. Tooling unavailable in the current environment. Any verification step that can't be automated yet.

### §3.4 Evidence over claims
- **Rule.** Verification claims require machine-verifiable evidence (logs, manifests, hashes, screenshots tied to commit SHA). Human "I checked" is not evidence.
- **Why.** Reviews and handoffs based on human claims compound trust debt. Machine-readable evidence stays valid across sessions and reviewers.
- **Trigger.** Anything labelled "done" or "verified". Any review checklist. Any sign-off.

---

## §4. Live-Test Reality

### §4.1 Operator-visible behaviour is the spec
- **Rule.** When the operator screenshot says X and the design doc says Y, the screenshot wins. Update the doc; don't argue with the operator's reality.
- **Why.** Design correctness is "operator can use it without friction", not "matches the paper spec". The paper exists to serve the operator's experience, not the reverse.
- **Trigger.** Operator says "this looks broken" or "this feels overloaded". Disagreement between live behaviour and written spec.

### §4.2 Back-propagate cheap fixes immediately
- **Rule.** A live-test finding that can be patched in the same session IS an active slice — not a backlog item.
- **Why.** Deferring cheap fixes to "next sprint" creates compounding rot: each session ships near the finding but doesn't fix it, the operator stops trusting the loop.
- **Trigger.** A live-test surfaces a bug or rough edge with a known, scoped fix. The fix touches fewer than ~3 files.

### §4.3 Latency / cost surprises are policy signals
- **Rule.** When a user reports unexpectedly slow or expensive behaviour, the first diagnosis is "is the policy aligned with the layer?", not "is the underlying thing slow?"
- **Why.** A correctly-chosen tool in the wrong policy configuration looks identical to a slow tool. Reaching for "use a faster tool" before checking policy alignment masks the real problem.
- **Trigger.** Latency report, cost surprise, "this used to be fast", anomalous resource usage.

### §4.4 Visible confirmation on every initiated action
- **Rule.** Every user-initiated action that triggers async work must emit an immediate visible confirmation. Silent success is indistinguishable from silent failure.
- **Why.** On slow paths, the gap between "your action was accepted, working on it" and "your action was not accepted" is the entire UX. Without explicit confirmation, the user assumes failure and retries.
- **Trigger.** Voice commands, async submissions, anything with measurable latency between user action and result. Hotkeys that trigger long-running work.

---

## §5. Architecture — Orthogonality & Layering

### §5.1 Don't collapse orthogonal axes into one enum
- **Rule.** When two concepts describe independent decisions (e.g. *what* and *how*, *who* and *when*), keep them as separate types — never as variants of a single enum.
- **Why.** Collapsing orthogonal axes forces every consumer to handle the cross-product, and adding a new value on one axis explodes the other. Independence at the type level keeps growth linear, not multiplicative.
- **Trigger.** Tempting "let me just add a new variant" moment. Pattern matches that branch on substring or prefix of an enum name. Cross-product matrices in code.

### §5.2 Sub-pass policy differs from primary-pass policy
- **Rule.** Sub-passes (probes, repair passes, liveness checks, sanity checks) need explicit policy distinct from primary user-facing passes. Don't blanket-apply the user-visible policy to internal sub-passes.
- **Why.** Aborting a probe produces a false-negative. Aborting a post-success repair pass throws away completed work. The dividing line is "would the operator expect this phase to stop?"
- **Trigger.** Cross-cutting features (abort, timeout, cost cap, telemetry) being wired through code that runs both user-visible and internal flows.

### §5.3 Recency wins in attention contexts
- **Rule.** When the context window has both system-level framing and per-turn content, put the load-bearing context closest to the answer position — not in the framing.
- **Why.** Attention-based models weight recent context heavier than distant context. System-prompt context tends to be treated as stylistic frame; user-turn context tends to be treated as authoritative grounding.
- **Trigger.** Designing prompt scaffolding, grounding strategies, retrieval injection. Anywhere model fidelity to context matters.

### §5.4 Two providers, one policy method
- **Rule.** When the same behavioural switch must work across multiple providers with different APIs, route it through one policy method on the request type. Each provider consults the method — never re-encodes the flag.
- **Why.** Two flags drift; one method forces alignment. Adding a third provider must hit the same call site, which makes drift visible at review.
- **Trigger.** Multi-provider abstractions. Cross-cutting flags that need different wire-format encoding per provider.

---

## §6. State Machines & Transitions

### §6.1 Name a transient state when there's observable in-flight latency
- **Rule.** If a transition from "live" to "terminal" has measurable user-perceivable latency, introduce a named transient state between them with its own visible treatment.
- **Why.** Without the transient state, the user can't tell whether their action was acknowledged. Repurposing the live state with a different message confuses the system clock.
- **Trigger.** Abort/cancel/stop transitions. Save-pending states. Anything where user input takes >250ms to reach a terminal-looking UI.

### §6.2 Preserve timestamps on message-only updates
- **Rule.** When a state store has a `set(state, message)` API that always stamps `updated_at`, introduce a separate method for "same phase, different message" that preserves the stamp.
- **Why.** Frontend components computing "elapsed since last update" silently re-zero when a message-only update bumps the stamp. The user sees the timer reset and assumes a new phase started.
- **Trigger.** State stores with combined `set` APIs. Any time you want to add a message to an ongoing phase without "restarting the clock".

### §6.3 Different semantics need different methods
- **Rule.** If two callers have semantically different intents ("transition phase" vs "annotate current phase"), give them separate methods on the state machine — don't share a polymorphic setter.
- **Why.** Polymorphic setters bury the semantic distinction in caller-supplied arguments. The next caller passes the wrong arguments and the bug surfaces in the UI, not at the call site.
- **Trigger.** Any state-machine method with `Option<>` arguments where some combinations mean fundamentally different operations.

### §6.4 Cancellation is a first-class state, not a feature
- **Rule.** Every long-running, user-initiated operation must be cancellable. Cancellation is part of the state machine (with its own transient state, its own visible treatment, its own classification path) — not an afterthought wired into one provider.
- **Why.** A "processing" phase that silently ignores cancel input is a UX bug regardless of how well it succeeds when it succeeds. Once an operation crosses the perceptual-latency threshold (~250ms), the user must be able to abort cleanly without process kill.
- **Trigger.** Streaming generation, network calls, multi-step pipelines, batch operations, anything that runs longer than perceptual latency from a user-initiated action.

---

## §7. Error Handling & Resolution Chains

### §7.1 Fall-through chains need per-step full validation
- **Rule.** In a chain of fallback strategies (`A or_else B or_else C`), every step must validate its own success fully before returning Success. Partial-match Successes short-circuit the chain and starve later strategies.
- **Why.** A step that returns Success on a partial match blocks later strategies from running — even when a later strategy would have produced the correct result more cheaply.
- **Trigger.** Resolver chains, parser chains, retry strategies, dispatch chains. Anything using `.or_else`-style composition over multiple strategies.

### §7.2 Sentinel error contracts for cross-module classification
- **Rule.** When a classification decision ("was this cancelled or did it fail?") must cross a module boundary on an opaque error type, a pinned sentinel string in the error message is a legitimate engineering primitive.
- **Why.** Downcast-based discrimination couples crates; typed error enums force every provider to carry variants it doesn't own. A sentinel string at a module-to-module seam is cheaper and self-documenting.
- **Trigger.** Cross-module error classification. Multi-provider abstractions where one provider returns the error and another classifies it.

### §7.3 Classify by intent, not by surface symptom
- **Rule.** When user intent ("I pressed cancel") and system symptom ("the stream returned an error") arrive at the same classifier, classify by intent first — the symptom is a consequence.
- **Why.** Classifying by symptom buckets user-initiated cancels into "failed", which mis-labels the runtime state and triggers wrong follow-up UX (red error vs neutral cancelled).
- **Trigger.** Abort, cancel, user-initiated termination flows. Anywhere a graceful user action and a system failure share an error path.

### §7.4 One physical bit, one shared state
- **Rule.** A cross-module signal that is semantically one bit ("user requested cancellation") is physically one bit. Don't introduce per-provider or per-phase flags that view the same intent.
- **Why.** Multiple views of the same conceptual bit drift. Operators end up with abort that "kind of works on provider A but not on provider B".
- **Trigger.** Any cross-cutting Boolean (abort, debug, dry-run, maintenance). Multi-provider implementations.

### §7.5 Split layer diagnosis at the symptom, don't assume one fix covers all layers
- **Rule.** When a user-visible symptom could be produced by any of several stacked layers (input → transform → output), split diagnosis by layer immediately. Do not assume a single fix at one layer corrects the others.
- **Why.** Most "X is wrong" reports are surface-level; the actual breakage lives at a different layer than where the symptom is visible. Patching the surface masks the real cause and the symptom returns elsewhere.
- **Trigger.** "Wrong language output", "garbled formatting", "stale data", "duplicate notification" — anything where multiple processing layers could be the root cause.

---

## §8. External Integration / Connectors

### §8.1 Local vs hosted under one descriptor is a lie
- **Rule.** When a provider has both local-execution and hosted/cloud-execution paths, model them as distinct descriptors with distinct auth state, distinct preset gates, and distinct user-facing disclosure.
- **Why.** When the wire protocol is identical, the code path looks identical and the user has no way to tell that their payload is leaving the device. Mixing the two under one "local" flag is a privacy regression that hides until the first incident.
- **Trigger.** Provider ecosystems that ship both local and managed execution under similar URLs (e.g. `:cloud` tags). Any "compatibility-mode" SDK that masks the actual execution location.

### §8.2 Research availability before editing the catalog
- **Rule.** Before adding any entry to a provider catalog or registry, verify it actually exists in the form the catalog promises (local-runnable tag, supported quant, fits target hardware tier).
- **Why.** Catalog edits without research land entries that no real user can use. The entry sits broken until the first user pulls it and hits "manifest not found" or "out of memory".
- **Trigger.** Any catalog/registry expansion. New provider, new model, new connector. Tempting "I'll just add the JSON line" moments.

### §8.3 Three-pillar problems need all three pillars
- **Rule.** When a known failure mode has multiple root causes (cold-start has three: keep-alive, stream timeout, prewarm), implement all causes together. Partial implementations partially fix the symptom and lull the team into thinking it's fixed.
- **Why.** Removing any one pillar reintroduces the symptom. The next session sees a "partially fixed" feature, attributes the remaining failures to randomness, and waste a week.
- **Trigger.** Known multi-cause problems. Any rule that says "X alone is not enough".

### §8.4 Honest data labels: stale, inferred, missing
- **Rule.** Every metric, every value, every chart carries its source and freshness label. Stale data is marked stale. Inferred data is marked inferred. Missing data is marked missing.
- **Why.** Fake confidence in dashboards is worse than no dashboard — decisions get made on data the operator thinks is fresh and observed when it's actually stale and inferred.
- **Trigger.** Any dashboard, any analytics surface, any report that aggregates data from multiple sources or time windows.

### §8.5 Wire-protocol transparency is the dangerous part
- **Rule.** When a remote endpoint speaks the same wire protocol as a local endpoint, the code path is identical and the user has no way to see the difference. Make the difference structural (separate code paths, separate types), not "trust the URL".
- **Why.** URL-only differentiation fails the moment someone copy-pastes a config. Structural differentiation makes mistakes impossible at the type level.
- **Trigger.** Any local/cloud split where both sides speak the same protocol (Ollama, OpenAI-compatible, etc.).

### §8.6 Runtime endpoints can't depend on operator-only auth flows
- **Rule.** Any endpoint the installed product hits at runtime must be accessible with the credentials the installed product can carry — not with credentials only the developer/operator has at their desk.
- **Why.** Private-repo asset URLs, dev-tunnel hostnames, and personal-access-token endpoints work for the operator but 404 for the installed app on a user's machine. The endpoint must be hosted on a path the runtime can actually reach with the credentials it actually has.
- **Trigger.** Updater feeds, telemetry sinks, license-check endpoints, content-CDN URLs — anything the running product fetches autonomously after install.

---

## §9. Capacity, Cost & Hardware Honesty

### §9.1 Label resource cost at selection time
- **Rule.** When a choice has materially different resource cost (latency, money, memory), label the cost on the choice itself — not buried in a docs page.
- **Why.** Invisible cost leads to 3-minute latency surprises, surprise bills, and false bug reports. Once the cost is visible at selection, the user can reason about it.
- **Trigger.** Model selectors, region selectors, plan selectors. Any UI choice that varies the resource cost of subsequent work.

### §9.2 Hardware classes: separate guaranteed / best-effort / blocked
- **Rule.** When a feature depends on hardware capability, classify devices into explicit tiers — guaranteed baseline, best effort, and blocked/incompatible. Don't lump unknowns into "probably works".
- **Why.** Promoting a model/feature beyond the actual capability ceiling produces silent swap thrashing, OOM, or thermal throttling — all of which look like "the software is slow", not "the device is the wrong tier".
- **Trigger.** Local-execution products. On-device ML. Anything where device specs vary by an order of magnitude across users.

### §9.3 Dynamic over static defaults for variable resource sizing
- **Rule.** When a resource bound (context window, memory budget, timeout) depends on input shape, compute it per-request from input size — never a single static default.
- **Why.** A static default that's "large enough for safety" wastes cold-start latency on every request. A static default "small enough for speed" silently truncates large inputs. Tiered/per-request sizing is the only honest answer.
- **Trigger.** Anything with a knob that varies by ~10× between use cases (context window, batch size, timeout, page size).

### §9.4 Don't compensate for the wrong tool at the framework layer
- **Rule.** When a chosen tool/model/library is below the baseline the product needs, surface a clear error pointing at alternatives — don't paper over it with prompt scaffolding, retries, or downstream cleanup.
- **Why.** Compensation layers grow unbounded, mask the underlying mismatch, and cage all the cases the compensation didn't anticipate.
- **Trigger.** Tempting "I'll add one more rule to make the small model behave like the big one" moments. Repair-pass / cleanup-pass / sanitisation-pass proposals.

---

## §10. UI Semantic Hygiene

### §10.1 Color is a semantic label, not decoration
- **Rule.** Every distinct hue on an operator UI is a label. Color choices must follow the state transitions they represent — colour progressions read as continuity, colour breaks read as lane changes.
- **Why.** Aesthetic color choices ("looks good") that don't match state semantics confuse the operator about what the system is doing. A processing colour that reads as a different lane than the resting colour breaks the mental model.
- **Trigger.** Designing status badges, progress indicators, terminal states. Multi-state flows.

### §10.2 Stale UI is a broken contract
- **Rule.** Any list that represents live external state must auto-refresh on mount and on focus return. Manual refresh stays as a power-user override, never as the default happy path.
- **Why.** A list that only updates on manual click is functionally broken regardless of backend health. The user assumes "what I see is what is".
- **Trigger.** Installed-X lists, connected-device lists, available-model lists, sync-status panels. Anything whose source-of-truth lives outside the app.

### §10.3 Info icon left of action, popover opens upward
- **Rule.** When an action has an explanatory affordance, the info icon sits LEFT of the action button. Popover opens UPWARD above the group. Never embed info inside the button's click surface.
- **Why.** Semantic separation (information vs action) is load-bearing. Reading order left-to-right carries the semantic structure question → answer. Mixing the two reintroduces click-target overlap.
- **Trigger.** Any action that needs a tooltip, "what does this do" explainer, or contextual help.

### §10.4 Reusable primitives before one-off classes
- **Rule.** Before adding a new component class, extend an existing primitive (chip, toggle, section, summary). The number of distinct primitives should grow slowly even as features grow fast.
- **Why.** One-off classes drift visually over time and end up with N variants of "looks like a chip but slightly different". A shared primitive enforces consistency by construction.
- **Trigger.** "I'll just add a new class for this one case" moments. Two visually-similar elements that don't share a CSS class.

### §10.5 Content-sized primitives need three constraints
- **Rule.** A "pill" or "chip" primitive that should fit its content across all parent contexts (grid / flex / block) needs three CSS rules together: `justify-self: start`, `width: fit-content`, `max-width: 100%`.
- **Why.** Each rule fixes a different parent context. Relying on the local parent's flex defaults works in one place and fails the moment the same primitive lands inside a grid.
- **Trigger.** A component that looks correct in one place and stretched/squashed in another. Any "content-sized" requirement that has to work in arbitrary parent layouts.

### §10.6 Every classification state needs a matching visible treatment
- **Rule.** If the system can classify itself into state X, the UI must render a treatment that reads as state X. A backend "cancelled" classification with no visible cancelled treatment is a silent failure regardless of how well the backend behaves.
- **Why.** The classification is for the operator's benefit. Without a matching visual, the operator can't tell whether their action was acknowledged or whether the system simply got stuck.
- **Trigger.** Adding a new state to a state machine, adding a new error category, adding a new cycle outcome. Any backend taxonomy whose values surface to a user.

### §10.7 Per-entity flags belong in the entity's edit modal, not a global settings panel
- **Rule.** When a boolean policy flag applies per-entity (per-role, per-product, per-connector), put the control inside that entity's edit modal — not in a separate global settings panel with an entity dropdown.
- **Why.** The mental model for "this setting applies to entity X" forms while editing entity X. A separate panel forces context-switching and produces stale "I configured the wrong one" bugs.
- **Trigger.** Any per-entity opt-in flag. Any settings panel that already requires "choose which entity this applies to" as a first step.

### §10.8 Credentials UX: masked preview + connectivity test, never plaintext
- **Rule.** Credential management UI shows a masked preview (last 4 chars or fingerprint), never the plaintext. Always offers an explicit, dedicated connectivity-test action that reports pass/fail before the credential is saved as "live".
- **Why.** Plaintext display leaks credentials to screen-share / over-the-shoulder / screenshots. No connectivity test means the user discovers the credential is broken only when the actual feature fails — far from the configuration moment.
- **Trigger.** Any auth-token field, API-key field, OAuth scope confirmation. Every connector setup flow.

---

## §11. Asset & Platform Conformance

### §11.1 Bake platform assumptions into the asset
- **Rule.** When a platform applies automatic chrome to non-conforming assets (e.g. macOS wraps non-squircle app icons in a light-material frame), bake the conforming shape into the asset itself.
- **Why.** Relying on the platform "to do the right thing" fails when the platform applies its own visible adjustments. Transparent corners produce anti-aliasing artefacts. The robust answer is conform at the asset.
- **Trigger.** App icons, OG images, social previews, splash screens, anything where the destination platform decorates the asset before showing it.

### §11.2 Absolute URLs for social-meta assets
- **Rule.** Open Graph and Twitter Card image URLs must be absolute (`https://example.com/og.png`), never relative (`og.png`).
- **Why.** Most scrapers fetch the HTML server-side and don't resolve relative paths against the page URL reliably. WhatsApp in particular is strict. The preview silently fails to render and the user sees an unbranded link.
- **Trigger.** Any new public page with social sharing. Any time meta tags are copied between projects.

### §11.3 Build-time identity, not runtime env, for installed artefacts
- **Rule.** An installed/distributed product determines its channel, release, version, and environment identity at **build** time — baked into the artefact — not from runtime environment variables.
- **Why.** An installed `.app`/`.exe`/container does not inherit the shell environment of the machine that built it. Runtime-env identity works on the developer's machine and fails everywhere else, silently picking a wrong default.
- **Trigger.** Channel selectors (beta/stable), telemetry endpoints, update feeds, license keys, anything where "which build is this" matters and the answer travels with the artefact.

---

## §12. Scope Discipline & Slice Sizing

### §12.1 Positioning-only slices are legitimate ship units
- **Rule.** A slice that only ships layout/positioning (no action wiring) is a valid ship unit if it has bounded acceptance criteria and an independent regression surface.
- **Why.** Bundling positioning with action wiring inflates scope, delays both, and merges two regression surfaces. Shipping positioning alone makes the next slice tighter.
- **Trigger.** "I'll do positioning + wiring together" temptations when the two have independent verification.

### §12.2 Ladder-sequenced over multiple-choice when the problem is one escalation
- **Rule.** When several proposed alternatives address different rungs of the same feedback ladder (don't punish → tell what happened → show real-time signal → combine), ship all of them, sequenced — not pick one.
- **Why.** Picking one leaves the other rungs as permanent "maybe later". The user pain is the whole ladder, not any single rung.
- **Trigger.** Design discussions framed as "A or B or C" where each option addresses a different stage of the same user pain.

### §12.3 Capture/mode safety: state must not leak into runtime
- **Rule.** Modal or capture modes (assignment dialogs, edit overlays, draft sessions) must be gated against runtime side effects. Pressing a key in capture mode never triggers the live action that key is bound to.
- **Why.** Capture/edit modes accept input that looks like trigger input. Without explicit gating, the user's "I'm just configuring this" action fires the live behaviour.
- **Trigger.** Modal capture flows. Hotkey assignment UI. Anywhere user input is being recorded rather than acted upon.

### §12.4 Destructive primary action on the main surface, not the modal
- **Rule.** Destructive primary actions (factory reset, delete all, force resync) belong on the main runtime control surface — not buried inside a modal that the user reads as "draft / cancel-able".
- **Why.** Users interpret modal actions as draft actions. Putting destructive runtime actions inside a modal causes accidental destruction when the user thought they were just cancelling.
- **Trigger.** Any destructive action that affects persisted state. Reset, wipe, disconnect, archive.

### §12.5 Separate work modes get separate boards, not one swimlane view
- **Rule.** When two streams of work require different cadences and different mental modes (e.g. urgent bug triage vs. weekly feature planning), give them separate boards / surfaces — not one shared view with swimlane separation.
- **Why.** Mixed modes on one surface cause cognitive bleed: the operator triaging stream A gets pulled out of mode by visible items in stream B. The "single pane of glass" promise hides the cost of constant context-switching.
- **Trigger.** Any UI proposal that wants to "consolidate" two work streams into one view with type-based filters or swimlanes.

---

## §13. Honest Engineering

### §13.1 Pushback over people-pleasing
- **Rule.** When the user's request is based on a wrong premise, the right response is "stop — here's why this would break", not "yes, doing now".
- **Why.** Agents that default to "yes" in the face of wrong premises ship bugs that cost weeks to unwind. Hard pushback at the right moment prevents weeks of cleanup.
- **Trigger.** Requests that violate a documented constraint. Requests that contradict a recently-locked decision. "Just add X" requests that touch a structural concern.

### §13.2 Tolerance for fuzzy natural-language input
- **Rule.** When user input is natural-language (spoken commands, search queries, free-text triggers), match with explicit synonym vocabularies + normalised fuzzy comparison — not exact-string equality.
- **Why.** Natural-language input has inherent variance: transcription noise, localisation, abbreviations, alternate spellings. Exact-string matching turns variance into failed invocations.
- **Trigger.** Voice commands, search-as-you-type, keyword triggers, role/tag selectors driven by user-supplied strings.

### §13.3 Layer is data delivery, not a cage around the user
- **Rule.** The framework layer wraps context and data; it does not inject "always X / never Y" rules into the user's request. Trust strong tools to handle complex intent natively.
- **Why.** Every accumulated "always X / never Y" rule conflicts with the next request the rule didn't anticipate. The cage built to fix one case breaks the case after.
- **Trigger.** Tempting moments to "just add one more rule to the system prompt / middleware / wrapper" to fix a specific user complaint.

### §13.4 Honest scope decisions, declined options recorded
- **Rule.** When a candidate addition is rejected (provider not adopted, feature declined), record the rejection with the reason. Future sessions must not re-propose without explicit alignment.
- **Why.** Without a recorded decline, each new session re-evaluates the same option, re-runs the same exploration, and wastes the analysis already done.
- **Trigger.** Any "considered and rejected" decision. Any provider/feature/integration that was scoped and declined.

### §13.5 Source labels are data hygiene, not metadata bloat
- **Rule.** Strip identifying paths and machine-specific identifiers from any data label that may surface to a user, output, or clipboard. Keep the human-readable identity.
- **Why.** Absolute paths and machine IDs leak environment context that the user did not consent to share. Pasted output containing `/Users/x/...` reveals more than the user expected.
- **Trigger.** Any data label that survives across surfaces — output text, copy-to-clipboard payloads, exported files, shared screenshots.

### §13.6 Don't expose user-facing controls for capabilities that aren't reliable across variants
- **Rule.** If a capability (reasoning toggle, advanced feature, experimental mode) behaves differently or fails on some of the variants/models/providers you support, do not expose a single binary control to the user. Either gate by detected capability or keep it internal until the variants converge.
- **Why.** A control that works in one variant and silently misbehaves in another teaches the user to distrust the entire surface. The user can't reason about "this toggle only applies to half the models", so the toggle becomes a bug factory.
- **Trigger.** Any feature gate that depends on model / provider / region / plan capability. Beta-stage products with mixed-quality variants.

---

## §14. Dependency & Toolchain Discipline

### §14.1 Reserve dependencies for transitive value
- **Rule.** Adding a third-party dependency to gain a single function is almost always wrong. Inline the function (~40 lines) instead. Reserve dependencies for components with transitive value across many call sites (HTTP client, JSON serializer, runtime, framework).
- **Why.** Every dependency has compounding cost: lock-file churn, security review, version-bump maintenance, supply-chain risk, build-time impact. A 40-line inline implementation has none of these and stays under your control.
- **Trigger.** "I'll just add a crate / npm package for fuzzy matching / date formatting / one utility." Stop and write it inline; only escalate to a dependency if the inline version exceeds ~150 lines or needs serious algorithmic work.

### §14.2 Single-source for behaviour configuration
- **Rule.** When the same behavioural parameter (context window size, timeout, retry count, rate limit) appears in multiple files / call sites, route it through one helper / one config object. Never hardcode the same number in two places.
- **Why.** Drift between the two hardcoded values produces "fixed in one place, regressed in another" bugs that survive code review because each individual change looks correct.
- **Trigger.** Any tunable number that already appears in more than one file. Any "make this configurable later" comment.

### §14.3 Local sandbox limits are documented gaps, not blocks
- **Rule.** When the local environment can't run a verification (compile, test, install, deploy), the slice ships with the gap documented explicitly — including which post-ship checks the operator now owns.
- **Why.** Letting a slice rot waiting for the sandbox is worse than shipping with a known gap. The operator can run the gap; an unshipped slice helps no one.
- **Trigger.** Sandboxed agent runs that can't reach the real build pipeline. CI environments missing platform-specific tooling. Anything where the verification machine isn't the deploy machine.

---

## §15. Adding new lessons

When a project surfaces a new lesson worth promoting to this canonical file:

1. **Distill first.** Strip project-specific names, paths, tool versions. The lesson must read as a rule any future project could need.
2. **Place it in an existing category if possible.** Only open a new category if no existing one fits.
3. **Use the Rule / Why / Trigger format.** Don't break the template — uniformity is what makes this readable across projects.
4. **Add a stable ID.** Append `§N.M` where N is the category and M is the next number in sequence. Never renumber existing entries — outside docs reference these IDs.
5. **Bump the frontmatter `version` and `date`.**

If a lesson really is too project-specific to abstract, it belongs in that project's `SKILLS_COMPOUNDING.md`, not here.
