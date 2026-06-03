import type { CalendarPlatform } from "@/types/database";
import type { Reservation } from "@/types/database";
import { getReservationDisplayKind } from "./display";

export interface BarShade {
  backgroundColor: string;
  color: string;
}

const AIRBNB_SHADES: BarShade[] = [
  { backgroundColor: "#c13545", color: "#ffffff" },
  { backgroundColor: "#a52835", color: "#ffffff" },
  { backgroundColor: "#8b2230", color: "#ffffff" },
  { backgroundColor: "#d14752", color: "#ffffff" },
  { backgroundColor: "#922028", color: "#ffffff" },
  { backgroundColor: "#e04e59", color: "#ffffff" },
];

const BOOKING_SHADES: BarShade[] = [
  { backgroundColor: "#003580", color: "#ffffff" },
  { backgroundColor: "#004494", color: "#ffffff" },
  { backgroundColor: "#0057b8", color: "#ffffff" },
  { backgroundColor: "#1a5099", color: "#ffffff" },
  { backgroundColor: "#002d6e", color: "#ffffff" },
  { backgroundColor: "#003d8f", color: "#ffffff" },
];

const CUSTOM_SHADES: BarShade[] = [
  { backgroundColor: "#047857", color: "#ffffff" },
  { backgroundColor: "#065f46", color: "#ffffff" },
  { backgroundColor: "#059669", color: "#ffffff" },
];

const MANUAL_SHADES: BarShade[] = [
  { backgroundColor: "#b45309", color: "#ffffff" },
  { backgroundColor: "#92400e", color: "#ffffff" },
  { backgroundColor: "#d97706", color: "#ffffff" },
];

const SHADE_PALETTES: Record<CalendarPlatform, BarShade[]> = {
  airbnb: AIRBNB_SHADES,
  booking: BOOKING_SHADES,
  custom: CUSTOM_SHADES,
};

/** Stabilan redoslijed nijansi po platformi (sortirano po check-in). */
export function buildReservationShadeMap(
  reservations: Reservation[]
): Map<string, number> {
  const map = new Map<string, number>();
  const counters: Record<CalendarPlatform, number> = {
    airbnb: 0,
    booking: 0,
    custom: 0,
  };

  const sorted = [...reservations].sort((a, b) =>
    a.check_in.localeCompare(b.check_in)
  );

  for (const r of sorted) {
    map.set(r.id, counters[r.platform]++);
  }

  return map;
}

export function getReservationBarShade(
  reservation: Reservation,
  shadeIndex: number
): BarShade {
  if (getReservationDisplayKind(reservation) === "manual_block") {
    return MANUAL_SHADES[shadeIndex % MANUAL_SHADES.length];
  }
  const palette = SHADE_PALETTES[reservation.platform];
  return palette[shadeIndex % palette.length];
}
