"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Pencil, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FeedDialog } from "./feed-dialog";
import { usePropertyFeeds, useSyncFeed } from "@/hooks/use-properties";
import { PLATFORM_LABELS, PLATFORM_COLORS } from "@/lib/constants";
import { requireUser } from "@/lib/supabase/require-user";
import { useSupabase } from "@/hooks/use-supabase";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { CalendarFeed } from "@/types/database";
import { cn } from "@/lib/utils";
import { formatSyncResultMessage } from "@/lib/ical/sync-message";

export function ConnectedFeeds({ propertyId }: { propertyId: string }) {
  const supabase = useSupabase();
  const { data: feeds = [], isLoading } = usePropertyFeeds(propertyId);
  const syncFeed = useSyncFeed();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CalendarFeed | null>(null);
  const qc = useQueryClient();

  async function deleteFeed(id: string) {
    if (!confirm("Delete this calendar feed?")) return;
    await requireUser(supabase);
    const { error } = await supabase.from("calendar_feeds").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Feed deleted");
    qc.invalidateQueries({ queryKey: ["calendar_feeds", propertyId] });
  }

  async function syncAll() {
    const res = await fetch("/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ propertyId }),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error ?? "Sync failed");
      return;
    }
    const failed = (json.results as { error?: string }[] | undefined)?.find(
      (r) => r.error
    );
    if (failed?.error) {
      toast.error(failed.error);
      qc.invalidateQueries({ queryKey: ["calendar_feeds", propertyId] });
      return;
    }
    const results = json.results as {
      imported?: number;
      totalEvents?: number;
      skippedBlocked?: number;
    }[] | undefined;
    const total = results?.reduce((n, r) => n + (r.imported ?? 0), 0) ?? 0;
    const events = results?.reduce((n, r) => n + (r.totalEvents ?? 0), 0) ?? 0;
    toast.success(
      formatSyncResultMessage({
        imported: total,
        totalEvents: events,
        skippedBlocked: results?.reduce(
          (n, r) => n + (r.skippedBlocked ?? 0),
          0
        ),
      })
    );
    qc.invalidateQueries({ queryKey: ["calendar_feeds", propertyId] });
    qc.invalidateQueries({ queryKey: ["reservations"] });
  }

  return (
    <>
      <section id="import-calendars" className="hostvia-panel overflow-hidden">
        <div className="hostvia-panel-header flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-white">
              Import calendars
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Paste iCal links from Airbnb or Booking.com — reservations import
              into Hostvia
            </p>
          </div>
          <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              className="hostvia-dashboard-btn flex-1 border-white/10 sm:flex-none"
              onClick={syncAll}
              disabled={!feeds.length}
            >
              <RefreshCw className="h-4 w-4" />
              Sync all
            </Button>
            <Button
              size="sm"
              className="flex-1 sm:flex-none"
              onClick={() => {
                setEditing(null);
                setDialogOpen(true);
              }}
            >
              Add import link
            </Button>
          </div>
        </div>
        <div className="hostvia-panel-body space-y-3">
          {isLoading && (
            <p className="text-sm text-muted-foreground">Loading feeds…</p>
          )}
          {!isLoading && feeds.length === 0 && (
            <p className="rounded-lg border border-dashed border-white/10 p-6 text-center text-sm text-zinc-500">
              No import links yet. Add your Airbnb or Booking.com iCal URL.
            </p>
          )}
          {feeds.map((feed) => {
            const colors = PLATFORM_COLORS[feed.platform];
            return (
              <div
                key={feed.id}
                className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{feed.name}</span>
                    <Badge
                      variant="outline"
                      className={cn(colors.bg, colors.border, colors.text)}
                    >
                      {PLATFORM_LABELS[feed.platform]}
                    </Badge>
                    {feed.last_sync_status === "error" && (
                      <Badge variant="destructive">Sync error</Badge>
                    )}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{feed.ics_url}</p>
                  <p className="text-xs text-muted-foreground">
                    {feed.last_synced_at
                      ? `Last synced ${formatDistanceToNow(new Date(feed.last_synced_at), { addSuffix: true })}`
                      : "Never synced"}
                  </p>
                  {feed.last_sync_error && (
                    <p className="text-xs text-destructive">{feed.last_sync_error}</p>
                  )}
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      syncFeed.mutate(feed.id, {
                        onSuccess: (data) => {
                          const r = (
                            data.results as {
                              imported?: number;
                              totalEvents?: number;
                              skippedBlocked?: number;
                            }[]
                          )?.[0];
                          toast.success(formatSyncResultMessage(r ?? {}));
                          qc.invalidateQueries({
                            queryKey: ["calendar_feeds", propertyId],
                          });
                          qc.invalidateQueries({ queryKey: ["reservations"] });
                        },
                        onError: (err) =>
                          toast.error(
                            err instanceof Error ? err.message : "Sync failed"
                          ),
                      })
                    }
                    disabled={syncFeed.isPending}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Sync Now
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditing(feed);
                      setDialogOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteFeed(feed.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      <FeedDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        propertyId={propertyId}
        feed={editing}
      />
    </>
  );
}
