"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { requireUser } from "@/lib/supabase/require-user";
import { useSupabase } from "@/hooks/use-supabase";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { CalendarFeed, CalendarPlatform } from "@/types/database";
import { PLATFORM_LABELS } from "@/lib/constants";
import { getSupabaseErrorMessage } from "@/lib/supabase/error-message";
import {
  getIcsUrlHint,
  normalizeIcsUrl,
  validateIcsUrl,
} from "@/lib/ical/validate-feed-url";
import { formatSyncResultMessage } from "@/lib/ical/sync-message";

interface FeedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
  feed?: CalendarFeed | null;
}

export function FeedDialog({ open, onOpenChange, propertyId, feed }: FeedDialogProps) {
  const [platform, setPlatform] = useState<CalendarPlatform>("airbnb");
  const [name, setName] = useState("");
  const [icsUrl, setIcsUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const qc = useQueryClient();
  const supabase = useSupabase();

  useEffect(() => {
    if (feed) {
      setPlatform(feed.platform);
      setName(feed.name);
      setIcsUrl(feed.ics_url);
    } else {
      setPlatform("airbnb");
      setName("");
      setIcsUrl("");
    }
  }, [feed, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await requireUser(supabase);
      const trimmedUrl = normalizeIcsUrl(icsUrl);
      if (
        !trimmedUrl.startsWith("http://") &&
        !trimmedUrl.startsWith("https://")
      ) {
        throw new Error("ICS URL mora počinjati sa http:// ili https://");
      }

      const urlProblem = validateIcsUrl(platform, trimmedUrl);
      if (urlProblem) {
        throw new Error(
          urlProblem.hint
            ? `${urlProblem.error} ${urlProblem.hint}`
            : urlProblem.error
        );
      }

      const urlHint = getIcsUrlHint(platform, trimmedUrl);
      if (urlHint) {
        toast.warning(urlHint);
      }

      const { data: owned, error: ownedError } = await supabase
        .from("properties")
        .select("id")
        .eq("id", propertyId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (ownedError) throw ownedError;
      if (!owned) {
        throw new Error("Nekretnina nije pronađena ili nemate pristup.");
      }

      let feedId = feed?.id;

      if (feed) {
        const { error } = await supabase
          .from("calendar_feeds")
          .update({ platform, name, ics_url: trimmedUrl })
          .eq("id", feed.id);
        if (error) throw error;
        feedId = feed.id;
        toast.success("Kalendar ažuriran");
      } else {
        const { data: created, error } = await supabase
          .from("calendar_feeds")
          .insert({
            property_id: propertyId,
            platform,
            name: name.trim(),
            ics_url: trimmedUrl,
          })
          .select("id")
          .single();
        if (error) throw error;
        feedId = created.id;
        toast.success("Kalendar dodat");
      }

      if (feedId) {
        const syncRes = await fetch("/api/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ feedId }),
        });
        const syncJson = await syncRes.json();
        if (!syncRes.ok) {
          toast.error(syncJson.error ?? "Sync nije uspio");
        } else {
          const r = (
            syncJson.results as {
              imported?: number;
              totalEvents?: number;
              skippedBlocked?: number;
              error?: string;
            }[]
          )?.[0];
          if (r?.error) {
            toast.error(r.error);
          } else {
            toast.info(formatSyncResultMessage(r ?? {}));
          }
          qc.invalidateQueries({ queryKey: ["reservations"] });
        }
      }

      qc.invalidateQueries({ queryKey: ["calendar_feeds", propertyId] });
      onOpenChange(false);
    } catch (err) {
      toast.error(getSupabaseErrorMessage(err, "Greška pri čuvanju kalendara"));
      console.error("[feed-dialog]", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{feed ? "Edit Calendar Feed" : "Add Calendar Feed"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Platform</Label>
            <Select value={platform} onValueChange={(v) => setPlatform(v as CalendarPlatform)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(PLATFORM_LABELS) as CalendarPlatform[]).map((p) => (
                  <SelectItem key={p} value={p}>
                    {PLATFORM_LABELS[p]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="feed-name">Calendar Name</Label>
            <Input
              id="feed-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Main listing calendar"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ics-url">ICS URL</Label>
            <Input
              id="ics-url"
              type="text"
              value={icsUrl}
              onChange={(e) => setIcsUrl(e.target.value)}
              placeholder="https://www.airbnb.com/calendar/ical/....ics"
              required
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground">
              {platform === "airbnb" &&
                "Airbnb: Calendar → Availability → Export calendar. Kopiraj cijeli link (webcal:// pretvaramo u https)."}
              {platform === "booking" &&
                "Booking: Rates & availability → Sync calendars → Add connection → Skip to export → Copy link. Mora biti ical.html?t=... ili ical.booking.com/v1/export?t=... (NE Import link)."}
              {platform === "custom" &&
                "Zalijepi javni .ics URL kalendara (http/https)."}
            </p>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving…" : feed ? "Save Changes" : "Add Feed"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
