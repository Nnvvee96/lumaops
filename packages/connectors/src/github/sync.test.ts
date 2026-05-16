/**
 * S4C — GitHub sync golden-file tests.
 *
 * Pattern: feed a fixed JSON payload into the adapter, assert the
 * normalised NormalizedEvent shape. Per TDD §7 + IMPLEMENTATION_PLAN
 * §S4C DoD: 1 test per event kind + 1 happy-path full sync, plus
 * pagination / abort / partial-failure verification.
 */

import { describe, expect, it } from "vitest";

import { syncGitHub, parseSyncConfig } from "./sync";

// ============================================================
// Helpers
// ============================================================

const WORKSPACE_ID = "11111111-1111-1111-1111-111111111111";
const PRODUCT_ID = "22222222-2222-2222-2222-222222222222";

const baseConfig = {
  owner_repo: "Nnvvee96/NOESIS",
  workspace_id: WORKSPACE_ID,
  product_id: PRODUCT_ID,
  token: "ghp_test123",
};

interface MockResponse {
  status: number;
  body?: unknown;
  headers?: Record<string, string>;
}

/**
 * Match by pathname + a path-suffix index. Each entry can supply multiple
 * sequential responses for the same path — used for pagination tests.
 */
function mockFetch(
  byPath: Record<string, MockResponse | MockResponse[]>,
): typeof globalThis.fetch {
  const counters = new Map<string, number>();
  return (async (input: Request | URL | string): Promise<Response> => {
    const url = typeof input === "string" ? input : input.toString();
    const parsed = new URL(url);
    // Match the bare pathname OR pathname+query for full-URL fixtures.
    const key =
      byPath[parsed.pathname + parsed.search] !== undefined
        ? parsed.pathname + parsed.search
        : parsed.pathname;
    const entry = byPath[key];
    if (entry === undefined) {
      throw new Error(`mockFetch: unexpected URL ${url}`);
    }
    let r: MockResponse;
    if (Array.isArray(entry)) {
      const i = counters.get(key) ?? 0;
      const item = entry[i];
      if (!item) throw new Error(`mockFetch: ran out of responses for ${key}`);
      r = item;
      counters.set(key, i + 1);
    } else {
      r = entry;
    }
    return new Response(JSON.stringify(r.body ?? {}), {
      status: r.status,
      headers: new Headers(r.headers ?? {}),
    });
  }) as unknown as typeof globalThis.fetch;
}

/** All four endpoints — returns an empty array unless overridden. */
function defaultEmpty(): Record<string, MockResponse> {
  return {
    "/repos/Nnvvee96/NOESIS/releases": { status: 200, body: [] },
    "/repos/Nnvvee96/NOESIS/issues": { status: 200, body: [] },
    "/repos/Nnvvee96/NOESIS/pulls": { status: 200, body: [] },
    "/repos/Nnvvee96/NOESIS/commits": { status: 200, body: [] },
  };
}

// ============================================================
// parseSyncConfig
// ============================================================

describe("parseSyncConfig", () => {
  it("accepts a complete config", () => {
    const r = parseSyncConfig(baseConfig);
    expect(r.ok).toBe(true);
  });

  it("rejects missing workspace_id", () => {
    const { workspace_id: _w, ...rest } = baseConfig;
    const r = parseSyncConfig(rest);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.message).toMatch(/workspace_id/);
  });

  it("rejects non-uuid product_id", () => {
    const r = parseSyncConfig({ ...baseConfig, product_id: "not-a-uuid" });
    expect(r.ok).toBe(false);
  });

  it("rejects bad owner_repo format", () => {
    const r = parseSyncConfig({ ...baseConfig, owner_repo: "no-slash" });
    expect(r.ok).toBe(false);
  });
});

// ============================================================
// Schema-drift handling at the boundary
// ============================================================

describe("syncGitHub — config validation", () => {
  it("returns schema_drift error and empty events for bad config", async () => {
    const since = new Date("2026-05-01T00:00:00Z");
    const result = await syncGitHub({}, since, { fetch: mockFetch({}) });
    expect(result.events).toEqual([]);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.kind).toBe("schema_drift");
    expect(result.next_since).toEqual(since); // cursor untouched on hard failure
  });
});

// ============================================================
// Per-event-kind goldens
// ============================================================

