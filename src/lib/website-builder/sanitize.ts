import { currencyCodeFromUnknown } from "@/lib/currency/currencies";
import { googleMapsUrlToEmbed, isAllowedMapEmbedUrl } from "@/lib/public/google-maps-embed";
import { WEBSITE_LIMITS } from "@/lib/website-builder/limits";
import { allocateSlug, normalizePageSlug } from "@/lib/website-builder/paths";
import { defaultPaletteId, isPaletteForTheme } from "@/lib/website-builder/themes";
import {
  ACCOMMODATION_KINDS,
  PAGE_TYPES,
  SECTION_TYPES,
  WEBSITE_LANGUAGES,
  WEBSITE_THEMES,
  type AccommodationKind,
  type PageSeo,
  type SectionSettings,
  type WebsiteAccommodation,
  type WebsiteDesign,
  type WebsiteDocument,
  type WebsiteFaqItem,
  type WebsiteImage,
  type WebsiteLanguage,
  type WebsitePage,
  type WebsitePageType,
  type WebsiteProfile,
  type WebsiteSection,
  type WebsiteSectionType,
  type WebsiteThemeId,
} from "@/lib/website-builder/types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const KIND_SET = new Set<string>(ACCOMMODATION_KINDS);
const PAGE_SET = new Set<string>(PAGE_TYPES);
const SECTION_SET = new Set<string>(SECTION_TYPES);
const THEME_SET = new Set<string>(WEBSITE_THEMES);
const LANGUAGE_SET = new Set<string>(WEBSITE_LANGUAGES);

export function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/**
 * Strips control characters and tags. Only leading whitespace is removed: the
 * document is sanitized on every keystroke while a host types, so trimming the end
 * would swallow each space before the next word. Rendering and SEO trim on output.
 */
export function cleanText(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/^\s+/, "")
    .slice(0, max);
}

export function isSafeHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;
    if (url.username || url.password) return false;
    if (url.pathname.toLowerCase().endsWith(".svg")) return false;
    return true;
  } catch {
    return false;
  }
}

export function cleanImageUrl(value: unknown): string {
  if (typeof value !== "string") return "";
  const trimmed = value.trim().slice(0, 2000);
  return isSafeHttpUrl(trimmed) ? trimmed : "";
}

export function cleanEmail(value: unknown): string {
  const email = cleanText(value, 180);
  return EMAIL_PATTERN.test(email) ? email : "";
}

export function cleanPhone(value: unknown): string {
  const phone = cleanText(value, 40);
  if (!phone) return "";
  return /^[0-9+().\-\s]{3,40}$/.test(phone) ? phone : "";
}

export function toEmbedVideoUrl(value: unknown): string {
  const raw = cleanText(value, 500);
  if (!raw) return "";
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return "";
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id && /^[\w-]{6,20}$/.test(id)
        ? `https://www.youtube-nocookie.com/embed/${id}`
        : "";
    }
    if (host === "youtube.com" || host === "youtube-nocookie.com") {
      const id =
        url.searchParams.get("v") ||
        url.pathname.split("/").filter((part) => part && part !== "embed").pop();
      return id && /^[\w-]{6,20}$/.test(id)
        ? `https://www.youtube-nocookie.com/embed/${id}`
        : "";
    }
    if (host === "vimeo.com" || host === "player.vimeo.com") {
      const id = url.pathname.split("/").filter(Boolean).pop();
      return id && /^\d{5,12}$/.test(id)
        ? `https://player.vimeo.com/video/${id}`
        : "";
    }
    return "";
  } catch {
    return "";
  }
}

export function cleanMapEmbed(value: unknown): string {
  if (typeof value !== "string") return "";
  const trimmed = value.trim().slice(0, 2000);
  if (!trimmed) return "";
  try {
    const embed =
      googleMapsUrlToEmbed(trimmed) ??
      (isAllowedMapEmbedUrl(trimmed) ? trimmed : null);
    return embed && isAllowedMapEmbedUrl(embed) ? embed : "";
  } catch {
    return "";
  }
}

