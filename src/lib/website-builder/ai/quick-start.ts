import { KIND_LABELS } from "@/lib/website-builder/defaults";
import { addAccommodation, syncAccommodationPages, updateAccommodation, withProfile } from "@/lib/website-builder/document-ops";
import { WEBSITE_LIMITS } from "@/lib/website-builder/limits";
import { sanitizeDocument } from "@/lib/website-builder/sanitize";
import {
  ACCOMMODATION_KINDS,
  WEBSITE_LANGUAGES,
  type AccommodationKind,
  type SectionSettings,
  type WebsiteDocument,
  type WebsiteImage,
  type WebsiteLanguage,
  type WebsitePageType,
  type WebsiteSectionType,
  type WebsiteThemeId,
} from "@/lib/website-builder/types";

/**
 * Quick start: the host pastes the text of their own listing and adds photographs;
 * the model writes the whole website in the chosen theme's voice. This module holds
 * the shared contract (limits, output schema, prompt) and the pure function that
 * applies a result to a document. The server route lives in
 * app/api/website-builder/generate.
 */

export const QUICK_START_LIMITS = {
  minChars: 200,
  maxChars: 60_000,
  photos: 30,
  /** Longest side of the thumbnails the browser sends for the model to look at. */
  photoEdge: 640,
  photoBytes: 220_000,
  perDraftPerDay: 4,
  perIpPerDay: 8,
} as const;

export const QUICK_START_MODEL = "claude-opus-5-5";

export const PHOTO_ROLES = [
  "exterior",
  "view",
  "pool",
  "living",
  "bedroom",
  "kitchen",
  "bathroom",
  "dining",
  "outdoor",
  "detail",
  "surroundings",
  "other",
] as const;

export type PhotoRole = (typeof PHOTO_ROLES)[number];

interface Copy {
  eyebrow: string;
  title: string;
  body: string;
}

interface ItemCopy {
  title: string;
  body: string;
}

export interface QuickStartResult {
  language: WebsiteLanguage;
  property: {
    name: string;
    type: string;
    location: string;
    shortDescription: string;
  };
  home: {
    hero: Copy & { ctaLabel: string };
    welcome: Copy;
    story: Copy;
    featured: Copy;
    amenities: Copy & { items: string[] };
    experiences: Copy & { items: ItemCopy[] };
    gallery: Copy;
    chapter: Copy;
    cta: Copy & { ctaLabel: string };
  };
  about: { intro: Copy; story: Copy };
  stays: { hero: Copy; grid: Copy };
  location: Copy;
  faq: ItemCopy[];
  contact: Copy;
  seo: { title: string; description: string };
  units: {
    name: string;
    kind: AccommodationKind;
    capacity: number | null;
    summary: string;
    description: string;
    amenities: string[];
    photoIndexes: number[];
  }[];
  photos: { index: number; role: PhotoRole; alt: string }[];
  coverIndex: number;
  notes: string[];
}

const str = { type: "string" } as const;
const copy = {
  type: "object",
  properties: { eyebrow: str, title: str, body: str },
  required: ["eyebrow", "title", "body"],
  additionalProperties: false,
} as const;
const copyWithCta = {
  type: "object",
  properties: { eyebrow: str, title: str, body: str, ctaLabel: str },
  required: ["eyebrow", "title", "body", "ctaLabel"],
  additionalProperties: false,
} as const;
const item = {
  type: "object",
  properties: { title: str, body: str },
  required: ["title", "body"],
  additionalProperties: false,
} as const;

