/**
 * Adapter scaffold tests — the runtime methods throw in S4A.
 * What we verify here is the contract surface: capabilities,
 * provider+variant identity, parseGitHubConfig boundary behaviour.
 *
 * S4B will replace the throw-tests with real auth + health checks.
 * S4C will replace the sync throw-test with golden-file event tests.
 */

import { describe, expect, it } from "vitest";

import { createGitHubAdapter, parseGitHubConfig } from "./adapter";

describe("GitHub adapter — contract surface (S4A scaffold)", () => {
  const adapter = createGitHubAdapter();

  it("declares provider github / variant public", () => {
    expect(adapter.provider).toBe("github");
    expect(adapter.variant).toBe("public");
  });

  it("returns the locked capabilities shape", () => {
    const caps = adapter.capabilities();
    expect(caps.privacy_class).toBe("hosted");
    expect(caps.required_scopes).toEqual(["repo", "read:user"]);
    expect(caps.supports_realtime).toBe(false);
    expect(caps.supports_backfill).toBe(true);
    expect(caps.rate_limits).toEqual([{ window: "hour", limit: 5000 }]);
  });

  it("validateCredentials throws with the not-yet-implemented marker", async () => {
    await expect(adapter.validateCredentials({})).rejects.toThrow(
      /not yet implemented/i,
    );
  });

  it("health throws with the not-yet-implemented marker", async () => {
    await expect(adapter.health({})).rejects.toThrow(/not yet implemented/i);
  });

  it("sync throws with the not-yet-implemented marker", async () => {
    await expect(adapter.sync({}, new Date())).rejects.toThrow(
      /not yet implemented/i,
    );
  });
});

describe("parseGitHubConfig — boundary parsing", () => {
  it("accepts owner/repo", () => {
    const result = parseGitHubConfig({ owner_repo: "Nnvvee96/NOESIS" });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.config.owner_repo).toBe("Nnvvee96/NOESIS");
  });

  it("rejects when owner_repo missing", () => {
    const result = parseGitHubConfig({});
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toContain("owner_repo");
  });

  it("rejects malformed owner/repo", () => {
    const result = parseGitHubConfig({ owner_repo: "broken-no-slash" });
    expect(result.ok).toBe(false);
  });
});
