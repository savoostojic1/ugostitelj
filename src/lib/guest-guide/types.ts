export const GUEST_GUIDE_THEMES = [
  "signature-beige",
  "mediterranean-escape",
  "midnight-luxury",
] as const;

export type GuestGuideTheme = (typeof GUEST_GUIDE_THEMES)[number];

export const GUEST_GUIDE_SECTION_IDS = [
  "welcome",
  "checkin",
  "wifi",
  "property",
  "rules",
  "checkout",
  "local",
  "emergency",
  "contact",
] as const;

export type GuestGuideSectionId = (typeof GUEST_GUIDE_SECTION_IDS)[number];

export type GuestGuideStatus = "draft" | "published" | "unpublished";

export interface GuidePhoto {
  id: string;
  url: string;
  alt?: string;
}

export interface WelcomeContent {
  propertyName: string;
  location: string;
  subtitle: string;
  message: string;
  hostName: string;
  hostPhotoUrl: string;
  coverPhotoUrl: string;
  contactNote: string;
}

export interface CheckInContent {
  checkInTime: string;
  address: string;
  arrivalInstructions: string;
  parkingInstructions: string;
  keyCollection: string;
  entryInstructions: string;
  mapLink: string;
  photos: GuidePhoto[];
}

export interface CheckOutContent {
  checkOutTime: string;
  departureInstructions: string;
  keyReturn: string;
  cleaningExpectations: string;
  wasteDisposal: string;
  otherInfo: string;
}

export interface WifiContent {
  networkName: string;
  password: string;
  instructions: string;
}

export interface PropertyItem {
  id: string;
  title: string;
  description: string;
  icon?: string;
  imageUrl?: string;
}

export interface RuleItem {
  id: string;
  title: string;
  description: string;
}

export type LocalCategory =
  | "restaurants"
  | "cafes"
  | "beaches"
  | "activities"
  | "attractions"
  | "shopping"
  | "supermarkets"
  | "pharmacies"
  | "transport"
  | "other";

export interface LocalRecommendation {
  id: string;
  category: LocalCategory;
  name: string;
  description: string;
  photoUrl: string;
  address: string;
  mapsLink: string;
  website: string;
}

export interface EmergencyContact {
  id: string;
  label: string;
  value: string;
}

export interface EmergencyContent {
  numbers: EmergencyContact[];
  nearestHospital: string;
  nearestPharmacy: string;
  localContacts: string;
  instructions: string;
}

export interface ContactContent {
  hostName: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
}

export interface GuestGuideContent {
  welcome: WelcomeContent;
  checkin: CheckInContent;
  checkout: CheckOutContent;
  wifi: WifiContent;
  property: PropertyItem[];
  rules: RuleItem[];
  local: LocalRecommendation[];
  emergency: EmergencyContent;
  contact: ContactContent;
}

export type SectionVisibility = Record<GuestGuideSectionId, boolean>;

export interface GuestGuideDocument {
  theme: GuestGuideTheme;
  content: GuestGuideContent;
  sectionOrder: GuestGuideSectionId[];
  sectionVisibility: SectionVisibility;
}

export interface GuestGuideRow {
  id: string;
  user_id: string;
  property_id: string | null;
  draft_id: string | null;
  slug: string;
  title: string;
  theme: GuestGuideTheme;
  content: GuestGuideContent;
  section_order: GuestGuideSectionId[];
  section_visibility: SectionVisibility;
  cover_image_url: string | null;
  status: GuestGuideStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export function isGuestGuideTheme(value: string): value is GuestGuideTheme {
  return (GUEST_GUIDE_THEMES as readonly string[]).includes(value);
}

export function isGuestGuideSectionId(
  value: string
): value is GuestGuideSectionId {
  return (GUEST_GUIDE_SECTION_IDS as readonly string[]).includes(value);
}
