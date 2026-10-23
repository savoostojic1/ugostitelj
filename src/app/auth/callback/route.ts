import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";

function safeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }
  return value;
}

function loginErrorRedirect(origin: string, reason: "failed" | "exists") {
  const loginUrl = new URL("/login", origin);
  loginUrl.searchParams.set("error", "auth-callback");
  loginUrl.searchParams.set("reason", reason);
  return NextResponse.redirect(loginUrl);
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));
  const providerError = (
    searchParams.get("error_description") ??
    searchParams.get("error") ??
    ""
  ).toLowerCase();

  if (!code) {
    const reason = providerError.includes("already") ? "exists" : "failed";
    return loginErrorRedirect(origin, providerError ? reason : "failed");
  }

  const response = NextResponse.redirect(`${origin}${next}`);
  const supabase = await createRouteHandlerClient(response);
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback]", error.message);
    const reason = error.message.toLowerCase().includes("already")
      ? "exists"
      : "failed";
    return loginErrorRedirect(origin, reason);
  }

  return response;
}
