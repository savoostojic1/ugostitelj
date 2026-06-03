import "server-only";

/** Lightweight ICS parser — avoids node-ical (BigInt issues in Next.js bundle). */

export interface IcsEventFields {
  uid?: string;
  summary?: string;
  description?: string;
  dtstart?: string;
  dtend?: string;
}

function unfoldIcs(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\n[ \t]/g, "");
}

function unescapeIcsText(value: string): string {
  return value
    .replace(/\\n/gi, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\");
}

/** Parse iCal date (DATE or DATE-TIME, with or without Z). */
export function parseIcsDate(value: string): Date {
  const v = value.trim();
  const m = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?)?Z?$/i.exec(
    v.replace(/[^0-9TZ]/gi, "").toUpperCase()
  );
  if (!m) {
    throw new Error(`Invalid iCal date: ${value}`);
  }
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  if (m[4] !== undefined) {
    const h = Number(m[4]);
    const mi = Number(m[5]);
    const s = Number(m[6] ?? 0);
    const isUtc = /Z$/i.test(v) || v.toUpperCase().includes("Z");
    return isUtc
      ? new Date(Date.UTC(y, mo, d, h, mi, s))
      : new Date(y, mo, d, h, mi, s);
  }
  return new Date(Date.UTC(y, mo, d));
}

export function parseIcsEvents(icsText: string): IcsEventFields[] {
  const unfolded = unfoldIcs(icsText);
  const events: IcsEventFields[] = [];
  const parts = unfolded.split("BEGIN:VEVENT");

  for (let i = 1; i < parts.length; i++) {
    const chunk = parts[i];
    const end = chunk.indexOf("END:VEVENT");
    const body = end >= 0 ? chunk.slice(0, end) : chunk;
    const fields: IcsEventFields = {};

    for (const line of body.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith(":")) continue;
      const firstColon = trimmed.indexOf(":");
      if (firstColon < 0) continue;
      const rawKey = trimmed.slice(0, firstColon);
      const key = rawKey.split(";")[0].toUpperCase();
      // Airbnb: DTSTART;VALUE=DATE:20260711 — value is after the *last* colon
      const lastColon = trimmed.lastIndexOf(":");
      const val = unescapeIcsText(trimmed.slice(lastColon + 1));

      if (key === "UID") fields.uid = val;
      else if (key === "SUMMARY") fields.summary = val;
      else if (key === "DESCRIPTION") fields.description = val;
      else if (key === "DTSTART") fields.dtstart = val;
      else if (key === "DTEND") fields.dtend = val;
    }

    if (fields.dtstart) events.push(fields);
  }

  return events;
}
