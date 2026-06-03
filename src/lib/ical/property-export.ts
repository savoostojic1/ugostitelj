import type { CalendarPlatform } from "@/types/database";
import {
  generateIcsCalendar,
  type IcsExportEvent,
} from "@/lib/ical/generate-ics";
import { getReservationDisplayKind } from "@/lib/reservations/display";

export interface PropertyExportReservation {
  id: string;
  external_uid: string;
  title: string;
  check_in: string;
  check_out: string;
  platform: CalendarPlatform;
  is_manual?: boolean;
  source?: string | null;
}

function buildExportSummary(reservation: PropertyExportReservation): string {
  if (getReservationDisplayKind(reservation) === "manual_block") {
    return "Not available";
  }

  if (reservation.is_manual) {
    return "Reserved";
  }

  if (reservation.platform === "booking") {
    return "Reserved (Booking)";
  }

  if (reservation.platform === "airbnb") {
    return "Reserved (Airbnb)";
  }

  return "Reserved";
}

function buildExportDescription(
  reservation: PropertyExportReservation
): string | undefined {
  if (getReservationDisplayKind(reservation) === "manual_block") {
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
    checkIn: reservation.check_in,
    checkOut: reservation.check_out,
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
