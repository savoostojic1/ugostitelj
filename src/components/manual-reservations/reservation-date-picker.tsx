"use client";

import { useMemo, useState } from "react";
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
}

const WEEKDAYS = ["Pon", "Uto", "Sri", "Čet", "Pet", "Sub", "Ned"];

export function ReservationDatePicker({
  reservations,
  checkIn,
  checkOut,
  onChange,
  isLoading,
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

  const upcomingOccupied = useMemo(() => {
    const todayKey = format(today, "yyyy-MM-dd");
    return [...reservations]
      .filter((r) => r.check_out > todayKey)
      .sort((a, b) => a.check_in.localeCompare(b.check_in))
      .slice(0, 8);
  }, [reservations, today]);

  const selectionLabel =
    checkIn && checkOut
      ? formatStayPeriodLabel(checkIn, checkOut)
      : checkIn
        ? `${format(parseDateOnly(checkIn), "d. MMM yyyy")} · izaberi odlazak`
        : "Klikni dan dolaska, zatim dan odlaska";

  function handleDayClick(day: Date) {
    if (day < today) {
      toast.error("Ne možeš birati datume u prošlosti");
      return;
    }

    const dateKey = format(day, "yyyy-MM-dd");

    if (!checkIn || (checkIn && checkOut)) {
      if (!canCheckInOnDay(reservations, day)) {
        const label = getDayAvailabilityLabel(reservations, day);
        toast.error(
          label
            ? `Zauzeto: ${label}. Izaberi slobodan dan za dolazak.`
            : "Ovaj dan je zauzet — izaberi slobodan dolazak"
        );
        return;
      }
      onChange(dateKey, "");
      return;
    }

    if (dateKey <= checkIn) {
      if (!canCheckInOnDay(reservations, day)) {
        toast.error("Ovaj dan je zauzet — izaberi slobodan dolazak");
        return;
      }
      onChange(dateKey, "");
      return;
    }

    const validation = validateStayRange(reservations, checkIn, dateKey);
    if (!validation.ok) {
      toast.error(validation.message);
      return;
    }

    onChange(checkIn, dateKey);
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Učitavanje kalendara…</p>;
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label>Datumi boravka</Label>
        <p className="text-sm text-muted-foreground">{selectionLabel}</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b px-3 py-2">
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
            {format(viewMonth, "MMMM yyyy")}
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
              className="py-2 text-center text-[11px] font-medium text-muted-foreground"
            >
              {d}
            </div>
          ))}
        </div>

        <div className="p-2">
          {weeks.map((weekDays, wi) => (
            <div key={wi} className="grid grid-cols-7 gap-1">
              {weekDays.map((day) => {
                const inMonth = isSameMonth(day, viewMonth);
                const isPast = day < today;
                const dateKey = format(day, "yyyy-MM-dd");
                const availability = getDayAvailabilityKind(reservations, day);
                const tooltip = getDayAvailabilityLabel(reservations, day);
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
                      "relative flex aspect-square flex-col items-center justify-center rounded-lg border text-sm tabular-nums transition-colors",
                      !inMonth && "opacity-40",
                      isPast &&
                        "cursor-not-allowed border-transparent bg-muted/20 text-muted-foreground/50",
                      !isPast &&
                        !inRange &&
                        !isSelectedStart &&
                        !isSelectedEnd &&
                        availability === "free" &&
                        "border-border hover:border-primary/50 hover:bg-primary/5",
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
                        "border-primary/30 bg-primary/15 text-primary",
                      isSelectedStart &&
                        "border-[var(--calendar-check-in-ring)] bg-[var(--calendar-check-in-soft)] font-semibold text-[var(--calendar-check-in)]",
                      isSelectedEnd &&
                        "border-[var(--calendar-check-out-ring)] bg-[var(--calendar-check-out-soft)] font-semibold text-[var(--calendar-check-out)]",
                      isToday &&
                        !isSelectedStart &&
                        !isSelectedEnd &&
                        !inRange &&
                        "ring-1 ring-inset ring-primary/30"
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

        <div className="flex flex-wrap gap-x-4 gap-y-1 border-t px-3 py-2 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded border border-red-500/25 bg-red-500/10" />
            Zauzeto
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded border border-amber-500/30 bg-amber-500/15" />
            Blokirano
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded border border-primary/30 bg-primary/15" />
            Tvoj izbor
          </span>
        </div>
      </div>

      {upcomingOccupied.length > 0 && (
        <div className="rounded-lg border border-border/80 bg-muted/20 p-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Zauzeti periodi u ovom bungalovu
          </p>
          <ul className="space-y-1.5">
            {upcomingOccupied.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-2 text-sm"
              >
                <span className="font-medium">
                  {formatStayPeriodLabel(r.check_in, r.check_out)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {getDayAvailabilityKind(
                    reservations,
                    parseDateOnly(r.check_in)
                  ) === "blocked"
                    ? "Blokirano"
                    : r.title}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
