import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

export function jsonError(
  c: Context,
  message: string,
  status: ContentfulStatusCode = 400
) {
  return c.json({ error: message }, status);
}