describe("syncGitHub — release_published", () => {
  it("emits one release_published per release with published_at in window", async () => {
    const since = new Date("2026-05-01T00:00:00Z");
    const fetch = mockFetch({
      ...defaultEmpty(),
      "/repos/Nnvvee96/NOESIS/releases": {
        status: 200,
        body: [
          {
            id: 1,
            tag_name: "v0.2.0",
            name: "v0.2.0 — beta",
            draft: false,
            prerelease: true,
            published_at: "2026-05-10T12:00:00Z",
            assets: [],
          },
          {
            id: 2,
            tag_name: "v0.1.0",
            name: null,
            draft: false,
            prerelease: false,
            published_at: "2026-04-28T12:00:00Z", // BEFORE since
            assets: [],
          },
          {
            id: 3,
            tag_name: "v0.3.0-draft",
            name: null,
            draft: true,
            prerelease: false,
            published_at: null, // draft, no publish event
            assets: [],
          },
        ],
      },
    });
    const result = await syncGitHub(baseConfig, since, { fetch });
    const releases = result.events.filter(
      (e) => e.event_name === "release_published",
    );
    expect(releases).toHaveLength(1);
    expect(releases[0]?.source_event_id).toBe("release:1");
    expect(releases[0]?.properties).toMatchObject({
      tag_name: "v0.2.0",
      prerelease: true,
      draft: false,
    });
    expect(releases[0]?.source).toBe("github");
    expect(releases[0]?.workspace_id).toBe(WORKSPACE_ID);
    expect(releases[0]?.product_id).toBe(PRODUCT_ID);
  });
});

describe("syncGitHub — release_asset_uploaded", () => {
  it("emits one asset-uploaded event per release asset", async () => {
    const since = new Date("2026-05-01T00:00:00Z");
    const fetch = mockFetch({
      ...defaultEmpty(),
      "/repos/Nnvvee96/NOESIS/releases": {
        status: 200,
        body: [
          {
            id: 1,
            tag_name: "v0.2.0",
            name: "v0.2.0",
            draft: false,
            prerelease: false,
            published_at: "2026-05-10T12:00:00Z",
            assets: [
              {
                id: 100,
                name: "NOESIS.dmg",
                size: 12345678,
                download_count: 17,
                created_at: "2026-05-10T12:30:00Z",
              },
              {
                id: 101,
                name: "NOESIS.exe",
                size: 9999999,
                download_count: 4,
                created_at: "2026-05-10T12:31:00Z",
              },
            ],
          },
        ],
      },
    });
    const result = await syncGitHub(baseConfig, since, { fetch });
    const assets = result.events.filter(
      (e) => e.event_name === "release_asset_uploaded",
    );
    expect(assets).toHaveLength(2);
    expect(assets[0]?.properties).toMatchObject({
      asset_name: "NOESIS.dmg",
      size_bytes: 12345678,
      download_count: 17,
      release_tag: "v0.2.0",
    });
    expect(assets[1]?.source_event_id).toBe("release_asset:101");
  });
});

describe("syncGitHub — support_ticket_created", () => {
  it("emits only for labelled issues, filtering PRs from /issues", async () => {
    const since = new Date("2026-05-01T00:00:00Z");
    const fetch = mockFetch({
      ...defaultEmpty(),
      "/repos/Nnvvee96/NOESIS/issues": {
        status: 200,
        body: [
          {
            id: 10,
            number: 42,
            title: "Crash on startup",
            state: "open",
            labels: [{ id: 1, name: "bug" }],
            created_at: "2026-05-10T00:00:00Z",
            updated_at: "2026-05-12T00:00:00Z",
          },
          {
            id: 11,
            number: 43,
            title: "PR via /issues endpoint",
            state: "open",
            labels: [{ id: 2, name: "bug" }],
            pull_request: { url: "https://example.com/pr" },
            created_at: "2026-05-10T00:00:00Z",
            updated_at: "2026-05-10T00:00:00Z",
          },
          {
            id: 12,
            number: 44,
            title: "Feature request",
            state: "open",
            labels: [{ id: 3, name: "enhancement" }],
            created_at: "2026-05-11T00:00:00Z",
            updated_at: "2026-05-11T00:00:00Z",
          },
          {
            id: 13,
            number: 45,
            title: "User needs help",
            state: "open",
            labels: [{ id: 4, name: "Support" }], // case-insensitive
            created_at: "2026-05-12T00:00:00Z",
            updated_at: "2026-05-12T00:00:00Z",
          },
        ],
      },
    });
    const result = await syncGitHub(baseConfig, since, { fetch });
    const tickets = result.events.filter(
      (e) => e.event_name === "support_ticket_created",
    );
    expect(tickets).toHaveLength(2);
    expect(tickets.map((t) => t.source_event_id).sort()).toEqual([
      "issue:10",
      "issue:13",
    ]);
  });
});

