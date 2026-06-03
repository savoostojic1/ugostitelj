import {
  generateIcsCalendar,
  type IcsExportEvent,
} from "@/lib/ical/generate-ics";
import { toExportDateOnly } from "@/lib/calendar/export-filter";
import { getReservationDisplayKind } from "@/lib/reservations/display";
import type { CalendarPlatform } from "@/types/database";

export interface PropertyExportReservation {
  id: string;
  external_uid: string;
  title: string;
  check_in: string;
  check_out: string;
  platform: CalendarPlatform | string;
  is_manual?: boolean;
  source?: string | null;
}

function asPlatform(
  platform: CalendarPlatform | string
): CalendarPlatform {
  if (platform === "airbnb" || platform === "booking" || platform === "custom") {
    return platform;
  }
  return "custom";
}

function buildExportSummary(reservation: PropertyExportReservation): string {
  const platform = asPlatform(reservation.platform);
  if (
    getReservationDisplayKind({
      title: reservation.title,
      platform,
    }) === "manual_block"
  ) {
    return "Not available";
  }

  if (reservation.is_manual) {
    return "Reserved";
  }

  if (platform === "booking") {
    return "Reserved (Booking)";
  }

  if (platform === "airbnb") {
    return "Reserved (Airbnb)";
  }

  return "Reserved";
}

function buildExportDescription(
  reservation: PropertyExportReservation
): string | undefined {
  const platform = asPlatform(reservation.platform);
  if (
    getReservationDisplayKind({
      title: reservation.title,
      platform,
    }) === "manual_block"
  ) {
    return "Blocked in Ugostitelj";
  }

  if (reservation.is_manual) {
    const parts = [reservation.title.trim()];
    if (reservation.source?.trim()) {
      parts.push(reservation.source.trim());
    }
    return `Ugostitelj: ${parts.join(" · ")}`;
  }

  return `Ugostitelj: ${reservation.title.trim()}`;
}

export function buildPropertyExportEvents(
  reservations: PropertyExportReservation[]
): IcsExportEvent[] {
  return reservations.map((reservation) => ({
    uid: `export-${reservation.id}`,
    summary: buildExportSummary(reservation),
    description: buildExportDescription(reservation),
    checkIn: toExportDateOnly(reservation.check_in),
    checkOut: toExportDateOnly(reservation.check_out),
  }));
}

export function generatePropertyExportIcs(
  calendarName: string,
  reservations: PropertyExportReservation[]
): string {
  return generateIcsCalendar({
    calendarName: `${calendarName} · Ugostitelj`,
    events: buildPropertyExportEvents(reservations),
  });
}
