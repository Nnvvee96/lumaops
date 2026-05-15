/**
 * Drizzle client factory — one Pool per process, one Drizzle instance
 * per (Pool, schema). Callers pass in the database URL explicitly so
 * the factory stays testable and the env boundary is owned by the
 * caller, not buried here.
 */

import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { schema } from "./schema";

export type LumaOpsDb = NodePgDatabase<typeof schema>;

export interface ClientOptions {
  /** Postgres connection string (DATABASE_URL). */
  databaseUrl: string;
  /** Connection pool max size; defaults to 10 (reasonable for MVP). */
  maxConnections?: number;
}

export function createClient(options: ClientOptions): {
  db: LumaOpsDb;
  pool: Pool;
} {
  const pool = new Pool({
    connectionString: options.databaseUrl,
    max: options.maxConnections ?? 10,
  });
  const db = drizzle(pool, { schema });
  return { db, pool };
}
