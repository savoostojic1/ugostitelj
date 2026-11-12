import { KIND_LABELS } from "@/lib/website-builder/defaults";
import { breadcrumbsFor, pagePath } from "@/lib/website-builder/paths";
import { cleanEmail, cleanImageUrl, cleanMapEmbed, cleanPhone, cleanText } from "@/lib/website-builder/sanitize";
import { stayForProperty, websiteProperties } from "@/lib/website-builder/property-stays";
import type {
  LivePropertySnapshot,
  PublicStay,
  PublicWebsiteModel,
  WebsiteDocument,
  WebsiteImage,
  WebsitePage,
} from "@/lib/website-builder/types";

function propertyPhotos(property: LivePropertySnapshot, alt: string): WebsiteImage[] {
  const urls = [
    property.imageUrl,
    ...property.galleryUrls,
  ].filter((url): url is string => Boolean(url));
  const unique: WebsiteImage[] = [];
  const seen = new Set<string>();
  for (const url of urls) {
    const safe = cleanImageUrl(url);
    if (!safe || seen.has(safe)) continue;
    seen.add(safe);
    unique.push({ url: safe, alt });
  }
  return unique;
}

/**
 * The stays guests see are the host's public Hostvia properties, exactly as on the
 * booking site. A document entry for a property adds the host's own wording and page;
 * a property without one still appears with everything taken from Hostvia. Stays that
 * belong to no public property are never shown. Only the fictional demo sites
 * (`sampleRates`) show the stays written in their document.
 */
export function mergeStays(
  document: WebsiteDocument,
  properties: LivePropertySnapshot[],
  options: { sampleRates?: boolean } = {}
): PublicStay[] {
  const byId = new Map(properties.map((property) => [property.id, property]));
  const entries = options.sampleRates
    ? document.accommodations
    : websiteProperties(properties).map(
        (property) =>
          document.accommodations.find((stay) => stay.propertyId === property.id) ?? {
            ...stayForProperty(property, document),
            id: `property-${property.id}`,
          }
      );
  return entries.map((stay) => {
    const property = stay.propertyId ? byId.get(stay.propertyId) : undefined;
    const linked = Boolean(property);
    const name =
      linked && stay.usePropertyName ? property!.name : stay.name || property?.name || "Stay";
    const description =
      linked && stay.usePropertyDescription
        ? cleanText(property!.description || property!.shortDescription || "", 4000)
        : stay.description;
    const summary =
      stay.summary ||
      (linked ? cleanText(property!.shortDescription || "", 220) : "");
    const location =
      linked && stay.usePropertyLocation
        ? cleanText(property!.address || "", 160)
        : stay.location;
    const photos =
      linked && stay.usePropertyPhotos
        ? propertyPhotos(property!, name)
        : stay.photos;
    const amenities =
      linked && stay.usePropertyAmenities ? property!.amenities : stay.amenities;
    const page = document.pages.find(
      (item) => item.type === "accommodation_unit" && item.accommodationId === stay.id && item.enabled
    );
    return {
      id: stay.id,
      propertyId: linked ? property!.id : null,
      propertySlug: linked ? property!.slug : null,
      kind: stay.kind,
      kindLabel: KIND_LABELS[stay.kind],
      name,
      summary,
      description,
      location,
      capacity: linked ? property!.capacity : stay.capacity,
      pricePerNight: linked ? property!.startingPrice : options.sampleRates ? stay.pricePerNight : null,
      currencyCode: linked ? property!.currencyCode : stay.currencyCode,
      amenities,
      photos: photos.length ? photos : document.gallery,
      href: page ? pagePath(page) : "/accommodation",
    };
  });
}

export function mergeWebsiteModel(input: {
  document: WebsiteDocument;
  properties: LivePropertySnapshot[];
  username: string;
  page: WebsitePage;
  preview?: boolean;
  pro?: boolean;
  sampleRates?: boolean;
}): PublicWebsiteModel {
  const stays = mergeStays(input.document, input.properties, { sampleRates: input.sampleRates });
  const enabled = input.document.pages.filter((page) => page.enabled);
  const pro = input.pro === true;
  return {
    theme: input.document.theme,
    paletteId: input.document.design.paletteId,
    design: input.document.design,
    language: input.document.profile.language,
    profile: {
      ...input.document.profile,
      contactEmail: cleanEmail(input.document.profile.contactEmail),
      contactPhone: cleanPhone(input.document.profile.contactPhone),
      mapEmbedUrl: cleanMapEmbed(input.document.profile.mapEmbedUrl),
    },
    stays,
    pages: enabled,
    page: input.page,
    navPages: enabled.filter((page) => page.showInNav && page.type !== "accommodation_unit"),
    gallery: input.document.gallery,
    username: input.username,
    canonicalPath: pagePath(input.page),
    showBranding: pro ? !input.document.design.hideBranding : true,
    preview: input.preview === true,
    demo: input.sampleRates === true,
    pro,
    breadcrumbs: breadcrumbsFor(enabled, input.page, input.document.profile.name || "Home"),
  };
}

export function pageForSlug(document: WebsiteDocument, slugParts: string[]): WebsitePage | null {
  const enabled = document.pages.filter((page) => page.enabled);
  if (slugParts.length === 0) {
    return enabled.find((page) => page.isHome) ?? null;
  }
  const slug = slugParts.join("/");
  return enabled.find((page) => !page.isHome && page.slug === slug) ?? null;
}
