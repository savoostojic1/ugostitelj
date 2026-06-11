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
    return { ok: false, message: "Select check-in and check-out" };
  }
  if (checkOut <= checkIn) {
    return { ok: false, message: "Check-out must be after check-in" };
  }
  if (parseDateOnly(checkIn) < startOfDay(new Date())) {
    return { ok: false, message: "Check-in cannot be in the past" };
  }
  if (!canPublicCheckInOnDay(reservations, parseDateOnly(checkIn))) {
    return { ok: false, message: "Check-in day is unavailable" };
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
      return { ok: false, message: "Dates overlap with an existing reservation" };
    }
  }

  return { ok: true };
}
