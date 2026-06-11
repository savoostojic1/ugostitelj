/** Shared between sync API and UI — no server-only imports */

import type { CalendarPlatform } from "@/types/database";

export const MANUAL_BLOCK_TITLE = "Manually blocked";

const LEGACY_MANUAL_BLOCK_TITLES = ["Ručno blokirano", "Blokirano"] as const;

function isLegacyManualBlockTitle(title: string): boolean {
  return (LEGACY_MANUAL_BLOCK_TITLES as readonly string[]).includes(title);
}

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
  if (
    kind === "manual_block" ||
    title === MANUAL_BLOCK_TITLE ||
    isLegacyManualBlockTitle(title)
  ) {
    return MANUAL_BLOCK_TITLE;
  }

  const t = title.trim();

  if (platform === "booking") {
    if (!t || isLegacyManualBlockTitle(t)) return "Reservation";
    if (/^reserved$/i.test(t)) return "Reservation";
    if (/^reservation$/i.test(t)) return "Reservation";
    if (/^booked$/i.test(t)) return "Reservation";
    if (/^confirmed$/i.test(t)) return "Reservation";
    if (/^closed\s*-\s*not\s*available$/i.test(t)) return "Reservation";
    if (/^closed\b/i.test(t)) return "Reservation";
    if (t.length > 28) return `${t.slice(0, 26)}…`;
    return t;
  }

  if (isBlockedCalendarEvent(t, platform)) return MANUAL_BLOCK_TITLE;
  if (/^reserved$/i.test(t)) return "Reservation";
  const cleaned = t
    .replace(/^closed\s*-\s*/i, "")
    .replace(/\s*\(not\s*available\)\s*/i, "")
    .trim();
  if (!cleaned || isBlockedCalendarEvent(cleaned, platform)) {
    return "Reservation";
  }
  if (cleaned.length > 28) return `${cleaned.slice(0, 26)}…`;
  return cleaned;
}

export function isManualBlockTitle(
  title: string,
  platform?: CalendarPlatform
): boolean {
  if (title === MANUAL_BLOCK_TITLE || isLegacyManualBlockTitle(title)) {
    return true;
  }
  return (
    platform !== "booking" &&
    isBlockedCalendarEvent(title, platform)
  );
}
