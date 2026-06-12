"use client";

import { useMemo } from "react";
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { cn } from "@/lib/utils";
import { getCalendarWeekSegments, clipWeekSegmentsToMonth } from "@/lib/reservations/calendar-week-segments";
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

const BAR_HEIGHT_DEFAULT = 6;
const BAR_GAP_DEFAULT = 3;
const DAY_HEADER_DEFAULT = 20;

const COMPACT_BAR_HEIGHT = 3;
const COMPACT_BAR_GAP = 2;
const COMPACT_WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

interface CompactPropertyCalendarProps {
  reservations: Reservation[];
  month: Date;
  compact?: boolean;
}

function ReservationBars({
  segments,
  weekIndex,
  barHeight,
  barGap,
  colorMap,
  compact,
}: {
  segments: ReturnType<typeof getCalendarWeekSegments>;
  weekIndex: number;
  barHeight: number;
  barGap: number;
  colorMap: Map<string, string>;
  compact: boolean;
}) {
  if (!segments.length) return null;

  const maxLane = Math.max(...segments.map((s) => s.lane)) + 1;
  const trackHeight = maxLane * barHeight + (maxLane - 1) * barGap;

  return (
    <div
      className={cn(
        "pointer-events-none",
        compact
          ? "absolute inset-x-1 bottom-1"
          : "absolute inset-x-0 px-0.5"
      )}
      style={
        compact
          ? { height: trackHeight }
          : {
              top: DAY_HEADER_DEFAULT,
              bottom: 3,
            }
      }
    >
      {segments.map((seg) => {
        const span = Math.max(1, seg.stayEndCol - seg.startCol + 1);
        const label = formatReservationLabel(
          seg.reservation.title,
          seg.reservation.platform
        );
        const color = getReservationColor(colorMap, seg.reservation.id);

        return (
          <div
            key={`${seg.reservation.id}-${weekIndex}-${seg.lane}`}
            className={cn(
              "absolute inset-x-0 grid grid-cols-7",
              compact ? "gap-0.5" : "gap-px px-0.5"
            )}
            style={
              compact
                ? {
                    bottom: seg.lane * (barHeight + barGap),
                    height: barHeight,
                  }
                : {
                    top: seg.lane * (barHeight + barGap),
                    height: barHeight,
                  }
            }
          >
            <div
              className={cn(
                "min-w-0",
                compact
                  ? "mx-0.5 rounded-full opacity-95"
                  : "rounded-sm shadow-sm"
              )}
              style={{
                gridColumn: `${seg.startCol + 1} / span ${span}`,
                backgroundColor: color,
              }}
              title={label}
            />
          </div>
        );
      })}
    </div>
  );
}

export function CompactPropertyCalendar({
  reservations,
  month,
  compact = false,
}: CompactPropertyCalendarProps) {
  const barHeight = compact ? COMPACT_BAR_HEIGHT : BAR_HEIGHT_DEFAULT;
  const barGap = compact ? COMPACT_BAR_GAP : BAR_GAP_DEFAULT;
  const dayHeader = compact ? 18 : DAY_HEADER_DEFAULT;

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

  const today = startOfDay(new Date());

  return (
    <div
      className={cn(
        "w-full min-w-0 overflow-hidden text-card-foreground",
        compact
          ? "rounded-xl bg-black/25 ring-1 ring-inset ring-white/[0.06]"
          : "rounded-lg border border-border bg-card"
      )}
    >
      {compact ? (
        <div className="grid grid-cols-7 gap-0.5 px-1.5 pb-1 pt-1.5">
          {COMPACT_WEEKDAYS.map((label, index) => (
            <div
              key={`${label}-${index}`}
              className="text-center text-[10px] font-semibold uppercase tracking-wide text-zinc-500"
            >
              {label}
            </div>
          ))}
        </div>
      ) : null}

      <div className={cn(compact ? "flex flex-col gap-1 px-1 pb-1.5 pt-0.5" : "divide-y divide-border/70")}>
        {weeks.map((weekDays, wi) => {
          const segments = clipWeekSegmentsToMonth(
            getCalendarWeekSegments(weekDays, visibleReservations),
            weekDays,
            month
          );

          return (
            <div
              key={wi}
              className={cn(
                "relative",
                compact && "rounded-lg bg-white/[0.02] px-0.5 py-0.5"
              )}
            >
              <div
                className={cn("grid grid-cols-7", compact ? "gap-0.5" : "")}
                style={
                  compact
                    ? undefined
                    : {
                        minHeight:
                          dayHeader +
                          (segments.length > 0
                            ? (Math.max(...segments.map((s) => s.lane)) + 1) *
                                (barHeight + barGap) +
                              6
                            : 0),
                      }
                }
              >
                {weekDays.map((day) => {
                  const inMonth = isSameMonth(day, month);
                  const isToday = isSameCalendarDay(day, today);
                  const staying = visibleReservations.some((r) =>
                    isStayNight(r.check_in, r.check_out, day)
                  );
                  const isPast = isBefore(startOfDay(day), today);
                  const isAvailable = inMonth && !staying && !isPast;
                  const isFree = inMonth && !staying;

                  if (!inMonth) {
                    return (
                      <div
                        key={day.toISOString()}
                        aria-hidden
                        className={cn(
                          "relative",
                          !compact && "border-r border-border/40 last:border-r-0",
                          compact && "aspect-square min-h-0 rounded-md"
                        )}
                      />
                    );
                  }

                  return (
                    <div
                      key={day.toISOString()}
                      className={cn(
                        "relative transition-colors",
                        !compact && "border-r border-border/40 last:border-r-0",
                        compact && "aspect-square min-h-0 rounded-md",
                        isAvailable && "bg-emerald-500/10",
                        staying && "bg-violet-500/[0.07]",
                        isFree && isPast && "bg-white/[0.02]",
                        isToday &&
                          "ring-1 ring-inset ring-violet-400/30"
                      )}
                    >
                      <span
                        className={cn(
                          "absolute font-medium leading-none tabular-nums",
                          compact
                            ? "left-1 top-1 text-[10px] sm:text-[11px]"
                            : "left-0.5 top-0.5 block px-0.5 pt-1 text-[11px]",
                          isAvailable && !isToday && "text-emerald-300/90",
                          isFree && isPast && !isToday && "text-zinc-500",
                          isToday && "font-semibold text-violet-200",
                          staying && !isToday && "text-zinc-200"
                        )}
                      >
                        {format(day, "d")}
                      </span>
                    </div>
                  );
                })}
              </div>

              {!compact && segments.length > 0 ? (
                <ReservationBars
                  segments={segments}
                  weekIndex={wi}
                  barHeight={barHeight}
                  barGap={barGap}
                  colorMap={colorMap}
                  compact={false}
                />
              ) : null}

              {compact && segments.length > 0 ? (
                <ReservationBars
                  segments={segments}
                  weekIndex={wi}
                  barHeight={barHeight}
                  barGap={barGap}
                  colorMap={colorMap}
                  compact
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
