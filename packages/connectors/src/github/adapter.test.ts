import { describe, expect, it } from "vitest";

import { createGitHubAdapter, fingerprint, parseGitHubConfig } from "./adapter";

// ============================================================
// Mock fetch helpers
// ============================================================

interface MockResponse {
  status: number;
  body?: unknown;
  headers?: Record<string, string>;
}

function mockFetch(responses: Record<string, MockResponse>): typeof globalThis.fetch {
  return (async (input: Request | URL | string): Promise<Response> => {
    const url = typeof input === "string" ? input : input.toString();
    const path = new URL(url).pathname;
    const r = responses[path];
    if (!r) {
      throw new Error(`mockFetch: unexpected path ${path}`);
    }
    const headers = new Headers(r.headers ?? {});
    return new Response(JSON.stringify(r.body ?? {}), {
      status: r.status,
      headers,
    });
  }) as unknown as typeof globalThis.fetch;
}

const validUser = {
  login: "octocat",
  id: 1,
  name: "The Octocat",
};

const validRateLimit = {
  resources: {
    core: { limit: 5000, remaining: 4980, reset: 1779030000 },
  },
};

// ============================================================
// capabilities + identity (unchanged from S4A)
// ============================================================

describe("GitHub adapter — contract surface", () => {
  it("declares provider github / variant public", () => {
    const adapter = createGitHubAdapter();
    expect(adapter.provider).toBe("github");
    expect(adapter.variant).toBe("public");
  });

  it("returns the locked capabilities", () => {
    const caps = createGitHubAdapter().capabilities();
    expect(caps.privacy_class).toBe("hosted");
    expect(caps.required_scopes).toEqual(["repo", "read:user"]);
    expect(caps.rate_limits).toEqual([{ window: "hour", limit: 5000 }]);
  });

  it("sync still throws — lands in S4C", async () => {
    await expect(
      createGitHubAdapter().sync({}, new Date()),
    ).rejects.toThrow(/sync\(\) not yet implemented/);
  });
});

// ============================================================
// validateCredentials
// ============================================================

