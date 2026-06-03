import { addDays, format } from "date-fns";

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
    return format(inD, "d. MMM");
  }
  return `${format(inD, "d.")}–${format(lastNight, "d. MMM")}`;
}

/** Pun opis za tooltip / listu: "13.–14. jun · odlazak 15. jun" */
export function formatStayPeriodLabel(
  checkIn: string,
  checkOutExclusive: string
): string {
  const nights = formatStayNightsLabel(checkIn, checkOutExclusive);
  const outD = parseDateOnly(checkOutExclusive);
  const inD = parseDateOnly(checkIn);
  const lastNight = getLastOccupiedNight(checkOutExclusive);

  if (isSameCalendarDay(inD, lastNight)) {
    return `${nights} · odlazak ${format(outD, "d. MMM")}`;
  }
  return `${nights} · odlazak ${format(outD, "d. MMM")}`;
}
