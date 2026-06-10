import { format } from "date-fns";
import { isStayNight } from "@/lib/dates/calendar-date";
import type { PublicReservationSpan } from "./types";

export type PublicDayStatus =
  | "available"
  | "occupied"
  | "check_in"
  | "check_out";

/** Da li je dan blokiran rezervacijom (noćenje). */
export function isPublicDayBlocked(
  reservations: PublicReservationSpan[],
  day: Date
): boolean {
  for (const reservation of reservations) {
    if (isStayNight(reservation.check_in, reservation.check_out, day)) {
      return true;
    }
  }
  return false;
}

export function getPublicDayStatus(
  reservations: PublicReservationSpan[],
  day: Date
): PublicDayStatus {
  const dateKey = format(day, "yyyy-MM-dd");
  let hasCheckIn = false;
  let hasCheckOut = false;
  let hasStay = false;

  for (const reservation of reservations) {
    const checkInKey = reservation.check_in.split("T")[0];
    const checkOutKey = reservation.check_out.split("T")[0];
    if (checkInKey === dateKey) hasCheckIn = true;
    if (checkOutKey === dateKey) hasCheckOut = true;
    if (isStayNight(reservation.check_in, reservation.check_out, day)) {
      hasStay = true;
    }
  }

  if (hasCheckIn) return "check_in";
  if (hasCheckOut) return "check_out";
  if (hasStay) return "occupied";
  return "available";
}

export const PUBLIC_DAY_STYLES: Record<PublicDayStatus, string> = {
  available: "bg-emerald-100 text-emerald-800 ring-emerald-200/80",
  occupied: "bg-zinc-100 text-zinc-400 ring-zinc-200/60",
  check_in: "bg-rose-50 text-rose-600 ring-rose-100",
  check_out: "bg-emerald-50 text-emerald-700 ring-emerald-100",
};

export const PUBLIC_DAY_DOT: Record<PublicDayStatus, string> = {
  available: "bg-emerald-500",
  occupied: "bg-red-500",
  check_in: "bg-sky-500",
  check_out: "bg-amber-500",
};

export const PUBLIC_DAY_LABELS: Record<PublicDayStatus, string> = {
  available: "Slobodno",
  occupied: "Zauzeto",
  check_in: "Dolazak",
  check_out: "Odlazak",
};
