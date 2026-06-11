import { addDays, format } from "date-fns";
import { appLocale } from "@/lib/dates/locale";

/** YYYY-MM-DD iz baze — bez timezone pomaka (parseISO na '2025-06-15' zna pogrešiti dan). */
export function parseDateOnly(isoDate: string): Date {
  const [y, m, d] = isoDate.split("T")[0].split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** check_out u bazi = prvi slobodan dan (iCal DTEND, ekskluzivno). Noći: [check_in, check_out). */
export function isStayNight(
  checkIn: string,
  checkOutExclusive: string,
  day: Date
): boolean {
  const inD = parseDateOnly(checkIn);
  const outD = parseDateOnly(checkOutExclusive);
  const t = day.getTime();
  return t >= inD.getTime() && t < outD.getTime();
}

export function getLastOccupiedNight(checkOutExclusive: string): Date {
  return addDays(parseDateOnly(checkOutExclusive), -1);
}

/** Samo noćenja — za traku na kalendaru (bez dana odlaska). */
export function formatStayNightsLabel(
  checkIn: string,
  checkOutExclusive: string
): string {
  const inD = parseDateOnly(checkIn);
  const lastNight = getLastOccupiedNight(checkOutExclusive);

  if (isSameCalendarDay(inD, lastNight)) {
    return format(inD, "d MMM", { locale: appLocale });
  }
  return `${format(inD, "d", { locale: appLocale })}–${format(lastNight, "d MMM", { locale: appLocale })}`;
}

/** Full label for tooltips and lists: "13–14 Jun · checkout 15 Jun" */
export function formatStayPeriodLabel(
  checkIn: string,
  checkOutExclusive: string
): string {
  const nights = formatStayNightsLabel(checkIn, checkOutExclusive);
  const outD = parseDateOnly(checkOutExclusive);

  return `${nights} · checkout ${format(outD, "d MMM", { locale: appLocale })}`;
}
