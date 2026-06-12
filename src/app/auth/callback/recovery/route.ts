import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PASSWORD_RECOVERY_COOKIE } from "@/lib/auth/password-recovery";

/** Legacy recovery links that still hit /auth/callback/recovery */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const response = NextResponse.redirect(`${origin}/reset-password`);
      response.cookies.set(PASSWORD_RECOVERY_COOKIE, "1", {
        path: "/",
        maxAge: 900,
        sameSite: "lax",
        secure: origin.startsWith("https://"),
      });
      return response;
    }
  }

  return NextResponse.redirect(`${origin}/forgot-password?error=recovery-link`);
}
