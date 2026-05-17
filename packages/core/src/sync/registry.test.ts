import { describe, expect, it } from "vitest";

import type { ConnectorAdapter } from "../connectors/contract";
import { MutableAdapterRegistry } from "./registry";

function stubAdapter(provider: "github" | "stripe", variant: string): ConnectorAdapter {
  return {
    provider,
    variant,
    async validateCredentials() {
      return { ok: false, reason: "missing", message: "" };
    },
    async health() {
      return {
        reachable: false,
        latency_ms: 0,
        rate_limit_remaining: null,
        rate_limit_reset_at: null,
      };
    },
    async sync() {
      return { events: [], metrics_pull: [], next_since: new Date(), errors: [] };
    },
    capabilities() {
      return {
        supports_realtime: false,
        supports_backfill: false,
        required_scopes: [],
        rate_limits: [],
        privacy_class: "hosted",
      };
    },
  };
}

describe("MutableAdapterRegistry", () => {
  it("returns the adapter for (provider, variant)", () => {
    const r = new MutableAdapterRegistry();
    const gh = stubAdapter("github", "public");
    r.register(gh);
    expect(r.get("github", "public")).toBe(gh);
  });

  it("returns null for unknown (provider, variant)", () => {
    const r = new MutableAdapterRegistry();
    expect(r.get("github", "public")).toBeNull();
  });

  it("treats variants as distinct keys", () => {
    const r = new MutableAdapterRegistry();
    const pub = stubAdapter("github", "public");
    const ent = stubAdapter("github", "enterprise");
    r.register(pub);
    r.register(ent);
    expect(r.get("github", "public")).toBe(pub);
    expect(r.get("github", "enterprise")).toBe(ent);
  });

  it("rejects duplicate registration", () => {
    const r = new MutableAdapterRegistry();
    r.register(stubAdapter("github", "public"));
    expect(() => r.register(stubAdapter("github", "public"))).toThrow(/duplicate/);
  });
});
