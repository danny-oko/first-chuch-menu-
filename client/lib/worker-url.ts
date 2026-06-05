/** Deployed Cloudflare Worker — keep in sync with server/.env.local WORKER_URL */
export const PRODUCTION_WORKER_URL =
  "https://menu-api.danny-otgontsetseg.workers.dev";

export const LOCAL_WORKER_URL = "http://127.0.0.1:8787";

export function getWorkerUrl(): string {
  const fromEnv = process.env.API_PROXY_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  return process.env.NODE_ENV === "production"
    ? PRODUCTION_WORKER_URL
    : LOCAL_WORKER_URL;
}
