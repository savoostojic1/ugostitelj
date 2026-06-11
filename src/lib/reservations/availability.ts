import { format, startOfDay } from "date-fns";
import { appLocale } from "@/lib/dates/locale";
import {
  isStayNight,
  parseDateOnly,
} from "@/lib/dates/calendar-date";
import type { Reservation } from "@/types/database";
import {
  formatReservationLabel,
  getReservationDisplayKind,
} from "./display";

/** Overlap of stay nights [aIn, aOut) and [bIn, bOut). */
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
  day: Date,
  excludeId?: string
): Reservation[] {
  return reservations.filter(
    (r) =>
      (!excludeId || r.id !== excludeId) &&
      isStayNight(r.check_in, r.check_out, day)
  );
}

export function isNightOccupied(
  reservations: Reservation[],
  day: Date,
  excludeId?: string
): boolean {
  return getReservationsOnNight(reservations, day, excludeId).length > 0;
}

export function canCheckInOnDay(
  reservations: Reservation[],
  day: Date,
  excludeId?: string
): boolean {
  return !isNightOccupied(reservations, day, excludeId);
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
  const type = kind === "manual_block" ? "Block" : label;
  return `Overlaps with: ${type} (${format(parseDateOnly(conflict.check_in), "d MMM", { locale: appLocale })} – checkout ${format(parseDateOnly(conflict.check_out), "d MMM", { locale: appLocale })})`;
}

export function validateStayRange(
  reservations: Reservation[],
  checkIn: string,
  checkOut: string,
  options?: { excludeId?: string; allowPastCheckIn?: boolean }
):
  | { ok: true }
  | { ok: false; message: string; conflict?: Reservation } {
  const excludeId = options?.excludeId;

  if (!checkIn || !checkOut) {
    return { ok: false, message: "Select check-in and check-out on the calendar" };
  }
  if (checkOut <= checkIn) {
    return {
      ok: false,
      message: "Check-out must be after check-in",
    };
  }
  if (
    !options?.allowPastCheckIn &&
    parseDateOnly(checkIn) < startOfDay(new Date())
  ) {
    return { ok: false, message: "Check-in cannot be in the past" };
  }
  if (!canCheckInOnDay(reservations, parseDateOnly(checkIn), excludeId)) {
    return {
      ok: false,
      message: "Check-in day is already occupied",
    };
  }

  const conflict = findStayRangeConflict(
    reservations,
    checkIn,
    checkOut,
    excludeId
  );
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
  day: Date,
  excludeId?: string
): DayAvailabilityKind {
  const onNight = getReservationsOnNight(reservations, day, excludeId);
  if (onNight.length === 0) return "free";

  const hasBlock = onNight.some(
    (r) => getReservationDisplayKind(r) === "manual_block"
  );
  return hasBlock ? "blocked" : "occupied";
}

export function getDayAvailabilityLabel(
  reservations: Reservation[],
  day: Date,
  excludeId?: string
): string | null {
  const onNight = getReservationsOnNight(reservations, day, excludeId);
  if (onNight.length === 0) return null;

  return onNight
    .map((r) => formatReservationLabel(r.title, r.platform))
    .join(", ");
}
