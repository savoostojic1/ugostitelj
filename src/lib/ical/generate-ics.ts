/** Generisanje .ics sadržaja za export ka Airbnb/Booking. */

export interface IcsExportEvent {
  uid: string;
  summary: string;
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
  return date.replace(/-/g, "").split("T")[0];
}

function formatEvent(event: IcsExportEvent): string[] {
  return [
    "BEGIN:VEVENT",
    `UID:${escapeIcsText(event.uid)}@ugostitelj.me`,
    `SUMMARY:${escapeIcsText(event.summary)}`,
    `DTSTART;VALUE=DATE:${toIcsDate(event.checkIn)}`,
    `DTEND;VALUE=DATE:${toIcsDate(event.checkOut)}`,
    "STATUS:CONFIRMED",
    "TRANSP:OPAQUE",
    "END:VEVENT",
  ];
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
