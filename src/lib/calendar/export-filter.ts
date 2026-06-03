import { format, startOfDay } from "date-fns";

/** Isti filter kao u Supabase RPC: export samo aktivnih boravaka. */
export function isExportableReservation(
  checkOut: string,
  today: Date = startOfDay(new Date())
): boolean {
  const todayKey = format(today, "yyyy-MM-dd");
  return checkOut.slice(0, 10) >= todayKey;
}

export function isManualExportReservation(
  reservation: { check_out: string; is_manual?: boolean },
  today: Date = startOfDay(new Date())
): boolean {
  return Boolean(reservation.is_manual) && isExportableReservation(
    reservation.check_out,
    today
  );
}

export function toExportDateOnly(value: string): string {
  return value.slice(0, 10);
}
