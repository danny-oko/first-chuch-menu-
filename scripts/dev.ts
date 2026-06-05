#!/usr/bin/env bun
/**
 * Starts server, waits for health, then starts client.
 * Run from repo root: bun run dev
 */

import { spawn } from "child_process";
import { join } from "path";

const root = join(import.meta.dir, "..");
const API_URL = process.env.API_PROXY_URL ?? "http://127.0.0.1:8787";
const HEALTH = `${API_URL}/api/health`;

function run(cwd: string, cmd: string, args: string[]) {
  return spawn(cmd, args, {
    cwd,
    stdio: "inherit",
    env: process.env,
  });
}

async function waitForApi(maxAttempts = 60) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(HEALTH);
      if (res.ok) {
        console.log("\n✓ Menu API ready at", API_URL);
        return;
      }
    } catch {
      /* retry */
    }
    await Bun.sleep(500);
  }
  console.error(
    "\n✘ Menu API did not start. Run manually: cd server && bun run dev"
  );
  process.exit(1);
}

console.log("Starting Menu API (server/)...");
const server = run(join(root, "server"), "bun", ["run", "dev"]);

await waitForApi();

console.log("Starting Next.js client (client/)...");
const client = run(join(root, "client"), "bun", ["run", "dev"]);

const shutdown = () => {
  server.kill();
  client.kill();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

await Promise.race([
  new Promise((resolve) => server.on("exit", resolve)),
  new Promise((resolve) => client.on("exit", resolve)),
]);

shutdown();
