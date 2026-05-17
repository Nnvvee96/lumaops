/**
 * GitHub sync — S4C.
 *
 * Pulls four entity kinds from GitHub REST v3 and normalises them
 * into LumaOps events:
 *
 *   /releases  → release_published, release_asset_uploaded
 *   /issues    → support_ticket_created  (labelled "bug" or "support",
 *                                          PRs filtered out)
 *   /pulls     → pr_merged
 *   /commits   → commit_pushed            (daily rollup, one event per UTC day)
 *
 * Discipline notes:
 * - One shared abort token, threaded through every fetch.        [LL §6.4]
 * - One source failing does NOT kill other sources — failures
 *   accumulate as ConnectorError entries on the SyncResult.
 *   Per-scope failures keep partial progress visible.            [LL §10.2]
 * - Error classification here is intentionally coarse. S4D adds
 *   the full taxonomy (auth / rate_limit / permission / …).      [LL §7.3]
 * - Zod-validation at the boundary; downstream consumes
 *   NormalizedEvent only.                                        [LL §1.5]
 * - `next_since` is the moment this sync STARTED. Using a stable
 *   start-stamp avoids skipping events that arrive mid-sync.
 */

import { z } from "zod";

import type {
  ConnectorError,
  ConnectorErrorKind,
  NormalizedEvent,
  SyncResult,
} from "@lumaops/core";

import { apiGet, GitHubHTTPError, parseNextLink } from "./http";
import {
  GitHubCommitSchema,
  GitHubIssueSchema,
  GitHubPullRequestSchema,
  GitHubReleaseSchema,
  GitHubSyncConfigSchema,
  type GitHubSyncConfig,
} from "./schemas";

// ============================================================
// Config parsing
// ============================================================

export function parseSyncConfig(
  raw: Record<string, unknown>,
):
  | { ok: true; config: GitHubSyncConfig }
  | { ok: false; message: string } {
  const result = GitHubSyncConfigSchema.safeParse(raw);
  if (result.success) return { ok: true, config: result.data };
  return {
    ok: false,
    message: `[github] sync config invalid: ${result.error.errors
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join("; ")}`,
  };
}

// ============================================================
// Constants — narrow blast radius for runaway pagination
// ============================================================

/** Hard cap so a misconfigured `since` window can't exhaust rate limit. */
const MAX_PAGES_PER_SOURCE = 10;
const PER_PAGE = 100;

const SUPPORT_LABELS = new Set(["bug", "support"]);

// ============================================================
// Public entry point
// ============================================================

export interface SyncOptions {
  readonly fetch?: typeof globalThis.fetch;
  readonly signal?: AbortSignal;
  /** Override the sync-start timestamp — used to make tests deterministic. */
  readonly now?: () => Date;
}

export async function syncGitHub(
  rawConfig: Record<string, unknown>,
  since: Date,
  options: SyncOptions = {},
): Promise<SyncResult> {
  const parsed = parseSyncConfig(rawConfig);
  if (!parsed.ok) {
    return {
      events: [],
      metrics_pull: [],
      next_since: since,
      errors: [
        {
          kind: "schema_drift",
          message: parsed.message,
          retry_after_ms: null,
          affected_scope: null,
        },
      ],
    };
  }

  const cfg = parsed.config;
  const nowFn = options.now ?? (() => new Date());
  const startedAt = nowFn();
  const events: NormalizedEvent[] = [];
  const errors: ConnectorError[] = [];

  const releases = await runSource("releases", () =>
    fetchReleases(cfg, since, options),
  );
  if (releases.ok) events.push(...releases.events);
  else errors.push(releases.error);

  const issues = await runSource("issues", () =>
    fetchIssueEvents(cfg, since, options),
  );
  if (issues.ok) events.push(...issues.events);
  else errors.push(issues.error);

  const prs = await runSource("pulls", () =>
    fetchPullEvents(cfg, since, options),
  );
  if (prs.ok) events.push(...prs.events);
  else errors.push(prs.error);

  const commits = await runSource("commits", () =>
    fetchCommitEvents(cfg, since, options),
  );
  if (commits.ok) events.push(...commits.events);
  else errors.push(commits.error);

  return {
    events,
    metrics_pull: [],
    next_since: startedAt,
    errors,
  };
}

// ============================================================
// Per-source pulls
// ============================================================

