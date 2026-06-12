"use client";

import { useMemo } from "react";
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isWeekend,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  buildReservationShadeMap,
  getReservationBarShade,
} from "@/lib/reservations/calendar-shades";
import { getCalendarWeekSegments } from "@/lib/reservations/calendar-week-segments";
import {
  isSameCalendarDay,
  isStayNight,
  parseDateOnly,
} from "@/lib/dates/calendar-date";
import {
  formatReservationLabel,
  getReservationDisplayKind,
} from "@/lib/reservations/display";
import { appLocale } from "@/lib/dates/locale";
import type { Reservation } from "@/types/database";
import { useUiStore } from "@/stores/ui-store";

interface MonthlyCalendarProps {
  reservations: Reservation[];
  propertyId?: string;
  embedded?: boolean;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function isCheckInDay(reservation: Reservation, day: Date) {
  return isSameCalendarDay(day, parseDateOnly(reservation.check_in));
}

function isCheckOutDay(reservation: Reservation, day: Date) {
  return isSameCalendarDay(day, parseDateOnly(reservation.check_out));
}

function barStyle(reservation: Reservation, shadeIndex: number) {
  const shade = getReservationBarShade(reservation, shadeIndex);
  return {
    backgroundColor: shade.backgroundColor,
    color: shade.color,
  };
}

function TurnoverTag({
  type,
  reservation,
}: {
  type: "in" | "out";
  reservation: Reservation;
}) {
  const label = formatReservationLabel(reservation.title, reservation.platform);
  const isIn = type === "in";

  return (
    <span
      className={cn(
        "rounded px-1 py-px text-[9px] font-bold uppercase leading-none",
        isIn
          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
          : "bg-red-500/15 text-red-600 dark:text-red-400"
      )}
      title={isIn ? `check-in · ${label}` : `check-out · ${label}`}
    >
      {type}
    </span>
  );
}

export function MonthlyCalendar({
  reservations,
  embedded,
}: MonthlyCalendarProps) {
  const { calendarMonth, setCalendarMonth } = useUiStore();
  const monthStart = startOfMonth(calendarMonth);
  const monthEnd = endOfMonth(calendarMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const allDays = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const weeks: Date[][] = [];
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7));
  }

  const visibleReservations = reservations.filter(
    (r) => getReservationDisplayKind(r) !== "manual_block"
  );

  const shadeMap = useMemo(
    () => buildReservationShadeMap(visibleReservations),
    [visibleReservations]
  );

  const today = new Date();

  return (
    <div
      className={cn(
        "w-full min-w-0 overflow-hidden bg-card text-card-foreground",
        embedded
          ? "rounded-none border-0 shadow-none"
          : "rounded-2xl border border-border shadow-sm"
      )}
    >
      <div className="flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold capitalize">
          {format(calendarMonth, "MMMM yyyy", { locale: appLocale })}
        </h3>
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
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => setCalendarMonth(new Date())}
          >
            Today
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

      <div className="grid grid-cols-7 border-b bg-muted/30">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="py-2 text-center text-xs font-medium text-muted-foreground"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="divide-y">
        {weeks.map((weekDays, wi) => {
          const segments = getCalendarWeekSegments(weekDays, visibleReservations);
          const maxLane =
            segments.length > 0
              ? Math.max(...segments.map((s) => s.lane)) + 1
              : 0;
          const rowHeight = Math.max(96, 44 + maxLane * 28);

          return (
            <div key={wi} className="relative">
              <div
                className="grid grid-cols-7"
                style={{ minHeight: rowHeight }}
              >
                {weekDays.map((day) => {
                  const inMonth = isSameMonth(day, calendarMonth);
                  const isToday = isSameCalendarDay(day, today);
                  const checkIns = visibleReservations.filter((r) =>
                    isCheckInDay(r, day)
                  );
                  const checkOuts = visibleReservations.filter((r) =>
                    isCheckOutDay(r, day)
                  );
                  const staying = visibleReservations.some((r) =>
                    isStayNight(r.check_in, r.check_out, day)
                  );

                  return (
                    <div
                      key={day.toISOString()}
                      className={cn(
                        "relative border-r p-1.5 last:border-r-0",
                        !inMonth && "bg-muted/20 text-muted-foreground",
                        inMonth && isWeekend(day) && "bg-muted/10",
                        inMonth && staying && "bg-muted/20",
                        isToday && inMonth && "ring-1 ring-inset ring-primary/30"
                      )}
                    >
                      <div className="flex items-start justify-between gap-0.5">
                        <span
                          className={cn(
                            "text-sm font-semibold tabular-nums",
                            isToday && inMonth && "text-primary"
                          )}
                        >
                          {format(day, "d")}
                        </span>
                        {(checkIns.length > 0 || checkOuts.length > 0) && (
                          <div className="flex flex-col items-end gap-0.5">
                            {checkIns.map((r) => (
                              <TurnoverTag
                                key={`in-${r.id}`}
                                type="in"
                                reservation={r}
                              />
                            ))}
                            {checkOuts.map((r) => (
                              <TurnoverTag
                                key={`out-${r.id}`}
                                type="out"
                                reservation={r}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {segments.length > 0 && (
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-1.5 top-10 px-1"
                  style={{ minHeight: maxLane * 28 }}
                >
                  {segments.map((seg) => {
                    const r = seg.reservation;
                    const span = Math.max(
                      1,
                      seg.stayEndCol - seg.startCol + 1
                    );
                    const label = formatReservationLabel(r.title, r.platform);
                    const shadeIndex = shadeMap.get(r.id) ?? 0;
                    const colors = barStyle(r, shadeIndex);

                    return (
                      <div
                        key={`${r.id}-${wi}-${seg.lane}`}
                        className="absolute inset-x-1 grid grid-cols-7"
                        style={{ top: seg.lane * 28, height: 24 }}
                      >
                        <div
                          className="flex items-center truncate rounded-md px-2 text-[10px] font-medium shadow-sm"
                          style={{
                            gridColumn: `${seg.startCol + 1} / span ${span}`,
                            ...colors,
                          }}
                          title={label}
                        >
                          {label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-2 border-t px-4 py-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-5 rounded-md bg-[#c13545]" />
          Airbnb
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-5 rounded-md bg-[#003580]" />
          Booking
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-5 rounded-md bg-amber-700" />
          Manually blocked
        </span>
        <span className="flex items-center gap-1.5">
          <span className="rounded bg-emerald-500/15 px-1 py-px text-[9px] font-bold text-emerald-600">
            in
          </span>
          Check-in
        </span>
        <span className="flex items-center gap-1.5">
          <span className="rounded bg-red-500/15 px-1 py-px text-[9px] font-bold text-red-600">
            out
          </span>
          Check-out
        </span>
        <span className="text-muted-foreground/70">
          Each bar uses a different shade (Airbnb red, Booking blue)
        </span>
      </div>
    </div>
  );
}
