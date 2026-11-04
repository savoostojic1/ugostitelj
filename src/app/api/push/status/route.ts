import { NextResponse } from "next/server";
import { matchingStoredUserAgents } from "@/lib/push/detect-subscription";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userAgent = request.headers.get("user-agent")?.trim() ?? "";
  if (!userAgent) {
    return NextResponse.json({ deviceSubscribed: false });
  }

  const { data, error } = await supabase
    .from("push_subscriptions")
    .select("user_agent")
    .eq("user_id", user.id);

  if (error) {
    console.error("[push/status]", error.message);
    return NextResponse.json({ deviceSubscribed: false });
  }

  const matches = matchingStoredUserAgents(
    (data ?? []).map((row) => row.user_agent as string | null),
    userAgent
  );

  return NextResponse.json({ deviceSubscribed: matches.length > 0 });
}
