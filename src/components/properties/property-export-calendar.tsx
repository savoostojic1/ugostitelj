"use client";

import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { buildPropertyExportUrl } from "@/lib/calendar/export-url";
import { isManualExportReservation } from "@/lib/calendar/export-filter";
import type { Reservation } from "@/types/database";
import { toast } from "sonner";

interface PropertyExportCalendarProps {
  propertyName: string;
  exportToken: string;
  reservations?: Reservation[];
}

export function PropertyExportCalendar({
  propertyName,
  exportToken,
  reservations = [],
}: PropertyExportCalendarProps) {
  const exportUrl = buildPropertyExportUrl(exportToken);
  const exportableCount = reservations.filter((r) =>
    isManualExportReservation(r)
  ).length;

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(exportUrl);
      toast.success("Link copied");
    } catch {
      toast.error("Copy failed");
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-base">Export link (Airbnb & Booking)</CardTitle>
        <p className="text-sm text-muted-foreground">
          Copy the <strong>link below</strong> and paste it into Airbnb and Booking as an{" "}
          <strong>Import calendar URL</strong>. Only{" "}
          <strong>manual reservations</strong> you add in Hostvia are exported — not
          Airbnb/Booking sync.
        </p>
      </CardHeader>
      <CardContent className="space-y-4 p-4 pt-0 sm:p-6 sm:pt-0">
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
          <Input
            readOnly
            value={exportUrl}
            className="min-w-0 font-mono text-xs"
            aria-label={`Export link for ${propertyName}`}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0"
            onClick={copyUrl}
            aria-label="Copy link"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>

        <div
          className={
            exportableCount > 0
              ? "rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-800 dark:text-emerald-200"
              : "rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-900 dark:text-amber-100"
          }
        >
          {exportableCount > 0 ? (
            <>
              <strong>{exportableCount}</strong>{" "}
              manual reservation{exportableCount === 1 ? "" : "s"} in export (dates
              Airbnb/Booking should block).
            </>
          ) : (
            <>
              Export is currently <strong>empty</strong> — no upcoming manual
              reservations for this property. Add them from{" "}
              <strong>Manual bookings</strong>.
            </>
          )}
        </div>

        <div className="rounded-lg border border-border/80 bg-muted/20 p-3 text-sm">
          <p className="font-medium">How platforms know what to block</p>
          <p className="mt-1 text-muted-foreground">
            Each <strong>manual reservation</strong> becomes one event in the
            .ics file with check-in (DTSTART) and check-out (DTEND). Airbnb and
            Booking pull the link and close those dates.
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
            <li>Manual reservations from Hostvia → included in export</li>
            <li>Airbnb / Booking sync → not included in export</li>
          </ul>
        </div>

        <div className="space-y-2 text-sm">
          <p className="font-medium">1. Airbnb</p>
          <p className="text-muted-foreground">
            Calendar → Availability → Import calendar → paste link → Save.
            Refreshes roughly every 1–3 hours.
          </p>
          <p className="font-medium">2. Booking.com</p>
          <p className="text-muted-foreground">
            Extranet → Rates &amp; availability → Sync calendars → Import
            calendar → paste the same link. Sync can take up to ~2 hours.
          </p>
        </div>

        <p className="text-xs text-muted-foreground">
          If you open the link in a browser, the file should contain{" "}
          <strong>BEGIN:VEVENT</strong> for each reservation and{" "}
          <strong>X-WR-CALNAME:… · Hostvia</strong>. If not, deploy is
          outdated or there are no reservations to export.
        </p>
      </CardContent>
    </Card>
  );
}
