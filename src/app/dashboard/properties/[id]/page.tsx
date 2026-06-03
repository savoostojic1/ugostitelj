"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthlyCalendar } from "@/components/calendar/monthly-calendar";
import { ConnectedFeeds } from "@/components/properties/connected-feeds";
import { PropertyNameEditor } from "@/components/properties/property-name-editor";
import { PropertyDeleteButton } from "@/components/properties/property-delete-button";
import { PropertyExportCalendar } from "@/components/properties/property-export-calendar";
import { PropertyCalendarNav } from "@/components/properties/property-calendar-nav";
import { useProperty, usePropertyFeeds, useReservations } from "@/hooks/use-properties";
import { PLATFORM_LABELS, PLATFORM_COLORS } from "@/lib/constants";
import { formatReservationLabel } from "@/lib/reservations/display";
import { formatStayPeriodLabel } from "@/lib/dates/calendar-date";
import { formatPrice } from "@/lib/format/price";
import { cn } from "@/lib/utils";

export default function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: property, isLoading } = useProperty(id);
  const { data: feeds = [], isLoading: feedsLoading } = usePropertyFeeds(id);
  const { data: reservations = [] } = useReservations(id);

  if (isLoading) {
    return <p className="text-muted-foreground">Učitavanje…</p>;
  }

  if (!property) {
    return (
      <div className="space-y-4">
        <p>Nekretnina nije pronađena</p>
        <Button asChild variant="outline">
          <Link href="/dashboard/properties">Nazad na listu</Link>
        </Button>
      </div>
    );
  }

  const isSetupState =
    !feedsLoading && feeds.length === 0 && reservations.length === 0;

  const calendarSetup = (
    <>
      <ConnectedFeeds propertyId={id} />
      {property.export_token && (
        <PropertyExportCalendar
          propertyName={property.name}
          exportToken={property.export_token}
        />
      )}
    </>
  );

  return (
    <div className="space-y-8">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/dashboard/properties">
          <ArrowLeft className="h-4 w-4" />
          Nekretnine
        </Link>
      </Button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PropertyNameEditor propertyId={id} name={property.name} />
        <PropertyDeleteButton propertyId={id} propertyName={property.name} />
      </div>

      {feedsLoading && reservations.length === 0 ? (
        <p className="text-sm text-muted-foreground">Učitavanje…</p>
      ) : isSetupState ? (
        calendarSetup
      ) : (
        <>
          <div>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Kalendar</h2>
              <PropertyCalendarNav propertyId={id} />
            </div>
            <MonthlyCalendar reservations={reservations} propertyId={id} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Rezervacije</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              {reservations.length === 0 ? (
                <p className="py-4 text-sm text-muted-foreground">
                  Nema rezervacija. Pokreni sync na povezanim kalendarima.
                </p>
              ) : (
                reservations.map((r) => {
                  const colors = PLATFORM_COLORS[r.platform];
                  return (
                    <div
                      key={r.id}
                      className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {formatReservationLabel(r.title, r.platform)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatStayPeriodLabel(r.check_in, r.check_out)}
                          {r.is_manual && r.source && <> · {r.source}</>}
                          {r.is_manual && r.price != null && (
                            <> · {formatPrice(r.price)}</>
                          )}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "rounded-md border px-2 py-0.5 text-xs",
                          r.is_manual
                            ? "border-violet-500/40 bg-violet-500/15 text-violet-600 dark:text-violet-300"
                            : cn(colors.bg, colors.border, colors.text)
                        )}
                      >
                        {r.is_manual ? "Ručno" : PLATFORM_LABELS[r.platform]}
                      </span>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {calendarSetup}
        </>
      )}
    </div>
  );
}
