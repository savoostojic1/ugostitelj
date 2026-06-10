import { startOfDay } from "date-fns";
import {
  isStayNight,
  parseDateOnly,
} from "@/lib/dates/calendar-date";
import { isPublicDayBlocked } from "@/lib/public/day-status";
import type { PublicReservationSpan } from "@/lib/public/types";

function rangesOverlapStayNights(
  aIn: string,
  aOut: string,
  bIn: string,
  bOut: string
): boolean {
  return aIn < bOut && aOut > bIn;
}

export function canPublicCheckInOnDay(
  reservations: PublicReservationSpan[],
  day: Date
): boolean {
  return !isPublicDayBlocked(reservations, day);
}

export function isPublicDayInSelectedRange(
  checkIn: string,
  checkOut: string,
  day: Date
): boolean {
  if (!checkIn || !checkOut || checkOut <= checkIn) return false;
  return isStayNight(checkIn, checkOut, day);
}

export function validatePublicStayRange(
  reservations: PublicReservationSpan[],
  checkIn: string,
  checkOut: string
): { ok: true } | { ok: false; message: string } {
  if (!checkIn || !checkOut) {
    return { ok: false, message: "Izaberite dolazak i odlazak" };
  }
  if (checkOut <= checkIn) {
    return { ok: false, message: "Datum odlaska mora biti poslije dolaska" };
  }
  if (parseDateOnly(checkIn) < startOfDay(new Date())) {
    return { ok: false, message: "Dolazak ne može biti u prošlosti" };
  }
  if (!canPublicCheckInOnDay(reservations, parseDateOnly(checkIn))) {
    return { ok: false, message: "Dan dolaska je zauzet" };
  }

  for (const reservation of reservations) {
    if (
      rangesOverlapStayNights(
        checkIn,
        checkOut,
        reservation.check_in,
        reservation.check_out
      )
    ) {
      return { ok: false, message: "Termin se preklapa sa postojećom rezervacijom" };
    }
  }

  return { ok: true };
}