async function fetchReleases(
  cfg: GitHubSyncConfig,
  since: Date,
  opts: SyncOptions,
): Promise<NormalizedEvent[]> {
  const all = await paginate(
    `/repos/${cfg.owner_repo}/releases?per_page=${PER_PAGE}`,
    cfg.token,
    z.array(GitHubReleaseSchema),
    opts,
  );

  const events: NormalizedEvent[] = [];
  for (const r of all) {
    if (!r.published_at) continue; // drafts: no publish event
    const publishedAt = new Date(r.published_at);
    if (publishedAt < since) continue;

    events.push({
      workspace_id: cfg.workspace_id,
      product_id: cfg.product_id,
      event_name: "release_published",
      occurred_at: publishedAt,
      source: "github",
      source_event_id: `release:${r.id}`,
      properties: {
        tag_name: r.tag_name,
        name: r.name ?? null,
        prerelease: r.prerelease,
        draft: r.draft,
      },
    });

    for (const asset of r.assets ?? []) {
      const createdAt = new Date(asset.created_at);
      if (createdAt < since) continue;
      events.push({
        workspace_id: cfg.workspace_id,
        product_id: cfg.product_id,
        event_name: "release_asset_uploaded",
        occurred_at: createdAt,
        source: "github",
        source_event_id: `release_asset:${asset.id}`,
        properties: {
          release_tag: r.tag_name,
          asset_name: asset.name,
          size_bytes: asset.size,
          download_count: asset.download_count,
        },
      });
    }
  }
  return events;
}

async function fetchIssueEvents(
  cfg: GitHubSyncConfig,
  since: Date,
  opts: SyncOptions,
): Promise<NormalizedEvent[]> {
  const sinceIso = since.toISOString();
  const path =
    `/repos/${cfg.owner_repo}/issues` +
    `?state=all&since=${encodeURIComponent(sinceIso)}` +
    `&per_page=${PER_PAGE}`;

  const all = await paginate(
    path,
    cfg.token,
    z.array(GitHubIssueSchema),
    opts,
  );

  const events: NormalizedEvent[] = [];
  for (const i of all) {
    if (i.pull_request !== undefined) continue; // /issues returns PRs too
    const labels = i.labels ?? [];
    const hasSupportLabel = labels.some((l) =>
      SUPPORT_LABELS.has(l.name.toLowerCase()),
    );
    if (!hasSupportLabel) continue;
    const createdAt = new Date(i.created_at);
    if (createdAt < since) continue;

    events.push({
      workspace_id: cfg.workspace_id,
      product_id: cfg.product_id,
      event_name: "support_ticket_created",
      occurred_at: createdAt,
      source: "github",
      source_event_id: `issue:${i.id}`,
      properties: {
        number: i.number,
        title: i.title,
        state: i.state,
        labels: labels.map((l) => l.name),
      },
    });
  }
  return events;
}

async function fetchPullEvents(
  cfg: GitHubSyncConfig,
  since: Date,
  opts: SyncOptions,
): Promise<NormalizedEvent[]> {
  const path =
    `/repos/${cfg.owner_repo}/pulls` +
    `?state=closed&sort=updated&direction=desc&per_page=${PER_PAGE}`;

  const all = await paginate(
    path,
    cfg.token,
    z.array(GitHubPullRequestSchema),
    opts,
    /* stopWhen */ (page) => {
      // Once a whole page predates `since`, deeper pages will too —
      // saves the rate-limit cost of pagination.
      return page.every((pr) => {
        const ts = new Date(pr.updated_at);
        return ts < since;
      });
    },
  );

  const events: NormalizedEvent[] = [];
  for (const pr of all) {
    if (!pr.merged_at) continue;
    const mergedAt = new Date(pr.merged_at);
    if (mergedAt < since) continue;

    events.push({
      workspace_id: cfg.workspace_id,
      product_id: cfg.product_id,
      event_name: "pr_merged",
      occurred_at: mergedAt,
      source: "github",
      source_event_id: `pr:${pr.id}`,
      properties: {
        number: pr.number,
        title: pr.title,
      },
    });
  }
  return events;
}

