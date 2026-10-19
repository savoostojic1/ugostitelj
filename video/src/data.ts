/**
 * Fictional sample data shared by every scene so the calendar, cleanings
 * list and dashboard stay consistent with each other. No real guests.
 */
export type Source = "airbnb" | "booking" | "direct";

export interface Stay {
  prop: number;
  checkIn: number;
  checkOut: number;
  src: Source;
  guest: string;
}

export const MONTH = {
  label: "July 2027",
  short: "Jul",
  days: 31,
  /** Monday-based column of July 1, 2027 (a Thursday). */
  firstCol: 3,
};

export const TODAY = 13;

export const STAYS: Stay[] = [
  { prop: 0, checkIn: 2, checkOut: 6, src: "airbnb", guest: "Airbnb guest" },
  { prop: 0, checkIn: 9, checkOut: 13, src: "direct", guest: "Emma & Tom" },
  { prop: 0, checkIn: 15, checkOut: 20, src: "booking", guest: "Lena H." },
  { prop: 0, checkIn: 26, checkOut: 30, src: "airbnb", guest: "Airbnb guest" },
  { prop: 1, checkIn: 1, checkOut: 4, src: "booking", guest: "Booking guest" },
  { prop: 1, checkIn: 7, checkOut: 12, src: "airbnb", guest: "Airbnb guest" },
  { prop: 1, checkIn: 13, checkOut: 17, src: "direct", guest: "Marco R." },
  { prop: 1, checkIn: 21, checkOut: 28, src: "booking", guest: "Mia S." },
  { prop: 2, checkIn: 3, checkOut: 8, src: "direct", guest: "Ivan K." },
  { prop: 2, checkIn: 9, checkOut: 13, src: "booking", guest: "Jonas W." },
  { prop: 2, checkIn: 18, checkOut: 25, src: "airbnb", guest: "Noah P." },
  { prop: 2, checkIn: 27, checkOut: 31, src: "direct", guest: "Ana & Filip" },
  { prop: 3, checkIn: 1, checkOut: 7, src: "airbnb", guest: "Airbnb guest" },
  { prop: 3, checkIn: 11, checkOut: 15, src: "booking", guest: "Booking guest" },
  { prop: 3, checkIn: 17, checkOut: 20, src: "airbnb", guest: "Clara D." },
  { prop: 3, checkIn: 24, checkOut: 29, src: "direct", guest: "Paul & Kim" },
];

/** The booking that is entered in the manual-booking scene. */
export const NEW_BOOKING: Stay = {
  prop: 0,
  checkIn: 20,
  checkOut: 24,
  src: "direct",
  guest: "Sarah Miller",
};

export const ALL_STAYS = [...STAYS, NEW_BOOKING];

export const SOURCE_COLOR: Record<Source, string> = {
  airbnb: "#ff5a5f",
  booking: "#3b82f6",
  direct: "#10b981",
};

export const SOURCE_LABEL: Record<Source, string> = {
  airbnb: "Airbnb",
  booking: "Booking.com",
  direct: "Manual",
};

export const SOURCE_LETTER: Record<Source, string> = {
  airbnb: "A",
  booking: "B",
  direct: "D",
};

export const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const WEEKDAY_LONG = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const weekdayOf = (day: number) =>
  WEEKDAY_LONG[(MONTH.firstCol + day - 1) % 7];

export type DayType = "check_out" | "check_in" | "stayover" | "empty";

export const DAY_LABEL: Record<DayType, string> = {
  check_out: "Checkout",
  check_in: "Check in",
  stayover: "Stayover",
  empty: "Empty",
};

export function dayCard(prop: number, day: number, stays: Stay[] = ALL_STAYS) {
  const own = stays.filter((s) => s.prop === prop);
  const types: DayType[] = [];
  const out = own.find((s) => s.checkOut === day);
  const inn = own.find((s) => s.checkIn === day);
  if (out) types.push("check_out");
  if (inn) types.push("check_in");
  if (!out && !inn && own.some((s) => s.checkIn < day && day < s.checkOut)) {
    types.push("stayover");
  }
  if (!types.length) types.push("empty");
  return { types, origin: inn?.src };
}

export const cleaningCount = (day: number, stays: Stay[] = ALL_STAYS) =>
  stays.filter((s) => s.checkOut === day).length;

export const formatCleaningCount = (n: number) =>
  n === 1 ? "1 cleaning" : `${n} cleanings`;

export const formatFreeDays = (n: number) =>
  n === 1 ? "1 free day" : `${n} free days`;

const isNight = (s: Stay, day: number) => s.checkIn <= day && day < s.checkOut;

export function freeDaysUntilMonthEnd(prop: number, stays: Stay[] = ALL_STAYS) {
  let free = 0;
  for (let d = TODAY; d <= MONTH.days; d++) {
    if (!stays.some((s) => s.prop === prop && isNight(s, d))) free++;
  }
  return free;
}

export function occupancyPercent(stays: Stay[] = STAYS) {
  let booked = 0;
  let total = 0;
  for (let p = 0; p < 4; p++) {
    for (let d = TODAY; d <= MONTH.days; d++) {
      total++;
      if (stays.some((s) => s.prop === p && isNight(s, d))) booked++;
    }
  }
  return Math.round((booked / total) * 100);
}

/** Splits a stay into per-week segments for a Monday-based month grid. */
export function staySegments(stay: Stay) {
  const segs: { row: number; startCol: number; endCol: number; startsHere: boolean; endsHere: boolean }[] = [];
  const cell = (day: number) => MONTH.firstCol + day - 1;
  let a = cell(stay.checkIn);
  const b = cell(stay.checkOut);
  while (a <= b) {
    const row = Math.floor(a / 7);
    const rowEnd = row * 7 + 6;
    const end = Math.min(b, rowEnd);
    segs.push({
      row,
      startCol: a % 7,
      endCol: end % 7,
      startsHere: a === cell(stay.checkIn),
      endsHere: end === b,
    });
    a = end + 1;
  }
  return segs;
}

export const MONTH_ROWS = Math.ceil((MONTH.firstCol + MONTH.days) / 7);
