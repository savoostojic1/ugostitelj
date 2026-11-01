export const FREE_TOOLS_PATH = "/free-tools";

export interface FreeTool {
  slug: string;
  href: string;
  title: string;
  summary: string;
  ctaLabel: string;
  /** Short list of what the tool covers. Keep to things the tool actually does. */
  highlights: string[];
}

/** Published tools, in display order. Add a tool here only once its page works. */
export const FREE_TOOLS: FreeTool[] = [
  {
    slug: "vacation-rental-income-calculator",
    href: `${FREE_TOOLS_PATH}/vacation-rental-income-calculator`,
    title: "Vacation Rental Income Calculator",
    summary:
      "Estimate revenue, expenses, platform fees and operating income for one rental or several similar ones.",
    ctaLabel: "Open the calculator",
    highlights: [
      "Simple averages or a 12-month seasonal table",
      "Per-booking, per-night, monthly, annual and % costs",
      "Break-even occupancy and profit margin",
    ],
  },
  {
    slug: "vacation-rental-calendar-sync-guide",
    href: `${FREE_TOOLS_PATH}/vacation-rental-calendar-sync-guide`,
    title: "Vacation Rental Calendar Sync Guide",
    summary:
      "Step-by-step Airbnb, Booking.com, Vrbo and Google Calendar iCal sync instructions for connecting two platforms.",
    ctaLabel: "Open the guide",
    highlights: [
      "Pick any supported calendar pair",
      "One-way and reverse-connection notes",
      "Official help links and troubleshooting",
    ],
  },
  {
    slug: "guest-guide-generator",
    href: `${FREE_TOOLS_PATH}/guest-guide-generator`,
    title: "Free Guest Guide Generator",
    summary:
      "Create a beautiful digital welcome book for your vacation rental. Share check-in, Wi-Fi, house rules and local tips with one link.",
    ctaLabel: "Create your free guide",
    highlights: [
      "Start without an account",
      "Premium templates included",
      "Shareable link and QR code",
    ],
  },
];