/** JSON schema for structured output. Lengths and counts are enforced again in code. */
export const QUICK_START_SCHEMA = {
  type: "object",
  properties: {
    // A plain string keeps the compiled grammar small; the code is validated in parseQuickStartResult.
    language: { type: "string", description: `ISO 639-1 code, one of: ${WEBSITE_LANGUAGES.join(", ")}` },
    property: {
      type: "object",
      properties: { name: str, type: str, location: str, shortDescription: str },
      required: ["name", "type", "location", "shortDescription"],
      additionalProperties: false,
    },
    home: {
      type: "object",
      properties: {
        hero: copyWithCta,
        welcome: copy,
        story: copy,
        featured: copy,
        amenities: {
          type: "object",
          properties: { eyebrow: str, title: str, body: str, items: { type: "array", items: str } },
          required: ["eyebrow", "title", "body", "items"],
          additionalProperties: false,
        },
        experiences: {
          type: "object",
          properties: { eyebrow: str, title: str, body: str, items: { type: "array", items: item } },
          required: ["eyebrow", "title", "body", "items"],
          additionalProperties: false,
        },
        gallery: copy,
        chapter: copy,
        cta: copyWithCta,
      },
      required: ["hero", "welcome", "story", "featured", "amenities", "experiences", "gallery", "chapter", "cta"],
      additionalProperties: false,
    },
    about: {
      type: "object",
      properties: { intro: copy, story: copy },
      required: ["intro", "story"],
      additionalProperties: false,
    },
    stays: {
      type: "object",
      properties: { hero: copy, grid: copy },
      required: ["hero", "grid"],
      additionalProperties: false,
    },
    location: copy,
    faq: { type: "array", items: item },
    contact: copy,
    seo: {
      type: "object",
      properties: { title: str, description: str },
      required: ["title", "description"],
      additionalProperties: false,
    },
    units: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: str,
          kind: { type: "string", enum: [...ACCOMMODATION_KINDS] },
          capacity: { anyOf: [{ type: "integer" }, { type: "null" }] },
          summary: str,
          description: str,
          amenities: { type: "array", items: str },
          photoIndexes: { type: "array", items: { type: "integer" } },
        },
        required: ["name", "kind", "capacity", "summary", "description", "amenities", "photoIndexes"],
        additionalProperties: false,
      },
    },
    photos: {
      type: "array",
      items: {
        type: "object",
        properties: {
          index: { type: "integer" },
          role: { type: "string", enum: [...PHOTO_ROLES] },
          alt: str,
        },
        required: ["index", "role", "alt"],
        additionalProperties: false,
      },
    },
    coverIndex: { type: "integer" },
    notes: { type: "array", items: str },
  },
  required: ["language", "property", "home", "about", "stays", "location", "faq", "contact", "seo", "units", "photos", "coverIndex", "notes"],
  additionalProperties: false,
} as const;

const THEME_VOICE: Record<WebsiteThemeId, string> = {
  luxe: "LUXE: quiet luxury, editorial and restrained. Short, assured sentences. Sensory detail, no superlatives, no exclamation marks. Headlines of three to seven words.",
  coastal: "COASTAL: sunlit, warm and easy. Light rhythm, the sea and the day outdoors. Friendly but never cute. Headlines that feel like a postcard.",
  nature: "NATURE: grounded and observant, like a field notebook. Seasons, materials, paths, silence. Plain words, concrete nouns.",
  minimal: "MINIMAL: precise, architectural, factual. Very short sentences. Lists over prose. Headlines as plain statements; no adjectives that do no work.",
  escape: "ESCAPE: slow, poetic and immersive, written as chapters of a retreat. Rituals, light, stillness. Calm second person.",
};

/**
 * How much text each design can carry in its large display type. The hero headline is
 * set very large (and the Escape hero is pinned full screen), so long copy wraps into
 * a wall of type. These limits go into the prompt and are enforced again in code.
 */
