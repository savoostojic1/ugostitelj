import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, adminCookieOptions } from "@/lib/admin/session";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, "", { ...adminCookieOptions(0), maxAge: 0 });

  return NextResponse.json({ ok: true });
}
