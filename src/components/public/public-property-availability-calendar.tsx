"use client";

import { useEffect, useMemo, useState } from "react";
import {
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
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { parseDateOnly } from "@/lib/dates/calendar-date";
import {
  canPublicCheckInOnDay,
  validatePublicStayRange,
} from "@/lib/public/availability";
import { isPublicDayBlocked } from "@/lib/public/day-status";
import type { PublicReservationSpan } from "@/lib/public/types";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

interface PublicPropertyAvailabilityCalendarProps {
  propertyId: string;
  checkIn?: string;
  checkOut?: string;
  onRangeChange?: (checkIn: string, checkOut: string) => void;
  compact?: boolean;
  showLegend?: boolean;
}

export function PublicPropertyAvailabilityCalendar({
  propertyId,
  checkIn = "",
  checkOut = "",
  onRangeChange,
  compact = false,
  showLegend,
}: PublicPropertyAvailabilityCalendarProps) {
  const legendVisible = showLegend ?? !compact;
  const today = startOfDay(new Date());
  const checkInDate = checkIn ? parseDateOnly(checkIn) : null;
  const checkOutDate = checkOut ? parseDateOnly(checkOut) : null;

  const [viewMonth, setViewMonth] = useState(() =>
    startOfMonth(checkInDate ?? today)
  );
  const [reservations, setReservations] = useState<PublicReservationSpan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (checkInDate) {
      setViewMonth(startOfMonth(checkInDate));
    }
  }, [checkInDate]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/public/properties/${propertyId}/reservations`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Error");
        if (!cancelled) setReservations(data.reservations ?? []);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Error");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [propertyId]);

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

  const selectionHint =
    checkIn && checkOut
      ? `${format(checkInDate!, "d. MMM", { locale: appLocale })} – ${format(checkOutDate!, "d. MMM yyyy", { locale: appLocale })}`
      : checkIn
        ? `${format(checkInDate!, "d. MMM yyyy", { locale: appLocale })} · select check-out`
        : "Click check-in, then check-out · click again to clear";

  function handleDayClick(day: Date) {
    if (!onRangeChange) return;

    const dateKey = format(day, "yyyy-MM-dd");

    if (checkOut && checkOutDate && isSameDay(day, checkOutDate)) {
      onRangeChange(checkIn, "");
      return;
    }

    if (checkIn && checkInDate && isSameDay(day, checkInDate)) {
      onRangeChange("", "");
      return;
    }

    if (!checkIn || (checkIn && checkOut)) {
      if (!canPublicCheckInOnDay(reservations, day)) {
        toast.error("This day is unavailable — choose an open check-in date");
        return;
      }
      onRangeChange(dateKey, "");
      return;
    }

    if (dateKey <= checkIn) {
      if (!canPublicCheckInOnDay(reservations, day)) {
        toast.error("This day is unavailable — choose an open check-in date");
        return;
      }
      onRangeChange(dateKey, "");
      return;
    }

    const validation = validatePublicStayRange(reservations, checkIn, dateKey);
    if (!validation.ok) {
      toast.error(validation.message);
      return;
    }

    onRangeChange(checkIn, dateKey);
  }

  if (loading) {
    return (
      <div
        className={cn(
          "flex items-center justify-center text-[var(--public-muted)]",
          compact ? "py-6 text-xs" : "py-10 text-sm"
        )}
      >
        <Loader2
          className={cn("mr-2 animate-spin", compact ? "h-3.5 w-3.5" : "h-4 w-4")}
        />
        Loading…
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          "rounded-xl bg-red-50 text-red-700",
          compact ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm"
        )}
      >
        {error}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden border border-[var(--public-border)] bg-white",
        compact ? "rounded-xl shadow-none" : "rounded-2xl shadow-sm"
      )}
    >
      <div
        className={cn(
          "border-b border-[var(--public-border)] bg-[var(--public-bg-subtle)]",
          compact ? "px-2.5 py-2" : "px-4 py-3"
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setViewMonth((m) => addMonths(m, -1))}
            className={cn(
              "flex items-center justify-center rounded-full border border-[var(--public-border)] bg-white text-[var(--public-muted)] transition hover:border-[var(--public-border-strong)] hover:text-[var(--public-fg)]",
              compact ? "h-7 w-7" : "h-9 w-9"
            )}
            aria-label="Previous month"
          >
            <ChevronLeft className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
          </button>
          <div className="min-w-0 text-center">
            {compact ? (
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--public-muted)]">
                Availability
              </p>
            ) : null}
            <p
              className={cn(
                "font-semibold capitalize text-[var(--public-fg)]",
                compact ? "truncate text-xs" : "text-base"
              )}
            >
              {format(viewMonth, compact ? "LLL yyyy" : "LLLL yyyy", {
                locale: appLocale,
              })}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setViewMonth((m) => addMonths(m, 1))}
            className={cn(
              "flex items-center justify-center rounded-full border border-[var(--public-border)] bg-white text-[var(--public-muted)] transition hover:border-[var(--public-border-strong)] hover:text-[var(--public-fg)]",
              compact ? "h-7 w-7" : "h-9 w-9"
            )}
            aria-label="Next month"
          >
            <ChevronRight className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
          </button>
        </div>
        {onRangeChange ? (
          <p
            className={cn(
              "mt-1.5 text-center text-[var(--public-muted)]",
              compact ? "text-[10px] leading-snug" : "text-sm"
            )}
          >
            {selectionHint}
          </p>
        ) : null}
      </div>

      <div className={compact ? "p-2.5" : "p-4"}>
        <div className={cn("mb-1 grid grid-cols-7", compact ? "gap-0.5" : "gap-1.5")}>
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className={cn(
                "text-center font-semibold uppercase tracking-wide text-[var(--public-muted-soft)]",
                compact ? "py-0.5 text-[9px]" : "py-1 text-[11px]"
              )}
            >
              {day}
            </div>
          ))}
        </div>

        <div className={compact ? "space-y-0.5" : "space-y-1.5"}>
          {weeks.map((week, wi) => (
            <div
              key={wi}
              className={cn("grid grid-cols-7", compact ? "gap-0.5" : "gap-1.5")}
            >
              {week.map((day) => {
                const inMonth = day.getMonth() === viewMonth.getMonth();
                const isPast = isBefore(day, today);
                const isToday = isSameDay(day, today);
                const showAvailability = inMonth && !isPast;
                const blocked =
                  showAvailability && isPublicDayBlocked(reservations, day);
                const isFree = showAvailability && !blocked;

                const rangeStart = checkInDate
                  ? isSameDay(day, checkInDate)
                  : false;
                const rangeEnd = checkOutDate
                  ? isSameDay(day, checkOutDate)
                  : false;
                const selectingCheckOut = Boolean(
                  onRangeChange && checkIn && !checkOut && checkInDate
                );
                const canUnclick = rangeStart || rangeEnd;
                const selectable =
                  showAvailability &&
                  Boolean(onRangeChange) &&
                  (canUnclick ||
                    isFree ||
                    (selectingCheckOut && isAfter(day, checkInDate!)));
                const rangeMiddle =
                  checkInDate &&
                  checkOutDate &&
                  isAfter(day, checkInDate) &&
                  isBefore(day, checkOutDate);

                const inSelection = rangeStart || rangeEnd || rangeMiddle;

                const cellContent = (
                  <span
                    className={cn(
                      "relative z-[1] flex h-full w-full items-center justify-center font-semibold transition",
                      compact ? "rounded-md text-[10px]" : "rounded-xl text-sm",
                      inMonth &&
                        isPast &&
                        "text-[var(--public-muted-soft)]/50",
                      isFree &&
                        !inSelection &&
                        "bg-emerald-500 text-white shadow-sm shadow-emerald-500/20",
                      isFree &&
                        !inSelection &&
                        isToday &&
                        !compact &&
                        "ring-2 ring-emerald-600 ring-offset-2 ring-offset-white",
                      isFree &&
                        !inSelection &&
                        isToday &&
                        compact &&
                        "font-bold ring-1 ring-inset ring-emerald-700/40",
                      blocked &&
                        !inSelection &&
                        "bg-stone-100 text-stone-400",
                      blocked &&
                        selectable &&
                        !inSelection &&
                        "cursor-pointer hover:bg-stone-200 hover:text-stone-600",
                      isFree &&
                        selectable &&
                        !inSelection &&
                        "cursor-pointer hover:bg-emerald-600 hover:shadow-md",
                      inSelection &&
                        "bg-[var(--public-accent)] text-white shadow-sm",
                      rangeStart &&
                        checkOutDate &&
                        "rounded-r-none",
                      rangeEnd &&
                        checkInDate &&
                        "rounded-l-none",
                      rangeMiddle && "rounded-none"
                    )}
                  >
                    {format(day, "d")}
                  </span>
                );

                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      "relative",
                      compact ? "h-7" : "aspect-square",
                      !inMonth && "pointer-events-none",
                      inSelection &&
                        checkInDate &&
                        checkOutDate &&
                        "bg-[var(--public-accent-soft)]/60",
                      rangeStart &&
                        checkOutDate &&
                        "rounded-l-xl",
                      rangeEnd &&
                        checkInDate &&
                        "rounded-r-xl"
                    )}
                  >
                    {!inMonth ? null : selectable ? (
                      <button
                        type="button"
                        onClick={() => handleDayClick(day)}
                        className="h-full w-full"
                        title={
                          inSelection
                            ? "Click to clear"
                            : selectingCheckOut && blocked
                              ? "Possible check-out"
                              : blocked
                                ? "Occupied"
                                : "Available"
                        }
                      >
                        {cellContent}
                      </button>
                    ) : (
                      <div
                        className="h-full w-full"
                        title={
                          isPast
                            ? "Past"
                            : blocked
                              ? "Occupied"
                              : "Available"
                        }
                      >
                        {cellContent}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {legendVisible ? (
          <div
            className={cn(
              "flex flex-wrap items-center justify-center border-t border-[var(--public-border)]",
              compact
                ? "mt-2 gap-3 pt-2"
                : "mt-5 gap-4 pt-4 sm:gap-6"
            )}
          >
            <span
              className={cn(
                "inline-flex items-center gap-1.5 text-[var(--public-muted)]",
                compact ? "text-[10px]" : "text-sm"
              )}
            >
              <span
                className={cn(
                  "rounded bg-emerald-500",
                  compact ? "h-2.5 w-2.5" : "h-4 w-4 rounded-md shadow-sm shadow-emerald-500/25"
                )}
              />
              Available
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 text-[var(--public-muted)]",
                compact ? "text-[10px]" : "text-sm"
              )}
            >
              <span
                className={cn(
                  "rounded bg-stone-100 ring-1 ring-stone-200",
                  compact ? "h-2.5 w-2.5" : "h-4 w-4 rounded-md"
                )}
              />
              Occupied
            </span>
            {onRangeChange ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 text-[var(--public-muted)]",
                  compact ? "text-[10px]" : "text-sm"
                )}
              >
                <span
                  className={cn(
                    "rounded bg-[var(--public-accent)]",
                    compact ? "h-2.5 w-2.5" : "h-4 w-4 rounded-md"
                  )}
                />
                Your selection
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