export const COPY_LIMITS: Record<WebsiteThemeId, { heroWords: number; heroChars: number; heroBody: number; title: number; body: number; welcomeBody: number }> = {
  luxe: { heroWords: 5, heroChars: 34, heroBody: 120, title: 48, body: 300, welcomeBody: 240 },
  coastal: { heroWords: 5, heroChars: 36, heroBody: 130, title: 52, body: 320, welcomeBody: 260 },
  nature: { heroWords: 6, heroChars: 40, heroBody: 140, title: 56, body: 340, welcomeBody: 280 },
  minimal: { heroWords: 4, heroChars: 28, heroBody: 100, title: 44, body: 260, welcomeBody: 200 },
  escape: { heroWords: 5, heroChars: 34, heroBody: 120, title: 48, body: 300, welcomeBody: 240 },
};

export function quickStartSystemPrompt(): string {
  return [
    "You write complete holiday-rental websites for hosts on Hostvia, a property management platform.",
    "The host pasted the text of their OWN listing page, copied with select-all, so it also contains menus, buttons, prices, guest reviews, ratings, policies and other page clutter. They may also attach numbered photographs of the property.",
    "",
    "Rules for the content:",
    "- Use only facts that the listing text or the photographs support. Never invent amenities, distances, awards, views, services or history. When unsure, leave the fact out and write about the feeling of the place instead.",
    "- Rewrite everything in your own words. Do not copy sentences from the listing.",
    "- Ignore and never reproduce: guest reviews and their names, review scores and ratings, prices, discounts, fees, payment and cancellation terms, and anything about the listing platform (Booking.com, Airbnb, Genius, Superhost and similar). Prices and availability on the website come live from Hostvia.",
    "- Do not mention Booking.com, Airbnb or any other platform.",
    "- No contact details, exact street numbers or entry codes.",
    "- Distances may be mentioned only if the listing states them.",
    "- Write all text in the requested website language. When the requested language is \"auto\", write in the main language of the listing description and return its code.",
    "",
    "Structure:",
    "- property.name is the property's own name without the platform's labels. property.type is a short noun phrase such as \"Private villa\" or \"Apartments by the sea\". property.location is \"Town, Country\". property.shortDescription is one sentence of at most 200 characters for the homepage introduction and search snippet.",
    "- Lengths follow the \"Lengths\" line of the theme in the user message. They are hard limits: the design sets headlines in very large type and longer text breaks the layout. Shorter is better.",
    "- eyebrow: one to three words. Body text: one to three sentences, except about.intro.body, about.story.body and location.body, which may run to 600 characters.",
    "- home.hero.title is the headline over the main photograph: a short evocative phrase, not a sentence, never the full property name plus location. home.hero.body is one short sentence. hero.ctaLabel and cta.ctaLabel: two or three words inviting a booking inquiry.",
    "- home.featured introduces the stay or stays guests can book. home.chapter is a single quiet line for a full-width photograph; its body may be empty.",
    "- home.amenities.items: 4 to 12 short amenity names actually in the listing, most appealing first.",
    "- home.experiences.items: 3 to 5 moments of a day or nearby activities that the listing supports (title of one to three words, body of one sentence).",
    "- faq: 4 to 7 practical questions answered from the listing (check-in and check-out times, parking, pets, children, Wi-Fi, beds). Always include that a request on this website is a booking inquiry that the host confirms. Skip questions the listing cannot answer.",
    "- seo.title at most 60 characters including the property name and town. seo.description at most 155 characters.",
    "- units: the bookable accommodation units the listing describes (apartments, rooms, the whole villa). One unit for a single home. Use capacity only when stated. amenities: up to 15 per unit. photoIndexes: photographs that clearly show that unit, best first; may be empty.",
    "- photos: one entry for every attached photograph, with its index, its role and alt text of at most 110 characters describing what is visible (no \"image of\"). coverIndex: the most striking wide photograph for the hero, preferably a view, the exterior or a bright living space. Use 0 when no photographs are attached.",
    "- notes: up to 4 short notes for the host, in the website language, about facts you left out or things worth checking. Empty when nothing needs attention.",
  ].join("\n");
}

