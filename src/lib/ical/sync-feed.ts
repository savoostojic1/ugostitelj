import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchAndParseIcs } from "./sync";
import { normalizeIcsUrl } from "./validate-feed-url";
import type { CalendarFeed } from "@/types/database";
import { getSupabaseErrorMessage } from "@/lib/supabase/error-message";

export async function syncCalendarFeed(
  supabase: SupabaseClient,
  feed: CalendarFeed
): Promise<{
  imported: number;
  removed: number;
  totalEvents: number;
  skippedBlocked: number;
  skippedInvalid: number;
  error?: string;
}> {
  try {
    const { data: property, error: propError } = await supabase
      .from("properties")
      .select("user_id")
      .eq("id", feed.property_id)
      .single();

    if (propError || !property?.user_id) {
      throw new Error("Property not found");
    }

    const { reservations: parsed, stats } = await fetchAndParseIcs(
      normalizeIcsUrl(feed.ics_url),
      feed.platform
    );

    const parsedUidSet = new Set(parsed.map((r) => r.external_uid));

    if (parsed.length > 0) {
      const rows = parsed.map((r) => ({
        property_id: feed.property_id,
        user_id: property.user_id,
        calendar_feed_id: feed.id,
        external_uid: r.external_uid,
        title: r.title,
        check_in: r.check_in,
        check_out: r.check_out,
        platform: r.platform,
        is_manual: false,
      }));

      const { error: upsertError } = await supabase
        .from("reservations")
        .upsert(rows, { onConflict: "property_id,external_uid" });

      if (upsertError) throw upsertError;
    }

    const { data: existing, error: existingError } = await supabase
      .from("reservations")
      .select("id, external_uid, is_manual")
      .eq("calendar_feed_id", feed.id);

    if (existingError) throw existingError;

    const staleIds =
      existing
        ?.filter((r) => !r.is_manual && !parsedUidSet.has(r.external_uid))
        .map((r) => r.id) ?? [];

    let removed = 0;
    if (staleIds.length > 0) {
      const { error: deleteError } = await supabase
        .from("reservations")
        .delete()
        .in("id", staleIds);

      if (deleteError) throw deleteError;
      removed = staleIds.length;
    }

    await supabase
      .from("calendar_feeds")
      .update({
        last_synced_at: new Date().toISOString(),
        last_sync_status: "success",
        last_sync_error: null,
      })
      .eq("id", feed.id);

    return {
      imported: parsed.length,
      removed,
      totalEvents: stats.totalEvents,
      skippedBlocked: stats.skippedBlocked,
      skippedInvalid: stats.skippedInvalid,
    };
  } catch (err) {
    const message = getSupabaseErrorMessage(err, "Sync failed");
    await supabase
      .from("calendar_feeds")
      .update({
        last_sync_status: "error",
        last_sync_error: message,
      })
      .eq("id", feed.id);
    return {
      imported: 0,
      removed: 0,
      totalEvents: 0,
      skippedBlocked: 0,
      skippedInvalid: 0,
      error: message,
    };
  }
}
