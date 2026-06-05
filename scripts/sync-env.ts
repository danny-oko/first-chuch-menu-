#!/usr/bin/env bun
/**
 * Syncs server env → client env for local development.
 * Run from repo root: bun run sync:env
 */

import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const root = join(import.meta.dir, "..");
const serverEnv = join(root, "server", ".env.local");
const clientEnv = join(root, "client", ".env.local");

const WORKER_PORT = "8787";

const clientTemplate = `# Auto-synced for server ↔ client integration
# Proxies /api/* → Hono Worker (client/app/api/[[...path]]/route.ts)
API_PROXY_URL=http://127.0.0.1:${WORKER_PORT}

# Same-origin in browser — requests go to /api/* then proxy to Worker
NEXT_PUBLIC_API_URL=

# Cloudinary (used by server upload endpoint; listed here for reference)
`;

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
let content = clientTemplate;

if (serverVars.CLOUDINARY_CLOUD_NAME) {
  content += `CLOUDINARY_CLOUD_NAME=${serverVars.CLOUDINARY_CLOUD_NAME}\n`;
}

writeFileSync(clientEnv, content);
console.log("✓ Synced client/.env.local from server config");
console.log(`  API_PROXY_URL=http://127.0.0.1:${WORKER_PORT}`);
