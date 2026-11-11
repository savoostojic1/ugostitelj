import { validatePublicStayRange } from "@/lib/public/availability";
import type { PublicReservationSpan } from "@/lib/public/types";

export interface BookingInquiryDraft {
  propertySlug: string;
  guestName: string;
  email: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  message: string | null;
}

export function bookingInquiryPayload(input: BookingInquiryDraft): BookingInquiryDraft {
  return {
    propertySlug: input.propertySlug.trim(),
    guestName: input.guestName.trim(),
    email: input.email.trim(),
    phone: input.phone.trim(),
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    guestCount: input.guestCount,
    message: input.message?.trim() ? input.message.trim() : null,
  };
}

export function stayRangeAvailability(
  reservations: PublicReservationSpan[],
  checkIn: string,
  checkOut: string
): { available: boolean; message: string | null } {
  const result = validatePublicStayRange(reservations, checkIn, checkOut);
  if (!result.ok) return { available: false, message: result.message };
  return { available: true, message: null };
}

export function unavailableNightKeys(reservations: PublicReservationSpan[]): string[] {
  const keys: string[] = [];
  for (const reservation of reservations) {
    const cursor = new Date(`${reservation.check_in}T00:00:00Z`);
    const end = new Date(`${reservation.check_out}T00:00:00Z`);
    while (cursor < end) {
      keys.push(cursor.toISOString().slice(0, 10));
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
  }
  return keys;
}
