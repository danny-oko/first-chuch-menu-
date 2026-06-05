import { getWorkerUrl } from "./worker-url";

/**
 * API base URL resolution:
 * - Browser: same-origin `/api/*` → Next.js proxy route → Hono Worker
 * - SSR: direct Worker URL via API_PROXY_URL or production fallback
 */
export function getApiBaseUrl(): string {
  const publicUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

  if (typeof window !== "undefined") {
    return publicUrl ?? "";
  }

  return publicUrl ?? getWorkerUrl();
}

export function apiUrl(path: string): string {
  const base = getApiBaseUrl();
  return base ? `${base}${path}` : path;
}

export const API_BASE = getApiBaseUrl();