export function quickStartUserText(input: {
  theme: WebsiteThemeId;
  language: WebsiteLanguage | "auto";
  listingText: string;
  photoCount: number;
}): string {
  return [
    `Theme voice: ${THEME_VOICE[input.theme]}`,
    `Lengths: hero.title at most ${COPY_LIMITS[input.theme].heroWords} words and ${COPY_LIMITS[input.theme].heroChars} characters; hero.body at most ${COPY_LIMITS[input.theme].heroBody} characters; every other title at most ${COPY_LIMITS[input.theme].title} characters; home.welcome.body at most ${COPY_LIMITS[input.theme].welcomeBody} characters; other body text at most ${COPY_LIMITS[input.theme].body} characters.`,
    `Website language: ${input.language}`,
    input.photoCount
      ? `${input.photoCount} photographs are attached above, numbered 0 to ${input.photoCount - 1} in the order of the labels.`
      : "No photographs are attached.",
    "",
    "Listing text pasted by the host:",
    "<listing>",
    input.listingText,
    "</listing>",
  ].join("\n");
}

/** Collapses the clutter of a select-all copy: repeated blank lines and spaces. */
export function tidyListingText(raw: string): string {
  return raw
    .replace(/\r\n?/g, "\n")
    .replace(/[\t  ]+/g, " ")
    .split("\n")
    .map((line) => line.trim())
    .filter((line, index, lines) => line || (index > 0 && lines[index - 1]))
    .join("\n")
    .trim();
}

/* ------------------------------------------------------------------ */
/* Validation of the model output                                     */
/* ------------------------------------------------------------------ */

function rec(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function text(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const stop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "));
  return (stop > max * 0.6 ? cut.slice(0, stop + 1) : cut.replace(/\s+\S*$/, "")).trim();
}

function readCopy(value: unknown, bodyMax = 420, titleMax = 110): Copy {
  const r = rec(value);
  return { eyebrow: text(r.eyebrow, 32), title: headline(r.title, titleMax), body: text(r.body, bodyMax) };
}

/** A headline is cut at a word, never mid-word, and loses trailing punctuation that dangles. */
function headline(value: unknown, maxChars: number, maxWords = 14): string {
  const clean = text(value, 400);
  if (!clean) return "";
  let words = clean.split(" ").slice(0, maxWords);
  while (words.length > 1 && words.join(" ").length > maxChars) words = words.slice(0, -1);
  const out = words.join(" ");
  return out === clean ? out : out.replace(/[,;:–—-]+$/, "").trim();
}

function readItems(value: unknown, max: number): ItemCopy[] {
  return (Array.isArray(value) ? value : [])
    .map((entry) => {
      const r = rec(entry);
      return { title: text(r.title, 110), body: text(r.body, 600) };
    })
    .filter((entry) => entry.title)
    .slice(0, max);
}

function readStrings(value: unknown, max: number, each = 60): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const entry of Array.isArray(value) ? value : []) {
    const clean = text(entry, each);
    const key = clean.toLowerCase();
    if (!clean || seen.has(key)) continue;
    seen.add(key);
    out.push(clean);
    if (out.length >= max) break;
  }
  return out;
}

function readIndexes(value: unknown, photoCount: number): number[] {
  const out: number[] = [];
  for (const entry of Array.isArray(value) ? value : []) {
    if (typeof entry === "number" && Number.isInteger(entry) && entry >= 0 && entry < photoCount && !out.includes(entry)) out.push(entry);
  }
  return out;
}

