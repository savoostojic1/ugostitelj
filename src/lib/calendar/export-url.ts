const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function parseExportToken(raw: string): string | null {
  const token = raw.replace(/\.ics$/i, "").trim();
  return UUID_RE.test(token) ? token : null;
}

export function buildPropertyExportUrl(
  exportToken: string,
  origin = typeof window !== "undefined" ? window.location.origin : ""
): string {
  return `${origin}/api/calendar/${exportToken}.ics`;
}
