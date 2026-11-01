import "server-only";

import { cookies } from "next/headers";

export const IMPERSONATING_COOKIE = "hostvia_impersonating";

export type ImpersonationMarker = {
  hostId: string;
  email: string;
  username: string | null;
};

export function impersonationCookieOptions(maxAge = 60 * 60 * 8) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export async function getImpersonationMarker(): Promise<ImpersonationMarker | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(IMPERSONATING_COOKIE)?.value;
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<ImpersonationMarker>;
    if (!parsed.hostId || !parsed.email) return null;
    return {
      hostId: parsed.hostId,
      email: parsed.email,
      username: parsed.username ?? null,
    };
  } catch {
    return null;
  }
}
