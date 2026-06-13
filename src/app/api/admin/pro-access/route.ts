import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/require-admin";
import { suggestUsernameFromEmail } from "@/lib/public/slug";
import { createServiceClient } from "@/lib/supabase/service";

type Body = {
  hostId?: string;
  username?: string;
  granted?: boolean;
  note?: string;
};

export async function POST(request: Request) {
  const denied = await requireAdminSession();
  if (denied) return denied;

  const body = (await request.json()) as Body;
  const granted = body.granted ?? true;
  const hostId = body.hostId?.trim();
  const username = body.username?.trim().toLowerCase();

  if (!hostId && !username) {
    return NextResponse.json(
      { error: "Provide hostId or username" },
      { status: 400 }
    );
  }

  let admin;
  try {
    admin = createServiceClient();
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Service client unavailable",
      },
      { status: 500 }
    );
  }

  let query = admin
    .from("host_profiles")
    .select("id, username, pro_access_granted")
    .limit(1);

  if (hostId) {
    query = query.eq("id", hostId);
  } else if (username) {
    query = query.ilike("username", username);
  }

  const { data: profile, error: lookupError } = await query.maybeSingle();

  if (lookupError) {
    return NextResponse.json({ error: lookupError.message }, { status: 500 });
  }

  if (!profile) {
    if (!hostId) {
      return NextResponse.json({ error: "Host not found" }, { status: 404 });
    }

    const { data: authData, error: authError } =
      await admin.auth.admin.getUserById(hostId);

    if (authError || !authData.user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const username = suggestUsernameFromEmail(authData.user.email ?? "host");
    const note = body.note?.trim() || null;

    const { data: created, error: createError } = await admin
      .from("host_profiles")
      .insert({
        id: hostId,
        username,
        business_name: username,
        is_published: false,
        pro_access_granted: granted,
        pro_access_granted_at: granted ? new Date().toISOString() : null,
        pro_access_granted_note: granted ? note : null,
        subscription_status: "free",
      })
      .select(
        "id, username, pro_access_granted, pro_access_granted_at, pro_access_granted_note"
      )
      .single();

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    return NextResponse.json({
      host: created,
      message: granted
        ? `Complimentary Pro granted to @${created.username}`
        : `Profile created for user`,
    });
  }

  const note = body.note?.trim() || null;

  const { data: updated, error: updateError } = await admin
    .from("host_profiles")
    .update({
      pro_access_granted: granted,
      pro_access_granted_at: granted ? new Date().toISOString() : null,
      pro_access_granted_note: granted ? note : null,
    })
    .eq("id", profile.id)
    .select(
      "id, username, pro_access_granted, pro_access_granted_at, pro_access_granted_note"
    )
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({
    host: updated,
    message: granted
      ? `Complimentary Pro granted to @${updated.username}`
      : `Complimentary Pro revoked from @${updated.username}`,
  });
}