describe("validateCredentials", () => {
  it("returns missing when no token", async () => {
    const adapter = createGitHubAdapter({ fetch: mockFetch({}) });
    const result = await adapter.validateCredentials({});
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("missing");
      expect(result.message).toMatch(/LUMAOPS_GITHUB_TOKEN/);
    }
  });

  it("returns ok with fingerprint when /user 200 and scopes adequate", async () => {
    const adapter = createGitHubAdapter({
      fetch: mockFetch({
        "/user": {
          status: 200,
          body: validUser,
          headers: { "X-OAuth-Scopes": "repo, read:user, gist" },
        },
      }),
    });
    const result = await adapter.validateCredentials({ token: "ghp_test123" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.scopes).toEqual(["repo", "read:user", "gist"]);
      expect(result.fingerprint).toMatch(/^sha:[a-f0-9]{12}$/);
    }
  });

  it("returns ok for fine-grained PAT (empty X-OAuth-Scopes header)", async () => {
    const adapter = createGitHubAdapter({
      fetch: mockFetch({
        "/user": {
          status: 200,
          body: validUser,
          headers: {}, // fine-grained PATs return no X-OAuth-Scopes
        },
      }),
    });
    const result = await adapter.validateCredentials({ token: "github_pat_test" });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.scopes).toEqual([]);
  });

  it("returns insufficient_scope when scopes missing required", async () => {
    const adapter = createGitHubAdapter({
      fetch: mockFetch({
        "/user": {
          status: 200,
          body: validUser,
          headers: { "X-OAuth-Scopes": "gist" }, // missing repo + read:user
        },
      }),
    });
    const result = await adapter.validateCredentials({ token: "ghp_test" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("insufficient_scope");
      expect(result.message).toMatch(/repo/);
      expect(result.message).toMatch(/read:user/);
    }
  });

  it("returns invalid on 401", async () => {
    const adapter = createGitHubAdapter({
      fetch: mockFetch({
        "/user": {
          status: 401,
          body: { message: "Bad credentials" },
        },
      }),
    });
    const result = await adapter.validateCredentials({ token: "ghp_bad" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("invalid");
      expect(result.message).toMatch(/Bad credentials/);
    }
  });

  it("returns insufficient_scope on 403 (non-rate-limit)", async () => {
    const adapter = createGitHubAdapter({
      fetch: mockFetch({
        "/user": {
          status: 403,
          body: { message: "Resource not accessible by integration" },
          headers: { "X-RateLimit-Remaining": "4999" },
        },
      }),
    });
    const result = await adapter.validateCredentials({ token: "ghp_test" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("insufficient_scope");
    }
  });

  it("returns invalid on 403 + X-RateLimit-Remaining=0", async () => {
    const adapter = createGitHubAdapter({
      fetch: mockFetch({
        "/user": {
          status: 403,
          body: { message: "API rate limit exceeded" },
          headers: { "X-RateLimit-Remaining": "0" },
        },
      }),
    });
    const result = await adapter.validateCredentials({ token: "ghp_test" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("invalid");
      expect(result.message).toMatch(/rate limit/i);
    }
  });

  it("returns revoked on 404 for /user", async () => {
    const adapter = createGitHubAdapter({
      fetch: mockFetch({
        "/user": { status: 404, body: { message: "Not Found" } },
      }),
    });
    const result = await adapter.validateCredentials({ token: "ghp_test" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("revoked");
  });
});

// ============================================================
// health
// ============================================================

describe("health", () => {
  it("returns reachable + remaining + reset on success", async () => {
    const adapter = createGitHubAdapter({
      fetch: mockFetch({
        "/rate_limit": { status: 200, body: validRateLimit },
      }),
    });
    const result = await adapter.health({ token: "ghp_test" });
    expect(result.reachable).toBe(true);
    expect(result.rate_limit_remaining).toBe(4980);
    expect(result.rate_limit_reset_at).toEqual(new Date(1779030000 * 1000));
    expect(result.latency_ms).toBeGreaterThanOrEqual(0);
  });

  it("returns unreachable on network failure", async () => {
    const adapter = createGitHubAdapter({
      fetch: (async () => {
        throw new Error("ENOTFOUND");
      }) as unknown as typeof globalThis.fetch,
    });
    const result = await adapter.health({ token: "ghp_test" });
    expect(result.reachable).toBe(false);
    expect(result.rate_limit_remaining).toBeNull();
    expect(result.rate_limit_reset_at).toBeNull();
  });

  it("returns unreachable on 500", async () => {
    const adapter = createGitHubAdapter({
      fetch: mockFetch({
        "/rate_limit": { status: 500, body: { message: "boom" } },
      }),
    });
    const result = await adapter.health({ token: "ghp_test" });
    expect(result.reachable).toBe(false);
  });
});

// ============================================================
// fingerprint determinism
// ============================================================

describe("fingerprint", () => {
  it("is deterministic for the same token", () => {
    expect(fingerprint("ghp_test123")).toBe(fingerprint("ghp_test123"));
  });

  it("differs across tokens", () => {
    expect(fingerprint("a")).not.toBe(fingerprint("b"));
  });

  it("never contains the raw token", () => {
    const fp = fingerprint("ghp_test123");
    expect(fp).not.toContain("ghp_test123");
    expect(fp).toMatch(/^sha:[a-f0-9]{12}$/);
  });
});

// ============================================================
// parseGitHubConfig — already covered in S4A but kept as smoke test
// ============================================================

describe("parseGitHubConfig", () => {
  it("accepts owner/repo", () => {
    expect(parseGitHubConfig({ owner_repo: "x/y" }).ok).toBe(true);
  });

  it("rejects missing slash", () => {
    expect(parseGitHubConfig({ owner_repo: "broken" }).ok).toBe(false);
  });
});
