---
system: Atlas Vault OS
version: 1.1
date: May 15, 2026
status: ACTIVE / RESOURCE_HYGIENE / PLAYBOOK
dependencies: [[AGENT.md]], [[CONSTRAINTS.md]], [[PLAYBOOKS.md]], [[PATTERNS.md]], [[AUDIT.md]], [[LESSONS_LEARNED.md]]
---
# PROJECT_HYGIENE_PLAYBOOK.md - Resource Hygiene for Local Development

# 0. Role In The MD Graph
This file is not a side note. It is a routing node.

Purpose:
- act as the system-wide hygiene policy for all current and future projects
- give every agent the same cleanup vocabulary and decision rules
- prevent projects from accumulating hidden operational debt between sessions

Agent contract:
- `AGENT.md` should load this node whenever implementation can create residue, large assets, caches, build outputs, or archive decisions
- this node governs session-close cleanup, pause/archive cleanup, and heavy-asset placement
- project-local docs may specialize these rules, but must not weaken them

# 1. Objective
Develop continuously without turning the machine into a landfill.
Primary goal: preserve system responsiveness by controlling disk growth, background processes, duplicate assets, stale build outputs, and oversized local artifacts.

# 2. Workspace Snapshot Pattern
A periodic snapshot inventory is the entry point for hygiene work. Take one at workspace setup, then at least monthly.

Capture three layers:

**Top-level size profile** — `du -sh` per top-level project (see §12.1).

**Largest payloads** — `find -size +100M` across the workspace (see §12.2). The recurring waste classes are: AI model files (`.bin`, `.gguf`, `.ggml*`, `.safetensors`), mobile build dependencies (`Pods`, `.dart_tool`), Rust target dirs, Node `node_modules`, release-validation artefact sinks, chat/screenshot backups.

**Common conclusions** (almost always true in indie / multi-project workspaces):
- Disk pressure dominates; git metadata is rarely the problem.
- Heaviest waste pattern is duplicated binary / model artefacts in active repos.
- Secondary waste pattern is rebuildable native/mobile build state (`Pods`, `.dart_tool`, `target`).
- Snapshot ≠ rule. Record it in `MEMORY.md` with a date stamp so the next snapshot can compare; do not let a snapshot ossify into "the truth".

# 3. Important Correction: Disk vs. RAM vs. CPU
Do not mix these together.

Disk pressure:
- Comes from artifacts, Pods, cached dependencies, model files, generated apps, archives, backups.
- This is the dominant problem in the current workspace.

RAM pressure:
- Usually comes from active processes: IDEs, browsers, local dev servers, watchers, emulators, Docker, Xcode, Electron/Tauri dev sessions.
- Old files on disk do not consume RAM by themselves.

CPU pressure:
- Usually comes from indexing, hot reload watchers, builds, sync daemons, Spotlight, Xcode, package managers, background local AI runs.

Rule:
- Cleanup files for disk health.
- Kill stale processes for RAM/CPU health.
- Do not treat both with the same solution.

# 4. Resource Taxonomy
Every heavy item must fall into one of four classes.

Class A - Regenerable
Safe to delete because tools can recreate them.
Examples:
- `ios/Pods`
- `.dart_tool`
- `dist`
- `build`
- `.next`
- `coverage`
- `__pycache__`
- `.pytest_cache`
- `target`
- temporary release validation outputs

Class B - Cache-like but expensive to rebuild
Delete only when stale, broken, or space is needed.
Examples:
- local package caches inside project
- Flutter/Xcode generated intermediates
- large local test outputs

Class C - Assets that are large and intentional
Do not keep multiple copies in active project trees.
Examples:
- Whisper model files
- release binaries for manual QA
- local datasets
- media archives

Class D - Source of truth
Never delete casually.
Examples:
- source code
- docs
- migrations
- configuration
- lockfiles
- committed assets actually required by app runtime

# 5. Findings By Project Type
Generic patterns. Match your project to the closest family; the rule still holds.

## 5.1 Local AI / Model-Bearing Projects (desktop, server, on-device ML)
Recurring observation:
- Multi-GB of model files inside the repo (`.bin`, `.gguf`, `.ggml*`, `.safetensors`).
- Same model often duplicated across `tools/`, `artifacts/`, `out/` paths.
- `release-validation` / `qa-output` style directories grow without retention dates.

Interpretation:
- The biggest issue is not code sprawl. It is binary sprawl.
- Validation-artefact sinks become permanent unless retention is explicit.
- Model files should not live in multiple active directories unless there is a hard runtime requirement.

Required rule:
- Keep one canonical local model store outside active repos (`~/DeveloperAssets/models/`).
- Reference from projects via symlink or env-configured absolute path.
- Treat validation/QA output directories as disposable unless tied to a current release decision.
- Never keep the same model in two project paths without an explicit reason logged in MEMORY.md.

## 5.2 Mobile / Native Projects (iOS / Flutter / React Native)
Recurring observation:
- `ios/Pods` weighs hundreds of MB.
- `.dart_tool`, `android/.gradle`, derived build outputs grow silently.
- Repo source itself is otherwise small.

