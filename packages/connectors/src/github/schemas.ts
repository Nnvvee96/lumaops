/**
 * Zod schemas for the GitHub REST API v3 response shapes LumaOps reads.
 *
 * Discipline (TDD §7 + [LL §1.5] + [LL §13.5]):
 * - Every external response is parsed at the boundary. The rest of
 *   LumaOps consumes normalized types only.
 * - Anything PII-sensitive (emails, raw user IDs) is hashed *after*
 *   parsing but *before* leaving the adapter (TDD §6).
 * - Unknown extra fields are tolerated; missing required fields are
 *   schema-drift errors (caller maps to ConnectorError.kind="schema_drift").
 *
 * Keep these narrow: only the fields LumaOps actually reads. Adding
 * fields here is cheap; carrying fields LumaOps doesn't use bloats
 * the contract surface for no benefit.
 */

import { z } from "zod";

// ============================================================
// Config — what the GitHub adapter expects from integration.config
// ============================================================

export const GitHubConfigSchema = z.object({
  /** e.g. "Nnvvee96/NOESIS" */
  owner_repo: z.string().regex(/^[^/]+\/[^/]+$/, {
    message: "owner_repo must be in 'owner/repo' format",
  }),
});

export type GitHubConfig = z.infer<typeof GitHubConfigSchema>;

/**
 * Sync-time config. The framework runner (S4E) injects `workspace_id`,
 * `product_id`, and `token` into the per-integration config bag before
 * calling `adapter.sync`. Without these the adapter cannot emit a
 * valid NormalizedEvent — fail fast at the boundary.
 */
export const GitHubSyncConfigSchema = z.object({
  owner_repo: z.string().regex(/^[^/]+\/[^/]+$/, {
    message: "owner_repo must be in 'owner/repo' format",
  }),
  workspace_id: z.string().uuid(),
  product_id: z.string().uuid(),
  token: z.string().min(1),
});

export type GitHubSyncConfig = z.infer<typeof GitHubSyncConfigSchema>;

// ============================================================
// /user — used by validateCredentials
// ============================================================

export const GitHubUserSchema = z.object({
  login: z.string(),
  id: z.number(),
  name: z.string().nullable().optional(),
});

export type GitHubUser = z.infer<typeof GitHubUserSchema>;

// ============================================================
// /rate_limit — used by health
// ============================================================

export const GitHubRateLimitSchema = z.object({
  resources: z.object({
    core: z.object({
      limit: z.number(),
      remaining: z.number(),
      reset: z.number(), // unix timestamp seconds
    }),
  }),
});

export type GitHubRateLimit = z.infer<typeof GitHubRateLimitSchema>;

// ============================================================
// /repos/{owner}/{repo} — used for repo metadata
// ============================================================

export const GitHubRepoSchema = z.object({
  id: z.number(),
  full_name: z.string(),
  description: z.string().nullable().optional(),
  default_branch: z.string(),
  archived: z.boolean(),
  pushed_at: z.string(), // ISO 8601
});

export type GitHubRepo = z.infer<typeof GitHubRepoSchema>;

// ============================================================
// /repos/{owner}/{repo}/releases — used by sync for release_published
// ============================================================

export const GitHubReleaseAssetSchema = z.object({
  id: z.number(),
  name: z.string(),
  size: z.number(),
  download_count: z.number(),
  created_at: z.string(),
});

export const GitHubReleaseSchema = z.object({
  id: z.number(),
  tag_name: z.string(),
  name: z.string().nullable().optional(),
  draft: z.boolean(),
  prerelease: z.boolean(),
  published_at: z.string().nullable(),
  assets: z.array(GitHubReleaseAssetSchema).default([]),
});

export type GitHubReleaseAsset = z.infer<typeof GitHubReleaseAssetSchema>;
export type GitHubRelease = z.infer<typeof GitHubReleaseSchema>;

// ============================================================
// /repos/{owner}/{repo}/issues — used by sync for support_ticket_created
// ============================================================

export const GitHubLabelSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const GitHubIssueSchema = z.object({
  id: z.number(),
  number: z.number(),
  title: z.string(),
  state: z.enum(["open", "closed"]),
  labels: z.array(GitHubLabelSchema).default([]),
  /** GitHub returns PRs through this endpoint too; filter via this hint. */
  pull_request: z.unknown().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  closed_at: z.string().nullable().optional(),
});

export type GitHubLabel = z.infer<typeof GitHubLabelSchema>;
export type GitHubIssue = z.infer<typeof GitHubIssueSchema>;

// ============================================================
// /repos/{owner}/{repo}/pulls — used by sync for pr_merged
// ============================================================

export const GitHubPullRequestSchema = z.object({
  id: z.number(),
  number: z.number(),
  title: z.string(),
  state: z.enum(["open", "closed"]),
  merged_at: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type GitHubPullRequest = z.infer<typeof GitHubPullRequestSchema>;

// ============================================================
// /repos/{owner}/{repo}/commits — used for daily commit-activity rollup
// ============================================================

export const GitHubCommitSchema = z.object({
  sha: z.string(),
  commit: z.object({
    message: z.string(),
    author: z
      .object({
        date: z.string(),
      })
      .nullable()
      .optional(),
  }),
});

export type GitHubCommit = z.infer<typeof GitHubCommitSchema>;

// ============================================================
// Errors
// ============================================================

/**
 * GitHub error payload shape (rate-limit, 4xx, 5xx all share this).
 * Used to extract `message` and (for rate limit) `documentation_url`.
 */
export const GitHubErrorBodySchema = z.object({
  message: z.string(),
  documentation_url: z.string().optional(),
});

export type GitHubErrorBody = z.infer<typeof GitHubErrorBodySchema>;
