import { currencyCodeFromUnknown } from "@/lib/currency/currencies";
import { syncAccommodationPages } from "@/lib/website-builder/document-ops";
import { WEBSITE_LIMITS } from "@/lib/website-builder/limits";
import { cleanText, sanitizeDocument } from "@/lib/website-builder/sanitize";
import type {
  AccommodationKind,
  LivePropertySnapshot,
  WebsiteAccommodation,
  WebsiteDocument,
} from "@/lib/website-builder/types";

/**
 * The website shows the same stays as the host's booking site: every Hostvia property
 * that is public. Name, photos, price, capacity and availability come from the property,
 * which the host already filled in when adding it. The document only keeps one entry
 * per shown property so the host can give it a type, a short line and its own page.
 */

/** Database rows (snake_case) to snapshots; `is_public` false hides a property. */
export function rowsToProperties(rows: unknown): LivePropertySnapshot[] {
  if (!Array.isArray(rows)) return [];
  return rows.flatMap((row) => {
    if (!row || typeof row !== "object") return [];
    const item = row as Record<string, unknown>;
    if (typeof item.id !== "string" || typeof item.name !== "string") return [];
    const price = Number(item.starting_price);
    return [
      {
        id: item.id,
        slug: typeof item.slug === "string" ? item.slug : null,
        name: item.name,
        shortDescription: typeof item.short_description === "string" ? item.short_description : null,
        description: typeof item.description === "string" ? item.description : null,
        address: typeof item.address === "string" ? item.address : null,
        imageUrl: typeof item.image_url === "string" ? item.image_url : null,
        galleryUrls: Array.isArray(item.gallery_urls)
          ? item.gallery_urls.filter((url): url is string => typeof url === "string")
          : [],
        capacity: typeof item.capacity === "number" ? item.capacity : null,
        amenities: Array.isArray(item.amenities)
          ? item.amenities.filter((amenity): amenity is string => typeof amenity === "string")
          : [],
        startingPrice: Number.isFinite(price) && price > 0 ? price : null,
        currencyCode: currencyCodeFromUnknown(item.currency_code),
        isPublic: item.is_public !== false,
      },
    ];
  });
}

/** Properties guests can see, in the host's order. */
export function websiteProperties(properties: LivePropertySnapshot[]): LivePropertySnapshot[] {
  return properties.filter((property) => property.isPublic !== false).slice(0, WEBSITE_LIMITS.accommodations);
}

const KIND_WORDS: [AccommodationKind, RegExp][] = [
  ["villa", /\bvill/i],
  ["cabin", /\b(cabin|chalet|lodge|koliba|brvnara)/i],
  ["bungalow", /\bbungal/i],
  ["room", /\b(room|soba|suite)/i],
  ["apartment", /\b(apartment|apartman|flat|studio)/i],
  ["holiday_home", /\b(house|home|kuća|kuca|cottage)/i],
];

export function kindForName(name: string): AccommodationKind {
  return KIND_WORDS.find(([, pattern]) => pattern.test(name))?.[0] ?? "other";
}

/** A document entry that takes everything from its property. */
export function stayForProperty(property: LivePropertySnapshot, document: WebsiteDocument): WebsiteAccommodation {
  return {
    id: crypto.randomUUID(),
    propertyId: property.id,
    kind: kindForName(property.name),
    name: property.name,
    summary: "",
    description: "",
    location: document.profile.location,
    capacity: property.capacity,
    pricePerNight: null,
    currencyCode: property.currencyCode,
    amenities: [],
    photos: [],
    usePropertyName: true,
    usePropertyDescription: true,
    usePropertyPhotos: true,
    usePropertyAmenities: true,
    usePropertyLocation: true,
  };
}

/**
 * Makes the document's stays match the host's public properties: one entry (and one
 * page) per property, in the same order. Entries the host already customised are kept;
 * stays that belong to no public property (typed by hand or written by the AI before
 * the host had an account) are removed with their pages. Returns the same object when
 * nothing changes, so callers can tell whether to save.
 */
export function syncStaysWithProperties(
  document: WebsiteDocument,
  properties: LivePropertySnapshot[]
): WebsiteDocument {
  const shown = websiteProperties(properties);
  const existing = new Map(
    document.accommodations
      .filter((stay): stay is WebsiteAccommodation & { propertyId: string } => Boolean(stay.propertyId))
      .map((stay) => [stay.propertyId, stay])
  );
  const added: { stayId: string; property: LivePropertySnapshot }[] = [];
  const accommodations = shown.map((property) => {
    const kept = existing.get(property.id);
    if (kept) return kept;
    const stay = stayForProperty(property, document);
    added.push({ stayId: stay.id, property });
    return stay;
  });

  const unchanged =
    accommodations.length === document.accommodations.length &&
    accommodations.every((stay, index) => stay === document.accommodations[index]);
  if (unchanged) return document;

  const keep = new Set(accommodations.map((stay) => stay.id));
  const pages = document.pages.filter(
    (page) => page.type !== "accommodation_unit" || (page.accommodationId !== null && keep.has(page.accommodationId))
  );
  const synced = syncAccommodationPages(sanitizeDocument({ ...document, accommodations, pages }));

  // A new stay page opens with the property's own short description.
  const intro = new Map(added.map(({ stayId, property }) => [stayId, cleanText(property.shortDescription ?? "", 220)]));
  return {
    ...synced,
    pages: synced.pages.map((page) => {
      const body = page.type === "accommodation_unit" && page.accommodationId ? intro.get(page.accommodationId) : undefined;
      if (!body) return page;
      return {
        ...page,
        sections: page.sections.map((section) =>
          section.type === "hero" ? { ...section, settings: { ...section.settings, body } } : section
        ),
      };
    }),
  };
}
