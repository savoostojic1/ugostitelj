import { NextResponse } from "next/server";
import { matchingStoredUserAgents } from "@/lib/push/detect-subscription";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { endpoint?: string; device?: boolean };
  const endpoint = body.endpoint?.trim();
  const userAgent = request.headers.get("user-agent")?.trim() ?? "";

  if (!endpoint && !body.device) {
    return NextResponse.json({ error: "Missing endpoint" }, { status: 400 });
  }

  if (endpoint) {
    const { error } = await supabase
      .from("push_subscriptions")
      .delete()
      .eq("user_id", user.id)
      .eq("endpoint", endpoint);

    if (error) {
      console.error("[push/unsubscribe]", error.message);
      return NextResponse.json({ error: "Could not remove subscription" }, { status: 500 });
    }
  }

  if (body.device) {
    if (!userAgent) {
      return NextResponse.json({ error: "Missing device" }, { status: 400 });
    }

    const { data: existing, error: loadError } = await supabase
      .from("push_subscriptions")
      .select("user_agent")
      .eq("user_id", user.id);

    if (loadError) {
      console.error("[push/unsubscribe] device", loadError.message);
      return NextResponse.json({ error: "Could not remove subscription" }, { status: 500 });
    }

    const matches = matchingStoredUserAgents(
      (existing ?? []).map((row) => row.user_agent as string | null),
      userAgent
    );

    if (matches.length > 0) {
      const { error } = await supabase
        .from("push_subscriptions")
        .delete()
        .eq("user_id", user.id)
        .in("user_agent", matches);

      if (error) {
        console.error("[push/unsubscribe] device", error.message);
        return NextResponse.json({ error: "Could not remove subscription" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ ok: true });
}
