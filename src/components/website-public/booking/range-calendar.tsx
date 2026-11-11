"use client";

import { useMemo, useState } from "react";
import { addDays, addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, startOfDay, startOfMonth, startOfWeek } from "date-fns";
import { parseDateOnly } from "@/lib/dates/calendar-date";
import { isPublicDayBlocked } from "@/lib/public/day-status";
import type { PublicReservationSpan } from "@/lib/public/types";

const iso = (day: Date) => format(day, "yyyy-MM-dd");

function weekdayLabels(language: string): string[] {
  const monday = new Date(Date.UTC(2024, 0, 1));
  return Array.from({ length: 7 }, (_, index) => {
    try {
      return new Intl.DateTimeFormat(language, { weekday: "narrow", timeZone: "UTC" }).format(new Date(monday.getTime() + index * 86400000));
    } catch {
      return "MTWTFSS"[index];
    }
  });
}

function monthLabel(month: Date, language: string): string {
  try {
    return new Intl.DateTimeFormat(language, { month: "long", year: "numeric" }).format(month);
  } catch {
    return format(month, "MMMM yyyy");
  }
}

/**
 * Two-step range picker: choose arrival, then departure. Booked nights cannot be
 * chosen as arrival and a stay can never run across one. Departure is allowed on
 * the morning a booked stay begins.
 */
export function RangeCalendar({
  checkIn,
  checkOut,
  reservations,
  language,
  onChange,
}: {
  checkIn: string;
  checkOut: string;
  reservations: PublicReservationSpan[];
  language: string;
  onChange: (dates: { checkIn: string; checkOut: string }) => void;
}) {
  const today = startOfDay(new Date());
  const [view, setView] = useState(() => startOfMonth(checkIn ? parseDateOnly(checkIn) : today));
  const [hover, setHover] = useState<string>("");
  const weekdays = useMemo(() => weekdayLabels(language), [language]);

  const blocked = (day: Date) => isPublicDayBlocked(reservations, day);
  const arrival = checkIn ? parseDateOnly(checkIn) : null;

  // The first booked night after arrival caps how far a stay can run.
  const limit = useMemo(() => {
    if (!arrival || checkOut) return null;
    for (let i = 1; i <= 365; i += 1) {
      const day = addDays(arrival, i);
      if (isPublicDayBlocked(reservations, day)) return day;
    }
    return null;
  }, [arrival, checkOut, reservations]);

  const choosingDeparture = Boolean(arrival && !checkOut);

  const select = (day: Date) => {
    const key = iso(day);
    if (choosingDeparture && arrival && day > arrival && (!limit || day <= limit)) {
      onChange({ checkIn, checkOut: key });
      return;
    }
    if (blocked(day) || day < today) return;
    onChange({ checkIn: key, checkOut: "" });
  };

  const months = [view, addMonths(view, 1)];
  const rangeEnd = checkOut || (choosingDeparture ? hover : "");

  return (
    <div className="wb-cal" data-choosing={choosingDeparture ? "out" : "in"}>
      <div className="wb-cal-head">
        <button type="button" className="wb-cal-nav" onClick={() => setView(addMonths(view, -1))} disabled={view <= startOfMonth(today)} aria-label="Previous month">
          ‹
        </button>
        <p className="wb-cal-hint" aria-live="polite">
          {choosingDeparture ? "Choose your departure date" : checkIn && checkOut ? "Dates selected. Tap a day to start over." : "Choose your arrival date"}
        </p>
        <button type="button" className="wb-cal-nav" onClick={() => setView(addMonths(view, 1))} aria-label="Next month">
          ›
        </button>
      </div>
      <div className="wb-cal-months">
        {months.map((month, monthIndex) => {
          const days = eachDayOfInterval({
            start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
            end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
          });
          return (
            <div key={iso(month)} className="wb-cal-month" data-second={monthIndex === 1 ? "1" : undefined}>
              <p className="wb-cal-title">{monthLabel(month, language)}</p>
              <div className="wb-cal-grid" role="grid">
                {weekdays.map((label, index) => (
                  <span key={index} className="wb-cal-wd" aria-hidden>
                    {label}
                  </span>
                ))}
                {days.map((day) => {
                  const key = iso(day);
                  const outside = day.getMonth() !== month.getMonth();
                  if (outside) return <span key={key} className="wb-cal-empty" aria-hidden />;
                  const past = day < today;
                  const isBlocked = blocked(day);
                  const canDepart = choosingDeparture && arrival !== null && day > arrival && (!limit || day <= limit);
                  const disabled = (past || isBlocked) && !canDepart;
                  const isStart = key === checkIn;
                  const isEnd = key === rangeEnd && Boolean(rangeEnd);
                  const inRange = Boolean(checkIn && rangeEnd && key > checkIn && key < rangeEnd);
                  return (
                    <button
                      key={key}
                      type="button"
                      className="wb-cal-day"
                      data-start={isStart ? "1" : undefined}
                      data-end={isEnd ? "1" : undefined}
                      data-range={inRange ? "1" : undefined}
                      data-blocked={isBlocked && !past ? "1" : undefined}
                      data-today={key === iso(today) ? "1" : undefined}
                      disabled={disabled}
                      aria-pressed={isStart || isEnd}
                      aria-label={`${key}${isBlocked ? ", booked" : ""}`}
                      onMouseEnter={() => setHover(key)}
                      onFocus={() => setHover(key)}
                      onClick={() => select(day)}
                    >
                      {day.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div className="wb-cal-legend">
        <span>
          <i data-k="sel" /> Your stay
        </span>
        <span>
          <i data-k="blk" /> Booked
        </span>
        {checkIn ? (
          <button type="button" onClick={() => onChange({ checkIn: "", checkOut: "" })}>
            Clear dates
          </button>
        ) : null}
      </div>
    </div>
  );
}
