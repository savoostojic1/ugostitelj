import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getPasswordRecoveryRedirectUrl } from "@/lib/auth/password-recovery";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { isTeamAccessEmail } from "@/lib/team-access/permissions";
import { consumeRateLimits } from "@/lib/security/consume-rate-limit";
import {
  clientIpFromHeaders,
  PASSWORD_RESET_EMAIL_LIMIT,
  PASSWORD_RESET_IP_LIMIT,
  PASSWORD_RESET_WINDOW_SECONDS,
} from "@/lib/security/rate-limit";

type Body = {
  email?: string;
  captchaToken?: string;
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const normalizedEmail = body.email?.trim().toLowerCase() ?? "";

  const limited = await consumeRateLimits([
    {
      action: "password_reset_ip",
      key: clientIpFromHeaders(request.headers),
      limit: PASSWORD_RESET_IP_LIMIT,
      windowSeconds: PASSWORD_RESET_WINDOW_SECONDS,
    },
    {
      action: "password_reset_email",
      key: normalizedEmail || "-",
      limit: PASSWORD_RESET_EMAIL_LIMIT,
      windowSeconds: PASSWORD_RESET_WINDOW_SECONDS,
    },
  ]);
  if (limited === "deny") {
    return NextResponse.json(
      { error: "Too many reset requests. Try again in an hour." },
      { status: 429 }
    );
  }

  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  if (isTeamAccessEmail(normalizedEmail)) {
    return NextResponse.json(
      {
        error:
          "Team access accounts cannot reset password by email. Ask the property owner to use Give access → Reset password.",
      },
      { status: 400 }
    );
  }

  const { url, anonKey } = getSupabaseEnv();
  // Implicit flow puts the session in the email link itself. PKCE would require
  // a cookie from the browser that requested the reset, which mail apps do not keep.
  const supabase = createClient(url, anonKey, {
    auth: {
      flowType: "implicit",
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  const origin = new URL(request.url).origin;
  const redirectTo = getPasswordRecoveryRedirectUrl(origin);

  const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
    redirectTo,
    captchaToken: body.captchaToken || undefined,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
