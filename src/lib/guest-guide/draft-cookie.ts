import type { NextRequest, NextResponse } from "next/server";
import { DRAFT_COOKIE_NAME } from "@/lib/guest-guide/content";

const DRAFT_COOKIE_MAX_AGE = 30 * 24 * 60 * 60;

function draftCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export function getDraftToken(request: NextRequest): string | undefined {
  const value = request.cookies.get(DRAFT_COOKIE_NAME)?.value?.trim();
  return value || undefined;
}

export function setDraftTokenCookie(
  response: NextResponse,
  token: string
): void {
  response.cookies.set(
    DRAFT_COOKIE_NAME,
    token,
    draftCookieOptions(DRAFT_COOKIE_MAX_AGE)
  );
}

export function clearDraftTokenCookie(response: NextResponse): void {
  response.cookies.set(DRAFT_COOKIE_NAME, "", draftCookieOptions(0));
}
