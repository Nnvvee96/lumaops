---
system: Atlas Vault OS
version: 1.0
date: May 15, 2026
status: ACTIVE / RECOVERY
project: LumaOps
dependencies: [[AGENT.md]], [[MEMORY.md]], [[SESSION_LOGS.md]], [[LESSONS_LEARNED.md]]
---
# RECOVERY_KIT.md - Restoration Guide
# PROJECT: LumaOps

## 1. Environment Setup
Infra: local development first; self-hosted container later.
Harness: typecheck, lint, unit tests, browser smoke once app exists.
Runtime: Node.js 22.x, pnpm, PostgreSQL.

## 2. Account Restoration
Repository: `https://github.com/Nnvvee96/lumaops.git`.
Domain: `lumaops.app`.
Keys: never commit provider tokens; use local `.env` and later documented secret storage.

## 3. Sequence
1. Clone repository.
2. Read `README.md`, `docs/CONCEPT.md`, `docs/TECHSTACK.md`, and `docs/IMPLEMENTATION_PLAN.md`.
3. Restore local `.env` from private notes or provider dashboards.
4. Install dependencies once app scaffold exists.
5. Run typecheck/lint/tests/browser smoke once available.
6. Verify no secrets or generated artifacts are staged.
Diagnostics: Uptime/output flags.