/** Turns untrusted model output into a complete, bounded result. Throws when it is unusable. */
export function parseQuickStartResult(raw: unknown, photoCount: number, theme: WebsiteThemeId = "luxe"): QuickStartResult {
  const limits = COPY_LIMITS[theme];
  const copyOf = (value: unknown, bodyMax = limits.body) => readCopy(value, bodyMax, limits.title);
  const r = rec(raw);
  const property = rec(r.property);
  const home = rec(r.home);
  const name = text(property.name, 140);
  const heroRaw = rec(home.hero);
  const hero = { eyebrow: text(heroRaw.eyebrow, 32), title: headline(heroRaw.title, limits.heroChars, limits.heroWords), body: text(heroRaw.body, limits.heroBody) };
  if (!name && !hero.title) throw new Error("The model returned no usable content");
  const language = WEBSITE_LANGUAGES.includes(r.language as WebsiteLanguage) ? (r.language as WebsiteLanguage) : "en";
  const amenities = rec(home.amenities);
  const experiences = rec(home.experiences);
  const photos = (Array.isArray(r.photos) ? r.photos : [])
    .map((entry) => {
      const p = rec(entry);
      const index = typeof p.index === "number" && Number.isInteger(p.index) ? p.index : -1;
      const role = PHOTO_ROLES.includes(p.role as PhotoRole) ? (p.role as PhotoRole) : "other";
      return { index, role, alt: text(p.alt, 140) };
    })
    .filter((entry, i, list) => entry.index >= 0 && entry.index < photoCount && list.findIndex((other) => other.index === entry.index) === i);
  const cover = typeof r.coverIndex === "number" && Number.isInteger(r.coverIndex) && r.coverIndex >= 0 && r.coverIndex < photoCount ? r.coverIndex : 0;
  const units = (Array.isArray(r.units) ? r.units : [])
    .map((entry) => {
      const u = rec(entry);
      const kind = ACCOMMODATION_KINDS.includes(u.kind as AccommodationKind) ? (u.kind as AccommodationKind) : "holiday_home";
      const capacity = typeof u.capacity === "number" && Number.isInteger(u.capacity) && u.capacity > 0 && u.capacity <= 60 ? u.capacity : null;
      return {
        name: text(u.name, 120) || KIND_LABELS[kind],
        kind,
        capacity,
        summary: text(u.summary, WEBSITE_LIMITS.shortText),
        description: text(u.description, 1600),
        amenities: readStrings(u.amenities, 15),
        photoIndexes: readIndexes(u.photoIndexes, photoCount).slice(0, WEBSITE_LIMITS.photosPerAccommodation),
      };
    })
    .slice(0, 8);
  const about = rec(r.about);
  const stays = rec(r.stays);
  const seo = rec(r.seo);
  return {
    language,
    property: {
      name,
      type: text(property.type, 80),
      location: text(property.location, 160),
      shortDescription: text(property.shortDescription, WEBSITE_LIMITS.shortText),
    },
    home: {
      hero: { ...hero, ctaLabel: text(rec(home.hero).ctaLabel, 32) },
      welcome: copyOf(home.welcome, limits.welcomeBody),
      story: copyOf(home.story),
      featured: copyOf(home.featured),
      amenities: { ...copyOf(amenities), items: readStrings(amenities.items, 12) },
      experiences: { ...copyOf(experiences), items: readItems(experiences.items, 6) },
      gallery: copyOf(home.gallery),
      chapter: copyOf(home.chapter),
      cta: { ...copyOf(home.cta), ctaLabel: text(rec(home.cta).ctaLabel, 32) },
    },
    about: { intro: copyOf(about.intro, 700), story: copyOf(about.story, 700) },
    stays: { hero: copyOf(stays.hero), grid: copyOf(stays.grid) },
    location: copyOf(r.location, 700),
    faq: readItems(r.faq, 8),
    contact: copyOf(r.contact),
    seo: { title: text(seo.title, 70), description: text(seo.description, 160) },
    units,
    photos,
    coverIndex: cover,
    notes: readStrings(r.notes, 4, 220),
  };
}

/* ------------------------------------------------------------------ */
/* Applying a result to a document                                    */
/* ------------------------------------------------------------------ */

type Slot = Partial<Pick<SectionSettings, "eyebrow" | "title" | "body" | "ctaLabel" | "items">>;

