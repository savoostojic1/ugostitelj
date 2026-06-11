import type { SupabaseClient } from "@supabase/supabase-js";
import { syncCalendarFeed } from "@/lib/ical/sync-feed";
import type { CalendarFeed } from "@/types/database";
import type { SyncFeedResult } from "@/lib/sync/sync-all";

export async function syncCalendarFeeds(
  supabase: SupabaseClient,
  feeds: CalendarFeed[]
): Promise<SyncFeedResult[]> {
  const results: SyncFeedResult[] = [];

  for (const feed of feeds) {
    const result = await syncCalendarFeed(supabase, feed);
    results.push({ feedId: feed.id, ...result });
  }

  return results;
}
