import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { isTeamPermission } from "@/lib/team-access/permissions";

type PatchBody = {
  displayName?: string;
  password?: string;
  permissions?: string[];
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: existing, error: fetchError } = await supabase
    .from("team_access_users")
    .select("*")
    .eq("id", id)
    .eq("host_id", user.id)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json({ error: "Could not load user" }, { status: 500 });
  }

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = (await request.json()) as PatchBody;
  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (body.displayName !== undefined) {
    updates.display_name = body.displayName.trim() || null;
  }

  if (body.permissions !== undefined) {
    const permissions = body.permissions.filter(isTeamPermission);
    if (!permissions.length) {
      return NextResponse.json(
        { error: "Select at least one section." },
        { status: 400 }
      );
    }
    updates.permissions = permissions;
  }

  if (body.password && body.password.length >= 6) {
    try {
      const admin = createServiceClient();
      const { error: pwError } = await admin.auth.admin.updateUserById(
        existing.auth_user_id,
        { password: body.password }
      );
      if (pwError) {
        return NextResponse.json({ error: pwError.message }, { status: 500 });
      }
      updates.password_plain = body.password;
    } catch {
      return NextResponse.json(
        { error: "Server is not configured for password updates." },
        { status: 500 }
      );
    }
  } else if (body.password) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("team_access_users")
    .update(updates)
    .eq("id", id)
    .eq("host_id", user.id)
    .select(
      "id, host_id, auth_user_id, username, login_email, display_name, password_plain, permissions, created_at, updated_at"
    )
    .single();

  if (error) {
    return NextResponse.json({ error: "Could not update user" }, { status: 500 });
  }

  if (updates.permissions || updates.display_name !== undefined) {
    try {
      const admin = createServiceClient();
      await admin.auth.admin.updateUserById(existing.auth_user_id, {
        user_metadata: {
          is_team_access: true,
          host_id: user.id,
          team_username: existing.username,
          display_name: data.display_name,
          permissions: data.permissions,
        },
      });
    } catch {
      // Row updated; metadata sync is best-effort.
    }
  }

  return NextResponse.json({ user: data });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: existing, error: fetchError } = await supabase
    .from("team_access_users")
    .select("auth_user_id")
    .eq("id", id)
    .eq("host_id", user.id)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json({ error: "Could not load user" }, { status: 500 });
  }

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { error: deleteRowError } = await supabase
    .from("team_access_users")
    .delete()
    .eq("id", id)
    .eq("host_id", user.id);

  if (deleteRowError) {
    return NextResponse.json({ error: "Could not delete user" }, { status: 500 });
  }

  try {
    const admin = createServiceClient();
    await admin.auth.admin.deleteUser(existing.auth_user_id);
  } catch {
    // Auth user may already be gone.
  }

  return NextResponse.json({ ok: true });
}
