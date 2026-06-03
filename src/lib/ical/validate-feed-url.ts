/** Normalizacija i upozorenja za iCal URL (Booking često pogrešan „import“ link). */

export function normalizeIcsUrl(raw: string): string {
  let url = raw.trim();
  if (url.startsWith("webcal://")) {
    url = `https://${url.slice("webcal://".length)}`;
  }
  if (url.startsWith("webcals://")) {
    url = `https://${url.slice("webcals://".length)}`;
  }
  return url;
}

export function getIcsUrlHint(
  platform: "airbnb" | "booking" | "custom",
  url: string
): string | null {
  const lower = url.toLowerCase();
  if (platform === "booking") {
    if (lower.includes("import") && !lower.includes("export")) {
      return "Izgleda kao IMPORT link (uvoz u Booking). Treba EXPORT link: Sync calendars → Export → Copy link.";
    }
    if (!lower.includes("http")) return null;
    if (
      !lower.includes("booking") &&
      !lower.includes("ical") &&
      !lower.includes(".ics")
    ) {
      return "URL ne liči na Booking iCal export. Provjeri da si kopirao link iz „Export“, ne API ključ.";
    }
  }
  return null;
}
