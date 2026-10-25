/**
 * Fictional sample month used only in this ad.
 * February 2027 starts on Monday and has 28 days, so the grid is four rows.
 * "Today" in the sample is Thursday 11 February 2027.
 * Nothing here is a real guest, property, or performance figure.
 */

export const MONTH = "February 2027";
export const TODAY = 11;

export const PROPERTIES = [
  { name: "Olive Bungalow", color: "#818cf8" },
  { name: "Pine Bungalow", color: "#f472b6" },
] as const;

export interface Stay {
  prop: 0 | 1;
  checkIn: number;
  checkOut: number;
  label: string;
  color: string;
}

/**
 * Bar colors follow src/lib/reservations/compact-calendar-colors.ts:
 * reservations sorted by check-in, then COMPACT_RESERVATION_COLORS.
 * Bars cover nights only (checkout morning is not a stay night), matching
 * getCalendarWeekSegments.
 */
export const STAYS: Stay[] = [
  { prop: 0, checkIn: 4, checkOut: 8, label: "Airbnb", color: "#2563eb" },
  { prop: 1, checkIn: 6, checkOut: 11, label: "Booking.com", color: "#dc2626" },
  { prop: 0, checkIn: 11, checkOut: 15, label: "Direct", color: "#16a34a" },
  { prop: 1, checkIn: 16, checkOut: 20, label: "Airbnb", color: "#ea580c" },
];

export const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export interface BarSegment {
  row: number;
  startCol: number;
  endCol: number;
  label: string;
}

/** Monday-based segments for a 28-day month that starts on Monday. */
export function barSegments(stay: Stay): BarSegment[] {
  const segs: BarSegment[] = [];
  const lastNight = stay.checkOut - 1;
  let day = stay.checkIn;
  let first = true;
  while (day <= lastNight) {
    const col = (day - 1) % 7;
    const row = Math.floor((day - 1) / 7);
    const endDay = Math.min(lastNight, day + (6 - col));
    segs.push({
      row,
      startCol: col,
      endCol: (endDay - 1) % 7,
      label: first ? stay.label : "",
    });
    first = false;
    day = endDay + 1;
  }
  return segs;
}
