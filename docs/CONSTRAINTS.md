---
system: Atlas Vault OS
version: 3.2
date: May 15, 2026
status: GOVERNANCE / CONSTRAINTS
dependencies: [[PATTERNS.md]], [[AGENT.md]], [[AUDIT.md]], [[LESSONS_LEARNED.md]]
---
# CONSTRAINTS.md - Core Operating Constraints

# 1. Strategic Constitution

Ownership Liability
Software is a liability.
Every line of code is maintenance tax.
Build only what is genuinely hard to own.
Prioritize solving acute, recurring pain.

85% Hardening Rule
No task is Done until 85% hardened.
Hardening = passing integration tests + documented edge cases in MEMORY.md + robust error handling.
Unfinished logic ("digital scaffolding") is operational failure.

Spec-Driven Development
Implementation forbidden until TDD.md is approved and locked.
Every spec must be red-teamed (shredded) via AUDIT.md before code is written.

# 2. Economic & Context Constraints

Model Arbitrage
Reasoning tier (high-cost) → architecture, planning, root-cause
Execution tier (balanced) → core logic
Utility tier (low-cost) → tests, docs, re-indexing

Context Traversal
Selective graph load only.
Use YAML frontmatter + headers to determine relevance before full file ingestion.

# 3. Quality & Evidence Constraints

Harness Risk Tiers
High-risk paths → manual sign-off + 100% test coverage
Low-risk paths → automated remediation permitted

Evidence over Claims
UI/frontend changes require machine-verifiable proof (logs, manifests, Playwright traces).
Human claims without evidence are rejected.

# 4. Revenue & Compounding Constraints

Lessons Compounding (Cross-Project)
[[LESSONS_LEARNED.md]] is the canonical, cross-project ledger of abstracted rules.
At project start, load it; reference relevant entries by ID in [[IMPLEMENTATION_PLAN.md]] "Risks From Experience" blocks.
At phase close, promote abstractable findings from project [[SKILLS_COMPOUNDING.md]] into LESSONS_LEARNED with a stable §N.M ID.
The hurdle rate of new projects must fall over time; if it isn't, the distillation step is being skipped.

Attribution Discipline
Traffic and views are secondary.
Cross-reference distribution with revenue/subscription data.
Scale only patterns that demonstrably drive trials or MRR.
Eliminate vanity drivers.

Failure Compounding
Every production regression → permanent Negative Constraint in SKILLS_COMPOUNDING.md.
System must never repeat the same technical or strategic mistake.

# 5. Final Operating Principle

Systems over Tasks
Do not build tools that execute tasks.
Build systems that manage themselves.
Primary success metrics:
- Silence of the System (autonomous operation time)
- Growth of MRR