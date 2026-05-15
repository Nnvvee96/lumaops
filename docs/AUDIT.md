---
system: Atlas Vault OS
version: 1.0
date: May 15, 2026
status: GOVERNANCE / AUDIT
dependencies: [[AGENT.md]], [[CONSTRAINTS.md]], [[PATTERNS.md]], [[PLAYBOOKS.md]], [[LESSONS_LEARNED.md]], [[RECOVERY_KIT.md]]
---
# AUDIT.md — Red-Team, Risk Tiers, Hardening Gates

This is the auditing node. It is invoked by `/SHRED` (red-team before code) and `/AUDIT` (hardening gate after implementation). It is **not** a playbook or command index — those live in `PLAYBOOKS.md`.

# 1. Purpose

Audit answers three questions, in order:

1. **What can break?** (Red-team — surface failure modes before implementation.)
2. **How will we know it broke?** (Evidence — define machine-verifiable proof.)
3. **Has it been hardened to 85%?** (Gate — block merge / phase close until met.)

Audit is the friction layer. If a plan cannot survive `/SHRED`, the plan is the bug. If a slice cannot survive `/AUDIT`, the slice is not done.

# 2. Risk Tiers

Every change is classified into one of three tiers before it ships. The tier determines the evidence the audit gate requires.

| Tier   | Trigger                                                                                     | Sign-off    | Coverage      | Evidence required                                                          |
|--------|---------------------------------------------------------------------------------------------|-------------|---------------|----------------------------------------------------------------------------|
| HIGH   | Touches credentials, persisted user data, billing, security, irreversible operations, releases | Manual      | 100%          | Tests + manifest + machine-verifiable trace (logs / Playwright / hashes)   |
| MEDIUM | Touches data model, cross-cutting policy, multi-provider abstractions, public surfaces       | Manual      | ≥85%          | Tests + commit-pinned review + symbol grep                                 |
| LOW    | Internal refactor, docs, dev tooling, isolated UI polish                                     | Automatable | smoke/none    | Build/lint/typecheck green                                                 |

Cross-reference: [[CONSTRAINTS.md]] §3 (Harness Risk Tiers, Evidence over Claims), [[LESSONS_LEARNED.md]] §3 (Shipping & Verification).

# 3. /SHRED — Red-Team Phase

Invoked before implementation. Owns the question "what breaks?"

Procedure:

1. **Read the spec** ([[TDD.md]] / phase spec in [[IMPLEMENTATION_PLAN.md]]).
2. **Walk the spec adversarially.** For every assumption, ask "what if the opposite?"
3. **Apply the lesson lens.** Consult [[LESSONS_LEARNED.md]] categories that match the surface (§1 Spec, §5 Architecture, §7 Error Handling, §8 Integration, §10 UI — at minimum).
4. **Enumerate failure modes.** For each, mark: probability (low/med/high), blast radius (local/module/system/external), reversibility (easy/hard/permanent).
5. **Block until resolved.** No implementation begins while a HIGH-risk failure mode is unaddressed in the spec.

Output of `/SHRED`: an explicit list of identified failure modes, each with a planned mitigation or accepted-risk note. Persisted in the TDD or as an addendum.

# 4. /AUDIT — Hardening Gate

Invoked at phase close, before merge. Owns the question "is it done?"

Procedure:

1. **Tier the change.** Use §2 above.
2. **Apply the 85% rule.** Per [[CONSTRAINTS.md]] §1: tests pass, edge cases documented in [[MEMORY.md]], error handling verified.
3. **Verify the artefact, not the log line.** Per [[LESSONS_LEARNED.md]] §3.1: timestamp + symbol grep + deployed-hash comparison.
4. **Walk the cross-phase gates** from [[IMPLEMENTATION_PLAN.md]] §3 (Technical / Shipping / Product / Security / Docs).
5. **Block on red flags.** Any of: failing test, undocumented sandbox gap, missing docs update, claim without evidence.

Output of `/AUDIT`: pass / block decision with the evidence ledger. Persisted in [[SESSION_LOGS.md]].

# 5. Evidence Contract

Per [[CONSTRAINTS.md]] §3, "human claims without evidence are rejected". The evidence contract:

- **Tests** — automated, deterministic, committed alongside the change.
- **Manifests / logs** — machine-readable, commit-SHA-pinned. Reviews against stale SHAs are invalid.
- **Hashes / timestamps** — for deployed artefacts (when sandbox can't run the install, document the gap; see [[LESSONS_LEARNED.md]] §3.3).
- **Playwright / browser traces** — for UI/frontend behaviour. Screenshots without a commit-SHA tie are not evidence.
- **Operator confirmation** — accepted only for surfaces where machine evidence is impossible AND the operator's confirmation is logged in [[SESSION_LOGS.md]].

# 6. Harness Risk Contract

For high-risk paths, the audit gate requires a written risk contract:

- **Pre-condition** — what must be true before the change executes.
- **Post-condition** — what is true after, including the unhappy paths.
- **Rollback** — confirmed exit strategy (per [[PATTERNS.md]] P#5 Rollback Readiness).
- **Detection** — how a regression would be caught.

The contract lives in [[TDD.md]] and is referenced by the phase in [[IMPLEMENTATION_PLAN.md]].

# 7. Anti-Patterns

The audit node specifically rejects:

- **SHA-stale reviews.** Evidence against an outdated commit is not evidence.
- **Vibes-based sign-off.** "Looks fine" / "I tested it" without a logged trace.
- **Coverage theatre.** Tests written to satisfy a coverage number, not to catch regressions.
- **Audit-after-the-fact.** Auditing a change that's already been deployed turns the gate into a post-mortem.
- **Skipping `/SHRED` for "small" changes.** Small changes touch the same surfaces as big ones; the size is not the relevant axis.

# 8. Triggers

Open the audit node when:

- A `/SPECIFY` is about to lock a TDD.
- A phase from [[IMPLEMENTATION_PLAN.md]] is about to close.
- A merge to `main` is being prepared.
- A regression is reported (audit retroactively to identify the missing gate).

# 9. Compounding

When an audit catches something that should have been caught earlier, the gap is itself a finding:

- Add the project-specific gap to [[SKILLS_COMPOUNDING.md]].
- If the gap generalises, distill it to [[LESSONS_LEARNED.md]] with a stable §N.M ID at phase close.

Final Principle: **Halt on ambiguity. No guesses. Discipline over inspiration.**
