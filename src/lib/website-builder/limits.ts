export const WEBSITE_LIMITS = {
  pages: 24,
  sectionsPerPage: 24,
  accommodations: 20,
  photosPerAccommodation: 12,
  galleryImages: 30,
  text: 4000,
  shortText: 220,
  title: 140,
  seoTitle: 70,
  seoDescription: 160,
  items: 16,
  amenities: 40,
  documentChars: 350_000,
  uploadBytes: 5 * 1024 * 1024,
  draftWritesPer10Min: 40,
  draftCreatesPerHour: 8,
  uploadsPerHour: 30,
  mapResolvesPerHour: 20,
  anonymousTtlDays: 14,
  anonymousMaxAgeDays: 30,
} as const;

export const WEBSITE_DRAFT_COOKIE = "hv_website_draft";

export const WEBSITE_BUILDER_PATH = "/website-builder";
export const WEBSITE_PREVIEW_PATH = "/website-builder/preview";
export const WEBSITE_TOOL_SLUG = "vacation-rental-website-builder";
export const WEBSITE_MANAGEMENT_PATH = "/dashboard/website";
