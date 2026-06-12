import { NextResponse } from "next/server";
import { sendWebPushToUser } from "@/lib/push/send-web-push";
import { createClient } from "@/lib/supabase/server";

type PushSubscriptionBody = {
  endpoint?: string;
  keys?: {
    p256dh?: string;
    auth?: string;
  };
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as PushSubscriptionBody;
  const endpoint = body.endpoint?.trim();
  const p256dh = body.keys?.p256dh?.trim();
  const auth = body.keys?.auth?.trim();

  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
  }

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      endpoint,
      p256dh,
      auth,
      user_agent: request.headers.get("user-agent"),
    },
    { onConflict: "user_id,endpoint" }
  );

  if (error) {
    console.error("[push/subscribe]", error.message);
    return NextResponse.json({ error: "Could not save subscription" }, { status: 500 });
  }

  try {
    await sendWebPushToUser(user.id, {
      title: "Notifications enabled",
      body: "You will get an alert when a guest sends a booking inquiry.",
      url: "/dashboard/booking-requests",
    });
  } catch (err) {
    console.error("[push/subscribe] test push failed:", err);
  }

  return NextResponse.json({ ok: true });
}
