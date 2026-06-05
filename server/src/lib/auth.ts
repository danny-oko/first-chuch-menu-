import { SignJWT, jwtVerify } from "jose";
import type { Context, Next } from "hono";
import type { AppEnv } from "../common/types";

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123@";

export async function signAdminToken(secret: string): Promise<string> {
  const key = new TextEncoder().encode(secret);
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(key);
}

export async function verifyAdminToken(
  token: string,
  secret: string
): Promise<boolean> {
  try {
    const key = new TextEncoder().encode(secret);
    await jwtVerify(token, key);
    return true;
  } catch {
    return false;
  }
}

export function validateAdminCredentials(
  username: string,
  password: string
): boolean {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

export async function adminAuth(c: Context<AppEnv>, next: Next) {
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "");

  if (!token) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const valid = await verifyAdminToken(token, c.env.JWT_SECRET);
  if (!valid) {
    return c.json({ error: "Invalid or expired token" }, 401);
  }

  await next();
}

export function createId(): string {
  return crypto.randomUUID();
}

export function formatPrice(cents: number): string {
  const amount = Math.round(cents / 100);
  return `${amount.toLocaleString("mn-MN")}₮`;
}
