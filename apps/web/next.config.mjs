import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  poweredByHeader: false,
  // Pin the workspace root so Next.js doesn't pick the wrong lockfile
  // when running inside a git worktree (or any sibling checkout).
  outputFileTracingRoot: join(__dirname, "..", ".."),
};

export default nextConfig;