Interpretation:
- Normal mobile tooling weight, but it should be treated as disposable build state, not permanent project value.

Required rule:
- `Pods`, `.dart_tool`, `.gradle`, derived build outputs are rebuildable and should be pruned when the project is inactive.
- Clean these before archiving or after long pauses.
- Keep them only while actively iterating.
- Always keep `Podfile.lock` / `pubspec.lock` / equivalent — they are source of truth, not regenerable.

## 5.3 Web / Node Projects
Recurring observation:
- `node_modules` per project (hundreds of MB each).
- `.next`, `dist`, `build`, `.turbo`, `coverage` accumulate.
- Multiple lockfile-mismatched copies under monorepo `apps/*` when not using a shared workspace.

Required rule:
- Prefer workspace tooling (pnpm/yarn workspaces) so `node_modules` is hoisted, not duplicated.
- Disposable: `.next`, `dist`, `build`, `.turbo`, `coverage`, local test snapshots.
- Durable: source, `package.json`, lockfile, committed assets required at runtime.

## 5.4 Rust / Tauri Projects
Recurring observation:
- `target/` directories at multiple GB per project.
- `src-tauri/target` + duplicate `target` in workspace root.

Required rule:
- `target/` is regenerable; safe to delete when inactive.
- `Cargo.lock` stays unless project policy explicitly allows regeneration.
- After release-build, materialize step is mandatory (see [[LESSONS_LEARNED.md]] §3.2).

## 5.5 Archive / Learning / Backup Directories
Recurring observation:
- Educational / archive content, screenshot backups, chat exports accumulate silently.
- Single large data files (`*.csv`, `*.zip`) sit unreviewed.
- `__pycache__` and similar remnants stay forever.

Required rule:
- Archived learning material gets compressed, moved out of active `~/Desktop/Projects/`, or tagged as cold storage.
- Backup directories get a quarterly review and a retention date.

# 6. Non-Negotiable Hygiene Rules
1. No duplicate large binaries inside active repos.
2. No release-validation dump remains without retention date.
3. No project may store disposable outputs beside source without a clear folder contract.
4. Inactive mobile/native build dependencies must be removable in under 5 minutes.
5. A project is not considered clean if it contains regenerable folders older than the current work cycle.
6. Before starting new work, remove stale outputs from the previous loop unless actively needed.

# 7. Canonical Folder Contract
Use the same folder semantics everywhere.

Inside project root:
- `src/`, `lib/`, `app/`, `docs/` -> durable
- `scripts/` -> durable
- `artifacts/current/` -> temporary, tied to active milestone only
- `artifacts/archive/` -> explicitly retained outputs with date and reason
- `tmp/` -> disposable
- `out/`, `build/`, `dist/` -> disposable

Outside project roots:
- `~/DeveloperAssets/models/` -> canonical shared model store
- `~/DeveloperAssets/datasets/` -> canonical shared dataset store
- `~/DeveloperAssets/releases/` -> exported binaries worth keeping
- `~/DeveloperArchives/` -> cold storage for paused/legacy projects

Rule:
- Large binaries belong outside repos by default.
- Repos should reference them, not duplicate them.

# 8. Cleanup Cadence
## 8.1 After every focused build session
Run a 2-minute hygiene pass:
- stop dev servers you no longer use
- close emulators/simulators
- remove obviously stale `tmp`, `out`, `dist`, `coverage`
- decide whether new artifacts are source-of-truth or disposable
- move one-off exports out of repo root

## 8.2 Weekly
Run a 10-minute audit:
- check top directories by size
- check for duplicate model files
- check for inactive `Pods`, `.dart_tool`, `target`, `.next`, `build`
- check for old release-validation output
- check for paused projects that should move to archive storage

## 8.3 Before archiving or pausing a project
- delete rebuildable folders
- keep only source, lockfiles, docs, essential assets
- export any important binaries to a central archive
- record how to rebuild from clean state

# 8.4 For all future projects at creation time
Before implementation scales, establish:
- one canonical home for shared heavy assets
- one disposable folder contract: `tmp/`, `out/`, `build/`, `dist`
- one archive contract for retained exports and milestone artifacts
- one rebuild note describing what can be safely deleted and how to recreate it
- one session-close rule that forces a hygiene pass before task completion

# 9. Operational Checklist for AI-Assisted Development
Whenever an agent continues work on a project, enforce this sequence:
1. Inspect current project size and top heavy subfolders.
2. Classify new files as `source`, `artifact`, `cache`, or `archive`.
3. Keep generated outputs out of tracked source paths unless truly required.
4. Before ending the session, remove disposable outputs created during the task.
5. If a file exceeds 100M, force a keep/delete/archive decision immediately.
6. If the same binary exists twice, collapse to one canonical copy.

# 9.1 Generic Orchestration Plan For Every Future Project
Phase 1 - Project bootstrap
- identify stack: web, mobile, Python, Tauri, local AI, mixed
- define disposable outputs before first build
- define where large assets live before first large download
- document cleanup-safe folders in project docs

Phase 2 - Active implementation
- keep source and generated outputs physically separated
- refuse silent growth in `artifacts/`, `out/`, `build/`, `dist`, `tmp`
- audit large files at the moment they appear, not weeks later
- stop idle watchers, emulators, and dev servers at task end

