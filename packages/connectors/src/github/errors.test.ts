/**
 * S4D — branch coverage for the GitHub error classifier.
 *
 * Per S4D DoD: every classifier branch is exercised; the function is
 * pure (no Date.now, no I/O); rate-limit `retry_after_ms` is read from
 * `X-RateLimit-Reset` and clamped to >= 0.
 */

import { describe, expect, it } from "vitest";
import { z } from "zod";

import { connectorKindToErrorClass } from "@lumaops/core";

import { backoffMs, classifyGitHubError } from "./errors";
import { GitHubHTTPError } from "./http";

// ============================================================
// Helpers
// ============================================================

function err(
  status: number,
  headers: Record<string, string> = {},
  body: { message: string } | null = null,
): GitHubHTTPError {
  return new GitHubHTTPError(
    status,
    new Headers(headers),
    body,
    body?.message ?? `GitHub ${status}`,
  );
}

const FIXED_NOW = () => new Date("2026-05-16T20:00:00Z");

// ============================================================
// 1) 401 → connector_auth
// ============================================================

describe("classifyGitHubError — 401 auth", () => {
  it("maps 401 to kind=auth, no retry", () => {
    const r = classifyGitHubError(err(401, {}, { message: "Bad credentials" }));
    expect(r.kind).toBe("auth");
    expect(r.message).toBe("Bad credentials");
    expect(r.retry_after_ms).toBeNull();
  });

  it("falls back to a generic message when body is missing", () => {
    const r = classifyGitHubError(err(401));
    expect(r.kind).toBe("auth");
    expect(r.message).toMatch(/token rejected/);
  });
});

// ============================================================
// 2) 403 + X-RateLimit-Remaining=0 → connector_rate_limit
// ============================================================

describe("classifyGitHubError — 403 rate limit", () => {
  it("maps 403 + Remaining=0 to kind=rate_limit, retry_after_ms from Reset", () => {
    // Reset is now + 90s
    const resetSec = Math.floor(FIXED_NOW().getTime() / 1000) + 90;
    const r = classifyGitHubError(
      err(
        403,
        {
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(resetSec),
        },
        { message: "API rate limit exceeded" },
      ),
      { now: FIXED_NOW },
    );
    expect(r.kind).toBe("rate_limit");
    expect(r.retry_after_ms).toBe(90_000);
    expect(r.message).toMatch(/rate limit/i);
  });

  it("clamps retry_after_ms to 0 when Reset is already in the past", () => {
    const resetSec = Math.floor(FIXED_NOW().getTime() / 1000) - 60;
    const r = classifyGitHubError(
      err(403, {
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(resetSec),
      }),
      { now: FIXED_NOW },
    );
    expect(r.kind).toBe("rate_limit");
    expect(r.retry_after_ms).toBe(0);
  });

  it("falls back to 60s when Reset is missing or malformed", () => {
    const r = classifyGitHubError(
      err(403, { "X-RateLimit-Remaining": "0" }),
      { now: FIXED_NOW },
    );
    expect(r.kind).toBe("rate_limit");
    expect(r.retry_after_ms).toBe(60_000);
  });
});

// ============================================================
// 3) 403 (non-rate-limit) → connector_permission
// ============================================================

describe("classifyGitHubError — 403 permission", () => {
  it("maps 403 without Remaining=0 to kind=permission", () => {
    const r = classifyGitHubError(
      err(
        403,
        { "X-RateLimit-Remaining": "4999" },
        { message: "Resource not accessible by integration" },
      ),
    );
    expect(r.kind).toBe("permission");
    expect(r.message).toMatch(/Resource not accessible/);
    expect(r.retry_after_ms).toBeNull();
  });

  it("treats missing Remaining header as permission, not rate-limit", () => {
    const r = classifyGitHubError(err(403, {}, { message: "SAML enforcement" }));
    expect(r.kind).toBe("permission");
  });
});

// ============================================================
// 4) 404 → connector_not_found
// ============================================================

describe("classifyGitHubError — 404 not found", () => {
  it("maps 404 to kind=not_found", () => {
    const r = classifyGitHubError(err(404, {}, { message: "Not Found" }));
    expect(r.kind).toBe("not_found");
    expect(r.retry_after_ms).toBeNull();
  });
});

// ============================================================
// 5) 422 / ZodError → connector_schema_drift
// ============================================================

describe("classifyGitHubError — schema drift", () => {
  it("maps 422 to kind=schema_drift", () => {
    const r = classifyGitHubError(
      err(422, {}, { message: "Validation Failed" }),
    );
    expect(r.kind).toBe("schema_drift");
    expect(r.retry_after_ms).toBeNull();
  });

  it("maps ZodError to kind=schema_drift with the failing path", () => {
    const schema = z.object({ assets: z.array(z.string()) });
    let zerr: z.ZodError | null = null;
    try {
      schema.parse({ assets: [1, 2, 3] });
    } catch (e) {
      zerr = e as z.ZodError;
    }
    const r = classifyGitHubError(zerr);
    expect(r.kind).toBe("schema_drift");
    expect(r.message).toMatch(/assets/);
  });
});

