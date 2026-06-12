import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { isValidTeamUsername } from "@/lib/team-access/permissions";

type Body = {
  username?: string;
  password?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as Body;
  const username = body.username?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";

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
  });

  if (signInError) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
