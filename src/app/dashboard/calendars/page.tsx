"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { CompactPropertyCalendar } from "@/components/calendar/compact-property-calendar";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { useAllowedProperties, useAllowedReservations } from "@/hooks/use-allowed-properties";
import { useDashboardContext } from "@/hooks/use-team-access";
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
    useAllowedProperties();
  const { data: reservations = [], isLoading: reservationsLoading } =
    useAllowedReservations();
  const { calendarMonth, setCalendarMonth } = useUiStore();
  const { data: context } = useDashboardContext();
  const isOwner = context?.isOwner ?? true;

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
            {isOwner
              ? "No properties yet. Add your first property to see calendars."
              : "No properties to show yet."}
          </p>
          {isOwner ? (
            <Link
              href="/dashboard/properties/new"
              className="hostvia-btn-gradient mt-4 inline-flex h-10 items-center rounded-lg px-5 text-sm font-semibold"
            >
              Add property
            </Link>
          ) : null}
        </div>
      )}

      <div className="grid w-full grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
        {grouped.map(({ property, reservations: propertyReservations }, i) => {
          const colors = getPropertyCalendarColor(i);
          const count = propertyReservations.length;
          return (
            <div
              key={property.id}
              className="hostvia-panel group flex w-full min-w-0 flex-col overflow-hidden transition hover:border-violet-500/20"
            >
              <div className="flex items-center gap-2.5 border-b border-white/6 px-3 py-2.5">
                <div
                  className="h-8 w-1 shrink-0 rounded-full"
                  style={{ background: colors.solid }}
                />
                <Link
                  href={`/dashboard/properties/${property.id}/calendar`}
                  className="min-w-0 flex-1 truncate text-sm font-semibold text-white transition group-hover:text-violet-200"
                >
                  {property.name}
                </Link>
                <span className="shrink-0 rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] tabular-nums text-zinc-400">
                  {count}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-2 sm:p-2.5">
                <CompactPropertyCalendar
                  reservations={propertyReservations}
                  month={calendarMonth}
                  compact
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
