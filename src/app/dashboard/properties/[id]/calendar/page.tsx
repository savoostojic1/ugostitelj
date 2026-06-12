"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthlyCalendar } from "@/components/calendar/monthly-calendar";
import { PropertyDeleteButton } from "@/components/properties/property-delete-button";
import { PropertyCalendarNav } from "@/components/properties/property-calendar-nav";
import { PropertyDetailNav } from "@/components/properties/property-detail-nav";
import { useProperty, useReservations } from "@/hooks/use-properties";
import { useDashboardContext } from "@/hooks/use-team-access";
import { canAccessPropertySettings } from "@/lib/team-access/permissions";
import { PLATFORM_LABELS, PLATFORM_COLORS } from "@/lib/constants";
import { formatReservationLabel } from "@/lib/reservations/display";
import { formatStayPeriodLabel } from "@/lib/dates/calendar-date";
import { formatPrice } from "@/lib/format/price";
import { cn } from "@/lib/utils";

export default function PropertyCalendarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: property, isLoading } = useProperty(id);
  const { data: reservations = [], isLoading: reservationsLoading } =
    useReservations(id);
  const { data: context, isLoading: contextLoading } = useDashboardContext();
  const showSettings = context
    ? canAccessPropertySettings(context.permissions, context.isOwner)
    : false;
  const backHref = showSettings
    ? "/dashboard/properties"
    : "/dashboard/calendars";
  const backLabel = showSettings ? "Properties" : "Calendars";

  if (isLoading || contextLoading) {
    return null;
  }

  if (!property) {
    return (
      <div className="space-y-4">
        <p className="text-foreground">Property not found</p>
        <Button asChild variant="outline">
          <Link href={backHref}>Back to list</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="hostvia-property-page hostvia-pwa-property-page space-y-8">
      <Button variant="ghost" size="sm" asChild className="hostvia-dashboard-page-inset w-fit">
        <Link href={backHref}>
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>
      </Button>

      <div className="hostvia-dashboard-page-inset flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h1 className="hostvia-dashboard-title truncate">{property.name}</h1>
          <p className="text-sm text-muted-foreground">
            Calendar & reservations
          </p>
        </div>
        {showSettings ? (
          <PropertyDeleteButton propertyId={id} propertyName={property.name} />
        ) : null}
      </div>

      <PropertyDetailNav propertyId={id} />

      <section className="hostvia-panel w-full min-w-0 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-white/6 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-semibold text-white">Calendar</h2>
          <PropertyCalendarNav propertyId={id} />
        </div>
        {reservationsLoading ? null : (
          <MonthlyCalendar reservations={reservations} propertyId={id} embedded />
        )}
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Reservations</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {reservationsLoading ? null : reservations.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">
              No reservations. Connect calendars in settings and run sync.
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
                      {r.is_manual && r.guest_phone && <> · {r.guest_phone}</>}
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
                    {r.is_manual ? "Manual" : PLATFORM_LABELS[r.platform]}
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
