export type SetupStepId =
  | "property"
  | "calendar"
  | "booking-site"
  | "publish-listing";

export type SetupStep = {
  id: SetupStepId;
  title: string;
  description: string;
  href: string;
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
      title: "Add your first accommodation",
      description:
        "Create a listing — apartment, studio, room, or whole house.",
      href: "/dashboard/properties/new",
    },
    {
      id: "calendar",
      title: "Connect your calendar",
      description:
        "Paste the iCal link from Airbnb or Booking.com so dates stay in sync.",
      href: syncHref,
    },
    {
      id: "booking-site",
      title: "Set up your booking site",
      description:
        "Choose your site address, add photos and contact details.",
      href: "/dashboard/public-site",
    },
    {
      id: "publish-listing",
      title: "Publish on your booking site",
      description:
        "Open Settings for this unit and turn on publishing so guests can book it.",
      href: publishHref,
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
  const hasBookingSite = input.isPublished || input.hasSiteBasics;
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

export const SETUP_DISMISS_STORAGE_KEY = "hostvia-getting-started-dismissed";