function filled(copyValue: Copy & { ctaLabel?: string }): Slot {
  const slot: Slot = {};
  if (copyValue.eyebrow) slot.eyebrow = copyValue.eyebrow;
  if (copyValue.title) slot.title = copyValue.title;
  if (copyValue.body) slot.body = copyValue.body;
  if (copyValue.ctaLabel) slot.ctaLabel = copyValue.ctaLabel;
  return slot;
}

function itemSlot(items: ItemCopy[]): Slot {
  return items.length ? { items: items.map((entry) => ({ id: crypto.randomUUID(), title: entry.title, body: entry.body })) } : {};
}

/** Which generated copy belongs in which section of which page. */
function slotFor(result: QuickStartResult, pageType: WebsitePageType, sectionType: WebsiteSectionType): Slot | null {
  const h = result.home;
  const amenityItems = h.amenities.items.length ? itemSlot(h.amenities.items.map((title) => ({ title, body: "" }))) : {};
  if (pageType === "home") {
    switch (sectionType) {
      case "hero": return filled(h.hero);
      case "welcome": return filled(h.welcome);
      case "image_text": return filled(h.story);
      case "featured_accommodation":
      case "accommodation_grid": return filled(h.featured);
      case "amenities": return { ...filled(h.amenities), ...amenityItems };
      case "experiences": return { ...filled(h.experiences), ...itemSlot(h.experiences.items) };
      case "gallery": return filled(h.gallery);
      case "full_image": return filled(h.chapter);
      case "cta": return filled(h.cta);
      case "faq": return result.faq.length ? itemSlot(result.faq) : null;
      case "location": return filled(result.location);
      case "contact": return filled(result.contact);
      default: return null;
    }
  }
  switch (`${pageType}:${sectionType}`) {
    case "about:welcome": return filled(result.about.intro);
    case "about:image_text": return filled(result.about.story);
    case "accommodation:hero": return filled(result.stays.hero);
    case "accommodation:accommodation_grid": return filled(result.stays.grid);
    case "amenities:amenities": return { body: h.amenities.body, ...amenityItems };
    case "gallery:gallery": return filled(h.gallery);
    case "gallery:full_image": return filled(h.chapter);
    case "location:location": return filled(result.location);
    case "experiences:experiences": return { ...filled(h.experiences), ...itemSlot(h.experiences.items) };
    case "faq:faq": return result.faq.length ? itemSlot(result.faq) : null;
    case "contact:contact": return filled(result.contact);
    default: return null;
  }
}

/**
 * Writes a generated result into the document. `photoUrls[i]` is the uploaded URL of
 * photograph i, or null when that upload failed. Stays already connected to a Hostvia
 * property are kept untouched; unconnected stays are replaced by the units found in
 * the listing. Prices are never written: they come from Hostvia.
 */
