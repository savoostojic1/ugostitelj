import { format, startOfDay } from "date-fns";
import {
  isStayNight,
  parseDateOnly,
} from "@/lib/dates/calendar-date";
import type { Reservation } from "@/types/database";
import {
  formatReservationLabel,
  getReservationDisplayKind,
} from "./display";

/** Preklapanje noćenja [aIn, aOut) i [bIn, bOut). */
export function rangesOverlapStayNights(
  aIn: string,
  aOut: string,
  bIn: string,
  bOut: string
): boolean {
  return aIn < bOut && aOut > bIn;
}

export function findStayRangeConflict(
  reservations: Reservation[],
  checkIn: string,
  checkOut: string,
  excludeId?: string
): Reservation | null {
  for (const reservation of reservations) {
    if (excludeId && reservation.id === excludeId) continue;
    if (
      rangesOverlapStayNights(
        checkIn,
        checkOut,
        reservation.check_in,
        reservation.check_out
      )
    ) {
      return reservation;
    }
  }
  return null;
}

export function getReservationsOnNight(
  reservations: Reservation[],
  day: Date
): Reservation[] {
  return reservations.filter((r) =>
    isStayNight(r.check_in, r.check_out, day)
  );
}

export function isNightOccupied(
  reservations: Reservation[],
  day: Date
): boolean {
  return getReservationsOnNight(reservations, day).length > 0;
}

export function canCheckInOnDay(
  reservations: Reservation[],
  day: Date
): boolean {
  return !isNightOccupied(reservations, day);
}

export function isDayInSelectedRange(
  checkIn: string,
  checkOut: string,
  day: Date
): boolean {
  if (!checkIn || !checkOut || checkOut <= checkIn) return false;
  return isStayNight(checkIn, checkOut, day);
}

export function formatConflictMessage(conflict: Reservation): string {
  const label = formatReservationLabel(conflict.title, conflict.platform);
  const kind = getReservationDisplayKind(conflict);
  const type = kind === "manual_block" ? "Blokada" : label;
  return `Preklapa se sa: ${type} (${format(parseDateOnly(conflict.check_in), "d. MMM")} – odlazak ${format(parseDateOnly(conflict.check_out), "d. MMM")})`;
}

export function validateStayRange(
  reservations: Reservation[],
  checkIn: string,
  checkOut: string
):
  | { ok: true }
  | { ok: false; message: string; conflict?: Reservation } {
  if (!checkIn || !checkOut) {
    return { ok: false, message: "Izaberi dolazak i odlazak na kalendaru" };
  }
  if (checkOut <= checkIn) {
    return {
      ok: false,
      message: "Datum odlaska mora biti poslije dolaska",
    };
  }
  if (parseDateOnly(checkIn) < startOfDay(new Date())) {
    return { ok: false, message: "Dolazak ne može biti u prošlosti" };
  }
  if (!canCheckInOnDay(reservations, parseDateOnly(checkIn))) {
    return {
      ok: false,
      message: "Dan dolaska je već zauzet",
    };
  }

  const conflict = findStayRangeConflict(reservations, checkIn, checkOut);
  if (conflict) {
    return {
      ok: false,
      message: formatConflictMessage(conflict),
      conflict,
    };
  }

  return { ok: true };
}

export type DayAvailabilityKind = "free" | "occupied" | "blocked";

export function getDayAvailabilityKind(
  reservations: Reservation[],
  day: Date
): DayAvailabilityKind {
  const onNight = getReservationsOnNight(reservations, day);
  if (onNight.length === 0) return "free";

  const hasBlock = onNight.some(
    (r) => getReservationDisplayKind(r) === "manual_block"
  );
  return hasBlock ? "blocked" : "occupied";
}

export function getDayAvailabilityLabel(
  reservations: Reservation[],
  day: Date
): string | null {
  const onNight = getReservationsOnNight(reservations, day);
  if (onNight.length === 0) return null;

  return onNight
    .map((r) => formatReservationLabel(r.title, r.platform))
    .join(", ");
}
