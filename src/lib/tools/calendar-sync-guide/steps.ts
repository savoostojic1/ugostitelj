import type { PlatformId } from "./platforms";

export interface StepLink {
  label: string;
  url: string;
  kind: "open_platform" | "official_help";
}

/** One actionable screen in the interactive guide. */
export interface ActionStep {
  id: string;
  title: string;
  body: string;
  note?: string;
  why?: string;
  needHelp?: string;
  links?: StepLink[];
  confirmLabel: string;
  checklist?: string[];
  needsConfirmation?: boolean;
}

export interface PlatformFlow {
  helpUrl: string;
  helpLabel: string;
  needsConfirmation?: boolean;
  /** Short warning shown only in expandable help / limitations. */
  caveats?: string[];
  /** Step: open the product and reach calendar sync. */
  open: Omit<ActionStep, "id" | "confirmLabel" | "links"> & {
    confirmLabel?: string;
  };
  /** Step: export or import the calendar link. */
  connect: Omit<ActionStep, "id" | "confirmLabel" | "links"> & {
    confirmLabel?: string;
  };
}

/**
 * Compact export/import flows from official platform help.
 * Keep titles short and details in why / needHelp.
 */
export const EXPORT_FLOWS: Record<PlatformId, PlatformFlow> = {
  airbnb: {
    helpUrl: "https://www.airbnb.com/help/article/99",
    helpLabel: "View official Airbnb instructions",
    open: {
      title: "Open your Airbnb calendar",
      body: "Go to Airbnb and open the calendar for the property you want to connect.",
      note: "Make sure you select the correct property.",
      why: "You will copy a calendar link from this listing so another platform can read its booked and blocked dates.",
      needHelp:
        "On desktop: Calendar → select the listing → Availability → Connect calendars → Connect to another website.",
      confirmLabel: "I’ve opened my calendar",
    },
    connect: {
      title: "Copy your Airbnb calendar link",
      body: "Under Connect calendars, copy the Airbnb calendar link. Keep it private — do not paste it into Hostvia.",
      note: "An iCal link lets another calendar read your property’s booked and unavailable dates.",
      why: "This link only sends Airbnb busy dates outward. It does not import the other platform automatically.",
      needHelp:
        "If you do not see Connect calendars, open Airbnb’s official calendar sync help. Never share the link publicly.",
      confirmLabel: "I’ve copied the calendar link",
    },
  },
  booking: {
    helpUrl:
      "https://partner.booking.com/en-us/help/rates-availability/extranet-calendar/how-synchronize-your-calendars-across-channels",
    helpLabel: "View official Booking.com instructions",
    caveats: [
      "Booking.com calendar sync is only available when your property meets their eligibility rules. If Sync calendars is missing, check Booking.com’s help.",
    ],
    open: {
      title: "Open Booking.com Sync calendars",
      body: "Sign in to the Extranet, open Rates & Availability → Sync calendars, and select the correct room or unit.",
      note: "You need Rates & Availability permission.",
      why: "Booking.com creates an export link here that other calendars can import.",
      needHelp:
        "Path: Extranet → Rates & Availability → Sync calendars. If the page is missing, your property may not be eligible for calendar sync.",
      confirmLabel: "I’ve opened Sync calendars",
    },
    connect: {
      title: "Copy your Booking.com calendar link",
      body: "Choose Add calendar connection → Skip to export, name the connection, then Copy link.",
      note: "Booking.com says sync links often include “/ical/” in the URL.",
      why: "Skip to export is fine when you only need the Booking.com link for another platform.",
      needHelp:
        "Paste this link only into the other platform’s import field. Do not paste it into Hostvia or post it publicly.",
      confirmLabel: "I’ve copied the calendar link",
    },
  },
  vrbo: {
    helpUrl: "https://help.vrbo.com/articles/Export-your-reservation-calendar",
    helpLabel: "View official Vrbo instructions",
    open: {
      title: "Open your Vrbo calendar",
      body: "In the Vrbo Owner Dashboard, open the listing Calendar, then Availability → Calendar sync → Connect calendars.",
      note: "Make sure you select the correct listing.",
      why: "Vrbo can export a reservation calendar URL for other booking sites to import.",
      needHelp:
        "Path: Calendar → Settings → Availability → Calendar sync → Connect calendars → Export calendar.",
      confirmLabel: "I’ve opened calendar sync",
    },
    connect: {
      title: "Copy your Vrbo calendar link",
      body: "Open Export calendar and copy the URL. Leave “Include tentative bookings” off when exporting to another booking site.",
      note: "Keep the link private. Do not paste it into Hostvia.",
      why: "Vrbo warns that including tentative bookings is meant for a private calendar, not another booking site.",
      needHelp: "If Copy URL is missing, open Vrbo’s official export help for the Owner Dashboard or app steps.",
      confirmLabel: "I’ve copied the calendar link",
    },
  },
  google: {
    helpUrl: "https://support.google.com/calendar/answer/37083",
    helpLabel: "View official Google Calendar instructions",
    caveats: [
      "Making a Google Calendar public can expose event details or free/busy status. Prefer a dedicated rental calendar.",
    ],
    open: {
      title: "Open Google Calendar settings",
      body: "On a computer, open Google Calendar settings for the rental calendar you want to share.",
      note: "Sharing settings are edited on the web, not in the mobile apps.",
      why: "Google can provide a public iCal address only after the calendar is available to the public.",
      needHelp:
        "Settings → Settings for my calendars → choose the calendar → Access permissions for events.",
      confirmLabel: "I’ve opened calendar settings",
    },
    connect: {
      title: "Copy the public iCal address",
      body: "Enable Make available to the public, then under Integrate calendar copy Public address in iCal format.",
      note: "You can choose free/busy only if you do not want event details public.",
      why: "Booking platforms import this address to see when the Google calendar is busy.",
      needHelp:
        "Google notes the iCal address only works when the calendar is public. Do not paste the link into Hostvia.",
      confirmLabel: "I’ve copied the calendar link",
    },
  },
  other: {
    helpUrl: "",
    helpLabel: "",
    needsConfirmation: true,
    caveats: [
      "Menu names differ by product. Confirm the exact export steps in that calendar’s official help.",
    ],
    open: {
      title: "Open your other calendar’s settings",
      body: "Open the calendar product and find Export calendar, Calendar sync, or an iCal / .ics link.",
      note: "Confirm the menus in that product’s official help.",
      why: "An iCal link lets another calendar read booked and unavailable dates.",
      needHelp:
        "Look for words like Export, Subscribe, Sync, iCal, or .ics. Copy the calendar URL, not the normal website page.",
      needsConfirmation: true,
      confirmLabel: "I’ve found the export settings",
    },
    connect: {
      title: "Copy the iCal link",
      body: "Copy the calendar URL. Prefer https links. If it starts with webcal://, many platforms ask you to change it to https://.",
      note: "Keep the link private. Do not paste it into Hostvia.",
      why: "Website page URLs will not sync — you need the calendar feed URL.",
      needHelp: "Valid feeds often include “ical”, “ics”, or “.ics” in the URL.",
      needsConfirmation: true,
      confirmLabel: "I’ve copied the calendar link",
    },
  },
};

