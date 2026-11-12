export const WEBSITE_THEMES = [
  "luxe",
  "coastal",
  "nature",
  "minimal",
  "escape",
] as const;

export type WebsiteThemeId = (typeof WEBSITE_THEMES)[number];

export const PAGE_TYPES = [
  "home",
  "about",
  "accommodation",
  "accommodation_unit",
  "amenities",
  "gallery",
  "location",
  "experiences",
  "reviews",
  "faq",
  "contact",
  "custom",
] as const;

export type WebsitePageType = (typeof PAGE_TYPES)[number];

export const SECTION_TYPES = [
  "hero",
  "welcome",
  "featured_accommodation",
  "accommodation_grid",
  "gallery",
  "amenities",
  "image_text",
  "full_image",
  "video",
  "location",
  "experiences",
  "reviews",
  "faq",
  "cta",
  "contact",
  "booking",
  "newsletter",
  "text",
] as const;

export type WebsiteSectionType = (typeof SECTION_TYPES)[number];

export const ACCOMMODATION_KINDS = [
  "apartment",
  "room",
  "bungalow",
  "villa",
  "holiday_home",
  "cabin",
  "other",
] as const;

export type AccommodationKind = (typeof ACCOMMODATION_KINDS)[number];

export const WEBSITE_LANGUAGES = [
  "en",
  "es",
  "fr",
  "de",
  "it",
  "pt",
  "hr",
  "sr",
  "bs",
  "sl",
  "el",
  "nl",
  "pl",
  "cs",
  "hu",
  "tr",
  "sv",
  "no",
  "da",
  "fi",
  "ro",
  "ru",
  "uk",
  "ar",
  "he",
  "ja",
  "zh",
] as const;

export type WebsiteLanguage = (typeof WEBSITE_LANGUAGES)[number];

export interface WebsiteImage {
  url: string;
  alt: string;
}

export interface WebsiteFaqItem {
  id: string;
  title: string;
  body: string;
}

export interface SectionSettings {
  eyebrow: string;
  title: string;
  body: string;
  imageUrl: string;
  imageAlt: string;
  imagePosition: "left" | "right";
  videoUrl: string;
  align: "left" | "center";
  items: WebsiteFaqItem[];
  accommodationId: string;
  ctaLabel: string;
  ctaHref: string;
  animation: "inherit" | "none" | "rise" | "fade";
  spacing: "compact" | "normal" | "spacious";
}

export interface WebsiteSection {
  id: string;
  type: WebsiteSectionType;
  visible: boolean;
  settings: SectionSettings;
}

export interface PageSeo {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  /** Applied on published pages only for Pro accounts. */
  noindex: boolean;
}

export interface WebsitePage {
  id: string;
  type: WebsitePageType;
  title: string;
  slug: string;
  enabled: boolean;
  showInNav: boolean;
  isHome: boolean;
  accommodationId: string | null;
  seo: PageSeo;
  sections: WebsiteSection[];
}

export interface WebsiteAccommodation {
  id: string;
  propertyId: string | null;
  kind: AccommodationKind;
  name: string;
  summary: string;
  description: string;
  location: string;
  capacity: number | null;
  pricePerNight: number | null;
  currencyCode: string;
  amenities: string[];
  photos: WebsiteImage[];
  usePropertyName: boolean;
  usePropertyDescription: boolean;
  usePropertyPhotos: boolean;
  usePropertyAmenities: boolean;
  usePropertyLocation: boolean;
}

export interface WebsiteProfile {
  name: string;
  propertyType: string;
  location: string;
  shortDescription: string;
  language: WebsiteLanguage;
  contactEmail: string;
  contactPhone: string;
  logoUrl: string;
  mapEmbedUrl: string;
}

export interface WebsiteDesign {
  paletteId: string;
  animation: "elegant" | "subtle" | "none";
  headingScale: "standard" | "large";
  hideBranding: boolean;
  /** True once the host arranges homepage sections by hand; theme switches then keep their order. */
  customOrder: boolean;
  /** Shows the dates-and-guests booking bar in the hero. */
  heroBooking: boolean;
}

export interface WebsiteDocument {
  version: 1;
  theme: WebsiteThemeId;
  profile: WebsiteProfile;
  design: WebsiteDesign;
  accommodations: WebsiteAccommodation[];
  gallery: WebsiteImage[];
  pages: WebsitePage[];
  wizardStep: number;
  /** How the host chose to build in the guided flow: written by AI, or step by step. */
  wizardPath: WizardPath;
}

export type WizardPath = "ai" | "manual" | null;

export type PublicSiteMode = "booking" | "website";

export type WebsiteStatus = "draft" | "published" | "unpublished";

export interface LivePropertySnapshot {
  id: string;
  slug: string | null;
  name: string;
  shortDescription: string | null;
  description: string | null;
  address: string | null;
  imageUrl: string | null;
  galleryUrls: string[];
  capacity: number | null;
  amenities: string[];
  startingPrice: number | null;
  currencyCode: string;
  /** False when the host keeps the property off their booking site; missing means public. */
  isPublic?: boolean;
}

export interface PublicStay {
  id: string;
  propertyId: string | null;
  propertySlug: string | null;
  kind: AccommodationKind;
  kindLabel: string;
  name: string;
  summary: string;
  description: string;
  location: string;
  capacity: number | null;
  pricePerNight: number | null;
  currencyCode: string;
  amenities: string[];
  photos: WebsiteImage[];
  href: string;
}

export interface PublicWebsiteModel {
  theme: WebsiteThemeId;
  paletteId: string;
  design: WebsiteDesign;
  language: WebsiteLanguage;
  profile: WebsiteProfile;
  stays: PublicStay[];
  pages: WebsitePage[];
  page: WebsitePage;
  navPages: WebsitePage[];
  gallery: WebsiteImage[];
  username: string;
  canonicalPath: string;
  showBranding: boolean;
  preview: boolean;
  /** The fictional showcase sites: their unconnected stays may take sample inquiries. */
  demo: boolean;
  pro: boolean;
  breadcrumbs: { name: string; path: string }[];
}
