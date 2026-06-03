import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncCalendarFeed } from "@/lib/ical/sync-feed";
import type { CalendarFeed } from "@/types/database";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const feedId = body.feedId as string | undefined;
  const propertyId = body.propertyId as string | undefined;
  const syncAll = body.syncAll === true;

  if (!feedId && !propertyId && !syncAll) {
    return NextResponse.json(
      { error: "feedId, propertyId, or syncAll required" },
      { status: 400 }
    );
  }

  let feeds: CalendarFeed[] = [];

  if (syncAll) {
    const { data: properties, error: propsError } = await supabase
      .from("properties")
      .select("id")
      .eq("user_id", user.id);

    if (propsError) {
      return NextResponse.json({ error: propsError.message }, { status: 500 });
    }

    const propertyIds = properties?.map((p) => p.id) ?? [];
    if (propertyIds.length === 0) {
      return NextResponse.json({ results: [] });
    }

    const { data, error } = await supabase
      .from("calendar_feeds")
      .select("*")
      .in("property_id", propertyIds);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    feeds = (data ?? []) as CalendarFeed[];
  } else if (feedId) {
    const { data: feed, error } = await supabase
      .from("calendar_feeds")
      .select("*")
      .eq("id", feedId)
      .single();
    if (error || !feed) {
      return NextResponse.json({ error: "Feed not found" }, { status: 404 });
    }
    const { data: prop } = await supabase
      .from("properties")
      .select("user_id")
      .eq("id", feed.property_id)
      .single();
    if (!prop || prop.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    feeds = [feed as CalendarFeed];
  } else {
    const { data: props } = await supabase
      .from("properties")
      .select("id")
      .eq("id", propertyId!)
      .eq("user_id", user.id)
      .single();
    if (!props) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }
    const { data, error } = await supabase
      .from("calendar_feeds")
      .select("*")
      .eq("property_id", propertyId!);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    feeds = (data ?? []) as CalendarFeed[];
  }

  const results = [];
  for (const feed of feeds) {
    const result = await syncCalendarFeed(supabase, feed);
    results.push({ feedId: feed.id, ...result });
  }

  const failed = results.find((r) => r.error);
  if (failed?.error) {
    return NextResponse.json(
      { error: failed.error, results },
      { status: 422 }
    );
  }

  return NextResponse.json({ results });
}