// ============================================================
// 6) 5xx → connector_network with exponential backoff
// ============================================================

describe("classifyGitHubError — 5xx", () => {
  it("maps 500 to kind=network with backoff(0) = 1s on first attempt", () => {
    const r = classifyGitHubError(err(500, {}, { message: "boom" }), {
      attempt: 0,
    });
    expect(r.kind).toBe("network");
    expect(r.retry_after_ms).toBe(1_000);
  });

  it("backs off exponentially: attempt 3 → 8s", () => {
    const r = classifyGitHubError(err(502), { attempt: 3 });
    expect(r.retry_after_ms).toBe(8_000);
  });

  it("caps backoff at 60s", () => {
    const r = classifyGitHubError(err(503), { attempt: 20 });
    expect(r.retry_after_ms).toBe(60_000);
  });

  it("classifies 504 the same as 500", () => {
    const r = classifyGitHubError(err(504));
    expect(r.kind).toBe("network");
  });
});

// ============================================================
// 7) Network / DNS / timeout / abort
// ============================================================

describe("classifyGitHubError — network family", () => {
  it("maps a raw fetch TypeError to kind=network with backoff", () => {
    const r = classifyGitHubError(new TypeError("fetch failed"), {
      attempt: 1,
    });
    expect(r.kind).toBe("network");
    expect(r.retry_after_ms).toBe(2_000);
    expect(r.message).toMatch(/fetch failed/);
  });

  it("maps an AbortError to kind=network with no retry", () => {
    const ab = new DOMException("aborted", "AbortError");
    const r = classifyGitHubError(ab, { scope: "issues" });
    expect(r.kind).toBe("network");
    expect(r.retry_after_ms).toBeNull();
    expect(r.affected_scope).toBe("issues");
    expect(r.message).toMatch(/aborted/);
  });

  it("maps an unknown thrown value to kind=network with backoff", () => {
    const r = classifyGitHubError("string thrown as error", { attempt: 0 });
    expect(r.kind).toBe("network");
    expect(r.retry_after_ms).toBe(1_000);
    expect(r.message).toBe("string thrown as error");
  });

  it("never leaves a raw Authorization header in the message", () => {
    // GitHubHTTPError.message is constructed without auth context; the
    // classifier just forwards it. Sanity check: no "Bearer" leaks.
    const r = classifyGitHubError(
      err(401, {}, { message: "Bad credentials" }),
    );
    expect(r.message).not.toMatch(/Bearer/i);
    expect(r.message).not.toMatch(/ghp_/);
  });
});

// ============================================================
// Unclassified 4xx — surface as `unknown` (don't silently swallow)
// ============================================================

describe("classifyGitHubError — other 4xx", () => {
  it("maps 410 to kind=unknown so the runner doesn't swallow it", () => {
    const r = classifyGitHubError(err(410, {}, { message: "Gone" }));
    expect(r.kind).toBe("unknown");
    expect(r.retry_after_ms).toBeNull();
  });
});

// ============================================================
// Purity / determinism
// ============================================================

describe("classifyGitHubError — purity", () => {
  it("returns the same result for identical inputs", () => {
    const input = err(500);
    const a = classifyGitHubError(input, { attempt: 2 });
    const b = classifyGitHubError(input, { attempt: 2 });
    expect(a).toEqual(b);
  });

  it("threads the scope tag through unchanged", () => {
    const r = classifyGitHubError(err(401), { scope: "releases" });
    expect(r.affected_scope).toBe("releases");
  });
});

// ============================================================
// backoffMs helper
// ============================================================

describe("backoffMs", () => {
  it("doubles per attempt", () => {
    expect(backoffMs(0)).toBe(1_000);
    expect(backoffMs(1)).toBe(2_000);
    expect(backoffMs(2)).toBe(4_000);
    expect(backoffMs(3)).toBe(8_000);
  });

  it("caps at 60s", () => {
    expect(backoffMs(10)).toBe(60_000);
    expect(backoffMs(100)).toBe(60_000);
  });
});

// ============================================================
// connectorKindToErrorClass — TDD §8 lift
// ============================================================

describe("connectorKindToErrorClass", () => {
  it("lifts every ConnectorError.kind to the framework ErrorClass", () => {
    expect(connectorKindToErrorClass("auth")).toBe("connector_auth");
    expect(connectorKindToErrorClass("rate_limit")).toBe("connector_rate_limit");
    expect(connectorKindToErrorClass("schema_drift")).toBe(
      "connector_schema_drift",
    );
    expect(connectorKindToErrorClass("network")).toBe("connector_network");
    expect(connectorKindToErrorClass("permission")).toBe(
      "connector_permission",
    );
    expect(connectorKindToErrorClass("not_found")).toBe("connector_not_found");
    expect(connectorKindToErrorClass("unknown")).toBe("internal_bug");
  });
});
