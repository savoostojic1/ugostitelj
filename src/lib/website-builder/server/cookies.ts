import "server-only";

import type { NextRequest, NextResponse } from "next/server";
import { WEBSITE_DRAFT_COOKIE, WEBSITE_LIMITS } from "@/lib/website-builder/limits";
import { isDraftToken } from "@/lib/website-builder/draft-store";

const MAX_AGE = WEBSITE_LIMITS.anonymousMaxAgeDays * 24 * 60 * 60;

function options(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export function readDraftToken(request: NextRequest): string | undefined {
  const value = request.cookies.get(WEBSITE_DRAFT_COOKIE)?.value;
  return isDraftToken(value) ? value : undefined;
}

export function writeDraftToken(response: NextResponse, token: string): void {
  response.cookies.set(WEBSITE_DRAFT_COOKIE, token, options(MAX_AGE));
}

export function clearDraftToken(response: NextResponse): void {
  response.cookies.set(WEBSITE_DRAFT_COOKIE, "", options(0));
}