export const IMPORT_FLOWS: Record<PlatformId, PlatformFlow> = {
  airbnb: {
    helpUrl: "https://www.airbnb.com/help/article/99",
    helpLabel: "View official Airbnb instructions",
    open: {
      title: "Open Airbnb Connect calendars",
      body: "Open the destination listing calendar, then Availability → Connect calendars → Connect to another website.",
      note: "Select the same property you want to block dates on.",
      why: "Airbnb imports another calendar when you paste an iCal URL that ends in .ics.",
      needHelp: "Use Airbnb’s official calendar sync help if the Connect calendars section has moved.",
      confirmLabel: "I’ve opened Connect calendars",
    },
    connect: {
      title: "Import the calendar into Airbnb",
      body: "Paste the copied link into the calendar address field, give it a clear name, and click Add calendar.",
      note: "Airbnb says imported URLs should end in .ics.",
      why: "This only imports dates into Airbnb. It does not export Airbnb dates back the other way.",
      needHelp: "You can refresh an imported calendar later from the same Connect calendars area.",
      confirmLabel: "I’ve imported the calendar",
    },
  },
  booking: {
    helpUrl:
      "https://partner.booking.com/en-us/help/rates-availability/extranet-calendar/how-synchronize-your-calendars-across-channels",
    helpLabel: "View official Booking.com instructions",
    caveats: [
      "If Sync calendars is unavailable, your property may not meet Booking.com’s eligibility rules.",
    ],
    open: {
      title: "Open Booking.com Sync calendars",
      body: "In the Extranet, go to Rates & Availability → Sync calendars and select the correct room or unit.",
      note: "You need Rates & Availability permission.",
      why: "Booking.com imports booked or closed dates from an external iCal link here.",
      needHelp: "Path: Extranet → Rates & Availability → Sync calendars → Add calendar connection.",
      confirmLabel: "I’ve opened Sync calendars",
    },
    connect: {
      title: "Import the calendar into Booking.com",
      body: "Add a calendar connection, paste the link you copied, name it, then finish the setup.",
      note: "Imported OTA links often include “.ics”.",
      why: "This connection is one-way into Booking.com unless you also export Booking.com separately.",
      needHelp: "Use Import now later if dates have not appeared yet. Sync is not real time.",
      confirmLabel: "I’ve imported the calendar",
    },
  },
  vrbo: {
    helpUrl: "https://help.vrbo.com/articles/How-do-I-import-my-iCal-or-Google-calendar",
    helpLabel: "View official Vrbo instructions",
    caveats: [
      "Import works from the Vrbo Owner Dashboard or Owner app, not when a third-party PMS manages the property.",
      "Vrbo allows up to five imported calendars per property.",
    ],
    open: {
      title: "Open Vrbo imported calendars",
      body: "Open the listing Calendar → Availability → Calendar sync → Connect calendars → Manage imported calendars → Import a calendar.",
      note: "Select the correct listing first.",
      why: "Vrbo imports iCal links so other platforms’ busy dates can block Vrbo availability.",
      needHelp: "If import is missing, confirm you manage the property in Vrbo (not only through another PMS).",
      confirmLabel: "I’ve opened import settings",
    },
    connect: {
      title: "Import the calendar into Vrbo",
      body: "Paste the link into Calendar URL (use https://, not webcal://), name it, then Import.",
      note: "Vrbo says imported events may take up to 20 minutes to appear.",
      why: "Vrbo says the correct link includes “icalendar” — copy the iCal feed, not the website page.",
      needHelp: "If import fails, re-copy the source link and check Vrbo’s official import troubleshooting.",
      confirmLabel: "I’ve imported the calendar",
    },
  },
  google: {
    helpUrl: "https://support.google.com/calendar/answer/37100",
    helpLabel: "View official Google Calendar instructions",
    caveats: [
      "Adding a calendar From URL is done on a computer browser, not in the Google Calendar mobile apps.",
    ],
    open: {
      title: "Open Google Calendar on a computer",
      body: "Open Google Calendar in a computer browser. Next to Other calendars, choose Add other calendars → From URL.",
      note: "Importing a downloaded .ics file is a one-time copy and will not keep updating.",
      why: "From URL keeps the calendar connected to the source feed.",
      needHelp: "You must use a computer web browser to add a From URL calendar.",
      confirmLabel: "I’ve opened From URL",
    },
    connect: {
      title: "Import the calendar into Google",
      body: "Paste the copied calendar URL and click Add calendar. It should appear under Other calendars.",
      note: "Updates are not instant.",
      why: "Google does not publish a fixed refresh interval for From URL calendars.",
      needHelp: "If Google cannot fetch the URL, re-copy the source iCal link and confirm it is publicly reachable.",
      confirmLabel: "I’ve imported the calendar",
    },
  },
  other: {
    helpUrl: "",
    helpLabel: "",
    needsConfirmation: true,
    caveats: [
      "Confirm import steps in that calendar product’s official help. Not every product accepts the same URL format.",
    ],
    open: {
      title: "Open the destination calendar’s import settings",
      body: "Look for Import calendar, Subscribe, Add calendar from URL, or Calendar sync.",
      note: "Confirm the exact menus in that product’s help center.",
      why: "The destination calendar needs the iCal link so it can read busy dates from the source.",
      needHelp: "If you only see a file upload, that may be a one-time import. Prefer a Subscribe / From URL option when available.",
      needsConfirmation: true,
      confirmLabel: "I’ve opened import settings",
    },
    connect: {
      title: "Import the calendar link",
      body: "Paste the iCal URL you copied and save. Prefer https links; try https:// if webcal:// is rejected.",
      note: "Do not paste the link into Hostvia.",
      why: "After importing, wait for that product’s normal refresh cycle before assuming it failed.",
      needHelp: "Check the product’s official help if the URL is rejected.",
      needsConfirmation: true,
      confirmLabel: "I’ve imported the calendar",
    },
  },
};