Phase 3 - Pre-close hardening
- remove regenerable residue created during the task
- verify no duplicate heavy assets were introduced
- verify archive-worthy exports were moved out of active paths
- log any intentional exceptions and why they remain

Phase 4 - Pause or archive
- strip project to rebuildable clean state
- move retained binaries and datasets to shared storage or cold archive
- keep only durable source-of-truth inside the project root

Success condition:
- project can be resumed quickly
- machine stays responsive
- agents do not need to rediscover what is safe to delete

# 10. Stack-Specific Delete Rules
## Node / Web
Usually safe to remove when inactive:
- `node_modules`
- `.next`
- `dist`
- `coverage`
- `.turbo`
- local test snapshots not intentionally retained

## Python
Usually safe to remove when inactive:
- `__pycache__`
- `.pytest_cache`
- `.mypy_cache`
- `.venv` only if rebuild instructions are clear

## Flutter / iOS
Usually safe to remove when inactive:
- `.dart_tool`
- `ios/Pods`
- local derived build outputs

Use caution:
- keep `Podfile.lock` and `pubspec.lock`
- do not delete committed iOS project files

## Rust / Tauri
Usually safe to remove when inactive:
- `target`
- local bundle outputs in `src-tauri/target` or export directories

Use caution:
- do not delete `Cargo.lock` unless the project policy explicitly allows it

## Local AI / Model Work
Never duplicate these casually:
- `.bin`
- `.gguf`
- `.ggml*`
- large `.onnx`
- large `.safetensors`

Rule:
- one canonical store
- project-local copies only if automation truly requires local relative paths

# 11. Decision Framework: Keep vs Delete vs Move
Keep if:
- cannot be recreated cheaply
- is source-of-truth
- is needed for current milestone

Delete if:
- tool-generated
- older than the current work loop
- not referenced by current build or release

Move out of repo if:
- file is large and intentional
- file is shared by multiple projects
- file is useful but not needed in the active source tree

# 12. Commands for Manual Audits
Disk overview:
```bash
du -sh ~/Desktop/Projects/* | sort -hr
```

Find heavy artifacts:
```bash
find ~/Desktop/Projects -type f -size +100M -print
```

Find common disposable folders:
```bash
find ~/Desktop/Projects \(
  -name node_modules -o -name .next -o -name dist -o -name build -o \
  -name .turbo -o -name coverage -o -name .dart_tool -o -name Pods -o \
  -name target -o -name __pycache__ -o -name .pytest_cache
\) -type d -prune -print
```

Find duplicate model families:
```bash
find ~/Desktop/Projects ~/DeveloperAssets -type f \(
  -name '*.bin' -o -name '*.gguf' -o -name '*.onnx' -o -name '*.safetensors'
\) -print
```

# 13. Standing Workspace-Level Priorities
Apply these in order to any multi-project workspace.

Priority 1 — Shared heavy-asset store:
- Establish a single canonical heavy-asset directory outside repos (`~/DeveloperAssets/models/`, `~/DeveloperAssets/datasets/`, `~/DeveloperAssets/releases/`).
- Migrate any project carrying duplicated AI models / large datasets / built release artefacts to reference the shared store via symlink or env-var path.

Priority 2 — Validation / QA artefact retention:
- Any `artifacts/release-validation/`, `qa-output/`, `test-snapshots/` directory needs an explicit retention date or it gets purged on the weekly audit.
- Untagged content older than two release cycles is disposable.

Priority 3 — Disposable native build state:
- Mobile (`Pods`, `.dart_tool`, `.gradle`), Rust (`target`), Node (`node_modules`, `.next`, `dist`) are disposable when their project is idle.
- Clean them as part of the §8.3 pre-pause routine.

Priority 4 — Archive / backup discipline:
- Chat backups, screenshot exports, learning material get a quarterly review and a retention date.
- Cold storage moves outside the active `Projects` tree.

Priority 5 — Greenfield projects:
- Standardize new projects around the canonical folder contract (§7): `tmp/`, `artifacts/current/`, `artifacts/archive/`, shared asset folders outside the repo.
- Bootstrap-time decisions are cheap; retrofit hygiene is expensive.

# 14. Agent Prompt Snippet
Use this instruction at the start or end of implementation tasks:

"Before finishing, perform a resource hygiene pass: identify generated files, caches, duplicate binaries, and stale artifacts created or touched during the task. Remove disposable outputs, move intentional heavy assets out of the repo if appropriate, and report what was kept, deleted, or deferred."

# 15. Hard Truths
- Most local slowdown blamed on "the system" is actually undisciplined artifact retention plus too many concurrent dev processes.
- Reinstalling macOS does not fix a workflow that keeps duplicating binary assets and leaving build outputs behind.
- If large artifacts are not assigned a lifecycle, they become permanent by accident.

# 16. Minimum Standard Going Forward
A project is considered healthy only if:
- heavy assets have an explicit home
- disposable outputs are disposable in practice
- archive material is separated from active work
- every session ends with a cleanup decision, not silent accumulation