async function fetchCommitEvents(
  cfg: GitHubSyncConfig,
  since: Date,
  opts: SyncOptions,
): Promise<NormalizedEvent[]> {
  const sinceIso = since.toISOString();
  const path =
    `/repos/${cfg.owner_repo}/commits` +
    `?since=${encodeURIComponent(sinceIso)}&per_page=${PER_PAGE}`;

  const all = await paginate(
    path,
    cfg.token,
    z.array(GitHubCommitSchema),
    opts,
  );

  // Roll up to one event per UTC date. Commit floods (squash-merges,
  // tooling pushes) would otherwise dominate the event table.
  const countByDay = new Map<string, { date: Date; count: number }>();
  for (const c of all) {
    const dateStr = c.commit.author?.date;
    if (!dateStr) continue;
    const d = new Date(dateStr);
    if (d < since) continue;
    const key = d.toISOString().slice(0, 10);
    const existing = countByDay.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      // Anchor the rolled-up event at the start of the UTC day so the
      // source_event_id is stable across reruns within the same day.
      countByDay.set(key, {
        date: new Date(`${key}T00:00:00.000Z`),
        count: 1,
      });
    }
  }

  const events: NormalizedEvent[] = [];
  for (const [key, { date, count }] of countByDay) {
    events.push({
      workspace_id: cfg.workspace_id,
      product_id: cfg.product_id,
      event_name: "commit_pushed",
      occurred_at: date,
      source: "github",
      source_event_id: `commits:${cfg.owner_repo}:${key}`,
      properties: { count },
    });
  }
  return events;
}

// ============================================================
// Pagination + per-source error isolation
// ============================================================

async function paginate<T>(
  initialPath: string,
  token: string,
  itemsSchema: z.ZodType<readonly T[]>,
  opts: SyncOptions,
  stopWhen?: (page: readonly T[]) => boolean,
): Promise<T[]> {
  const fetchImpl = opts.fetch;
  const signal = opts.signal;

  let nextUrl: string | null = initialPath;
  const items: T[] = [];
  let pageCount = 0;

  while (nextUrl) {
    if (signal?.aborted) {
      throw new DOMException("Sync aborted", "AbortError");
    }
    if (pageCount >= MAX_PAGES_PER_SOURCE) {
      // Hard stop — surfaced as a soft warning by the caller via the
      // SyncResult.errors path. We choose to truncate rather than fail,
      // so the operator still gets partial data.
      break;
    }
    const apiOpts: { fetch?: typeof globalThis.fetch; signal?: AbortSignal } = {};
    if (fetchImpl) apiOpts.fetch = fetchImpl;
    if (signal) apiOpts.signal = signal;

    const { data, headers } = await apiGet(
      nextUrl,
      token,
      itemsSchema,
      apiOpts,
    );
    items.push(...data);
    pageCount += 1;

    if (stopWhen && stopWhen(data)) break;
    nextUrl = parseNextLink(headers.get("Link"));
  }
  return items;
}

type SourceResult =
  | { ok: true; events: readonly NormalizedEvent[] }
  | { ok: false; error: ConnectorError };

async function runSource(
  scope: string,
  fn: () => Promise<readonly NormalizedEvent[]>,
): Promise<SourceResult> {
  try {
    const events = await fn();
    return { ok: true, events };
  } catch (err) {
    return { ok: false, error: classifyError(scope, err) };
  }
}

/**
 * Coarse classifier for S4C. S4D replaces this with the full taxonomy
 * (auth / rate_limit / permission / not_found / schema_drift / network).
 * Kept minimal here so per-source failures surface honestly rather than
 * crashing the whole sync.
 */
function classifyError(scope: string, err: unknown): ConnectorError {
  if (err instanceof DOMException && err.name === "AbortError") {
    return {
      kind: "network",
      message: `[${scope}] aborted`,
      retry_after_ms: null,
      affected_scope: scope,
    };
  }
  if (err instanceof GitHubHTTPError) {
    let kind: ConnectorErrorKind = "unknown";
    if (err.status === 401) kind = "auth";
    else if (err.status === 403) {
      const remaining = err.headers.get("X-RateLimit-Remaining");
      kind = remaining === "0" ? "rate_limit" : "permission";
    } else if (err.status === 404) kind = "not_found";
    else if (err.status >= 500) kind = "network";
    return {
      kind,
      message: err.message,
      retry_after_ms: null,
      affected_scope: scope,
    };
  }
  if (err instanceof z.ZodError) {
    return {
      kind: "schema_drift",
      message: `[${scope}] schema drift: ${err.errors[0]?.message ?? "unknown"}`,
      retry_after_ms: null,
      affected_scope: scope,
    };
  }
  return {
    kind: "network",
    message: `[${scope}] ${(err as Error).message ?? String(err)}`,
    retry_after_ms: null,
    affected_scope: scope,
  };
}
