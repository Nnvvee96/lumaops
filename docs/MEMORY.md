---
system: Atlas Vault OS
version: 1.0
date: May 15, 2026
status: ACTIVE / PROJECT_MEMORY
project: LumaOps
---
# MEMORY.md - Project Knowledge Base
# PROJECT: LumaOps

## 1. Strategic Decisions
Decision A: Browser-based app first > fastest open-source/self-hosted onboarding; desktop wrapper can come later via Tauri.
Decision B: LumaOps name + `lumaops.app` > clean product-ops brand with app-domain fit.
Decision C: Open-source core before hosted SaaS > avoids premature auth, tenancy, billing, and secrets-management complexity.
Decision D: GitHub connector first > provides product structure and dev/release signals without pretending to provide business truth.

## 2. Flush Logs
Compaction: At 150k tokens (anecdotal), distill insights.
2026-05-15: Product direction locked as open-source, self-hostable product operations cockpit for indie software.

## 3. Locked Prompts
Visual Seed: Minimal, calm, premium operations cockpit inspired by restrained personal-site aesthetics, adapted for dense product dashboards.

## 4. Failure Lessons
Failure: `.com` availability over-optimized naming exploration.
Solution: Prefer strong brand plus `.app`/`.dev` over weak `.com` leftovers.

## 5. Harness Gap Loop
Incident: None yet.
Issue: None yet.
New Case: Add connector freshness tests before first external API implementation.
SLA: Pending first code scaffold.
Diagnostics: High uptime/low output = spec issue.
