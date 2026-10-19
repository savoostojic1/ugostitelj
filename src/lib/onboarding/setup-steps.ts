export type SetupStepId =
  | "property"
  | "calendar"
  | "booking-site"
  | "publish-listing";

export type SetupStep = {
  id: SetupStepId;
  title: string;
  description: string;
  tasks: string[];
  actionLabel: string;
  href: string;
  /** Calendar and publishing need a place to exist first. */
  requiresProperty: boolean;
};

export type SetupProgress = {
  hasProperty: boolean;
  hasCalendarSync: boolean;
  hasBookingSite: boolean;
  hasPublishedListing: boolean;
  firstPropertyId: string | null;
  completedCount: number;
  totalCount: number;
  isComplete: boolean;
  steps: (SetupStep & { done: boolean })[];
};

export function buildSetupSteps(
  firstPropertyId: string | null
): SetupStep[] {
  const syncHref = firstPropertyId
    ? `/dashboard/properties/${firstPropertyId}/sync`
    : "/dashboard/properties/new";
  const publishHref = firstPropertyId
    ? `/dashboard/properties/${firstPropertyId}#publish-listing`
    : "/dashboard/properties/new";

  return [
    {
      id: "property",
      title: "Add your first place",
      description: "The apartment, room, or house that guests stay in.",
      tasks: [
        "Open the form and type a name you will recognize",
        "Save it — photos and price can wait",
      ],
      actionLabel: "Add a place",
      href: "/dashboard/properties/new",
      requiresProperty: false,
    },
    {
      id: "calendar",
      title: "Connect Airbnb or Booking",
      description: "Reservations from those sites then show up here.",
      tasks: [
        "In Airbnb or Booking.com, copy the calendar export (iCal) link",
        "On Booking, set Decide what to export to Booked dates only, then save",
        "Paste that link under Import calendars and press Sync all",
      ],
      actionLabel: "Connect calendar",
      href: syncHref,
      requiresProperty: true,
    },
    {
      id: "booking-site",
      title: "Create your booking website",
      description: "Guests use this page to see your places and send a request.",
      tasks: [
        "Choose the web address for your site",
        "Add your name, a photo, and a phone or email",
        "Turn on Publish booking site, then save",
      ],
      actionLabel: "Set up website",
      href: "/dashboard/public-site",
      requiresProperty: false,
    },
    {
      id: "publish-listing",
      title: "Show this place on your website",
      description: "Until you publish it, guests cannot see or request this unit.",
      tasks: [
        "Open the place settings",
        "Turn publishing on",
        "Save",
      ],
      actionLabel: "Publish this place",
      href: publishHref,
      requiresProperty: true,
    },
  ];
}

export function computeSetupProgress(input: {
  propertyCount: number;
  feedCount: number;
  reservationCount: number;
  isPublished: boolean;
  hasPublicListing: boolean;
  hasSiteBasics: boolean;
  firstPropertyId: string | null;
}): SetupProgress {
  const hasProperty = input.propertyCount > 0;
  const hasCalendarSync =
    input.feedCount > 0 || input.reservationCount > 0;
  const hasBookingSite = input.isPublished && input.hasSiteBasics;
  const hasPublishedListing = input.hasPublicListing;

  const flags: Record<SetupStepId, boolean> = {
    property: hasProperty,
    calendar: hasCalendarSync,
    "booking-site": hasBookingSite,
    "publish-listing": hasPublishedListing,
  };

  const steps = buildSetupSteps(input.firstPropertyId).map((step) => ({
    ...step,
    done: flags[step.id],
  }));

  const completedCount = steps.filter((step) => step.done).length;
  const totalCount = steps.length;

  return {
    hasProperty,
    hasCalendarSync,
    hasBookingSite,
    hasPublishedListing,
    firstPropertyId: input.firstPropertyId,
    completedCount,
    totalCount,
    isComplete: completedCount === totalCount,
    steps,
  };
}
