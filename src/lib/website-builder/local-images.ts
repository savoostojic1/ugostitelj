import type { WebsiteDocument, WebsiteImage } from "@/lib/website-builder/types";

/**
 * Photos added before the host has an account stay in their browser (IndexedDB) and
 * are referenced in the document as `local:<id>`. Nothing is uploaded until the host
 * registers: the builder then uploads them and swaps each reference for its URL.
 * Published websites never contain local references (see stripLocalImages).
 */

export const LOCAL_IMAGE_PREFIX = "local:";
const LOCAL_REF = /^local:[a-z0-9-]{8,64}$/;

export function isLocalImageRef(value: unknown): value is `local:${string}` {
  return typeof value === "string" && LOCAL_REF.test(value);
}

export function newLocalImageRef(): string {
  return `${LOCAL_IMAGE_PREFIX}${crypto.randomUUID()}`;
}

/**
 * Object URLs for local photos in this browser tab, filled by the client store. Shared
 * here so thumbnails and previews can resolve a reference without importing IndexedDB.
 */
const resolved = new Map<string, string>();

export function registerLocalImageUrl(ref: string, objectUrl: string): void {
  resolved.set(ref, objectUrl);
}

/** Shown for a local photo whose preview is still loading (an empty src would refetch the page). */
export const LOCAL_IMAGE_PLACEHOLDER = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

export function localImageUrl(ref: string): string | null {
  return resolved.get(ref) ?? null;
}

/**
 * Rewrites every image in a document. Returning null removes a gallery or stay photo
 * and empties a single image field (section image, logo, social image).
 */
export function mapDocumentImages(document: WebsiteDocument, map: (url: string) => string | null): WebsiteDocument {
  const list = (images: WebsiteImage[]) =>
    images.flatMap((image) => {
      const url = map(image.url);
      return url ? [{ ...image, url }] : [];
    });
  const single = (url: string) => (url ? map(url) ?? "" : url);
  return {
    ...document,
    profile: { ...document.profile, logoUrl: single(document.profile.logoUrl) },
    gallery: list(document.gallery),
    accommodations: document.accommodations.map((stay) => ({ ...stay, photos: list(stay.photos) })),
    pages: document.pages.map((page) => ({
      ...page,
      seo: { ...page.seo, ogImage: single(page.seo.ogImage) },
      sections: page.sections.map((section) =>
        section.settings.imageUrl ? { ...section, settings: { ...section.settings, imageUrl: single(section.settings.imageUrl) } } : section
      ),
    })),
  };
}

/** Every distinct local reference in a document. */
export function collectLocalImageRefs(document: WebsiteDocument): string[] {
  const refs = new Set<string>();
  mapDocumentImages(document, (url) => {
    if (isLocalImageRef(url)) refs.add(url);
    return url;
  });
  return [...refs];
}

/** Removes photos that exist only in a browser; used before publishing and rendering live. */
export function stripLocalImages(document: WebsiteDocument): WebsiteDocument {
  return mapDocumentImages(document, (url) => (isLocalImageRef(url) ? null : url));
}

/** For previews: local references become this tab's object URLs; unknown ones are left out. */
export function resolveLocalImages(document: WebsiteDocument): WebsiteDocument {
  if (!collectLocalImageRefs(document).length) return document;
  return mapDocumentImages(document, (url) => (isLocalImageRef(url) ? localImageUrl(url) : url));
}
