---
system: Atlas Vault OS
version: 3.1
date: February 19, 2026
status: TEMPLATE / DYNAMIC
---
# TDD.md - Technical Design Blueprint
# PROJECT: [Insert] | RISK TIER: [High/Low]

## 1. Harness Contract
Risk Paths: app/api/**, db/schema.ts.
Checks: risk-gate, smoke, evidence.
Docs Drift: Changes trigger updates.

## 2. Shred
Failure A: Stale SHA.
Failure B: RLS bypass.

## 3. Design & Verification
Bones: Logic pass pre-skin.
Evidence Manifest: Flows with assertions.
Harness Cases: Repeatable additions.

## 4. Quality Gates
- SHA-Match: Review matches head.
- Policy Gate: Preflight passed.
- Browser: Manifest valid/fresh.
- Hardening: Signed URLs enforced.