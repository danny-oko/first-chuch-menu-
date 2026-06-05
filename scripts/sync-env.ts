#!/usr/bin/env bun
/**
 * Syncs server env → client env.
 * Run from repo root: bun run sync:env
 */

import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const root = join(import.meta.dir, "..");
const serverEnv = join(root, "server", ".env.local");
const clientEnv = join(root, "client", ".env.local");

const LOCAL_WORKER = "http://127.0.0.1:8787";

function readServerVars(): Record<string, string> {
  if (!existsSync(serverEnv)) return {};
  const vars: Record<string, string> = {};
  for (const line of readFileSync(serverEnv, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    vars[trimmed.slice(0, eq)] = trimmed.slice(eq + 1);
  }
  return vars;
}

const serverVars = readServerVars();
const workerUrl = serverVars.WORKER_URL?.replace(/\/$/, "") ?? LOCAL_WORKER;

let content = `# Auto-synced from server/.env.local
# Next.js proxy (app/api/[[...path]]/route.ts) forwards /api/* to the Worker
API_PROXY_URL=${workerUrl}

# Browser uses same-origin /api/* — leave empty
NEXT_PUBLIC_API_URL=
`;

if (serverVars.CLOUDINARY_CLOUD_NAME) {
  content += `CLOUDINARY_CLOUD_NAME=${serverVars.CLOUDINARY_CLOUD_NAME}\n`;
}

writeFileSync(clientEnv, content);
console.log("✓ Synced client/.env.local");
console.log(`  API_PROXY_URL=${workerUrl}`);
