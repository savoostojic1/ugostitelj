export const GUIDE_PATH = "/free-tools/vacation-rental-calendar-sync-guide";

export const GUIDE_TITLE =
  "How to Sync Airbnb, Booking.com and Vacation Rental Calendars";

export const GUIDE_SEO_TITLE =
  "Airbnb & Booking.com Calendar Sync Guide | Hostvia";

export const GUIDE_DESCRIPTION =
  "Learn how to sync Airbnb, Booking.com and Vrbo calendars using iCal. Follow simple step-by-step instructions to manage vacation rental availability.";

export const GUIDE_INTRO =
  "Use the free guide below to connect two booking platforms with iCal — without creating an account.";

export const SEO_SECTIONS = [
  {
    id: "what-is-ical",
    title: "What Is iCal Calendar Sync?",
    paragraphs: [
      "An iCal link lets another calendar read your property’s booked and unavailable dates. Airbnb, Booking.com, Vrbo and many other tools can export or import these links.",
      "It is a feed of busy dates, not a live booking API. That is why hosts still need to check calendars and allow for refresh delays.",
    ],
  },
  {
    id: "airbnb-booking",
    title: "How to Sync Airbnb and Booking.com Calendars",
    paragraphs: [
      "Treat Airbnb ↔ Booking.com as two separate one-way connections.",
      "Airbnb → Booking.com: copy the Airbnb calendar link from Calendar → Availability → Connect calendars, then add it under Booking.com Extranet → Rates & Availability → Sync calendars.",
      "Booking.com → Airbnb: copy the Booking.com export link from Sync calendars, then paste that .ics link into Airbnb’s Connect calendars import field. One URL never creates both directions.",
    ],
  },
  {
    id: "airbnb-vrbo",
    title: "How to Sync Airbnb and Vrbo Calendars",
    paragraphs: [
      "Export Airbnb from Connect calendars, then import that link in Vrbo under Calendar → Availability → Calendar sync → Manage imported calendars.",
      "For the reverse direction, export the Vrbo reservation calendar and import it into Airbnb. Leave tentative bookings off when exporting Vrbo to another booking site.",
    ],
  },
  {
    id: "why-not-instant",
    title: "Why Calendar Updates Can Be Delayed",
    paragraphs: [
      "Each platform refreshes imported calendars on its own schedule. Airbnb documents about every 3 hours, Booking.com about every two hours, Vrbo may take up to 20 minutes for imports to appear, and Google Calendar From URL updates are not instant.",
      "A guest can book on one site before another site has imported that night. Sync lowers double-booking risk; it does not eliminate it.",
    ],
  },
  {
    id: "common-problems",
    title: "Common Calendar Sync Problems",
    paragraphs: [
      "Wrong URL: copy the iCal / .ics feed, not the normal listing page. Airbnb imports should end in .ics; Booking.com sync links often include “/ical/”; Vrbo links include “icalendar”.",
      "Dates missing: confirm the correct property, wait for a refresh, and use Refresh / Import now when available. If only one direction updates, set up the reverse connection separately.",
      "Never share private calendar URLs publicly or send them to Hostvia.",
    ],
  },
];

/** Shown on the page and used for FAQPage structured data, so both stay identical. */
export const GUIDE_FAQ = [
  {
    question: "How do I sync Airbnb and Booking.com calendars?",
    answer:
      "Export Airbnb’s calendar link from Calendar → Availability → Connect calendars and import it into Booking.com under Rates & Availability → Sync calendars. For the other direction, export Booking.com and import into Airbnb. Each URL creates only one direction.",
  },
  {
    question: "Does Airbnb calendar sync work both ways automatically?",
    answer:
      "No. Airbnb can export and import calendars, but those are separate actions. Connecting one link does not create a reverse connection.",
  },
  {
    question: "How often do vacation rental calendars refresh?",
    answer:
      "It depends on the platform. Airbnb documents about every 3 hours, Booking.com about every two hours, Vrbo may show imports within about 20 minutes, and Google Calendar From URL updates are not instant. There is no single refresh interval for every connection.",
  },
  {
    question: "Can calendar sync completely prevent double bookings?",
    answer:
      "No. Syncing reduces the chance of overlapping stays, but bookings can still happen in the delay between platforms. Verify important dates manually when timing is tight.",
  },
  {
    question: "Should I paste my iCal URL into Hostvia’s free guide?",
    answer:
      "No. This guide only shows where to copy and paste links between booking platforms. Private calendar URLs can expose availability information.",
  },
  {
    question: "What is the difference between one-way and two-way calendar sync?",
    answer:
      "One-way sync exports from platform A and imports into platform B. Two-way sync also exports from B into A. Most listing sites do not turn a single imported URL into full two-way synchronization.",
  },
];

export const OFFICIAL_SOURCES = [
  {
    label: "Airbnb: Sync your calendar",
    url: "https://www.airbnb.com/help/article/99",
  },
  {
    label: "Booking.com: Synchronize your calendars across channels",
    url: "https://partner.booking.com/en-us/help/rates-availability/extranet-calendar/how-synchronize-your-calendars-across-channels",
  },
  {
    label: "Vrbo: Import a calendar",
    url: "https://help.vrbo.com/articles/How-do-I-import-my-iCal-or-Google-calendar",
  },
  {
    label: "Vrbo: Export your reservation calendar",
    url: "https://help.vrbo.com/articles/Export-your-reservation-calendar",
  },
  {
    label: "Google Calendar: Subscribe / From URL",
    url: "https://support.google.com/calendar/answer/37100",
  },
  {
    label: "Google Calendar: Public calendars and iCal address",
    url: "https://support.google.com/calendar/answer/37083",
  },
] as const;
