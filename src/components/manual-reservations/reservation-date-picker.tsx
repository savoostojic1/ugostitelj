"use client";

import { useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { appLocale } from "@/lib/dates/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  canCheckInOnDay,
  getDayAvailabilityKind,
  getDayAvailabilityLabel,
  isDayInSelectedRange,
  validateStayRange,
} from "@/lib/reservations/availability";
import {
  formatStayPeriodLabel,
  isSameCalendarDay,
  parseDateOnly,
} from "@/lib/dates/calendar-date";
import type { Reservation } from "@/types/database";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ReservationDatePickerProps {
  reservations: Reservation[];
  checkIn: string;
  checkOut: string;
  onChange: (checkIn: string, checkOut: string) => void;
  isLoading?: boolean;
  excludeReservationId?: string;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function ReservationDatePicker({
  reservations,
  checkIn,
  checkOut,
  onChange,
  isLoading,
  excludeReservationId,
}: ReservationDatePickerProps) {
  const today = startOfDay(new Date());
  const [viewMonth, setViewMonth] = useState(() =>
    checkIn ? startOfMonth(parseDateOnly(checkIn)) : startOfMonth(today)
  );

  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const allDays = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const weeks: Date[][] = [];
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7));
  }

  const selectionLabel =
    checkIn && checkOut
      ? formatStayPeriodLabel(checkIn, checkOut)
      : checkIn
        ? `${format(parseDateOnly(checkIn), "d MMM yyyy", { locale: appLocale })} · select check-out`
        : "Click check-in, then check-out · click again to unselect";

  function handleDayClick(day: Date) {
    if (!excludeReservationId && day < today) {
      toast.error("You cannot select dates in the past");
      return;
    }

    const dateKey = format(day, "yyyy-MM-dd");

    if (checkOut && dateKey === checkOut) {
      onChange(checkIn, "");
      return;
    }

    if (checkIn && dateKey === checkIn) {
      onChange("", "");
      return;
    }

    if (!checkIn || (checkIn && checkOut)) {
      if (!canCheckInOnDay(reservations, day, excludeReservationId)) {
        const label = getDayAvailabilityLabel(
          reservations,
          day,
          excludeReservationId
        );
        toast.error(
          label
            ? `Occupied: ${label}. Choose a free day for check-in.`
            : "This day is occupied — choose a free check-in day"
        );
        return;
      }
      onChange(dateKey, "");
      return;
    }

    if (dateKey <= checkIn) {
      if (!canCheckInOnDay(reservations, day, excludeReservationId)) {
        toast.error("This day is occupied — choose a free check-in day");
        return;
      }
      onChange(dateKey, "");
      return;
    }

    const validation = validateStayRange(reservations, checkIn, dateKey, {
      excludeId: excludeReservationId,
      allowPastCheckIn: !!excludeReservationId,
    });
    if (!validation.ok) {
      toast.error(validation.message);
      return;
    }

    onChange(checkIn, dateKey);
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading calendar…</p>;
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label>Stay dates</Label>
          {checkIn ? (
            <button
              type="button"
              onClick={() => onChange("", "")}
              className="text-xs font-medium text-violet-300 transition hover:text-violet-200"
            >
              Clear dates
            </button>
          ) : null}
        </div>
        <p className="text-sm text-muted-foreground">{selectionLabel}</p>
      </div>

      <div className="mx-auto w-full max-w-[21rem] overflow-hidden rounded-lg border border-border bg-card text-card-foreground sm:mx-0">
        <div className="flex items-center justify-between border-b px-2.5 py-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMonth((m) => addMonths(m, -1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold capitalize">
            {format(viewMonth, "MMMM yyyy", { locale: appLocale })}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMonth((m) => addMonths(m, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-7 border-b bg-muted/30">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="py-1.5 text-center text-[11px] font-medium text-muted-foreground"
            >
              {d.slice(0, 2)}
            </div>
          ))}
        </div>

        <div className="p-2">
          {weeks.map((weekDays, wi) => (
            <div key={wi} className="grid grid-cols-7 gap-1">
              {weekDays.map((day) => {
                const inMonth = isSameMonth(day, viewMonth);
                const isPast = !excludeReservationId && day < today;
                const dateKey = format(day, "yyyy-MM-dd");
                const availability = getDayAvailabilityKind(
                  reservations,
                  day,
                  excludeReservationId
                );
                const tooltip = getDayAvailabilityLabel(
                  reservations,
                  day,
                  excludeReservationId
                );
                const isSelectedStart = !!checkIn && dateKey === checkIn;
                const isSelectedEnd = !!checkOut && dateKey === checkOut;
                const inRange = isDayInSelectedRange(checkIn, checkOut, day);
                const isToday = isSameCalendarDay(day, today);
                const isBlockedDay =
                  availability === "occupied" || availability === "blocked";

                return (
                  <button
                    key={dateKey}
                    type="button"
                    disabled={isPast}
                    title={tooltip ?? undefined}
                    onClick={() => handleDayClick(day)}
                    className={cn(
                      "relative flex h-9 flex-col items-center justify-center rounded-md border text-sm tabular-nums transition-colors",
                      !inMonth && "opacity-40",
                      isPast &&
                        "cursor-not-allowed border-transparent bg-muted/20 text-muted-foreground/50",
                      !isPast &&
                        !inRange &&
                        !isSelectedStart &&
                        !isSelectedEnd &&
                        availability === "free" &&
                        "border-emerald-500/30 bg-emerald-500/15 text-emerald-700 hover:border-emerald-500/50 hover:bg-emerald-500/25 dark:text-emerald-300",
                      !isPast &&
                        availability === "occupied" &&
                        !inRange &&
                        !isSelectedStart &&
                        !isSelectedEnd &&
                        "border-red-500/25 bg-red-500/10 text-red-700 dark:text-red-300",
                      !isPast &&
                        availability === "blocked" &&
                        !inRange &&
                        !isSelectedStart &&
                        !isSelectedEnd &&
                        "border-amber-500/30 bg-amber-500/15 text-amber-800 dark:text-amber-200",
                      inRange &&
                        "border-violet-500/40 bg-violet-500/20 text-violet-200",
                      isSelectedStart &&
                        "border-[var(--calendar-check-in-ring)] bg-[var(--calendar-check-in-soft)] font-semibold text-[var(--calendar-check-in)]",
                      isSelectedEnd &&
                        "border-[var(--calendar-check-out-ring)] bg-[var(--calendar-check-out-soft)] font-semibold text-[var(--calendar-check-out)]",
                      isToday &&
                        !isSelectedStart &&
                        !isSelectedEnd &&
                        !inRange &&
                        availability === "free" &&
                        "ring-1 ring-inset ring-emerald-500/40"
                    )}
                  >
                    {format(day, "d")}
                    {isBlockedDay && !inRange && !isSelectedStart && (
                      <span
                        className={cn(
                          "mt-0.5 h-1 w-1 rounded-full",
                          availability === "blocked"
                            ? "bg-amber-600"
                            : "bg-red-500"
                        )}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-x-3 gap-y-1 border-t px-2.5 py-2 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded border border-emerald-500/30 bg-emerald-500/15" />
            Available
          </span>
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded border border-red-500/25 bg-red-500/10" />
            Occupied
          </span>
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded border border-amber-500/30 bg-amber-500/15" />
            Blocked
          </span>
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded border border-violet-500/40 bg-violet-500/20" />
            Selected
          </span>
        </div>
      </div>
    </div>
  );
}
