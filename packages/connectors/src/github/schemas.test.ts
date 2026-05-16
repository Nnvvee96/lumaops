/**
 * Zod schema tests — verify the GitHub API shapes we depend on parse
 * cleanly from real GitHub REST v3 response payloads, and that
 * malformed payloads are rejected (caller can map to schema_drift).
 */

import { describe, expect, it } from "vitest";

import {
  GitHubConfigSchema,
  GitHubErrorBodySchema,
  GitHubIssueSchema,
  GitHubPullRequestSchema,
  GitHubRateLimitSchema,
  GitHubReleaseSchema,
  GitHubRepoSchema,
  GitHubUserSchema,
  GitHubCommitSchema,
} from "./schemas";

describe("GitHubConfigSchema", () => {
  it("accepts owner/repo format", () => {
    expect(
      GitHubConfigSchema.parse({ owner_repo: "Nnvvee96/NOESIS" }),
    ).toEqual({ owner_repo: "Nnvvee96/NOESIS" });
  });

  it("rejects missing slash", () => {
    expect(() => GitHubConfigSchema.parse({ owner_repo: "broken" })).toThrow();
  });

  it("rejects multi-slash", () => {
    expect(() =>
      GitHubConfigSchema.parse({ owner_repo: "a/b/c" }),
    ).toThrow();
  });

  it("rejects missing field", () => {
    expect(() => GitHubConfigSchema.parse({})).toThrow();
  });
});

describe("GitHubUserSchema", () => {
  it("parses a real /user payload shape", () => {
    const parsed = GitHubUserSchema.parse({
      login: "octocat",
      id: 1,
      name: "The Octocat",
      // Extra fields are tolerated:
      type: "User",
      avatar_url: "https://example.com/avatar.png",
    });
    expect(parsed.login).toBe("octocat");
  });

  it("accepts null name", () => {
    expect(() =>
      GitHubUserSchema.parse({ login: "x", id: 1, name: null }),
    ).not.toThrow();
  });

  it("rejects when login missing", () => {
    expect(() => GitHubUserSchema.parse({ id: 1 })).toThrow();
  });
});

describe("GitHubRateLimitSchema", () => {
  it("parses the /rate_limit response", () => {
    const parsed = GitHubRateLimitSchema.parse({
      resources: {
        core: { limit: 5000, remaining: 4980, reset: 1779030000 },
        search: { limit: 30, remaining: 30, reset: 1779030000 }, // ignored
      },
      rate: { limit: 5000, remaining: 4980, reset: 1779030000 }, // tolerated
    });
    expect(parsed.resources.core.remaining).toBe(4980);
  });

  it("rejects when core is missing", () => {
    expect(() =>
      GitHubRateLimitSchema.parse({ resources: { search: {} } }),
    ).toThrow();
  });
});

describe("GitHubRepoSchema", () => {
  it("parses a real /repos/{owner}/{repo} response", () => {
    const parsed = GitHubRepoSchema.parse({
      id: 1234,
      full_name: "Nnvvee96/NOESIS",
      description: "Desktop assistant.",
      default_branch: "main",
      archived: false,
      pushed_at: "2026-05-15T19:24:00Z",
      // many other fields exist on real responses; tolerated
      private: false,
      html_url: "https://github.com/Nnvvee96/NOESIS",
    });
    expect(parsed.full_name).toBe("Nnvvee96/NOESIS");
  });

  it("accepts null description", () => {
    expect(() =>
      GitHubRepoSchema.parse({
        id: 1,
        full_name: "a/b",
        description: null,
        default_branch: "main",
        archived: false,
        pushed_at: "2026-05-15T00:00:00Z",
      }),
    ).not.toThrow();
  });
});

describe("GitHubReleaseSchema", () => {
  it("parses a release with assets", () => {
    const parsed = GitHubReleaseSchema.parse({
      id: 1,
      tag_name: "v0.1.0",
      name: "v0.1.0",
      draft: false,
      prerelease: true,
      published_at: "2026-05-15T00:00:00Z",
      assets: [
        {
          id: 10,
          name: "NOESIS.dmg",
          size: 12345678,
          download_count: 42,
          created_at: "2026-05-15T00:00:00Z",
        },
      ],
    });
    expect(parsed.assets).toHaveLength(1);
    expect(parsed.assets[0]?.download_count).toBe(42);
  });

  it("defaults assets to []", () => {
    const parsed = GitHubReleaseSchema.parse({
      id: 1,
      tag_name: "v0.1.0",
      name: null,
      draft: false,
      prerelease: false,
      published_at: null,
    });
    expect(parsed.assets).toEqual([]);
  });
});

describe("GitHubIssueSchema", () => {
  it("parses an open issue with labels", () => {
    const parsed = GitHubIssueSchema.parse({
      id: 1,
      number: 42,
      title: "Crash on startup",
      state: "open",
      labels: [{ id: 100, name: "bug" }],
      created_at: "2026-05-10T00:00:00Z",
      updated_at: "2026-05-15T00:00:00Z",
      // PR via issues endpoint signature
      pull_request: { url: "https://example.com" },
    });
    expect(parsed.labels?.[0]?.name).toBe("bug");
    expect(parsed.pull_request).toBeDefined();
  });

  it("rejects unknown state", () => {
    expect(() =>
      GitHubIssueSchema.parse({
        id: 1,
        number: 1,
        title: "x",
        state: "draft",
        created_at: "2026-05-10",
        updated_at: "2026-05-10",
      }),
    ).toThrow();
  });
});

describe("GitHubPullRequestSchema", () => {
  it("parses an open PR", () => {
    expect(() =>
      GitHubPullRequestSchema.parse({
        id: 1,
        number: 9,
        title: "Fix x",
        state: "open",
        merged_at: null,
        created_at: "2026-05-10T00:00:00Z",
        updated_at: "2026-05-15T00:00:00Z",
      }),
    ).not.toThrow();
  });

  it("parses a merged PR", () => {
    const parsed = GitHubPullRequestSchema.parse({
      id: 2,
      number: 10,
      title: "Merge x",
      state: "closed",
      merged_at: "2026-05-15T12:00:00Z",
      created_at: "2026-05-15T00:00:00Z",
      updated_at: "2026-05-15T12:00:00Z",
    });
    expect(parsed.merged_at).toBe("2026-05-15T12:00:00Z");
  });
});

describe("GitHubCommitSchema", () => {
  it("parses a commit", () => {
    const parsed = GitHubCommitSchema.parse({
      sha: "abc123",
      commit: {
        message: "first commit",
        author: { date: "2026-05-15T00:00:00Z" },
      },
    });
    expect(parsed.sha).toBe("abc123");
  });

  it("accepts missing author block", () => {
    expect(() =>
      GitHubCommitSchema.parse({
        sha: "abc",
        commit: { message: "x" },
      }),
    ).not.toThrow();
  });
});

describe("GitHubErrorBodySchema", () => {
  it("parses a rate-limit error body", () => {
    const parsed = GitHubErrorBodySchema.parse({
      message: "API rate limit exceeded",
      documentation_url: "https://docs.github.com/...",
    });
    expect(parsed.message).toContain("rate limit");
  });

  it("parses a minimal error body", () => {
    expect(() =>
      GitHubErrorBodySchema.parse({ message: "Not Found" }),
    ).not.toThrow();
  });
});
