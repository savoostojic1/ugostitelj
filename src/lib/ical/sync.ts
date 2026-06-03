import "server-only";

import { addDays } from "date-fns";
import { parseDateOnly } from "@/lib/dates/calendar-date";
import type { CalendarPlatform } from "@/types/database";
import { parseIcsDate, parseIcsEvents } from "./parse-ics";
import {
  classifyCalendarEvent,
  formatImportedEventTitle,
} from "./event-meta";

export interface ParsedReservation {
  external_uid: string;
  title: string;
  check_in: string;
  check_out: string;
  platform: CalendarPlatform;
}

function toDateString(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export interface IcsParseStats {
  totalEvents: number;
  imported: number;
  skippedBlocked: number;
  skippedInvalid: number;
}

export async function fetchAndParseIcs(
  icsUrl: string,
  platform: CalendarPlatform
): Promise<{ reservations: ParsedReservation[]; stats: IcsParseStats }> {
  const response = await fetch(icsUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; Ugostitelj/1.0; +https://ugostitelj.me)",
      Accept: "text/calendar, text/plain, */*",
    },
    signal: AbortSignal.timeout(30000),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Booking/Airbnb kalendar nije dostupan (HTTP ${response.status}). Koristi Export link iz extraneta, ne Import.`
    );
  }

  const icsText = await response.text();
  if (!icsText.includes("BEGIN:VCALENDAR")) {
    const preview = icsText.replace(/\s+/g, " ").slice(0, 80);
    throw new Error(
      `Odgovor nije iCal (.ics). ${preview ? `Početak: „${preview}…“` : "Prazan odgovor."} Treba Export URL, ne API ključ.`
    );
  }

  const events = parseIcsEvents(icsText);
  const reservations: ParsedReservation[] = [];
  const stats: IcsParseStats = {
    totalEvents: events.length,
    imported: 0,
    skippedBlocked: 0,
    skippedInvalid: 0,
  };

  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    if (!event.dtstart) {
      stats.skippedInvalid++;
      continue;
    }

    try {
      const startDate = parseIcsDate(event.dtstart);
      // DATE DTEND in iCal is exclusive → equals check-out day (Airbnb style)
      let endDate = event.dtend
        ? parseIcsDate(event.dtend)
        : addDays(startDate, 1);

      if (endDate <= startDate) {
        endDate = addDays(startDate, 1);
      }

      const uid = event.uid ?? `event-${i}-${toDateString(startDate)}`;
      const rawTitle = event.summary?.trim() || "Reserved";
      const kind = classifyCalendarEvent(
        rawTitle,
        platform,
        event.description
      );

      if (kind === "manual_block") {
        stats.skippedBlocked++;
      }

      reservations.push({
        external_uid: String(uid),
        title: formatImportedEventTitle(rawTitle, platform, kind),
        check_in: toDateString(startDate),
        check_out: toDateString(endDate),
        platform,
      });
      stats.imported++;
    } catch {
      stats.skippedInvalid++;
    }
  }

  return { reservations, stats };
}

export function parseReservationDates(reservation: {
  check_in: string;
  check_out: string;
}) {
  return {
    checkIn: parseDateOnly(reservation.check_in),
    checkOut: parseDateOnly(reservation.check_out),
  };
}
