---
system: Atlas Vault OS
version: 3.3
date: May 15, 2026
status: COMMAND_REF / PLAYBOOKS
dependencies: [[AGENT.md]], [[PATTERNS.md]], [[CONSTRAINTS.md]], [[LESSONS_LEARNED.md]]
---
# PLAYBOOKS.md - Command & Workflow Reference

# 1. Command Center
Tiered commands; cap at $0.50/task.

| Command | Purpose | Model Tier | Node |
|---------|---------|------------|------|
| /REINDEX | Refresh graph | Utility | Global |
| /SPECIFY | Lock architecture | Reasoning | TDD.md |
| /SHRED | Red-team plan | Reasoning | AUDIT.md |
| /PLAN | Micro-steps | Balanced | IMPLEMENTATION_PLAN.md |
| /EXECUTE | Implement | Balanced | SESSION_LOGS.md |
| /AUDIT | Hardening gate | Reasoning | AUDIT.md |
| /MARKET | Attribution | Balanced | PATTERNS.md |
| /SKILL | Compound failure (project-specific) | Balanced | SKILLS_COMPOUNDING.md |
| /LESSONS | Surface cross-project rules for current scope | Balanced | LESSONS_LEARNED.md |
| /REMEDIATE | Restore | Reasoning | RECOVERY_KIT.md |
| /ORCHESTRATE | Delegate agents | Reasoning | AGILE_CYCLES.md |

# 2. Operational Playbooks

Initialization Phase
- /REINDEX: Scan YAML/headers.
- /LESSONS: Load LESSONS_LEARNED entries that apply to this project / phase scope before any spec work.
- Interrogate: Flag assumptions.
- /SPECIFY: Freeze in TDD.md. Cross-reference LESSONS_LEARNED §1 (Spec & Contract Discipline) before lock.

Shred Phase
- /SHRED: Break logic/security.
- Constraint: No execution until resolved.
- Define risk in harness.json.

Action Phase
- Loop: Claim > Plan > Implement > Test.
- Utility tier for tests/docs.
- /MARKET: Cross-ref revenue.

Closing Phase
- /AUDIT: Verify 85%.
- /SKILL: Add project-specific constraint to SKILLS_COMPOUNDING.md.
- /LESSONS promote: If the finding is abstractable / cross-project, promote it to LESSONS_LEARNED.md with a stable §N.M ID and bump the frontmatter.
- Journal: Update MEMORY.md.
- Diagnostics: Flag high uptime/low output.

# 3. File Hierarchy (Skill Graph)
YAML required for scans.

Governance: AGENT.md, PATTERNS.md, CONSTRAINTS.md, AUDIT.md, PLAYBOOKS.md, PROJECT_HYGIENE_PLAYBOOK.md, PROJECT_INSTRUCTION.md.

Foundations: LESSONS_LEARNED.md (cross-project, canonical), SKILLS_COMPOUNDING.md (project-specific), TECHSTACK.md, RECOVERY_KIT.md.

Workflow: CONCEPT.md, IMPLEMENTATION_PLAN.md, TDD.md, MEMORY.md, SESSION_LOGS.md, AGILE_CYCLES.md.

Lessons flow: project SKILLS_COMPOUNDING.md captures the raw finding; phase-close distillation promotes generic findings to LESSONS_LEARNED.md with a stable §N.M ID; the next project's IMPLEMENTATION_PLAN references those IDs in its "Risks From Experience" blocks.

# 4. PR Loop
1. Review headSha.
2. /REMEDIATE if findings.
3. Hardening check: Backend access revoked.
4. CI fanout on clean state.
5. /ORCHESTRATE for multi-agent review.

Final Principle: Discipline over inspiration.
Halt on ambiguity. No guesses.

Update Protocol: Add commands via PATTERNS.md supersede.