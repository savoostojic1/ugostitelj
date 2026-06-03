/** Čisto — bez server-only; dijeljeno između sync API-ja i UI-a */

import type { CalendarPlatform } from "@/types/database";

export const MANUAL_BLOCK_TITLE = "Ručno blokirano";

export type CalendarEventKind = "reservation" | "manual_block";

const AIRBNB_BLOCKED_PATTERNS = [
  /not\s*available/i,
  /^closed\b/i,
  /\bclosed\s*-/i,
  /unavailable/i,
  /blocked/i,
  /airbnb\s*\(/i,
];

function isAirbnbBlockedTitle(title: string): boolean {
  const t = title.trim();
  if (!t) return true;
  if (/^reserved$/i.test(t)) return false;
  if (/^reservation$/i.test(t)) return false;
  if (/^booked$/i.test(t)) return false;
  if (/^confirmed$/i.test(t)) return false;
  return AIRBNB_BLOCKED_PATTERNS.some((p) => p.test(t));
}

export function isBlockedCalendarEvent(
  title: string,
  platform?: CalendarPlatform
): boolean {
  if (platform === "booking") return false;
  if (platform === "custom") {
    const t = title.trim();
    if (!t) return false;
    if (/^closed\s*-\s*not\s*available$/i.test(t)) return true;
    if (/^not\s*available$/i.test(t)) return true;
    if (/^blocked$/i.test(t)) return true;
    return false;
  }
  return isAirbnbBlockedTitle(title);
}

export function classifyCalendarEvent(
  summary: string,
  platform: CalendarPlatform,
  description?: string
): CalendarEventKind {
  const raw = summary.trim() || "Reserved";
  const desc = (description ?? "").toLowerCase();

  if (platform === "airbnb" || platform === "custom") {
    if (isBlockedCalendarEvent(raw, platform)) return "manual_block";
    return "reservation";
  }

  // Booking: Reserved = gost; eksplicitne blokade = ručno
  if (/^reserved$/i.test(raw)) return "reservation";
  if (/^booked$/i.test(raw)) return "reservation";
  if (/^confirmed$/i.test(raw)) return "reservation";
  if (/^blocked$/i.test(raw)) return "manual_block";
  if (/^unavailable$/i.test(raw)) return "manual_block";
  if (desc.includes("blocked") && !desc.includes("reservation")) {
    return "manual_block";
  }
  return "reservation";
}

export function formatImportedEventTitle(
  title: string,
  platform?: CalendarPlatform,
  kind?: CalendarEventKind
): string {
  if (kind === "manual_block" || title === MANUAL_BLOCK_TITLE) {
    return MANUAL_BLOCK_TITLE;
  }

  const t = title.trim();

  if (platform === "booking") {
    if (!t || t === "Blokirano") return "Rezervacija";
    if (/^reserved$/i.test(t)) return "Rezervacija";
    if (/^reservation$/i.test(t)) return "Rezervacija";
    if (/^booked$/i.test(t)) return "Rezervacija";
    if (/^confirmed$/i.test(t)) return "Rezervacija";
    if (/^closed\s*-\s*not\s*available$/i.test(t)) return "Rezervacija";
    if (/^closed\b/i.test(t)) return "Rezervacija";
    if (t.length > 28) return `${t.slice(0, 26)}…`;
    return t;
  }

  if (isBlockedCalendarEvent(t, platform)) return MANUAL_BLOCK_TITLE;
  if (/^reserved$/i.test(t)) return "Rezervacija";
  const cleaned = t
    .replace(/^closed\s*-\s*/i, "")
    .replace(/\s*\(not\s*available\)\s*/i, "")
    .trim();
  if (!cleaned || isBlockedCalendarEvent(cleaned, platform)) {
    return "Rezervacija";
  }
  if (cleaned.length > 28) return `${cleaned.slice(0, 26)}…`;
  return cleaned;
}

export function isManualBlockTitle(
  title: string,
  platform?: CalendarPlatform
): boolean {
  if (title === MANUAL_BLOCK_TITLE || title === "Blokirano") return true;
  return (
    platform !== "booking" &&
    isBlockedCalendarEvent(title, platform)
  );
}