export function cleanInternalHref(value: unknown): string {
  const href = cleanText(value, 180);
  if (!href) return "";
  if (href === "#booking") return href;
  if (!href.startsWith("/") || href.startsWith("//")) return "";
  if (href.includes("..") || href.includes("\\") || href.includes("?")) return "";
  return href.slice(0, 120);
}

function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, Math.round(number)));
}

function cleanId(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const id = value.trim().slice(0, 80);
  return /^[a-zA-Z0-9_-]{4,80}$/.test(id) ? id : fallback;
}

export function emptySettings(): SectionSettings {
  return {
    eyebrow: "",
    title: "",
    body: "",
    imageUrl: "",
    imageAlt: "",
    imagePosition: "left",
    videoUrl: "",
    align: "left",
    items: [],
    accommodationId: "",
    ctaLabel: "",
    ctaHref: "",
    animation: "inherit",
    spacing: "normal",
  };
}

function sanitizeItems(value: unknown): WebsiteFaqItem[] {
  if (!Array.isArray(value)) return [];
  const items: WebsiteFaqItem[] = [];
  for (const entry of value.slice(0, WEBSITE_LIMITS.items)) {
    if (!isRecord(entry)) continue;
    const title = cleanText(entry.title, WEBSITE_LIMITS.title);
    const body = cleanText(entry.body, WEBSITE_LIMITS.text);
    if (!title && !body && typeof entry.id !== "string") continue;
    items.push({
      id: cleanId(entry.id, `item-${items.length + 1}`),
      title,
      body,
    });
  }
  return items;
}

export function sanitizeSettings(value: unknown): SectionSettings {
  const raw = isRecord(value) ? value : {};
  const base = emptySettings();
  const position = raw.imagePosition === "right" ? "right" : "left";
  const align = raw.align === "center" ? "center" : "left";
  const animation =
    raw.animation === "none" || raw.animation === "rise" || raw.animation === "fade"
      ? raw.animation
      : "inherit";
  const spacing =
    raw.spacing === "compact" || raw.spacing === "spacious" ? raw.spacing : "normal";
  return {
    ...base,
    eyebrow: cleanText(raw.eyebrow, 80),
    title: cleanText(raw.title, WEBSITE_LIMITS.title),
    body: cleanText(raw.body, WEBSITE_LIMITS.text),
    imageUrl: cleanImageUrl(raw.imageUrl),
    imageAlt: cleanText(raw.imageAlt, 180),
    imagePosition: position,
    videoUrl: toEmbedVideoUrl(raw.videoUrl),
    align,
    items: sanitizeItems(raw.items),
    accommodationId: cleanId(raw.accommodationId, ""),
    ctaLabel: cleanText(raw.ctaLabel, 40),
    ctaHref: cleanInternalHref(raw.ctaHref),
    animation,
    spacing,
  };
}

export function sanitizeImage(value: unknown): WebsiteImage | null {
  if (!isRecord(value)) return null;
  const url = cleanImageUrl(value.url);
  if (!url) return null;
  return { url, alt: cleanText(value.alt, 180) };
}

export function sanitizeImages(value: unknown, max: number): WebsiteImage[] {
  if (!Array.isArray(value)) return [];
  const images: WebsiteImage[] = [];
  for (const entry of value) {
    const image = sanitizeImage(entry);
    if (!image) continue;
    images.push(image);
    if (images.length >= max) break;
  }
  return images;
}

function sanitizeSeo(value: unknown, title: string, description: string): PageSeo {
  const raw = isRecord(value) ? value : {};
  const seoTitle = cleanText(raw.title, WEBSITE_LIMITS.seoTitle) || title.slice(0, WEBSITE_LIMITS.seoTitle);
  const seoDescription =
    cleanText(raw.description, WEBSITE_LIMITS.seoDescription) ||
    description.slice(0, WEBSITE_LIMITS.seoDescription);
  return {
    title: seoTitle,
    description: seoDescription,
    ogTitle: cleanText(raw.ogTitle, WEBSITE_LIMITS.seoTitle) || seoTitle,
    ogDescription: cleanText(raw.ogDescription, WEBSITE_LIMITS.seoDescription) || seoDescription,
    ogImage: cleanImageUrl(raw.ogImage),
    noindex: raw.noindex === true,
  };
}