export function applyQuickStart(
  document: WebsiteDocument,
  result: QuickStartResult,
  photoUrls: (string | null)[]
): WebsiteDocument {
  const altFor = new Map(result.photos.map((photo) => [photo.index, photo.alt]));
  const imageAt = (index: number): WebsiteImage | null => {
    const url = photoUrls[index];
    return url ? { url, alt: altFor.get(index) || result.property.name } : null;
  };
  const order = [result.coverIndex, ...photoUrls.map((_, index) => index).filter((index) => index !== result.coverIndex)];
  const gallery = order.map(imageAt).filter((image): image is WebsiteImage => Boolean(image)).slice(0, WEBSITE_LIMITS.galleryImages);

  let next = withProfile(document, {
    name: result.property.name || document.profile.name,
    propertyType: result.property.type || document.profile.propertyType,
    location: result.property.location || document.profile.location,
    shortDescription: result.property.shortDescription || document.profile.shortDescription,
    language: result.language,
  });
  if (gallery.length) next = { ...next, gallery };

  next = {
    ...next,
    pages: next.pages.map((page) => {
      if (page.type === "accommodation_unit") return page;
      const sections = page.sections.map((section) => {
        const slot = slotFor(result, page.type, section.type);
        return slot ? { ...section, settings: { ...section.settings, ...slot } } : section;
      });
      const seo = page.isHome && (result.seo.title || result.seo.description)
        ? { ...page.seo, title: result.seo.title || page.seo.title, description: result.seo.description || page.seo.description }
        : page.seo;
      // Pages with written content become worth showing.
      const enabled =
        page.enabled ||
        (page.type === "faq" && result.faq.length >= 3) ||
        (page.type === "amenities" && result.home.amenities.items.length >= 6) ||
        (page.type === "experiences" && result.home.experiences.items.length >= 3);
      return { ...page, sections, seo, enabled };
    }),
  };

  // Stays: keep connected ones, replace the rest with the units from the listing.
  const connected = next.accommodations.filter((stay) => stay.propertyId);
  next = syncAccommodationPages(sanitizeDocument({ ...next, accommodations: connected }));
  const units = result.units.length
    ? result.units
    : connected.length
      ? []
      : [{ name: result.property.name || "Stay", kind: "holiday_home" as AccommodationKind, capacity: null, summary: result.property.shortDescription, description: "", amenities: result.home.amenities.items, photoIndexes: [] }];
  for (const unit of units) {
    if (next.accommodations.length >= WEBSITE_LIMITS.accommodations) break;
    const added = addAccommodation(next, { name: unit.name, kind: unit.kind });
    const created = added.accommodations[added.accommodations.length - 1];
    if (!created || added === next) break;
    const photos = unit.photoIndexes.map(imageAt).filter((image): image is WebsiteImage => Boolean(image));
    next = updateAccommodation(added, created.id, {
      capacity: unit.capacity,
      summary: unit.summary,
      description: unit.description,
      amenities: unit.amenities,
      location: next.profile.location,
      photos: photos.length ? photos : gallery.slice(0, 4),
    });
    // The unit page opens with the unit's own summary.
    next = {
      ...next,
      pages: next.pages.map((page) =>
        page.type === "accommodation_unit" && page.accommodationId === created.id
          ? { ...page, sections: page.sections.map((section) => (section.type === "hero" ? { ...section, settings: { ...section.settings, body: unit.summary || section.settings.body } } : section)) }
          : page
      ),
    };
  }
  return sanitizeDocument(next);
}

/**
 * Adds photographs that uploaded on a second try, without touching any text the host
 * may have edited since: the gallery is rebuilt in the AI's order (keeping any other
 * photos after it), and stays that still have no photographs of their own get theirs.
 */
export function addRetriedPhotos(
  document: WebsiteDocument,
  result: QuickStartResult,
  photoUrls: (string | null)[]
): WebsiteDocument {
  const altFor = new Map(result.photos.map((photo) => [photo.index, photo.alt]));
  const imageAt = (index: number): WebsiteImage | null => {
    const url = photoUrls[index];
    return url ? { url, alt: altFor.get(index) || result.property.name } : null;
  };
  const order = [result.coverIndex, ...photoUrls.map((_, index) => index).filter((index) => index !== result.coverIndex)];
  const ordered = order.map(imageAt).filter((image): image is WebsiteImage => Boolean(image));
  const known = new Set(ordered.map((image) => image.url));
  const gallery = [...ordered, ...document.gallery.filter((image) => !known.has(image.url))].slice(0, WEBSITE_LIMITS.galleryImages);
  const accommodations = document.accommodations.map((stay) => {
    if (stay.propertyId || stay.photos.length) return stay;
    const unit = result.units.find((item) => item.name === stay.name);
    const own = (unit?.photoIndexes ?? []).map(imageAt).filter((image): image is WebsiteImage => Boolean(image));
    return { ...stay, photos: own.length ? own : gallery.slice(0, 4) };
  });
  return sanitizeDocument({ ...document, gallery, accommodations });
}
