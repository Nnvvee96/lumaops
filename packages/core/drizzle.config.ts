import { defineConfig } from "drizzle-kit";

// Connection string used by drizzle-kit for `db:generate` (offline,
// schema-only, no DB needed) and `db:migrate` / `db:studio` (require
// a live Postgres). S3B brings up the local Postgres via docker-compose.

const databaseUrl =
  process.env.DATABASE_URL ?? "postgres://lumaops:lumaops@localhost:5433/lumaops";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: { url: databaseUrl },
  strict: true,
  verbose: true,
});
