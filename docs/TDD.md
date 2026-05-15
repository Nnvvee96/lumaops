---
system: Atlas Vault OS
version: 3.1
date: February 19, 2026
status: DRAFT / TECHNICAL_DESIGN
project: LumaOps
dependencies: [[CONCEPT.md]], [[IMPLEMENTATION_PLAN.md]], [[AUDIT.md]], [[CONSTRAINTS.md]], [[LESSONS_LEARNED.md]]
---
# TDD.md - Technical Design Blueprint
# PROJECT: LumaOps | RISK TIER: Medium

## 1. Harness Contract
Risk Paths: connector credential handling, external API sync, metric derivation, event ingest, hosted-mode auth if introduced.
Checks: typecheck, lint, unit tests for core mapping, connector error tests, browser smoke for dashboard shell.
Docs Drift: Changes to stack, schema, connector contracts, or auth model trigger updates.

## 2. Shred
Failure A: GitHub data is mistaken for business truth.
Failure B: Connector failure silently leaves stale metrics looking current.
Failure C: Hosted SaaS concerns pollute the open-source MVP too early.
Failure D: Secrets are committed or logged.
Failure E: Dashboard becomes decorative instead of operational.

## 3. Design & Verification
Bones: Product/workspace/integration/freshness model before UI polish.
Evidence Manifest: Local app smoke, route coverage, connector fixture tests, stale-data states.
Harness Cases: Repeatable additions per connector.

## 4. Quality Gates
- SHA-Match: Review matches head.
- Policy Gate: Open-source core stays self-hostable.
- Browser: Dashboard shell renders desktop/mobile without overlap.
- Hardening: No secrets in repository; all external data shows source/freshness.
