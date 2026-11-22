import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { isValidTeamUsername } from "@/lib/team-access/permissions";
import { consumeRateLimits } from "@/lib/security/consume-rate-limit";
import {
  clientIpFromHeaders,
  TEAM_LOGIN_IP_LIMIT,
  TEAM_LOGIN_USER_LIMIT,
  TEAM_LOGIN_WINDOW_SECONDS,
} from "@/lib/security/rate-limit";

type Body = {
  username?: string;
  password?: string;
  captchaToken?: string;
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const username = body.username?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";

  const limited = await consumeRateLimits([
    {
      action: "team_login_ip",
      key: clientIpFromHeaders(request.headers),
      limit: TEAM_LOGIN_IP_LIMIT,
      windowSeconds: TEAM_LOGIN_WINDOW_SECONDS,
    },
    {
      action: "team_login_user",
      key: username || "-",
      limit: TEAM_LOGIN_USER_LIMIT,
      windowSeconds: TEAM_LOGIN_WINDOW_SECONDS,
    },
  ]);
  if (limited === "deny") {
    return NextResponse.json(
      { error: "Too many sign-in attempts. Wait 15 minutes and try again." },
      { status: 429 }
    );
  }

  if (!isValidTeamUsername(username) || !password) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  let admin;
  try {
    admin = createServiceClient();
  } catch {
    return NextResponse.json({ error: "Login unavailable" }, { status: 500 });
  }

  const { data: teamRow, error: lookupError } = await admin
    .from("team_access_users")
    .select("login_email")
    .eq("username", username)
    .maybeSingle();

  if (lookupError || !teamRow?.login_email) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: teamRow.login_email,
    password,
    // Supabase checks this token itself when CAPTCHA is enabled under Auth settings.
    options: { captchaToken: body.captchaToken || undefined },
  });

  if (signInError) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
