import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { PASSWORD_RECOVERY_COOKIE } from "@/lib/auth/password-recovery";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";

function resetPasswordUrl(origin: string, params?: Record<string, string>) {
  const redirectUrl = new URL("/reset-password", origin);
  if (!params) return redirectUrl;
  for (const [key, value] of Object.entries(params)) {
    if (value) redirectUrl.searchParams.set(key, value);
  }
  return redirectUrl;
}

function withRecoveryCookie(response: NextResponse, origin: string) {
  response.cookies.set(PASSWORD_RECOVERY_COOKIE, "1", {
    path: "/",
    maxAge: 900,
    sameSite: "lax",
    secure: origin.startsWith("https://"),
  });
  return response;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const accessToken = searchParams.get("access_token");
  const refreshToken = searchParams.get("refresh_token");

  if (tokenHash && type) {
    const response = NextResponse.redirect(resetPasswordUrl(origin));
    const supabase = await createRouteHandlerClient(response);
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as EmailOtpType,
    });
    if (error) {
      console.error("[auth/callback/recovery]", error.message);
      return NextResponse.redirect(
        resetPasswordUrl(origin, { error: "recovery-link" })
      );
    }
    return withRecoveryCookie(response, origin);
  }

  if (accessToken && refreshToken) {
    const response = NextResponse.redirect(resetPasswordUrl(origin));
    const supabase = await createRouteHandlerClient(response);
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) {
      console.error("[auth/callback/recovery]", error.message);
      return NextResponse.redirect(
        resetPasswordUrl(origin, { error: "recovery-link" })
      );
    }
    return withRecoveryCookie(response, origin);
  }

  // Implicit recovery links keep the session in the URL hash, which this
  // request cannot see. Send the browser to the reset page and let it keep the hash.
  if (!code) {
    return NextResponse.redirect(
      resetPasswordUrl(origin, {
        error: searchParams.get("error") ?? "",
        error_code: searchParams.get("error_code") ?? "",
        error_description: searchParams.get("error_description") ?? "",
      })
    );
  }

  const response = NextResponse.redirect(resetPasswordUrl(origin));
  const supabase = await createRouteHandlerClient(response);
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback/recovery]", error.message);
    return NextResponse.redirect(
      resetPasswordUrl(origin, {
        error: "recovery-link",
        hint: error.message.toLowerCase().includes("code verifier")
          ? "same-browser"
          : "",
      })
    );
  }

  return withRecoveryCookie(response, origin);
}
