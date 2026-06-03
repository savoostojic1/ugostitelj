"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <div className="sticky top-0 z-20 border-b border-border/80 bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:px-8">
      <div className="mx-auto flex max-w-7xl justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleReload}
          disabled={syncAll.isPending}
          className="gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${syncAll.isPending ? "animate-spin" : ""}`}
          />
          {syncAll.isPending ? "Reloading…" : "Reload data"}
        </Button>
      </div>
    </div>
  );
}
