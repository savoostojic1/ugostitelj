"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { CompactPropertyCalendar } from "@/components/calendar/compact-property-calendar";
import { useProperties, useReservations } from "@/hooks/use-properties";
import { useUiStore } from "@/stores/ui-store";
import type { Reservation } from "@/types/database";

function groupByProperty(
  properties: { id: string; name: string }[],
  reservations: Reservation[]
) {
  const byId = new Map<string, Reservation[]>(
    properties.map((p) => [p.id, []])
  );

  for (const reservation of reservations) {
    const list = byId.get(reservation.property_id);
    if (list) list.push(reservation);
  }

  return properties.map((property) => ({
    property,
    reservations: byId.get(property.id) ?? [],
  }));
}

export default function CalendarsOverviewPage() {
  const { data: properties = [], isLoading: propertiesLoading } =
    useProperties();
  const { data: reservations = [], isLoading: reservationsLoading } =
    useReservations();
  const { calendarMonth, setCalendarMonth } = useUiStore();

  const isLoading = propertiesLoading || reservationsLoading;
  const grouped = groupByProperty(properties, reservations);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Kalendari</h1>
          <p className="text-muted-foreground">
            Pregled zauzetosti svih smještaja
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() =>
              setCalendarMonth(
                new Date(
                  calendarMonth.getFullYear(),
                  calendarMonth.getMonth() - 1,
                  1
                )
              )
            }
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[8rem] text-center text-sm font-semibold capitalize">
            {format(calendarMonth, "MMMM yyyy")}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => setCalendarMonth(new Date())}
          >
            Danas
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() =>
              setCalendarMonth(
                new Date(
                  calendarMonth.getFullYear(),
                  calendarMonth.getMonth() + 1,
                  1
                )
              )
            }
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Učitavanje…</p>
      )}

      {!isLoading && properties.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Nema smještaja. Dodaj prvi u meniju Properties.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {grouped.map(({ property, reservations: propertyReservations }) => (
          <div key={property.id} className="min-w-0 space-y-1.5">
            <Link
              href={`/dashboard/properties/${property.id}/calendar`}
              className="block truncate text-sm font-semibold hover:text-primary"
            >
              {property.name}
            </Link>
            <CompactPropertyCalendar
              reservations={propertyReservations}
              month={calendarMonth}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
