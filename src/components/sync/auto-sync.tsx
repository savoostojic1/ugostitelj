"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/hooks/use-supabase";
import { postSyncAll } from "@/lib/sync/sync-all";
import {
  markSyncCompleted,
  shouldRunAutoSync,
  SYNC_INTERVAL_MS,
} from "@/lib/sync/constants";

export function AutoSync() {
  const supabase = useSupabase();
  const qc = useQueryClient();
  const running = useRef(false);

  useEffect(() => {
    async function runAutoSync() {
      if (running.current || !shouldRunAutoSync()) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      running.current = true;
      try {
        await postSyncAll();
        markSyncCompleted();
        qc.invalidateQueries({ queryKey: ["calendar_feeds"] });
        qc.invalidateQueries({ queryKey: ["reservations"] });
      } catch {
        // Auto-sync fails silently; user can use Reload data
      } finally {
        running.current = false;
      }
    }

    runAutoSync();
    const interval = setInterval(runAutoSync, SYNC_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [supabase, qc]);

  return null;
}
