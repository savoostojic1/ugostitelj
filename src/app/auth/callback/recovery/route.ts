import { NextResponse } from "next/server";
import { PASSWORD_RECOVERY_COOKIE } from "@/lib/auth/password-recovery";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/forgot-password?error=recovery-link`);
  }

  const response = NextResponse.redirect(`${origin}/reset-password`);
  const supabase = await createRouteHandlerClient(response);
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback/recovery]", error.message);
    const redirectUrl = new URL(`${origin}/forgot-password`);
    redirectUrl.searchParams.set("error", "recovery-link");
    if (error.message.toLowerCase().includes("code verifier")) {
      redirectUrl.searchParams.set("hint", "same-browser");
    }
    return NextResponse.redirect(redirectUrl.toString());
  }

  response.cookies.set(PASSWORD_RECOVERY_COOKIE, "1", {
    path: "/",
    maxAge: 900,
    sameSite: "lax",
    secure: origin.startsWith("https://"),
  });
  return response;
}