describe("syncGitHub — pr_merged", () => {
  it("emits only for PRs with merged_at >= since", async () => {
    const since = new Date("2026-05-01T00:00:00Z");
    const fetch = mockFetch({
      ...defaultEmpty(),
      "/repos/Nnvvee96/NOESIS/pulls": {
        status: 200,
        body: [
          {
            id: 1,
            number: 9,
            title: "Add S4A",
            state: "closed",
            merged_at: "2026-05-10T08:00:00Z",
            created_at: "2026-05-08T00:00:00Z",
            updated_at: "2026-05-10T08:00:00Z",
          },
          {
            id: 2,
            number: 10,
            title: "Closed without merging",
            state: "closed",
            merged_at: null,
            created_at: "2026-05-09T00:00:00Z",
            updated_at: "2026-05-09T12:00:00Z",
          },
          {
            id: 3,
            number: 8,
            title: "Old PR before window",
            state: "closed",
            merged_at: "2026-04-20T08:00:00Z",
            created_at: "2026-04-19T00:00:00Z",
            updated_at: "2026-04-20T08:00:00Z",
          },
        ],
      },
    });
    const result = await syncGitHub(baseConfig, since, { fetch });
    const merged = result.events.filter((e) => e.event_name === "pr_merged");
    expect(merged).toHaveLength(1);
    expect(merged[0]?.source_event_id).toBe("pr:1");
    expect(merged[0]?.properties).toMatchObject({ number: 9, title: "Add S4A" });
  });
});

describe("syncGitHub — commit_pushed daily rollup", () => {
  it("collapses N same-day commits to one event with properties.count = N", async () => {
    const since = new Date("2026-05-01T00:00:00Z");
    const fetch = mockFetch({
      ...defaultEmpty(),
      "/repos/Nnvvee96/NOESIS/commits": {
        status: 200,
        body: [
          {
            sha: "a1",
            commit: {
              message: "x",
              author: { date: "2026-05-10T08:00:00Z" },
            },
          },
          {
            sha: "a2",
            commit: {
              message: "y",
              author: { date: "2026-05-10T18:00:00Z" },
            },
          },
          {
            sha: "b1",
            commit: {
              message: "z",
              author: { date: "2026-05-11T09:00:00Z" },
            },
          },
        ],
      },
    });
    const result = await syncGitHub(baseConfig, since, { fetch });
    const commits = result.events.filter(
      (e) => e.event_name === "commit_pushed",
    );
    expect(commits).toHaveLength(2);
    const may10 = commits.find(
      (e) => e.source_event_id === "commits:Nnvvee96/NOESIS:2026-05-10",
    );
    const may11 = commits.find(
      (e) => e.source_event_id === "commits:Nnvvee96/NOESIS:2026-05-11",
    );
    expect(may10?.properties).toEqual({ count: 2 });
    expect(may11?.properties).toEqual({ count: 1 });
    // Each rolled-up event is anchored at 00:00:00 UTC on its day.
    expect(may10?.occurred_at.toISOString()).toBe("2026-05-10T00:00:00.000Z");
  });
});

// ============================================================
// Happy-path full sync — all sources together
// ============================================================

describe("syncGitHub — full happy-path sync", () => {
  it("merges events across all 4 sources and stamps next_since at start time", async () => {
    const since = new Date("2026-05-01T00:00:00Z");
    const startedAt = new Date("2026-05-15T10:00:00Z");
    const fetch = mockFetch({
      "/repos/Nnvvee96/NOESIS/releases": {
        status: 200,
        body: [
          {
            id: 1,
            tag_name: "v0.2.0",
            name: "v0.2.0",
            draft: false,
            prerelease: false,
            published_at: "2026-05-10T12:00:00Z",
            assets: [
              {
                id: 100,
                name: "NOESIS.dmg",
                size: 1,
                download_count: 0,
                created_at: "2026-05-10T12:00:00Z",
              },
            ],
          },
        ],
      },
      "/repos/Nnvvee96/NOESIS/issues": {
        status: 200,
        body: [
          {
            id: 10,
            number: 1,
            title: "bug",
            state: "open",
            labels: [{ id: 1, name: "bug" }],
            created_at: "2026-05-08T00:00:00Z",
            updated_at: "2026-05-08T00:00:00Z",
          },
        ],
      },
      "/repos/Nnvvee96/NOESIS/pulls": {
        status: 200,
        body: [
          {
            id: 1,
            number: 9,
            title: "PR",
            state: "closed",
            merged_at: "2026-05-09T08:00:00Z",
            created_at: "2026-05-09T00:00:00Z",
            updated_at: "2026-05-09T08:00:00Z",
          },
        ],
      },
      "/repos/Nnvvee96/NOESIS/commits": {
        status: 200,
        body: [
          {
            sha: "a1",
            commit: { message: "x", author: { date: "2026-05-10T08:00:00Z" } },
          },
        ],
      },
    });
    const result = await syncGitHub(baseConfig, since, {
      fetch,
      now: () => startedAt,
    });

    const kinds = result.events.map((e) => e.event_name).sort();
    expect(kinds).toEqual([
      "commit_pushed",
      "pr_merged",
      "release_asset_uploaded",
      "release_published",
      "support_ticket_created",
    ]);
    expect(result.errors).toEqual([]);
    expect(result.next_since).toEqual(startedAt);
    expect(result.metrics_pull).toEqual([]);
    // Every event carries source: github + workspace/product context.
    for (const ev of result.events) {
      expect(ev.source).toBe("github");
      expect(ev.workspace_id).toBe(WORKSPACE_ID);
      expect(ev.product_id).toBe(PRODUCT_ID);
    }
  });
});

