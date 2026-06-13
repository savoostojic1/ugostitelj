import "server-only";

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { loadAdminAuth } from "@/lib/admin/auth-store";

export const ADMIN_COOKIE = "hostvia_admin_session";
const SESSION_DAYS = 7;

async function getSecret(): Promise<string> {
  const stored = await loadAdminAuth();
  if (stored?.session_secret) return stored.session_secret;

  const { adminSetupRequired } = await import("@/lib/admin/credentials");
  if (!(await adminSetupRequired())) {
    throw new Error("Could not load admin session secret from database");
  }

  const secret = process.env.ADMIN_SESSION_SECRET ?? process.env.CRON_SECRET;
  if (!secret) {
    throw new Error(
      "Admin session secret missing. Set a password at /admin first."
    );
  }
  return secret;
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export async function createAdminSessionToken(): Promise<string> {
  const secret = await getSecret();
  const exp = Math.floor(Date.now() / 1000) + SESSION_DAYS * 86400;
  const payload = Buffer.from(
    JSON.stringify({ exp, sub: "admin" })
  ).toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
}

export async function verifyAdminSessionToken(token: string): Promise<boolean> {
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;

  let secret: string;
  try {
    secret = await getSecret();
  } catch {
    return false;
  }

  const expected = sign(payload, secret);
  try {
    if (expected.length !== sig.length) return false;
    if (!timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return false;
  } catch {
    return false;
  }

  try {
    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as { exp?: number; sub?: string };
    if (!data.exp || data.exp < Math.floor(Date.now() / 1000)) return false;
    return data.sub === "admin";
  } catch {
    return false;
  }
}

export async function getAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  return verifyAdminSessionToken(token);
}

export function adminCookieOptions(maxAge = SESSION_DAYS * 86400) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}
