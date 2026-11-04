import { dispatchReservationEvent } from "@/lib/notifications/send-reservation-event";

/** @deprecated Prefer dispatchReservationEvent. Kept so older imports stay on one sender. */
export async function notifyHostOfBookingRequest(
  requestId: string
): Promise<void> {
  await dispatchReservationEvent(requestId, "request_received");
}