function sanitizeSection(value: unknown, index: number): WebsiteSection | null {
  if (!isRecord(value)) return null;
  const type = typeof value.type === "string" && SECTION_SET.has(value.type)
    ? (value.type as WebsiteSectionType)
    : null;
  if (!type) return null;
  return {
    id: cleanId(value.id, `section-${index + 1}`),
    type,
    visible: value.visible !== false,
    settings: sanitizeSettings(value.settings),
  };
}

function sanitizePage(value: unknown, index: number, taken: Set<string>): WebsitePage | null {
  if (!isRecord(value)) return null;
  const type = typeof value.type === "string" && PAGE_SET.has(value.type)
    ? (value.type as WebsitePageType)
    : "custom";
  const title = cleanText(value.title, WEBSITE_LIMITS.title) || `Page ${index + 1}`;
  const slug = allocateSlug(
    normalizePageSlug(typeof value.slug === "string" ? value.slug : title, `page-${index + 1}`),
    taken
  );
  taken.add(slug);
  const sections = Array.isArray(value.sections)
    ? value.sections
        .slice(0, WEBSITE_LIMITS.sectionsPerPage)
        .map((section, sectionIndex) => sanitizeSection(section, sectionIndex))
        .filter((section): section is WebsiteSection => Boolean(section))
    : [];
  return {
    id: cleanId(value.id, `page-${index + 1}`),
    type,
    title,
    slug,
    enabled: value.enabled !== false,
    showInNav: value.showInNav !== false,
    isHome: value.isHome === true || type === "home",
    accommodationId:
      type === "accommodation_unit" ? cleanId(value.accommodationId, "") || null : null,
    seo: sanitizeSeo(value.seo, title, ""),
    sections,
  };
}

export function sanitizeProfile(value: unknown): WebsiteProfile {
  const raw = isRecord(value) ? value : {};
  const language = typeof raw.language === "string" && LANGUAGE_SET.has(raw.language)
    ? (raw.language as WebsiteLanguage)
    : "en";
  return {
    name: cleanText(raw.name, WEBSITE_LIMITS.title),
    propertyType: cleanText(raw.propertyType, 80),
    location: cleanText(raw.location, 160),
    shortDescription: cleanText(raw.shortDescription, WEBSITE_LIMITS.shortText),
    language,
    // Stored as typed so the field can be edited; validated wherever it is rendered.
    contactEmail: cleanText(raw.contactEmail, 180),
    contactPhone: cleanPhone(raw.contactPhone),
    logoUrl: cleanImageUrl(raw.logoUrl),
    mapEmbedUrl: cleanMapEmbed(raw.mapEmbedUrl),
  };
}

export function sanitizeDesign(value: unknown, theme: WebsiteThemeId): WebsiteDesign {
  const raw = isRecord(value) ? value : {};
  const paletteId =
    typeof raw.paletteId === "string" && isPaletteForTheme(theme, raw.paletteId)
      ? raw.paletteId
      : defaultPaletteId(theme);
  return {
    paletteId,
    animation:
      raw.animation === "subtle" || raw.animation === "none" ? raw.animation : "elegant",
    headingScale: raw.headingScale === "large" ? "large" : "standard",
    hideBranding: raw.hideBranding === true,
    customOrder: raw.customOrder === true,
    heroBooking: raw.heroBooking !== false,
  };
}

