# Connector State-Cycle Test Template

**Status:** locked template (TDD §7, [IMPLEMENTATION_PLAN.md](../IMPLEMENTATION_PLAN.md) §S4G).
**Scope:** every connector landing under `packages/connectors/<provider>/` MUST ship a state-cycle test that follows this shape. Phase 6 connectors (Cloudflare, Stripe, tracking-api, app-telemetry, support, email, custom) copy this template directly.

## Why this test exists

Unit tests prove that individual functions behave under controlled inputs. The state-cycle test proves that the **whole pipeline** — adapter → runner → state machine → DB → UI — reaches the right state for every real-world scenario the operator will actually encounter. Without it, individual pieces can be green while the system is silently broken.

The five scenarios that matter:

| # | Scenario                                          | Expected terminal state |
|---|---------------------------------------------------|--------------------------|
| 1 | Fresh integration, valid token, first sync        | `live`                   |
| 2 | Subsequent sync within freshness window           | `live` (events deduped)  |
| 3 | Last sync older than freshness threshold          | `stale`                  |
| 4 | Token revoked / 401 mid-session                   | `error`                  |
| 5 | Operator pastes new token + clicks Sync now       | `live` again             |

Any state machine that can't run all five back-to-back on a single integration row has a hole.

## Two test layers — pick both

State-cycle verification needs both layers; one alone is insufficient.

### Layer 1 — Mocked HTTP (mandatory, runs on every PR)

Drives the runner against `mockFetch` from the connector's existing unit tests. No external network, no secret required. Catches:

- State-machine regressions (e.g. `syncing → live` no longer happens)
- Persistence regressions (e.g. events not deduped on second sync)
- Runner regressions (e.g. `pending` no longer flips to `syncing`)

Runs as a normal `vitest` file under `packages/connectors/<provider>/state-cycle.test.ts`. Adds **zero** maintenance burden to CI.

### Layer 2 — Real API E2E (mandatory, gated on a secret)

Drives the same orchestration against the real provider. Catches:

- Schema-drift the unit tests can't see (provider changed a field)
- Auth flow regressions (PAT scopes silently broken)
- Rate-limit handling on real budgets

Runs only when `LUMAOPS_<PROVIDER>_TEST_TOKEN` is present in the workflow environment. Locally and in PRs from forks it's absent → test skips with a clear message. Gated this way so:

- PRs from contributors without secrets still go green
- No secret ever lands in a repo file or PR log
- The maintainer's `main`-branch CI catches drift before users do

## File layout

```
packages/connectors/<provider>/
├── adapter.ts                      # ConnectorAdapter implementation
├── adapter.test.ts                 # unit tests (S<x>B / S<x>C)
├── errors.ts                       # classifier (S<x>D)
├── errors.test.ts
├── sync.ts                         # event-emitting sync (S<x>C)
├── sync.test.ts                    # golden-file unit tests
├── schemas.ts                      # Zod boundary
├── state-cycle.test.ts             # ← LAYER 1: mocked-HTTP state cycle
└── state-cycle.e2e.test.ts         # ← LAYER 2: real-API, gated on secret
```

The `.e2e.test.ts` suffix lets `vitest` config exclude E2E files from the default run without ceremony.

## Layer-1 skeleton (mocked HTTP, mandatory)

