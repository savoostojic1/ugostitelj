import type { GuestReservationStatus } from "@/lib/reservations/guest-access";
import type { NotificationPreferences } from "@/lib/notifications/preferences";

export type ReservationEventName =
  | "request_received"
  | "confirmed"
  | "cancelled_by_guest"
  | "cancelled_by_owner";

export type DeliveryChannel =
  | "email_guest"
  | "email_owner"
  | "push_owner"
  | "telegram";

export type StoredDelivery = {
  status: "pending" | "sent" | "failed" | "skipped";
  attemptCount: number;
  updatedAt: number;
};

export function channelsForEvent(
  event: ReservationEventName,
  options?: { telegram?: boolean }
): DeliveryChannel[] {
  const channels: DeliveryChannel[] = [
    "email_guest",
    "email_owner",
    "push_owner",
  ];
  if (event === "request_received" && options?.telegram) {
    channels.push("telegram");
  }
  return channels;
}

export function eventAllowedForStatus(
  event: ReservationEventName,
  status: GuestReservationStatus
): boolean {
  if (event === "request_received") return status === "pending";
  if (event === "confirmed") return status === "confirmed";
  if (event === "cancelled_by_guest" || event === "cancelled_by_owner") {
    return status === "cancelled";
  }
  return false;
}

export function notificationEventForState(input: {
  status: GuestReservationStatus;
  cancelledBy: "guest" | "owner" | null;
}): ReservationEventName | null {
  if (input.status === "pending") return "request_received";
  if (input.status === "confirmed") return "confirmed";
  if (input.status === "cancelled" && input.cancelledBy === "guest") {
    return "cancelled_by_guest";
  }
  if (input.status === "cancelled" && input.cancelledBy === "owner") {
    return "cancelled_by_owner";
  }
  return null;
}

export function isChannelEnabled(
  prefs: NotificationPreferences,
  event: ReservationEventName,
  channel: DeliveryChannel
): boolean {
  if (channel === "email_guest" || channel === "telegram") return true;
  if (channel === "email_owner") {
    if (event === "request_received") return prefs.emailNewRequest;
    if (event === "confirmed") return prefs.emailConfirmation;
    return prefs.emailCancellation;
  }
  if (channel === "push_owner") {
    if (event === "request_received") return prefs.pushNewRequest;
    if (event === "confirmed") return prefs.pushConfirmation;
    return prefs.pushCancellation;
  }
  return false;
}

export function decideDeliveryAttempt(
  existing: StoredDelivery | null,
  now: number,
  options?: { maxAttempts?: number; inflightMs?: number }
): "send" | "skip" {
  const maxAttempts = options?.maxAttempts ?? 5;
  const inflightMs = options?.inflightMs ?? 120_000;
  if (!existing) return "send";
  if (existing.status === "sent" || existing.status === "skipped") return "skip";
  if (existing.attemptCount >= maxAttempts) return "skip";
  if (existing.status === "pending" && now - existing.updatedAt < inflightMs) {
    return "skip";
  }
  return "send";
}
