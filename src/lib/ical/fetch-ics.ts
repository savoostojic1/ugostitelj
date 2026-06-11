import "server-only";

import type { CalendarPlatform } from "@/types/database";
import {
  buildIcsFetchHeaders,
  formatIcsFetchError,
  normalizeIcsUrl,
  validateIcsUrl,
} from "./validate-feed-url";

export async function fetchIcsText(
  rawUrl: string,
  platform: CalendarPlatform
): Promise<string> {
  const url = normalizeIcsUrl(rawUrl);
  const validation = validateIcsUrl(platform, url);
  if (validation) {
    throw new Error(
      validation.hint
        ? `${validation.error} ${validation.hint}`
        : validation.error
    );
  }

  const response = await fetch(url, {
    headers: buildIcsFetchHeaders(platform, url),
    signal: AbortSignal.timeout(30000),
    cache: "no-store",
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(formatIcsFetchError(response.status, platform, url));
  }

  const icsText = await response.text();

  if (!icsText.includes("BEGIN:VCALENDAR")) {
    const preview = icsText.replace(/\s+/g, " ").slice(0, 120);
    throw new Error(
      preview.toLowerCase().includes("<html")
        ? "This link points to a web page, not an .ics calendar. Copy the Export link (Copy link), not the URL from the extranet address bar."
        : `Response is not iCal (.ics). ${preview ? `Start: "${preview}…"` : "Empty response."}`
    );
  }

  return icsText;
}
