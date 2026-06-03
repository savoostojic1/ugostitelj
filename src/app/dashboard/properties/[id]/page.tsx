"use client";

import { use } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthlyCalendar } from "@/components/calendar/monthly-calendar";
import { ConnectedFeeds } from "@/components/properties/connected-feeds";
import { PropertyNameEditor } from "@/components/properties/property-name-editor";
import { PropertyDeleteButton } from "@/components/properties/property-delete-button";
import { PropertyExportCalendar } from "@/components/properties/property-export-calendar";
import { useProperty, useReservations } from "@/hooks/use-properties";
import { PLATFORM_LABELS, PLATFORM_COLORS } from "@/lib/constants";
import { formatReservationLabel } from "@/lib/reservations/display";
import { formatStayPeriodLabel } from "@/lib/dates/calendar-date";
import { cn } from "@/lib/utils";
import { getDashboardStats } from "@/lib/dashboard-stats";

export default function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: property, isLoading } = useProperty(id);
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

  const stats = getDashboardStats([property], reservations);

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

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Dolasci
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.upcomingArrivals.slice(0, 3).map((r) => (
              <div key={r.id} className="text-sm">
                <span className="font-medium">
                  {formatReservationLabel(r.title, r.platform)}
                </span>
                <span className="text-muted-foreground">
                  {" "}
                  · {format(parseISO(r.check_in), "d. MMM")}
                </span>
              </div>
            ))}
            {stats.upcomingArrivals.length === 0 && (
              <p className="text-sm text-muted-foreground">Nema</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Odlasci
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.upcomingDepartures.slice(0, 3).map((r) => (
              <div key={r.id} className="text-sm">
                <span className="font-medium">
                  {formatReservationLabel(r.title, r.platform)}
                </span>
                <span className="text-muted-foreground">
                  {" "}
                  · {format(parseISO(r.check_out), "d. MMM")}
                </span>
              </div>
            ))}
            {stats.upcomingDepartures.length === 0 && (
              <p className="text-sm text-muted-foreground">Nema</p>
            )}
          </CardContent>
        </Card>
      </div>

      <ConnectedFeeds propertyId={id} />

      {property.export_token && (
        <PropertyExportCalendar
          propertyName={property.name}
          exportToken={property.export_token}
        />
      )}

      <div>
        <h2 className="mb-4 text-lg font-semibold">Kalendar</h2>
        <MonthlyCalendar reservations={reservations} propertyId={id} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rezervacije</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {reservations.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">
              Poveži kalendar i pokreni sync.
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
                    <p className="text-xs capitalize text-muted-foreground">
                      {formatStayPeriodLabel(r.check_in, r.check_out)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-md border px-2 py-0.5 text-xs",
                      colors.bg,
                      colors.border,
                      colors.text
                    )}
                  >
                    {PLATFORM_LABELS[r.platform]}
                  </span>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
