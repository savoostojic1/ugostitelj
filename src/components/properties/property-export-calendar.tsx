"use client";

import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { buildPropertyExportUrl } from "@/lib/calendar/export-url";
import { isExportableReservation } from "@/lib/calendar/export-filter";
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
    isExportableReservation(r.check_out)
  ).length;

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(exportUrl);
      toast.success("Link kopiran");
    } catch {
      toast.error("Kopiranje nije uspjelo");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Export link (Airbnb & Booking)</CardTitle>
        <p className="text-sm text-muted-foreground">
          Ne uploaduj fajl ručno. Kopiraj <strong>link ispod</strong> i zalijepi
          ga u Airbnb i Booking kao <strong>Import calendar URL</strong>. Oba
          portala povlače taj link automatski i blokiraju datume iz liste
          događaja u kalendaru.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            readOnly
            value={exportUrl}
            className="font-mono text-xs"
            aria-label={`Export link za ${propertyName}`}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0"
            onClick={copyUrl}
            aria-label="Kopiraj link"
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
              {exportableCount === 1 ? "rezervacija" : "rezervacije"} u exportu
              (datumi koje Airbnb/Booking treba da blokiraju).
            </>
          ) : (
            <>
              Export je trenutno <strong>prazan</strong> — nema budućih
              rezervacija za ovaj bungalov. Dodaj ručnu rezervaciju ili sync
              kalendare.
            </>
          )}
        </div>

        <div className="rounded-lg border border-border/80 bg-muted/20 p-3 text-sm">
          <p className="font-medium">Kako platforme znaju šta da blokiraju</p>
          <p className="mt-1 text-muted-foreground">
            Svaka rezervacija u Ugostitelju postaje jedan događaj u .ics fajlu
            sa <strong>dolaskom</strong> (DTSTART) i <strong>odlaskom</strong>{" "}
            (DTEND). Airbnb i Booking čitaju te datume i zatvaraju te noći u
            kalendaru dostupnosti.
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
            <li>Ručne rezervacije → blokiraju oba portala</li>
            <li>Booking rezervacije (sync) → blokiraju Airbnb</li>
            <li>Airbnb rezervacije (sync) → blokiraju Booking</li>
          </ul>
        </div>

        <div className="space-y-2 text-sm">
          <p className="font-medium">1. Airbnb</p>
          <p className="text-muted-foreground">
            Kalendar → Availability → Import calendar → zalijepi link → Save.
            Osvježava se otprilike svakih 1–3 sata.
          </p>
          <p className="font-medium">2. Booking.com</p>
          <p className="text-muted-foreground">
            Extranet → Rates &amp; availability → Sync calendars → Import
            calendar → zalijepi isti link. Sync može trajati do ~2 sata.
          </p>
        </div>

        <p className="text-xs text-muted-foreground">
          Ako otvoriš link u browseru, u fajlu treba da vidiš{" "}
          <strong>BEGIN:VEVENT</strong> za svaku rezervaciju i{" "}
          <strong>X-WR-CALNAME:… · Ugostitelj</strong>. Ako toga nema, deploy
          nije ažuran ili nema rezervacija za export.
        </p>
      </CardContent>
    </Card>
  );
}
