import { NextResponse } from "next/server";
import {
  IMPERSONATING_COOKIE,
  impersonationCookieOptions,
} from "@/lib/admin/impersonation";
import { requireAdminSession } from "@/lib/admin/require-admin";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";

export async function POST() {
  const denied = await requireAdminSession();
  if (denied) return denied;

  const response = NextResponse.json({ ok: true, redirectTo: "/admin/dashboard" });
  const supabase = await createRouteHandlerClient(response);
  await supabase.auth.signOut({ scope: "local" });

  response.cookies.set(IMPERSONATING_COOKIE, "", {
    ...impersonationCookieOptions(0),
    maxAge: 0,
  });

  return response;
}