// ============================================================
// Pagination (Link header follow)
// ============================================================

describe("syncGitHub — Link header pagination", () => {
  it("follows rel=next until exhausted", async () => {
    const since = new Date("2026-05-01T00:00:00Z");
    const fetch = mockFetch({
      ...defaultEmpty(),
      "/repos/Nnvvee96/NOESIS/issues": [
        {
          status: 200,
          headers: {
            Link: `<https://api.github.com/repos/Nnvvee96/NOESIS/issues?page=2>; rel="next", <https://api.github.com/repos/Nnvvee96/NOESIS/issues?page=2>; rel="last"`,
          },
          body: [
            {
              id: 10,
              number: 1,
              title: "p1",
              state: "open",
              labels: [{ id: 1, name: "bug" }],
              created_at: "2026-05-10T00:00:00Z",
              updated_at: "2026-05-10T00:00:00Z",
            },
          ],
        },
      ],
      "/repos/Nnvvee96/NOESIS/issues?page=2": [
        {
          status: 200,
          headers: {}, // no Link header — pagination ends
          body: [
            {
              id: 11,
              number: 2,
              title: "p2",
              state: "open",
              labels: [{ id: 1, name: "bug" }],
              created_at: "2026-05-11T00:00:00Z",
              updated_at: "2026-05-11T00:00:00Z",
            },
          ],
        },
      ],
    });
    const result = await syncGitHub(baseConfig, since, { fetch });
    const tickets = result.events.filter(
      (e) => e.event_name === "support_ticket_created",
    );
    expect(tickets.map((t) => t.source_event_id).sort()).toEqual([
      "issue:10",
      "issue:11",
    ]);
  });
});

// ============================================================
// Per-source error isolation
// ============================================================

describe("syncGitHub — one source failing", () => {
  it("keeps other sources' events and reports the failure as ConnectorError", async () => {
    const since = new Date("2026-05-01T00:00:00Z");
    const fetch = mockFetch({
      ...defaultEmpty(),
      "/repos/Nnvvee96/NOESIS/issues": {
        status: 403,
        headers: { "X-RateLimit-Remaining": "0" },
        body: { message: "API rate limit exceeded" },
      },
      "/repos/Nnvvee96/NOESIS/releases": {
        status: 200,
        body: [
          {
            id: 1,
            tag_name: "v0.2.0",
            name: null,
            draft: false,
            prerelease: false,
            published_at: "2026-05-10T12:00:00Z",
            assets: [],
          },
        ],
      },
    });
    const result = await syncGitHub(baseConfig, since, { fetch });
    expect(
      result.events.some((e) => e.event_name === "release_published"),
    ).toBe(true);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.kind).toBe("rate_limit");
    expect(result.errors[0]?.affected_scope).toBe("issues");
  });
});

// ============================================================
// Abort
// ============================================================

describe("syncGitHub — abort signal", () => {
  it("each source surfaces an abort as a per-scope error and the sync still returns", async () => {
    const controller = new AbortController();
    const since = new Date("2026-05-01T00:00:00Z");
    // Pre-aborted so the first fetch sees it.
    controller.abort();
    const fetch = mockFetch(defaultEmpty());
    const result = await syncGitHub(baseConfig, since, {
      fetch,
      signal: controller.signal,
    });
    expect(result.events).toEqual([]);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors.every((e) => e.kind === "network")).toBe(true);
  });
});
