export const PLATFORM_IDS = [
  "airbnb",
  "booking",
  "vrbo",
  "google",
  "other",
] as const;

export type PlatformId = (typeof PLATFORM_IDS)[number];

export interface PlatformDefinition {
  id: PlatformId;
  label: string;
  shortLabel: string;
  /** Shown on the selector. Keep short. */
  selectorHint: string;
  canExport: boolean;
  canImport: boolean;
  /** Where to send the user to sign in / open the product. */
  openUrl: string | null;
  openLabel: string | null;
  helpUrls: {
    primary: string;
    export?: string;
    import?: string;
  };
  syncNote: string;
}

export const PLATFORMS: Record<PlatformId, PlatformDefinition> = {
  airbnb: {
    id: "airbnb",
    label: "Airbnb",
    shortLabel: "Airbnb",
    selectorHint: "Listing calendar",
    canExport: true,
    canImport: true,
    openUrl: "https://www.airbnb.com/hosting",
    openLabel: "Open Airbnb",
    helpUrls: {
      primary: "https://www.airbnb.com/help/article/99",
      export: "https://www.airbnb.com/help/article/99",
      import: "https://www.airbnb.com/help/article/99",
    },
    syncNote:
      "Airbnb updates connected calendars about every 3 hours, and lets you refresh an imported calendar sooner.",
  },
  booking: {
    id: "booking",
    label: "Booking.com",
    shortLabel: "Booking.com",
    selectorHint: "Extranet calendar",
    canExport: true,
    canImport: true,
    openUrl: "https://admin.booking.com/",
    openLabel: "Open Booking.com",
    helpUrls: {
      primary:
        "https://partner.booking.com/en-us/help/rates-availability/extranet-calendar/how-synchronize-your-calendars-across-channels",
      export:
        "https://partner.booking.com/en-us/help/rates-availability/extranet-calendar/how-synchronize-your-calendars-across-channels",
      import:
        "https://partner.booking.com/en-us/help/rates-availability/extranet-calendar/how-synchronize-your-calendars-across-channels",
    },
    syncNote:
      "Booking.com says sync is not real time and imports connected calendars about every two hours.",
  },
  vrbo: {
    id: "vrbo",
    label: "Vrbo",
    shortLabel: "Vrbo",
    selectorHint: "Owner calendar",
    canExport: true,
    canImport: true,
    openUrl: "https://www.vrbo.com/entry/login",
    openLabel: "Open Vrbo",
    helpUrls: {
      primary: "https://help.vrbo.com/articles/How-do-I-import-my-iCal-or-Google-calendar",
      export: "https://help.vrbo.com/articles/Export-your-reservation-calendar",
      import: "https://help.vrbo.com/articles/How-do-I-import-my-iCal-or-Google-calendar",
    },
    syncNote:
      "Vrbo says imported events may take up to 20 minutes to appear; the Owner app notes about 30-minute sync.",
  },
  google: {
    id: "google",
    label: "Google Calendar",
    shortLabel: "Google",
    selectorHint: "Personal calendar",
    canExport: true,
    canImport: true,
    openUrl: "https://calendar.google.com/",
    openLabel: "Open Google Calendar",
    helpUrls: {
      primary: "https://support.google.com/calendar/answer/37100",
      export: "https://support.google.com/calendar/answer/37083",
      import: "https://support.google.com/calendar/answer/37100",
    },
    syncNote:
      "Google Calendar does not publish a fixed refresh interval for From URL calendars. Updates are not instant.",
  },
  other: {
    id: "other",
    label: "Other iCal calendar",
    shortLabel: "Other",
    selectorHint: "Any .ics calendar",
    canExport: true,
    canImport: true,
    openUrl: null,
    openLabel: null,
    helpUrls: {
      primary: "",
    },
    syncNote:
      "Refresh timing depends on that calendar product. Check its official help for details.",
  },
};

export const PLATFORM_OPTIONS = PLATFORM_IDS.map((id) => PLATFORMS[id]);

export function platformLabel(id: PlatformId): string {
  return PLATFORMS[id].label;
}
