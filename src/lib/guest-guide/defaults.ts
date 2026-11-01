import {
  GUEST_GUIDE_SECTION_IDS,
  type GuestGuideContent,
  type GuestGuideDocument,
  type GuestGuideSectionId,
  type GuestGuideTheme,
  type SectionVisibility,
} from "@/lib/guest-guide/types";

export function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function defaultSectionVisibility(): SectionVisibility {
  return {
    welcome: true,
    checkin: true,
    wifi: true,
    property: true,
    rules: true,
    checkout: true,
    local: true,
    emergency: true,
    contact: true,
  };
}

export function emptyGuideContent(): GuestGuideContent {
  return {
    welcome: {
      propertyName: "",
      location: "",
      subtitle: "",
      message: "",
      hostName: "",
      hostPhotoUrl: "",
      coverPhotoUrl: "",
      contactNote: "",
    },
    checkin: {
      checkInTime: "",
      address: "",
      arrivalInstructions: "",
      parkingInstructions: "",
      keyCollection: "",
      entryInstructions: "",
      mapLink: "",
      photos: [],
    },
    checkout: {
      checkOutTime: "",
      departureInstructions: "",
      keyReturn: "",
      cleaningExpectations: "",
      wasteDisposal: "",
      otherInfo: "",
    },
    wifi: {
      networkName: "",
      password: "",
      instructions: "",
    },
    property: [],
    rules: [],
    local: [],
    emergency: {
      numbers: [],
      nearestHospital: "",
      nearestPharmacy: "",
      localContacts: "",
      instructions: "",
    },
    contact: {
      hostName: "",
      phone: "",
      whatsapp: "",
      email: "",
      website: "",
    },
  };
}

export function createEmptyGuideDocument(
  theme: GuestGuideTheme = "signature-beige"
): GuestGuideDocument {
  return {
    theme,
    content: emptyGuideContent(),
    sectionOrder: [...GUEST_GUIDE_SECTION_IDS],
    sectionVisibility: defaultSectionVisibility(),
  };
}

export const SECTION_LABELS: Record<GuestGuideSectionId, string> = {
  welcome: "Welcome",
  checkin: "Check-in",
  wifi: "Wi-Fi",
  property: "Your Stay",
  rules: "House Rules",
  checkout: "Check-out",
  local: "Local Recommendations",
  emergency: "Emergency",
  contact: "Contact",
};

export const SECTION_HINTS: Record<GuestGuideSectionId, string> = {
  welcome: "Introduce your property and welcome guests personally.",
  checkin: "Arrival time, address, parking and how to enter.",
  wifi: "Network name and password guests will need.",
  property: "How to use AC, kitchen, pool and other facilities.",
  rules: "Smoking, pets, quiet hours and other house policies.",
  checkout: "Departure time, keys, cleaning and waste tips.",
  local: "Restaurants, beaches, shops and things to do nearby.",
  emergency: "Important numbers and nearest medical help.",
  contact: "How guests can reach you during their stay.",
};

export const LOCAL_CATEGORY_LABELS = {
  restaurants: "Restaurants",
  cafes: "Cafés",
  beaches: "Beaches",
  activities: "Activities",
  attractions: "Attractions",
  shopping: "Shopping",
  supermarkets: "Supermarkets",
  pharmacies: "Pharmacies",
  transport: "Transport",
  other: "Other",
} as const;

export const PROPERTY_ITEM_PRESETS = [
  { title: "Air conditioning", icon: "snowflake" },
  { title: "Heating", icon: "flame" },
  { title: "Kitchen", icon: "utensils" },
  { title: "Washing machine", icon: "washing-machine" },
  { title: "Dishwasher", icon: "droplets" },
  { title: "Television", icon: "tv" },
  { title: "Swimming pool", icon: "waves" },
  { title: "Terrace", icon: "sun" },
  { title: "Garden", icon: "flower-2" },
  { title: "Waste disposal", icon: "trash-2" },
] as const;

export const RULE_PRESETS = [
  { title: "Smoking", description: "" },
  { title: "Pets", description: "" },
  { title: "Parties & events", description: "" },
  { title: "Quiet hours", description: "" },
  { title: "Maximum occupancy", description: "" },
  { title: "Pool rules", description: "" },
  { title: "Parking", description: "" },
  { title: "Waste disposal", description: "" },
] as const;
