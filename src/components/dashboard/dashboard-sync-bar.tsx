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
    <div className="border-b border-border bg-background px-4 py-2.5 md:sticky md:top-0 md:z-20 md:border-border/80 md:bg-background/95 md:py-3 md:px-8 md:backdrop-blur supports-[backdrop-filter]:md:bg-background/80">
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
