import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getPasswordRecoveryRedirectUrl } from "@/lib/auth/password-recovery";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { isTeamAccessEmail } from "@/lib/team-access/permissions";

type Body = {
  email?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as Body;
  const normalizedEmail = body.email?.trim().toLowerCase() ?? "";

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
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
