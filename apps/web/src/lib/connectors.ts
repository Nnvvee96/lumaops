import "server-only";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

import { integration, type Integration } from "@lumaops/core";
import { createGitHubAdapter } from "@lumaops/connectors";

import { getDb } from "./db";

/**
 * Test connection for an integration. Reads the token from env,
 * calls the adapter's validateCredentials + health, updates the
 * integration row in DB. Returns a serialisable result for UI.
 *
 * Token never leaves the server. Only the fingerprint persists.
 */
export interface TestConnectionResult {
  readonly ok: boolean;
  readonly summary: string;
  readonly fingerprint?: string;
  readonly scopes?: readonly string[];
  readonly rateLimitRemaining?: number | null;
  readonly latencyMs?: number;
}

export async function testIntegrationConnection(
  integrationId: string,
): Promise<TestConnectionResult> {
  const db = getDb();
  const rows = await db
    .select()
    .from(integration)
    .where(eq(integration.id, integrationId))
    .limit(1);

  const row: Integration | undefined = rows[0];
  if (!row) {
    return { ok: false, summary: "Integration not found." };
  }

  if (row.provider !== "github") {
    return {
      ok: false,
      summary: `Provider "${row.provider}" not yet wired — only GitHub in S4B.`,
    };
  }

  const token = process.env["LUMAOPS_GITHUB_TOKEN"];
  if (!token) {
    await db
      .update(integration)
      .set({
        credentialStatus: "missing",
        state: "pending",
        lastSyncError: "No LUMAOPS_GITHUB_TOKEN in env.",
        updatedAt: new Date(),
      })
      .where(eq(integration.id, row.id));
    revalidatePath("/integrations");
    return {
      ok: false,
      summary:
        "No LUMAOPS_GITHUB_TOKEN in your .env. Add it at the repo root, restart `pnpm dev`, and try again.",
    };
  }

  const adapter = createGitHubAdapter();
  const fullConfig = {
    ...(row.config as Record<string, unknown>),
    token,
  };

  const validation = await adapter.validateCredentials(fullConfig);
  if (!validation.ok) {
    await db
      .update(integration)
      .set({
        credentialStatus:
          validation.reason === "missing"
            ? "missing"
            : validation.reason === "revoked"
              ? "revoked"
              : "invalid",
        state: "error",
        lastSyncError: validation.message,
        updatedAt: new Date(),
      })
      .where(eq(integration.id, row.id));
    revalidatePath("/integrations");
    return {
      ok: false,
      summary: validation.message,
    };
  }

  const health = await adapter.health(fullConfig);

  await db
    .update(integration)
    .set({
      credentialStatus: "present",
      credentialFingerprint: validation.fingerprint,
      // Validation passed but sync hasn't run yet — keep state "pending".
      // S4E sync orchestrator flips to "syncing" → "live".
      state: "pending",
      lastSyncError: null,
      updatedAt: new Date(),
    })
    .where(eq(integration.id, row.id));

  revalidatePath("/integrations");

  return {
    ok: true,
    summary: health.reachable
      ? `Connected · ${health.rate_limit_remaining}/5000 requests remaining`
      : "Token validates but /rate_limit was unreachable.",
    fingerprint: validation.fingerprint,
    scopes: validation.scopes,
    rateLimitRemaining: health.rate_limit_remaining,
    latencyMs: health.latency_ms,
  };
}
