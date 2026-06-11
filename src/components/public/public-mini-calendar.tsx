"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { appLocale } from "@/lib/dates/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseDateOnly } from "@/lib/dates/calendar-date";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export type PublicCalendarMode = "check-in" | "check-out";

interface PublicMiniCalendarProps {
  mode: PublicCalendarMode;
  checkIn: string;
  checkOut: string;
  onSelect: (isoDate: string) => void;
  minDateIso?: string;
}

export function PublicMiniCalendar({
  mode,
  checkIn,
  checkOut,
  onSelect,
  minDateIso,
}: PublicMiniCalendarProps) {
  const minDate = parseDateOnly(
    minDateIso ?? format(startOfDay(new Date()), "yyyy-MM-dd")
  );
  const checkInDate = checkIn ? parseDateOnly(checkIn) : null;
  const checkOutDate = checkOut ? parseDateOnly(checkOut) : null;

  const [viewMonth, setViewMonth] = useState(() =>
    startOfMonth(checkIn ? parseDateOnly(checkIn) : minDate)
  );

  useEffect(() => {
    if (checkIn) {
      setViewMonth(startOfMonth(parseDateOnly(checkIn)));
    }
  }, [checkIn]);

  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const allDays = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const weeks = useMemo(() => {
    const rows: Date[][] = [];
    for (let i = 0; i < allDays.length; i += 7) {
      rows.push(allDays.slice(i, i + 7));
    }
    return rows;
  }, [allDays]);

  function isDisabled(day: Date) {
    if (mode === "check-out" && checkInDate) {
      const minOut = addDays(checkInDate, 1);
      return isBefore(day, minOut) && !isSameDay(day, minOut);
    }
    return isBefore(day, minDate) && !isSameDay(day, minDate);
  }

  function isRangeMiddle(day: Date) {
    if (!checkInDate || !checkOutDate) return false;
    return isAfter(day, checkInDate) && isBefore(day, checkOutDate);
  }

  function isRangeStart(day: Date) {
    return checkInDate ? isSameDay(day, checkInDate) : false;
  }

  function isRangeEnd(day: Date) {
    return checkOutDate ? isSameDay(day, checkOutDate) : false;
  }

  const hint =
    mode === "check-in"
      ? "Select check-in date"
      : checkIn
        ? "Select check-out date"
        : "Select check-in first";

  return (
    <div className="w-[18.5rem] select-none">
      <div className="border-b border-[var(--public-border)] bg-[var(--public-bg-subtle)] px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--public-muted)]">
          {hint}
        </p>
        {checkIn && checkOut ? (
          <p className="mt-1 text-sm font-semibold text-[var(--public-fg)]">
            {format(checkInDate!, "d. MMM", { locale: appLocale })} –{" "}
            {format(checkOutDate!, "d. MMM yyyy", { locale: appLocale })}
          </p>
        ) : checkIn ? (
          <p className="mt-1 text-sm font-semibold text-[var(--public-fg)]">
            Check-in: {format(checkInDate!, "d. MMM yyyy", { locale: appLocale })}
          </p>
        ) : null}
      </div>

      <div className="bg-[var(--public-bg-elevated)] p-4">
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setViewMonth((m) => addMonths(m, -1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--public-muted)] transition hover:bg-[var(--public-bg-subtle)] hover:text-[var(--public-fg)]"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <p className="text-sm font-semibold capitalize text-[var(--public-fg)]">
            {format(viewMonth, "LLLL yyyy", { locale: appLocale })}
          </p>
          <button
            type="button"
            onClick={() => setViewMonth((m) => addMonths(m, 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--public-muted)] transition hover:bg-[var(--public-bg-subtle)] hover:text-[var(--public-fg)]"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-1 grid grid-cols-7">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="py-1.5 text-center text-[10px] font-semibold uppercase tracking-wide text-[var(--public-muted-soft)]"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="space-y-0.5">
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7">
              {week.map((day) => {
                const inMonth = day.getMonth() === viewMonth.getMonth();
                const disabled = isDisabled(day);
                const rangeStart = isRangeStart(day);
                const rangeEnd = isRangeEnd(day);
                const rangeMiddle = isRangeMiddle(day);
                const isToday = isSameDay(day, new Date());
                const isActive =
                  (mode === "check-in" && rangeStart) ||
                  (mode === "check-out" && rangeEnd);

                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      "relative flex items-center justify-center py-0.5",
                      (rangeMiddle || rangeStart || rangeEnd) &&
                        checkInDate &&
                        checkOutDate &&
                        "bg-[var(--public-accent-soft)]/50",
                      rangeStart &&
                        checkOutDate &&
                        "rounded-l-full bg-[var(--public-accent-soft)]/50",
                      rangeEnd &&
                        checkInDate &&
                        "rounded-r-full bg-[var(--public-accent-soft)]/50"
                    )}
                  >
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => onSelect(format(day, "yyyy-MM-dd"))}
                      className={cn(
                        "relative z-[1] flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition",
                        !inMonth && "text-[var(--public-muted-soft)]/45",
                        inMonth && !disabled && "text-[var(--public-fg)]",
                        disabled &&
                          "cursor-not-allowed text-[var(--public-muted-soft)]/35",
                        !disabled &&
                          !rangeStart &&
                          !rangeEnd &&
                          !isActive &&
                          "hover:bg-[var(--public-accent-soft)] hover:text-[var(--public-accent)]",
                        (rangeStart || rangeEnd || isActive) &&
                          "bg-[var(--public-accent)] text-white shadow-sm",
                        isToday &&
                          !rangeStart &&
                          !rangeEnd &&
                          !isActive &&
                          "font-bold ring-2 ring-inset ring-[var(--public-accent)]/35"
                      )}
                    >
                      {format(day, "d")}
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
