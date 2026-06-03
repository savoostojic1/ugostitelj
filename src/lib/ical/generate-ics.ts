/** Generisanje .ics sadržaja za export ka Airbnb/Booking. */

export interface IcsExportEvent {
  uid: string;
  summary: string;
  description?: string;
  checkIn: string;
  checkOut: string;
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function toIcsDate(date: string): string {
  return date.split("T")[0].replace(/-/g, "");
}

function formatUtcStamp(date = new Date()): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function formatEvent(event: IcsExportEvent): string[] {
  const lines = [
    "BEGIN:VEVENT",
    `UID:${escapeIcsText(event.uid)}@ugostitelj.me`,
    `DTSTAMP:${formatUtcStamp()}`,
    `SUMMARY:${escapeIcsText(event.summary)}`,
    `DTSTART;VALUE=DATE:${toIcsDate(event.checkIn)}`,
    `DTEND;VALUE=DATE:${toIcsDate(event.checkOut)}`,
    "STATUS:CONFIRMED",
    "TRANSP:OPAQUE",
  ];

  if (event.description) {
    lines.push(`DESCRIPTION:${escapeIcsText(event.description)}`);
  }

  lines.push("END:VEVENT");
  return lines;
}

export function generateIcsCalendar(options: {
  calendarName: string;
  events?: IcsExportEvent[];
}): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Ugostitelj//Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeIcsText(options.calendarName)}`,
    `X-WR-TIMEZONE:UTC`,
  ];

  for (const event of options.events ?? []) {
    lines.push(...formatEvent(event));
  }

  lines.push("END:VCALENDAR");
  return `${lines.join("\r\n")}\r\n`;
}

export function generateEmptyIcsCalendar(calendarName: string): string {
  return generateIcsCalendar({ calendarName, events: [] });
}
