import { format, startOfDay } from "date-fns";

/** Isti filter kao u Supabase RPC: export samo aktivnih boravaka. */
export function isExportableReservation(
  checkOut: string,
  today: Date = startOfDay(new Date())
): boolean {
  const todayKey = format(today, "yyyy-MM-dd");
  return checkOut.slice(0, 10) >= todayKey;
}

export function toExportDateOnly(value: string): string {
  return value.slice(0, 10);
}
