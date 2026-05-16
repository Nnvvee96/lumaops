import "server-only";

import { createClient, type LumaOpsDb } from "@lumaops/core";

declare global {
  // eslint-disable-next-line no-var
  var __lumaopsDb: LumaOpsDb | undefined;
}

/**
 * Lazy db accessor. The Pool is only created on first call, not at
 * module load — so `next build` (and any static-analysis pass) never
 * tries to instantiate without DATABASE_URL.
 */
export function getDb(): LumaOpsDb {
  if (globalThis.__lumaopsDb) return globalThis.__lumaopsDb;
  const databaseUrl = process.env["DATABASE_URL"];
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env at repo root and run `docker compose up -d`.",
    );
  }
  const { db } = createClient({ databaseUrl });
  globalThis.__lumaopsDb = db;
  return db;
}
