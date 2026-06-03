/** Normalizacija i validacija iCal URL-ova (Booking Export vs Import). */

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
      error: "URL mora počinjati sa http:// ili https://",
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
        error: "Ovo izgleda kao IMPORT link (uvoz u Booking).",
        hint: "Treba EXPORT: Extranet → Rates & availability → Sync calendars → Add connection → Skip to export → Copy link.",
      };
    }

    if (lower.includes("extranet_ng/manage/ical.html") && !lower.includes("?t=")) {
      return {
        error: "Ovo je stranica kalendara, ne Export link.",
        hint: "Na toj stranici klikni Copy link / Export calendar — URL mora imati ?t= token.",
      };
    }

    const looksLikeBookingExport =
      lower.includes("ical.booking.com") ||
      lower.includes("/ical.html") ||
      lower.includes("/ical/") ||
      lower.endsWith(".ics");

    if (!looksLikeBookingExport) {
      return {
        error: "URL ne liči na Booking Export kalendar.",
        hint: "Ispravan format: admin.booking.com/.../ical.html?t=... ili ical.booking.com/v1/export?t=...",
      };
    }

    if (
      (lower.includes("ical.html") || lower.includes("ical.booking.com")) &&
      !lower.includes("t=")
    ) {
      return {
        error: "Booking Export linku nedostaje token (?t=...).",
        hint: "Kopiraj cijeli link iz „Copy link“, ne samo adresu stranice.",
      };
    }
  }

  if (platform === "airbnb") {
    if (!lower.includes("airbnb.")) {
      return {
        error: "URL ne liči na Airbnb kalendar.",
        hint: "Airbnb: Calendar → Availability settings → Export calendar → kopiraj .ics link.",
      };
    }

    if (!lower.includes("/calendar/ical/") && !lower.endsWith(".ics")) {
      return {
        error: "Ovo ne izgleda kao Airbnb iCal Export link.",
        hint: "Treba link oblika: airbnb.com/calendar/ical/....ics?s=...",
      };
    }

    if (lower.includes("/calendar/ical/") && !lower.includes("s=")) {
      return {
        error: "Airbnb linku vjerovatno nedostaje tajni ključ (?s=...).",
        hint: "Kopiraj cijeli link iz Export calendar, ne skraćenu verziju.",
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
        "Booking ne prihvata ovaj link (HTTP 400). Koristi Export link: Sync calendars → Skip to export → Copy link. " +
        "Link mora sadržavati ical.html?t=... ili ical.booking.com/v1/export?t=... — ne Import link sa drugog kanala."
      );
    }
    if (platform === "airbnb") {
      return (
        "Airbnb ne prihvata ovaj link (HTTP 400). Calendar → Export calendar → kopiraj cijeli .ics URL sa ?s= parametrom."
      );
    }
    return `Kalendar nije dostupan (HTTP 400). Provjeri da je link Export URL, ne Import.`;
  }

  if (status === 403 || status === 401) {
    return `Pristup kalendaru odbijen (HTTP ${status}). Link je možda istekao — generiši novi Export link u extranetu.`;
  }

  if (status === 404) {
    return `Kalendar nije pronađen (HTTP 404). Link je neispravan ili uklonjen — kopiraj novi Export link.`;
  }

  if (platform === "booking" && !lower.includes("ical")) {
    return `Booking kalendar nije dostupan (HTTP ${status}). URL mora sadržavati /ical/ — koristi Copy link iz Export sekcije.`;
  }

  return `Kalendar nije dostupan (HTTP ${status}). Provjeri Export link iz extraneta (ne Import).`;
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
