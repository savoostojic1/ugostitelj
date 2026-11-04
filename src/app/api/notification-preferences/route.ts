import { NextResponse } from "next/server";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  parseNotificationPreferences,
  preferencesFromRow,
  preferencesToRow,
} from "@/lib/notifications/preferences";
import { resolveBillingHostId } from "@/lib/subscriptions/resolve-host-subscription";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { isOwner } = await resolveBillingHostId(supabase, user.id);
  if (!isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("host_notification_preferences")
    .select(
      "email_new_request, email_confirmation, email_cancellation, push_new_request, push_confirmation, push_cancellation"
    )
    .eq("host_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("[notification-preferences] load failed");
    return NextResponse.json({
      ok: true,
      preferences: DEFAULT_NOTIFICATION_PREFERENCES,
    });
  }

  return NextResponse.json({
    ok: true,
    preferences: preferencesFromRow(data),
  });
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { isOwner } = await resolveBillingHostId(supabase, user.id);
  if (!isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const preferences = parseNotificationPreferences(
    json && typeof json === "object" && "preferences" in json
      ? (json as { preferences: unknown }).preferences
      : json
  );

  if (!preferences) {
    return NextResponse.json(
      { error: "Choose each notification as on or off." },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("host_notification_preferences").upsert(
    {
      host_id: user.id,
      ...preferencesToRow(preferences),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "host_id" }
  );

  if (error) {
    console.error("[notification-preferences] save failed");
    return NextResponse.json(
      { error: "Could not save notification settings." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, preferences });
}
