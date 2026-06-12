import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient, hasServiceRoleKey } from "@/lib/supabase/service";

const SERVICE_ROLE_SETUP_MESSAGE =
  "Add SUPABASE_SERVICE_ROLE_KEY to .env.local (local) and Vercel env (production). " +
  "Supabase → Project Settings → API → service_role secret. Restart the dev server after saving.";
import {
  isValidTeamUsername,
  isTeamPermission,
  teamAccessLoginEmail,
} from "@/lib/team-access/permissions";

type CreateBody = {
  username?: string;
  password?: string;
  displayName?: string;
  permissions?: string[];
};

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: selfTeam } = await supabase
    .from("team_access_users")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (selfTeam) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("team_access_users")
    .select(
      "id, host_id, auth_user_id, username, login_email, display_name, password_plain, permissions, created_at, updated_at"
    )
    .eq("host_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[team-access GET]", error.message);
    return NextResponse.json({ error: "Could not load users" }, { status: 500 });
  }

  return NextResponse.json({
    users: data ?? [],
    canCreateUsers: hasServiceRoleKey(),
  });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: selfTeam } = await supabase
    .from("team_access_users")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (selfTeam) {
    return NextResponse.json(
      { error: "Team accounts cannot manage access" },
      { status: 403 }
    );
  }

  const body = (await request.json()) as CreateBody;
  const username = body.username?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";
  const displayName = body.displayName?.trim() || null;
  const permissions = (body.permissions ?? []).filter(isTeamPermission);

  if (!isValidTeamUsername(username)) {
    return NextResponse.json(
      {
        error:
          "Username must look like pregled.your-host (lowercase letters, numbers, dots).",
      },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters." },
      { status: 400 }
    );
  }

  if (!permissions.length) {
    return NextResponse.json(
      { error: "Select at least one section the user can view." },
      { status: 400 }
    );
  }

  const loginEmail = teamAccessLoginEmail(username);

  if (!hasServiceRoleKey()) {
    return NextResponse.json({ error: SERVICE_ROLE_SETUP_MESSAGE }, { status: 503 });
  }

  const admin = createServiceClient();

  const { data: createdUser, error: createError } =
    await admin.auth.admin.createUser({
      email: loginEmail,
      password,
      email_confirm: true,
      user_metadata: {
        is_team_access: true,
        host_id: user.id,
        team_username: username,
        display_name: displayName,
        permissions,
      },
    });

  if (createError || !createdUser.user) {
    const message = createError?.message ?? "Could not create user";
    const status = message.toLowerCase().includes("already")
      ? 409
      : 500;
    return NextResponse.json({ error: message }, { status });
  }

  const { data: row, error: insertError } = await supabase
    .from("team_access_users")
    .insert({
      host_id: user.id,
      auth_user_id: createdUser.user.id,
      username,
      login_email: loginEmail,
      display_name: displayName,
      password_plain: password,
      permissions,
    })
    .select(
      "id, host_id, auth_user_id, username, login_email, display_name, password_plain, permissions, created_at, updated_at"
    )
    .single();

  if (insertError) {
    await admin.auth.admin.deleteUser(createdUser.user.id);
    console.error("[team-access POST]", insertError.message);
    return NextResponse.json(
      { error: "Could not save team access user" },
      { status: 500 }
    );
  }

  return NextResponse.json({ user: row }, { status: 201 });
}
