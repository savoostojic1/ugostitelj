"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SavedMessagesDropdown } from "@/components/dashboard/saved-messages-dropdown";
import { useSyncAll } from "@/hooks/use-properties";
import { formatSyncAllResultMessage } from "@/lib/sync/sync-all";
import { markSyncCompleted } from "@/lib/sync/constants";
import { toast } from "sonner";

export function DashboardSyncBar() {
  const syncAll = useSyncAll();

  function handleReload() {
    syncAll.mutate(undefined, {
      onSuccess: (data) => {
        toast.success(formatSyncAllResultMessage(data.results));
        markSyncCompleted();
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Sync failed");
      },
    });
  }

  return (
    <div className="border-b border-white/5 bg-[#0a0a10]/60 px-4 py-2.5 md:sticky md:top-0 md:z-20 md:px-8 md:py-3 md:backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl justify-end gap-2">
        <SavedMessagesDropdown />
        <Button
          variant="outline"
          size="sm"
          onClick={handleReload}
          disabled={syncAll.isPending}
          className="gap-2 border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
        >
          <RefreshCw
            className={`h-4 w-4 ${syncAll.isPending ? "animate-spin" : ""}`}
          />
          {syncAll.isPending ? "Syncing…" : "Sync calendars"}
        </Button>
      </div>
    </div>
  );
}