```ts
/**
 * State-cycle test — drives the runner through all five operator
 * scenarios with mocked HTTP. No external network required.
 *
 * Convention: keep this test self-contained. Importing test helpers
 * across connector boundaries makes future Phase 6 PRs harder to
 * review.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { runSync, MutableAdapterRegistry } from "@lumaops/core";
import type { Integration, SyncStore, NormalizedEvent } from "@lumaops/core";

import { createGitHubAdapter } from "./adapter"; // ← swap per provider

// ============================================================
// 1) Test doubles
// ============================================================

const INTEGRATION_ID  = "33333333-3333-3333-3333-333333333333";
const WORKSPACE_ID    = "11111111-1111-1111-1111-111111111111";
const PRODUCT_ID      = "22222222-2222-2222-2222-222222222222";

function makeRow(patch: Partial<Integration> = {}): Integration {
  return {
    id: INTEGRATION_ID,
    workspaceId: WORKSPACE_ID,
    productId: PRODUCT_ID,
    provider: "github",                // ← swap per provider
    variant: "public",
    displayName: "GitHub · test",
    state: "pending",
    credentialStatus: "present",
    credentialFingerprint: "sha:abc",
    scopes: ["repo", "read:user"],
    freshnessThresholdSeconds: 900,
    lastSyncAt: null,
    lastSyncError: null,
    config: { owner_repo: "octocat/Hello-World" },
    createdAt: new Date("2026-05-01T00:00:00Z"),
    updatedAt: new Date("2026-05-01T00:00:00Z"),
    ...patch,
  } as Integration;
}

function makeStore(initial: Integration): { store: SyncStore; row: () => Integration; events: () => NormalizedEvent[] } {
  let current: Integration = { ...initial };
  const inserted: NormalizedEvent[] = [];
  const store: SyncStore = {
    async loadIntegration(id) { return id === current.id ? current : null; },
    async updateIntegrationState(id, patch) {
      if (id !== current.id) return;
      current = {
        ...current,
        state: patch.state,
        lastSyncAt:    patch.lastSyncAt    !== undefined ? patch.lastSyncAt    : current.lastSyncAt,
        lastSyncError: patch.lastSyncError !== undefined ? patch.lastSyncError : current.lastSyncError,
      };
    },
    async insertEvents(events) {
      const known = new Set(inserted.map((e) => e.source_event_id).filter(Boolean));
      let n = 0, dup = 0;
      for (const ev of events) {
        if (ev.source_event_id && known.has(ev.source_event_id)) dup += 1;
        else { n += 1; inserted.push(ev); if (ev.source_event_id) known.add(ev.source_event_id); }
      }
      return { attempted: events.length, inserted: n, deduped: dup };
    },
    async listIntegrations() { return [current]; },
  };
  return { store, row: () => current, events: () => inserted };
}

// ============================================================
// 2) Mock fetch — swap per provider
// ============================================================

interface MockResponse { status: number; body?: unknown; headers?: Record<string, string>; }

function mockFetch(byPath: Record<string, MockResponse>): typeof globalThis.fetch {
  return (async (input: Request | URL | string): Promise<Response> => {
    const url = typeof input === "string" ? input : input.toString();
    const path = new URL(url).pathname;
    const r = byPath[path];
    if (!r) throw new Error(`mockFetch: unexpected ${path}`);
    return new Response(JSON.stringify(r.body ?? {}), {
      status: r.status,
      headers: new Headers(r.headers ?? {}),
    });
  }) as unknown as typeof globalThis.fetch;
}

const HAPPY_FETCH = mockFetch({
  "/repos/octocat/Hello-World/releases": { status: 200, body: [/* one release */] },
  "/repos/octocat/Hello-World/issues":   { status: 200, body: [] },
  "/repos/octocat/Hello-World/pulls":    { status: 200, body: [] },
  "/repos/octocat/Hello-World/commits":  { status: 200, body: [] },
});

const REVOKED_FETCH = mockFetch({
  "/repos/octocat/Hello-World/releases": { status: 401, body: { message: "Bad credentials" } },
  "/repos/octocat/Hello-World/issues":   { status: 401, body: { message: "Bad credentials" } },
  "/repos/octocat/Hello-World/pulls":    { status: 401, body: { message: "Bad credentials" } },
  "/repos/octocat/Hello-World/commits":  { status: 401, body: { message: "Bad credentials" } },
});

// ============================================================
// 3) The cycle — five sequential assertions on one row
// ============================================================

describe("github connector — state cycle", () => {
  it("cycles pending → live → live (deduped) → stale → error → live", async () => {
    const { store, row, events } = makeStore(makeRow());
    const registry = new MutableAdapterRegistry();
    let currentFetch = HAPPY_FETCH;
    registry.register(createGitHubAdapter({ fetch: (...args) => currentFetch(...args) }));
    let currentToken: string | null = "ghp_valid";

    // (1) First sync — pending → live
    let r = await runSync(INTEGRATION_ID, { registry, store, resolveToken: () => currentToken });
    expect(r.ok).toBe(true);
    expect(row().state).toBe("live");
    expect(events().length).toBeGreaterThan(0);
    const firstEventCount = events().length;

    // (2) Re-sync inside freshness window — still live, events deduped
    r = await runSync(INTEGRATION_ID, { registry, store, resolveToken: () => currentToken });
    expect(row().state).toBe("live");
    expect(events().length).toBe(firstEventCount); // ON CONFLICT DO NOTHING

    // (3) Force-stale by ageing last_sync_at — UI-side effectiveState
    //     flips, runner still treats the row as syncable.
    //     (DB row stays "live"; effectiveState() derives stale on read.)
    //     Verified directly:
    const ageNow = new Date(row().lastSyncAt!.getTime() + 24 * 3600 * 1000);
    // …assert via integrationFreshness or effectiveState that kind === "stale"…

    // (4) Token revoked — currentFetch swaps to all-401
    currentFetch = REVOKED_FETCH;
    r = await runSync(INTEGRATION_ID, { registry, store, resolveToken: () => currentToken });
    expect(r.ok).toBe(false);
    expect(row().state).toBe("error");
    expect(row().lastSyncError).toMatch(/auth|Bad credentials/i);

    // (5) Operator pastes new token → currentFetch swaps back → sync recovers
    currentFetch = HAPPY_FETCH;
    currentToken = "ghp_new_token";
    r = await runSync(INTEGRATION_ID, { registry, store, resolveToken: () => currentToken });
    expect(r.ok).toBe(true);
    expect(row().state).toBe("live");
  });
});
```

