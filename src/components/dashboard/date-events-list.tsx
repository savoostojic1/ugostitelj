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
  computeMonthFreeDaysSummary,
  DAY_EVENT_LABELS,
  formatCleaningCount,
  formatFreeDaysCount,
  type DayEventType,
  type PropertyDayCard,
} from "@/lib/reservations/date-events";
import {
  ORIGIN_CODE_LABELS,
  ORIGIN_CODE_LETTERS,
  type ReservationOriginCode,
} from "@/lib/reservations/display";
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
  stayover:
    "bg-[var(--calendar-stayover)] text-white ring-2 ring-[var(--calendar-stayover-ring)] shadow-[0_1px_8px_color-mix(in_srgb,var(--calendar-stayover)_45%,transparent)]",
  empty:
    "bg-[var(--calendar-empty)] text-[var(--calendar-empty-text)] ring-1 ring-[var(--calendar-empty-ring)]",
};

const ORIGIN_CODE_STYLES: Record<ReservationOriginCode, string> = {
  airbnb:
    "bg-[#ff5a5f] text-white ring-2 ring-[#ffb4b6] shadow-[0_1px_6px_color-mix(in_srgb,#ff5a5f_45%,transparent)]",
  booking:
    "bg-[#003580] text-white ring-2 ring-[#4a9eff] shadow-[0_1px_6px_color-mix(in_srgb,#003580_45%,transparent)]",
  direct:
    "bg-emerald-600 text-white ring-2 ring-emerald-300 shadow-[0_1px_6px_color-mix(in_srgb,#059669_45%,transparent)]",
};

function EventTypeBadge({
  type,
  originCode,
}: {
  type: DayEventType;
  originCode?: ReservationOriginCode;
}) {
  if (type === "check_in" && originCode) {
    return (
      <span
        className={cn(
          "flex w-full items-center justify-between gap-1.5 rounded-lg px-2 py-1",
          EVENT_TYPE_STYLES.check_in
        )}
        title={ORIGIN_CODE_LABELS[originCode]}
      >
        <span className="text-[10px] font-bold uppercase tracking-wide">
          {DAY_EVENT_LABELS.check_in}
        </span>
        <span
          className={cn(
            "flex h-4 min-w-4 shrink-0 items-center justify-center rounded px-1 text-[9px] font-bold leading-none",
            ORIGIN_CODE_STYLES[originCode]
          )}
        >
          {ORIGIN_CODE_LETTERS[originCode]}
        </span>
      </span>
    );
  }

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
  const isEmptyOnly =
    card.types.length === 1 && card.types[0] === "empty";

  return (
    <Link
      href={`/dashboard/properties/${card.propertyId}/calendar`}
      className={cn(
        "flex min-h-[5.5rem] w-full min-w-0 flex-col items-center justify-center gap-2 rounded-2xl px-2.5 py-2.5 text-center shadow-md ring-1 transition-all hover:scale-[1.02] hover:shadow-lg",
        "sm:w-32 sm:shrink-0",
        isEmptyOnly
          ? "bg-muted/60 text-foreground ring-border/60"
          : "text-white ring-white/20"
      )}
      style={isEmptyOnly ? undefined : { background: colors.gradient }}
    >
      <span
        className={cn(
          "line-clamp-2 text-xs font-bold leading-tight",
          !isEmptyOnly && "drop-shadow-sm"
        )}
      >
        {card.propertyName}
      </span>
      <div className="flex w-full flex-col gap-1">
        {card.types.map((type) => (
          <EventTypeBadge
            key={type}
            type={type}
            originCode={
              type === "check_in" ? card.checkInOriginCode ?? undefined : undefined
            }
          />
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

  const today = useMemo(() => startOfDay(new Date()), []);
  const todayKey = format(today, "yyyy-MM-dd");
  const isCurrentMonth =
    calendarMonth.getFullYear() === today.getFullYear() &&
    calendarMonth.getMonth() === today.getMonth();

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
    () =>
      buildMonthDayGroups(properties, reservations, calendarMonth, {
        from: today,
      }),
    [properties, reservations, calendarMonth, today]
  );

  const freeDaysSummary = useMemo(
    () =>
      computeMonthFreeDaysSummary(properties, reservations, calendarMonth, {
        from: today,
      }),
    [properties, reservations, calendarMonth, today]
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
    <div className="space-y-4">
      {freeDaysSummary.daysInRange > 0 && (
        <div className="rounded-2xl border border-border/80 bg-card px-4 py-3 shadow-sm">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <p className="text-sm font-medium text-foreground">
                Slobodni dani do kraja mjeseca
              </p>
              <p className="text-sm text-muted-foreground">
                Ukupno:{" "}
                <span className="font-semibold tabular-nums text-foreground">
                  {formatFreeDaysCount(freeDaysSummary.totalFreeDays)}
                </span>
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {freeDaysSummary.properties.map((property) => {
                const colors =
                  propertyColors.get(property.propertyId) ??
                  getPropertyCalendarColor(0);

                return (
                  <div
                    key={property.propertyId}
                    className="flex items-center gap-2 rounded-xl border border-border/70 bg-muted/20 px-3 py-2 text-sm"
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: colors.solid }}
                    />
                    <span className="font-medium">{property.propertyName}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {formatFreeDaysCount(property.freeDays)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

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
            disabled={isCurrentMonth}
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

      <div className="flex flex-col gap-3 p-3 sm:gap-0 sm:p-0 sm:divide-y sm:divide-border/60">
        {dayGroups.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-muted-foreground">
            Nema upcoming dana za ovaj mjesec.
          </p>
        ) : (
          dayGroups.map((group) => {
          const isToday = group.dateKey === todayKey;

          return (
            <div
              key={group.dateKey}
              className={cn(
                "flex flex-col gap-3 rounded-xl border border-border/70 bg-background p-3 shadow-sm",
                "sm:flex-row sm:items-center sm:gap-3 sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0 sm:px-4 sm:py-3 sm:shadow-none",
                isToday &&
                  "border-[var(--calendar-date-today-ring)] bg-[var(--calendar-row-today)] sm:border-0"
              )}
            >
              <div
                className={cn(
                  "flex h-20 w-full shrink-0 flex-row items-center justify-between gap-2 rounded-xl bg-[var(--calendar-date-bg)] px-3 py-2 text-[var(--calendar-date-text)]",
                  "sm:h-24 sm:w-20 sm:flex-col sm:justify-center sm:gap-0.5 sm:rounded-2xl sm:px-1 sm:py-0",
                  isToday &&
                    "bg-[var(--calendar-date-today-bg)] text-[var(--calendar-date-today-text)] ring-2 ring-[var(--calendar-date-today-ring)]"
                )}
              >
                <span className="text-2xl font-bold leading-none tabular-nums sm:text-3xl">
                  {group.dayNumber}
                </span>
                <span
                  className={cn(
                    "text-right text-[10px] font-semibold leading-tight tabular-nums sm:text-center sm:text-[9px]",
                    group.cleaningCount > 0
                      ? "text-[var(--calendar-check-out)]"
                      : "text-muted-foreground/70"
                  )}
                >
                  {formatCleaningCount(group.cleaningCount)}
                </span>
              </div>

              <div className="grid min-h-20 flex-1 grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-2.5">
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
        })
        )}
      </div>
    </div>
    </div>
  );
}
