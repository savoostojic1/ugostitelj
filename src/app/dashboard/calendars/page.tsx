"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { CompactPropertyCalendar } from "@/components/calendar/compact-property-calendar";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { useProperties, useReservations } from "@/hooks/use-properties";
import { useUiStore } from "@/stores/ui-store";
import { getPropertyCalendarColor } from "@/lib/properties/property-colors";
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
    <div className="space-y-8">
      <DashboardPageHeader
        eyebrow="Calendar view"
        title="Calendars"
        description="Occupancy across all properties"
        actions={
          <div className="flex items-center gap-1 rounded-lg border border-white/8 bg-black/20 p-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-300 hover:bg-white/5 hover:text-white"
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
            <span className="min-w-[8.5rem] text-center text-sm font-semibold capitalize text-white">
              {format(calendarMonth, "MMMM yyyy")}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-zinc-300 hover:bg-white/5 hover:text-white"
              onClick={() => setCalendarMonth(new Date())}
            >
              Today
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-300 hover:bg-white/5 hover:text-white"
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
        }
      />

      {!isLoading && properties.length === 0 && (
        <div className="hostvia-panel py-16 text-center">
          <p className="text-zinc-400">
            No properties yet. Add your first property to see calendars.
          </p>
          <Link
            href="/dashboard/properties/new"
            className="hostvia-btn-gradient mt-4 inline-flex h-10 items-center rounded-lg px-5 text-sm font-semibold"
          >
            Add property
          </Link>
        </div>
      )}

      <div className="hostvia-dashboard-bleed-x grid grid-cols-2 gap-1.5 sm:mx-0 sm:w-full sm:gap-4 md:grid-cols-2">
        {grouped.map(({ property, reservations: propertyReservations }, i) => {
          const colors = getPropertyCalendarColor(i);
          return (
            <div
              key={property.id}
              className="hostvia-panel min-w-0 overflow-hidden rounded-lg sm:rounded-xl"
            >
              <div className="flex items-center gap-1.5 border-b border-white/6 px-2 py-2 sm:gap-2 sm:px-4 sm:py-3">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: colors.solid }}
                />
                <Link
                  href={`/dashboard/properties/${property.id}/calendar`}
                  className="truncate text-xs font-semibold text-white hover:text-violet-200 sm:text-sm"
                >
                  {property.name}
                </Link>
              </div>
              <div className="p-1.5 sm:p-3">
                <CompactPropertyCalendar
                  reservations={propertyReservations}
                  month={calendarMonth}
                  compact
                />
                <p className="mt-2 text-[10px] text-zinc-500 sm:mt-3 sm:text-xs">
                  {propertyReservations.length} reservation
                  {propertyReservations.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
