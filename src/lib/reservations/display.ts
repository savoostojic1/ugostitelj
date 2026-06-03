import type { CalendarPlatform } from "@/types/database";
import {
  formatImportedEventTitle,
  isBlockedCalendarEvent,
  isManualBlockTitle,
  MANUAL_BLOCK_TITLE,
} from "@/lib/ical/event-meta";
import type { Reservation } from "@/types/database";

export { isBlockedCalendarEvent, MANUAL_BLOCK_TITLE };

export type ReservationDisplayKind = "reservation" | "manual_block";

export function getReservationDisplayKind(
  reservation: Pick<Reservation, "title" | "platform">
): ReservationDisplayKind {
  if (isManualBlockTitle(reservation.title, reservation.platform)) {
    return "manual_block";
  }
  return "reservation";
}

export function formatReservationLabel(
  title: string,
  platform?: CalendarPlatform
): string {
  if (isManualBlockTitle(title, platform)) return MANUAL_BLOCK_TITLE;
  return formatImportedEventTitle(title, platform);
}

export function platformShort(platform: CalendarPlatform): string {
  if (platform === "airbnb") return "AB";
  if (platform === "booking") return "BK";
  return "•";
}

export function getPlatformBarClasses(
  platform: CalendarPlatform,
  kind: ReservationDisplayKind
): string {
  if (kind === "manual_block") {
    return "border-amber-500/40 bg-amber-500/15 text-amber-800 dark:text-amber-200";
  }
  switch (platform) {
    case "airbnb":
      return "border-[#ff5a5f]/40 bg-[#ff5a5f]/15 text-[#ff5a5f]";
    case "booking":
      return "border-[#003580]/40 bg-[#003580]/15 text-[#4a9eff]";
    default:
      return "border-emerald-500/40 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300";
  }
}
