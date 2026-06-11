import { NextResponse } from "next/server";
import { createServiceClient, hasServiceRoleKey } from "@/lib/supabase/service";
import { syncCalendarFeeds } from "@/lib/sync/sync-feeds-batch";
import type { CalendarFeed } from "@/types/database";

export const runtime = "nodejs";
export const maxDuration = 300;

function isAuthorized(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET?.trim();
  if (!cronSecret) return false;

  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasServiceRoleKey()) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY is not configured" },
      { status: 500 }
    );
  }

  const supabase = createServiceClient();

  const { data: feeds, error } = await supabase
    .from("calendar_feeds")
    .select("*")
    .order("last_synced_at", { ascending: true, nullsFirst: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const allFeeds = (feeds ?? []) as CalendarFeed[];

  if (allFeeds.length === 0) {
    return NextResponse.json({
      ok: true,
      feeds: 0,
      succeeded: 0,
      failed: 0,
      results: [],
    });
  }

  const results = await syncCalendarFeeds(supabase, allFeeds);
  const failed = results.filter((r) => r.error).length;

  return NextResponse.json({
    ok: failed === 0,
    feeds: allFeeds.length,
    succeeded: allFeeds.length - failed,
    failed,
    results,
  });
}
