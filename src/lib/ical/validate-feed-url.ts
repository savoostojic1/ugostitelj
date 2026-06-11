/** Normalize and validate iCal URLs (Booking Export vs Import). */

import type { CalendarPlatform } from "@/types/database";

export function normalizeIcsUrl(raw: string): string {
  let url = raw.trim().replace(/\s+/g, "");

  if (url.startsWith("webcal://")) {
    url = `https://${url.slice("webcal://".length)}`;
  }
  if (url.startsWith("webcals://")) {
    url = `https://${url.slice("webcals://".length)}`;
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:") {
      parsed.protocol = "https:";
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

export function getIcsUrlHint(
  platform: CalendarPlatform,
  url: string
): string | null {
  const problem = validateIcsUrl(platform, url);
  return problem?.hint ?? null;
}

export function validateIcsUrl(
  platform: CalendarPlatform,
  rawUrl: string
): { error: string; hint?: string } | null {
  const url = normalizeIcsUrl(rawUrl);
  const lower = url.toLowerCase();

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return {
      error: "URL must start with http:// or https://",
    };
  }

  if (platform === "booking") {
    if (
      lower.includes("/import") ||
      (lower.includes("import") &&
        !lower.includes("export") &&
        !lower.includes("/ical"))
    ) {
      return {
        error: "This looks like an IMPORT link (into Booking).",
        hint: "You need EXPORT: Extranet → Rates & availability → Sync calendars → Add connection → Skip to export → Copy link.",
      };
    }

    if (lower.includes("extranet_ng/manage/ical.html") && !lower.includes("?t=")) {
      return {
        error: "This is the calendar page, not an Export link.",
        hint: "On that page click Copy link / Export calendar — the URL must include a ?t= token.",
      };
    }

    const looksLikeBookingExport =
      lower.includes("ical.booking.com") ||
      lower.includes("/ical.html") ||
      lower.includes("/ical/") ||
      lower.endsWith(".ics");

    if (!looksLikeBookingExport) {
      return {
        error: "URL does not look like a Booking Export calendar.",
        hint: "Correct format: admin.booking.com/.../ical.html?t=... or ical.booking.com/v1/export?t=...",
      };
    }

    if (
      (lower.includes("ical.html") || lower.includes("ical.booking.com")) &&
      !lower.includes("t=")
    ) {
      return {
        error: "Booking Export link is missing the token (?t=...).",
        hint: "Copy the full link from “Copy link”, not just the page address.",
      };
    }
  }

  if (platform === "airbnb") {
    if (!lower.includes("airbnb.")) {
      return {
        error: "URL does not look like an Airbnb calendar.",
        hint: "Airbnb: Calendar → Availability → Export calendar → copy the full link.",
      };
    }

    const looksLikeExport =
      lower.includes("/calendar/ical/") ||
      (lower.includes("/ical/") && lower.includes(".ics"));

    if (!looksLikeExport) {
      return {
        error: "This does not look like an Airbnb iCal Export link.",
        hint: "You need a link with airbnb.com/calendar/ical/... (Export calendar, not Import).",
      };
    }
  }

  return null;
}

export function formatIcsFetchError(
  status: number,
  platform: CalendarPlatform,
  url: string
): string {
  const lower = url.toLowerCase();
  const validation = validateIcsUrl(platform, url);

  if (validation?.error) {
    return `${validation.error} ${validation.hint ?? ""}`.trim();
  }

  if (status === 400) {
    if (platform === "booking") {
      return (
        "Booking rejected this link (HTTP 400). Use the Export link: Sync calendars → Skip to export → Copy link. " +
        "The URL must contain ical.html?t=... or ical.booking.com/v1/export?t=... — not an Import link from another channel."
      );
    }
    if (platform === "airbnb") {
      return (
        "Airbnb rejected this link (HTTP 400). Calendar → Export calendar → copy the full link. " +
        "Try opening it in a browser — it should download .ics or show BEGIN:VCALENDAR."
      );
    }
    return `Calendar unavailable (HTTP 400). Check that the link is an Export URL, not Import.`;
  }

  if (status === 403 || status === 401) {
    return `Calendar access denied (HTTP ${status}). The link may have expired — generate a new Export link in the extranet.`;
  }

  if (status === 404) {
    return `Calendar not found (HTTP 404). The link is invalid or removed — copy a new Export link.`;
  }

  if (platform === "booking" && !lower.includes("ical")) {
    return `Booking calendar unavailable (HTTP ${status}). URL must contain /ical/ — use Copy link from the Export section.`;
  }

  return `Calendar unavailable (HTTP ${status}). Check the Export link from the extranet (not Import).`;
}

export function buildIcsFetchHeaders(
  platform: CalendarPlatform,
  url: string
): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "text/calendar, text/plain, application/ics, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "Cache-Control": "no-cache",
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  };

  try {
    const host = new URL(url).hostname;
    if (platform === "booking" || host.includes("booking.com")) {
      headers.Referer = "https://admin.booking.com/";
    } else if (platform === "airbnb" || host.includes("airbnb.")) {
      headers.Referer = "https://www.airbnb.com/";
    }
  } catch {
    // ignore
  }

  return headers;
}
