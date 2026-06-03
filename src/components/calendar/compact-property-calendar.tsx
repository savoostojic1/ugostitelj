"use client";

import { useMemo } from "react";
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { cn } from "@/lib/utils";
import { getCalendarWeekSegments } from "@/lib/reservations/calendar-week-segments";
import {
  buildReservationColorMap,
  filterVisibleCompactReservations,
  getReservationColor,
} from "@/lib/reservations/compact-calendar-colors";
import {
  isSameCalendarDay,
  isStayNight,
} from "@/lib/dates/calendar-date";
import { formatReservationLabel } from "@/lib/reservations/display";
import type { Reservation } from "@/types/database";

const BAR_HEIGHT = 6;
const BAR_GAP = 3;
const DAY_HEADER = 20;

interface CompactPropertyCalendarProps {
  reservations: Reservation[];
  month: Date;
}

export function CompactPropertyCalendar({
  reservations,
  month,
}: CompactPropertyCalendarProps) {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const allDays = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const weeks: Date[][] = [];
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7));
  }

  const visibleReservations = useMemo(
    () => filterVisibleCompactReservations(reservations),
    [reservations]
  );

  const colorMap = useMemo(
    () => buildReservationColorMap(reservations),
    [reservations]
  );

  const today = new Date();

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="divide-y divide-border/70">
        {weeks.map((weekDays, wi) => {
          const segments = getCalendarWeekSegments(weekDays, visibleReservations);
          const maxLane =
            segments.length > 0
              ? Math.max(...segments.map((s) => s.lane)) + 1
              : 0;
          const rowHeight = DAY_HEADER + maxLane * (BAR_HEIGHT + BAR_GAP) + 6;

          return (
            <div key={wi} className="relative">
              <div
                className="grid grid-cols-7"
                style={{ minHeight: rowHeight }}
              >
                {weekDays.map((day) => {
                  const inMonth = isSameMonth(day, month);
                  const isToday = isSameCalendarDay(day, today);
                  const staying = visibleReservations.some((r) =>
                    isStayNight(r.check_in, r.check_out, day)
                  );

                  return (
                    <div
                      key={day.toISOString()}
                      className={cn(
                        "relative border-r border-border/40 last:border-r-0",
                        !inMonth && "bg-muted/25",
                        inMonth && staying && "bg-muted/10",
                        isToday && inMonth && "bg-primary/5"
                      )}
                    >
                      <span
                        className={cn(
                          "block px-0.5 pt-1 text-[11px] font-medium leading-none tabular-nums text-muted-foreground",
                          inMonth && "text-foreground",
                          isToday && inMonth && "font-bold text-primary"
                        )}
                      >
                        {format(day, "d")}
                      </span>
                    </div>
                  );
                })}
              </div>

              {segments.length > 0 && (
                <div
                  className="pointer-events-none absolute inset-x-0 px-0.5"
                  style={{
                    top: DAY_HEADER,
                    bottom: 3,
                  }}
                >
                  {segments.map((seg) => {
                    const span = Math.max(
                      1,
                      seg.stayEndCol - seg.startCol + 1
                    );
                    const label = formatReservationLabel(
                      seg.reservation.title,
                      seg.reservation.platform
                    );

                    return (
                      <div
                        key={`${seg.reservation.id}-${wi}-${seg.lane}`}
                        className="absolute inset-x-0 grid grid-cols-7"
                        style={{
                          top: seg.lane * (BAR_HEIGHT + BAR_GAP),
                          height: BAR_HEIGHT,
                        }}
                      >
                        <div
                          className="rounded-sm shadow-sm"
                          style={{
                            gridColumn: `${seg.startCol + 1} / span ${span}`,
                            backgroundColor: getReservationColor(
                              colorMap,
                              seg.reservation.id
                            ),
                          }}
                          title={label}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