## Layer-2 skeleton (real API, gated)

```ts
/**
 * Real-API state-cycle E2E. Gated on `LUMAOPS_<PROVIDER>_TEST_TOKEN`.
 * Skip with a visible message when the secret is absent so PRs from
 * forks (and local dev without a token) stay green.
 */
import { describe, it, expect } from "vitest";

const TOKEN = process.env["LUMAOPS_GITHUB_TEST_TOKEN"];

describe.skipIf(!TOKEN)("github connector — real-API state cycle", () => {
  // Test repo MUST be a public, low-traffic, maintainer-controlled repo.
  // Do NOT point at customer data or anything that mutates.
  const TEST_REPO = "Nnvvee96/lumaops-test-fixtures";

  it("validates a real PAT and pulls at least one release", async () => {
    // (run a constrained subset of the cycle — usually scenarios 1 + 4,
    //  to avoid burning rate budget on every PR)
  });
});
```

Use `describe.skipIf` (vitest ≥ 0.34) rather than `if (!TOKEN) return;` so the skip surfaces in the test report — a silent `it.skip` is too easy to overlook.

## Wiring into CI

The required-checks list in [IMPLEMENTATION_PLAN.md §1.2](../IMPLEMENTATION_PLAN.md#12-cicd-pipeline) already includes `pnpm -r test` — Layer 1 runs automatically. For Layer 2:

1. Add the secret on GitHub: **Settings → Secrets and variables → Actions → New repository secret**, name `LUMAOPS_GITHUB_TEST_TOKEN`.
2. In the relevant workflow job, expose it as a workflow-scoped env:

```yaml
- name: Tests
  env:
    LUMAOPS_GITHUB_TEST_TOKEN: ${{ secrets.LUMAOPS_GITHUB_TEST_TOKEN }}
  run: pnpm -r test
```

3. Optionally pin the E2E file behind its own job that only runs on `main` push (skip on PRs from forks):

```yaml
e2e:
  if: github.event_name == 'push' && github.ref == 'refs/heads/main'
  env:
    LUMAOPS_GITHUB_TEST_TOKEN: ${{ secrets.LUMAOPS_GITHUB_TEST_TOKEN }}
  run: pnpm -r test -- state-cycle.e2e
```

The secret **never** appears in workflow files, log output, or repo content — GitHub redacts it on stdout, and our adapter's fingerprinting ensures the raw value never leaves the adapter boundary either ([LL §10.8], [LL §13.5]).

## What this template intentionally does NOT cover

- **Migrations.** State-cycle tests assume the DB schema is current. Migration tests live in `packages/core/db/migrations.test.ts`.
- **Cross-provider scenarios.** When a Stripe failure should not affect a GitHub integration — that's the runner's responsibility and tested in `packages/core/sync/runner.test.ts`.
- **Per-event-kind correctness.** The golden-file `sync.test.ts` files already cover that. Don't duplicate.
- **UI integration.** SyncNowButton + IntegrationsRefresher are covered by web build + lint; if a future visual regression suite (Phase 5+) checks them, that suite owns the assertion, not this template.

## Checklist for a new connector (copy this when opening a Phase 6 PR)

- [ ] `state-cycle.test.ts` covers all five scenarios with mocked HTTP
- [ ] `state-cycle.e2e.test.ts` exists, gated on `LUMAOPS_<PROVIDER>_TEST_TOKEN`
- [ ] The CI workflow exposes the secret via env (workflow-scoped, not at-rest in the repo)
- [ ] The test repo (or test customer / test event source) is documented in the test file's docblock
- [ ] No raw token appears in any persisted patch — assert it inside the test
- [ ] The test's mocked-HTTP fixtures live as data inside the test file, not as separate JSON files (keeps the review surface tight)