export function sanitizeAccommodation(value: unknown, index: number): WebsiteAccommodation | null {
  if (!isRecord(value)) return null;
  const name = cleanText(value.name, WEBSITE_LIMITS.title);
  if (!name) return null;
  const kind = typeof value.kind === "string" && KIND_SET.has(value.kind)
    ? (value.kind as AccommodationKind)
    : "other";
  const price =
    value.pricePerNight === null || value.pricePerNight === undefined || value.pricePerNight === ""
      ? null
      : Number(value.pricePerNight);
  const capacity =
    value.capacity === null || value.capacity === undefined || value.capacity === ""
      ? null
      : Number(value.capacity);
  const amenities = Array.isArray(value.amenities)
    ? value.amenities
        .map((item) => cleanText(item, 60))
        .filter(Boolean)
        .slice(0, WEBSITE_LIMITS.amenities)
    : [];
  return {
    id: cleanId(value.id, `stay-${index + 1}`),
    propertyId: cleanId(value.propertyId, "") || null,
    kind,
    name,
    summary: cleanText(value.summary, WEBSITE_LIMITS.shortText),
    description: cleanText(value.description, WEBSITE_LIMITS.text),
    location: cleanText(value.location, 160),
    capacity:
      capacity !== null && Number.isFinite(capacity)
        ? Math.min(100, Math.max(1, Math.round(capacity)))
        : null,
    pricePerNight:
      price !== null && Number.isFinite(price) && price > 0 ? Math.min(price, 1_000_000) : null,
    currencyCode: currencyCodeFromUnknown(value.currencyCode),
    amenities,
    photos: sanitizeImages(value.photos, WEBSITE_LIMITS.photosPerAccommodation),
    usePropertyName: value.usePropertyName !== false,
    usePropertyDescription: value.usePropertyDescription !== false,
    usePropertyPhotos: value.usePropertyPhotos !== false,
    usePropertyAmenities: value.usePropertyAmenities !== false,
    usePropertyLocation: value.usePropertyLocation !== false,
  };
}

function ensureHome(pages: WebsitePage[]): WebsitePage[] {
  if (pages.length === 0) return pages;
  const homes = pages.filter((page) => page.isHome || page.type === "home");
  const home = homes[0] ?? pages[0];
  return pages.map((page) => ({
    ...page,
    isHome: page.id === home.id,
    type: page.id === home.id ? "home" : page.type === "home" ? "custom" : page.type,
    slug: page.id === home.id ? "home" : page.slug,
  }));
}

export function countDocumentImages(document: WebsiteDocument): number {
  const gallery = document.gallery.length;
  const logo = document.profile.logoUrl ? 1 : 0;
  const stayPhotos = document.accommodations.reduce((sum, stay) => sum + stay.photos.length, 0);
  const sectionPhotos = document.pages.reduce(
    (sum, page) =>
      sum + page.sections.filter((section) => section.settings.imageUrl).length,
    0
  );
  return gallery + logo + stayPhotos + sectionPhotos;
}

export function sanitizeDocument(input: unknown): WebsiteDocument {
  const raw = isRecord(input) ? input : {};
  const theme = typeof raw.theme === "string" && THEME_SET.has(raw.theme)
    ? (raw.theme as WebsiteThemeId)
    : "luxe";
  const accommodations = (Array.isArray(raw.accommodations) ? raw.accommodations : [])
    .slice(0, WEBSITE_LIMITS.accommodations)
    .map((entry, index) => sanitizeAccommodation(entry, index))
    .filter((entry): entry is WebsiteAccommodation => Boolean(entry));
  const taken = new Set<string>(["home"]);
  const pages = ensureHome(
    (Array.isArray(raw.pages) ? raw.pages : [])
      .slice(0, WEBSITE_LIMITS.pages)
      .map((entry, index) => sanitizePage(entry, index, taken))
      .filter((entry): entry is WebsitePage => Boolean(entry))
  );
  return {
    version: 1,
    theme,
    profile: sanitizeProfile(raw.profile),
    design: sanitizeDesign(raw.design, theme),
    accommodations,
    gallery: sanitizeImages(raw.gallery, WEBSITE_LIMITS.galleryImages),
    pages,
    wizardStep: clampInt(raw.wizardStep, 1, 9, 1),
    wizardPath: raw.wizardPath === "ai" || raw.wizardPath === "manual" ? raw.wizardPath : null,
  };
}

export function documentTooLarge(document: WebsiteDocument): boolean {
  return JSON.stringify(document).length > WEBSITE_LIMITS.documentChars;
}
