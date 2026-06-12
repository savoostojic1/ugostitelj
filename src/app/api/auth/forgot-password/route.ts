import { NextResponse } from "next/server";
import { getPasswordRecoveryRedirectUrl } from "@/lib/auth/password-recovery";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";
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

  const response = NextResponse.json({ ok: true });
  const supabase = await createRouteHandlerClient(response);
  const origin = new URL(request.url).origin;
  const redirectTo = getPasswordRecoveryRedirectUrl(origin);

  const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
    redirectTo,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return response;
}
