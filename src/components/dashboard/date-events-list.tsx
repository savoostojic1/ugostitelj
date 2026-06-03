"use client";

import Link from "next/link";
import { useMemo } from "react";
import { format, startOfDay } from "date-fns";
import { sr } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  buildMonthDayGroups,
  DAY_EVENT_LABELS,
  formatCleaningCount,
  type DayEventType,
  type PropertyDayCard,
} from "@/lib/reservations/date-events";
import {
  getPropertyCalendarColor,
  type PropertyCalendarColor,
} from "@/lib/properties/property-colors";
import { useProperties, useReservations } from "@/hooks/use-properties";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

const EVENT_TYPE_STYLES: Record<DayEventType, string> = {
  check_in:
    "bg-[var(--calendar-check-in)] text-white ring-2 ring-[var(--calendar-check-in-ring)] shadow-[0_1px_8px_color-mix(in_srgb,var(--calendar-check-in)_45%,transparent)]",
  check_out:
    "bg-[var(--calendar-check-out)] text-white ring-2 ring-[var(--calendar-check-out-ring)] shadow-[0_1px_8px_color-mix(in_srgb,var(--calendar-check-out)_45%,transparent)]",
};

function EventTypeBadge({ type }: { type: DayEventType }) {
  return (
    <span
      className={cn(
        "w-full rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wide",
        EVENT_TYPE_STYLES[type]
      )}
    >
      {DAY_EVENT_LABELS[type]}
    </span>
  );
}

function EventSquare({
  card,
  colors,
}: {
  card: PropertyDayCard;
  colors: PropertyCalendarColor;
}) {
  return (
    <Link
      href={`/dashboard/properties/${card.propertyId}`}
      className="flex min-h-[5.5rem] w-32 shrink-0 flex-col items-center justify-center gap-2 rounded-2xl px-2.5 py-2.5 text-center text-white shadow-md ring-1 ring-white/20 transition-all hover:scale-[1.02] hover:shadow-lg"
      style={{ background: colors.gradient }}
    >
      <span className="line-clamp-2 text-xs font-bold leading-tight drop-shadow-sm">
        {card.propertyName}
      </span>
      <div className="flex w-full flex-col gap-1">
        {card.types.map((type) => (
          <EventTypeBadge key={type} type={type} />
        ))}
      </div>
    </Link>
  );
}

export function DateEventsList() {
  const { data: properties = [], isLoading: loadingProperties } =
    useProperties();
  const { data: reservations = [], isLoading: loadingReservations } =
    useReservations();
  const { calendarMonth, setCalendarMonth } = useUiStore();

  const todayKey = format(startOfDay(new Date()), "yyyy-MM-dd");

  const propertyColors = useMemo(
    () =>
      new Map(
        properties.map(
          (p, i) => [p.id, getPropertyCalendarColor(i)] as const
        )
      ),
    [properties]
  );

  const dayGroups = useMemo(
    () => buildMonthDayGroups(reservations, calendarMonth),
    [reservations, calendarMonth]
  );

  const isLoading = loadingProperties || loadingReservations;

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Učitavanje…</p>;
  }

  if (properties.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <p className="text-sm text-muted-foreground">
            Dodaj nekretninu da vidiš kalendar.
          </p>
          <Button asChild size="sm" className="mt-4">
            <Link href="/dashboard/properties/new">Dodaj nekretninu</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border/80 bg-muted/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold capitalize tracking-tight">
          {format(calendarMonth, "MMMM yyyy", { locale: sr })}
        </h2>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-border/80 bg-background/80"
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
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-border/80 bg-background/80"
            onClick={() => setCalendarMonth(new Date())}
          >
            Danas
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-border/80 bg-background/80"
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

      <div className="divide-y divide-border/60">
        {dayGroups.map((group) => {
          const isToday = group.dateKey === todayKey;

          return (
            <div
              key={group.dateKey}
              className={cn(
                "flex min-h-[5.5rem] items-center gap-3 px-4 py-3",
                isToday && "bg-[var(--calendar-row-today)]"
              )}
            >
              <div
                className={cn(
                  "flex h-24 w-20 shrink-0 flex-col items-center justify-center gap-0.5 rounded-2xl bg-[var(--calendar-date-bg)] px-1 text-[var(--calendar-date-text)]",
                  isToday &&
                    "bg-[var(--calendar-date-today-bg)] text-[var(--calendar-date-today-text)] ring-2 ring-[var(--calendar-date-today-ring)]"
                )}
              >
                <span className="text-3xl font-bold leading-none tabular-nums">
                  {group.dayNumber}
                </span>
                <span
                  className={cn(
                    "text-center text-[9px] font-semibold leading-tight tabular-nums",
                    group.cleaningCount > 0
                      ? "text-[var(--calendar-check-out)]"
                      : "text-muted-foreground/70"
                  )}
                >
                  {formatCleaningCount(group.cleaningCount)}
                </span>
              </div>

              <div className="flex min-h-20 flex-1 flex-wrap items-center gap-2.5">
                {group.properties.map((card) => (
                  <EventSquare
                    key={card.propertyId}
                    card={card}
                    colors={
                      propertyColors.get(card.propertyId) ??
                      getPropertyCalendarColor(0)
                    }
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
