"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SavedMessagesDropdown } from "@/components/dashboard/saved-messages-dropdown";
import { useSyncAll } from "@/hooks/use-properties";
import { formatSyncAllResultMessage } from "@/lib/sync/sync-all";
import { markSyncCompleted } from "@/lib/sync/constants";
import { toast } from "sonner";

export function DashboardTopbar() {
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
    <header className="hostvia-dashboard-topbar">
      <div className="flex flex-1 items-center gap-2">
        <span className="hidden text-xs text-zinc-500 sm:inline">
          Reservation operations
        </span>
      </div>
      <div className="flex items-center gap-2">
        <SavedMessagesDropdown />
        <Button
          variant="outline"
          size="sm"
          onClick={handleReload}
          disabled={syncAll.isPending}
          className="hostvia-dashboard-btn h-8 gap-2 border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/[0.06] hover:text-white"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 shrink-0 ${syncAll.isPending ? "animate-spin" : ""}`}
          />
          <span className="sm:hidden">
            {syncAll.isPending ? "Syncing…" : "Reload data"}
          </span>
          <span className="hidden sm:inline">
            {syncAll.isPending ? "Syncing…" : "Sync"}
          </span>
        </Button>
      </div>
    </header>
  );
}
