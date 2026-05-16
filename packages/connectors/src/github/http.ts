/**
 * Minimal HTTP boundary for the GitHub adapter.
 *
 * Every external call routes through `apiGet`. The helper:
 * - prepends GitHub API root + standard headers
 * - injects auth if a token is provided
 * - parses success bodies through a Zod schema at the boundary
 * - throws a structured `GitHubHTTPError` on non-2xx
 *
 * The adapter never touches fetch / response objects directly outside
 * this file. Keeps the "parse at the boundary" rule from
 * [LL §1.5] in one place.
 */

import type { ZodSchema } from "zod";

import { GitHubErrorBodySchema, type GitHubErrorBody } from "./schemas";

export const GITHUB_API_ROOT = "https://api.github.com";

export interface ApiGetOptions {
  readonly fetch?: typeof globalThis.fetch;
  readonly signal?: AbortSignal;
}

export interface ApiGetResult<T> {
  readonly data: T;
  readonly latencyMs: number;
  readonly headers: Headers;
}

export class GitHubHTTPError extends Error {
  public readonly status: number;
  public readonly headers: Headers;
  public readonly body: GitHubErrorBody | null;

  constructor(
    status: number,
    headers: Headers,
    body: GitHubErrorBody | null,
    message: string,
  ) {
    super(message);
    this.name = "GitHubHTTPError";
    this.status = status;
    this.headers = headers;
    this.body = body;
  }
}

export async function apiGet<T>(
  path: string,
  token: string | undefined,
  schema: ZodSchema<T>,
  options: ApiGetOptions = {},
): Promise<ApiGetResult<T>> {
  const fetchImpl = options.fetch ?? globalThis.fetch;
  if (!fetchImpl) {
    throw new Error("[github/http] fetch is not available in this runtime");
  }

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "LumaOps",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const init: RequestInit = {
    method: "GET",
    headers,
  };
  if (options.signal !== undefined) {
    init.signal = options.signal;
  }

  const start = now();
  const res = await fetchImpl(`${GITHUB_API_ROOT}${path}`, init);
  const latencyMs = Math.round(now() - start);

  if (!res.ok) {
    let body: GitHubErrorBody | null = null;
    try {
      const raw = (await res.json()) as unknown;
      const parsed = GitHubErrorBodySchema.safeParse(raw);
      if (parsed.success) body = parsed.data;
    } catch {
      // Not JSON, leave body as null.
    }
    throw new GitHubHTTPError(
      res.status,
      res.headers,
      body,
      `GitHub ${res.status} on ${path}${body?.message ? `: ${body.message}` : ""}`,
    );
  }

  const json = (await res.json()) as unknown;
  const data = schema.parse(json);
  return { data, latencyMs, headers: res.headers };
}

function now(): number {
  // performance.now() is available in Node 22 + browsers; fall back to Date.now().
  if (typeof performance !== "undefined" && typeof performance.now === "function") {
    return performance.now();
  }
  return Date.now();
}
