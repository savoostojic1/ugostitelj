import { createInitialDocument, KIND_LABELS, starterSettings } from "@/lib/website-builder/defaults";
import { WEBSITE_LIMITS } from "@/lib/website-builder/limits";
import { allocateSlug, normalizePageSlug } from "@/lib/website-builder/paths";
import { emptySettings, sanitizeDocument } from "@/lib/website-builder/sanitize";
import { defaultPaletteId, orderForTheme } from "@/lib/website-builder/themes";
import type {
  AccommodationKind,
  WebsiteAccommodation,
  WebsiteDocument,
  WebsiteImage,
  WebsitePage,
  WebsitePageType,
  WebsiteSection,
  WebsiteSectionType,
  WebsiteThemeId,
} from "@/lib/website-builder/types";

function newId(): string {
  return crypto.randomUUID();
}

export function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) {
    return items;
  }
  const next = items.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function switchTheme(document: WebsiteDocument, theme: WebsiteThemeId): WebsiteDocument {
  const pages = document.design.customOrder
    ? document.pages
    : document.pages.map((page) =>
        page.isHome ? { ...page, sections: orderForTheme(page.sections, theme) } : page
      );
  return sanitizeDocument({
    ...document,
    theme,
    pages,
    design: {
      ...document.design,
      paletteId: defaultPaletteId(theme),
    },
  });
}

function markCustomOrder(document: WebsiteDocument, pageId: string): WebsiteDocument {
  const page = document.pages.find((item) => item.id === pageId);
  if (!page?.isHome || document.design.customOrder) return document;
  return { ...document, design: { ...document.design, customOrder: true } };
}

export function setGallery(document: WebsiteDocument, gallery: WebsiteImage[]): WebsiteDocument {
  return sanitizeDocument({ ...document, gallery: gallery.slice(0, WEBSITE_LIMITS.galleryImages) });
}

export function addGalleryImages(document: WebsiteDocument, images: WebsiteImage[]): WebsiteDocument {
  const seen = new Set(document.gallery.map((image) => image.url));
  const fresh = images.filter((image) => image.url && !seen.has(image.url));
  return setGallery(document, [...document.gallery, ...fresh]);
}

export function removeGalleryImage(document: WebsiteDocument, url: string): WebsiteDocument {
  return setGallery(document, document.gallery.filter((image) => image.url !== url));
}

/** Move a photograph to the front. The first photograph is the cover across the site. */
export function setCoverImage(document: WebsiteDocument, url: string): WebsiteDocument {
  const image = document.gallery.find((item) => item.url === url);
  if (!image) return document;
  return setGallery(document, [image, ...document.gallery.filter((item) => item.url !== url)]);
}

export function duplicateSection(
  document: WebsiteDocument,
  pageId: string,
  sectionId: string
): { document: WebsiteDocument; sectionId: string | null } {
  let createdId: string | null = null;
  const next = sanitizeDocument({
    ...document,
    pages: document.pages.map((page) => {
      if (page.id !== pageId || page.sections.length >= WEBSITE_LIMITS.sectionsPerPage) return page;
      const index = page.sections.findIndex((section) => section.id === sectionId);
      if (index < 0) return page;
      const source = page.sections[index];
      createdId = newId();
      const copy: WebsiteSection = {
        ...source,
        id: createdId,
        settings: {
          ...source.settings,
          items: source.settings.items.map((item) => ({ ...item, id: newId() })),
        },
      };
      const sections = page.sections.slice();
      sections.splice(index + 1, 0, copy);
      return { ...page, sections };
    }),
  });
  return { document: markCustomOrder(next, pageId), sectionId: createdId };
}

export function withProfile(
  document: WebsiteDocument,
  patch: Partial<WebsiteDocument["profile"]>
): WebsiteDocument {
  const previousName = document.profile.name;
  const next = sanitizeDocument({
    ...document,
    profile: { ...document.profile, ...patch },
  });
  if (patch.name && patch.name !== previousName) {
    next.pages = next.pages.map((page) => ({
      ...page,
      sections: page.sections.map((section) => {
        if (section.type !== "hero") return section;
        if (section.settings.title && section.settings.title !== previousName && section.settings.title !== "Your property") {
          return section;
        }
        return {
          ...section,
          settings: {
            ...section.settings,
            title: next.profile.name || section.settings.title,
          },
        };
      }),
    }));
  }
  return next;
}

export function addAccommodation(
  document: WebsiteDocument,
  input: { name: string; kind: AccommodationKind }
): WebsiteDocument {
  if (document.accommodations.length >= WEBSITE_LIMITS.accommodations) return document;
  const stay: WebsiteAccommodation = {
    id: newId(),
    propertyId: null,
    kind: input.kind,
    name: input.name.trim() || KIND_LABELS[input.kind],
    summary: "",
    description: "",
    location: document.profile.location,
    capacity: null,
    pricePerNight: null,
    currencyCode: "EUR",
    amenities: [],
    photos: [],
    usePropertyName: true,
    usePropertyDescription: true,
    usePropertyPhotos: true,
    usePropertyAmenities: true,
    usePropertyLocation: true,
  };
  return syncAccommodationPages(
    sanitizeDocument({
      ...document,
      accommodations: [...document.accommodations, stay],
    })
  );
}

export function updateAccommodation(
  document: WebsiteDocument,
  id: string,
  patch: Partial<WebsiteAccommodation>
): WebsiteDocument {
  return syncAccommodationPages(
    sanitizeDocument({
      ...document,
      accommodations: document.accommodations.map((stay) =>
        stay.id === id ? { ...stay, ...patch, id: stay.id } : stay
      ),
    })
  );
}

export function removeAccommodation(document: WebsiteDocument, id: string): WebsiteDocument {
  return syncAccommodationPages(
    sanitizeDocument({
      ...document,
      accommodations: document.accommodations.filter((stay) => stay.id !== id),
      pages: document.pages.filter(
        (page) => page.type !== "accommodation_unit" || page.accommodationId !== id
      ),
    })
  );
}

function unitSlug(name: string, taken: Set<string>): string {
  return allocateSlug(name, taken);
}

export function syncAccommodationPages(document: WebsiteDocument): WebsiteDocument {
  const taken = new Set(
    document.pages
      .filter((page) => page.type !== "accommodation_unit")
      .map((page) => page.slug)
  );
  const existing = new Map(
    document.pages
      .filter((page) => page.type === "accommodation_unit" && page.accommodationId)
      .map((page) => [page.accommodationId as string, page])
  );
  const unitPages: WebsitePage[] = document.accommodations.map((stay) => {
    const current = existing.get(stay.id);
    if (current) {
      taken.add(current.slug);
      return {
        ...current,
        title: stay.name,
        accommodationId: stay.id,
      };
    }
    const slug = unitSlug(stay.name, taken);
    taken.add(slug);
    return {
      id: newId(),
      type: "accommodation_unit",
      title: stay.name,
      slug,
      enabled: true,
      showInNav: false,
      isHome: false,
      accommodationId: stay.id,
      seo: {
        title: "",
        description: "",
        ogTitle: "",
        ogDescription: "",
        ogImage: "",
        noindex: false,
      },
      sections: [
        {
          id: newId(),
          type: "hero",
          visible: true,
          settings: {
            ...emptySettings(),
            eyebrow: KIND_LABELS[stay.kind],
            title: stay.name,
            body: stay.summary,
            ctaLabel: "Request dates",
            ctaHref: "#booking",
          },
        },
        {
          id: newId(),
          type: "featured_accommodation",
          visible: true,
          settings: { ...emptySettings(), accommodationId: stay.id, title: stay.name },
        },
        {
          id: newId(),
          type: "booking",
          visible: true,
          settings: {
            ...emptySettings(),
            title: "Booking inquiry",
            body: "Ask the host about these dates. A request is not a confirmed reservation.",
            accommodationId: stay.id,
          },
        },
      ],
    };
  });
  const rest = document.pages.filter((page) => page.type !== "accommodation_unit");
  const homeIndex = rest.findIndex((page) => page.isHome);
  const insertAt = homeIndex >= 0 ? homeIndex + 1 : 0;
  const pages = [...rest.slice(0, insertAt), ...unitPages, ...rest.slice(insertAt)];
  return { ...document, pages };
}

export function addPage(
  document: WebsiteDocument,
  input: { title: string; type?: WebsitePageType }
): WebsiteDocument {
  if (document.pages.length >= WEBSITE_LIMITS.pages) return document;
  const type = input.type && input.type !== "home" && input.type !== "accommodation_unit"
    ? input.type
    : "custom";
  const taken = new Set(document.pages.map((page) => page.slug));
  const title = input.title.trim() || "Custom page";
  const slug = allocateSlug(normalizePageSlug(title, "page"), taken);
  const nextPage: WebsitePage = {
    id: newId(),
    type,
    title,
    slug,
    enabled: true,
    showInNav: true,
    isHome: false,
    accommodationId: null,
    seo: {
      title: "",
      description: "",
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
      noindex: false,
    },
    sections: [
      {
        id: newId(),
        type: "text",
        visible: true,
        settings: { ...emptySettings(), title, body: "" },
      },
    ],
  };
  return sanitizeDocument({ ...document, pages: [...document.pages, nextPage] });
}

export function updatePage(
  document: WebsiteDocument,
  pageId: string,
  patch: Partial<Pick<WebsitePage, "title" | "slug" | "enabled" | "showInNav" | "seo">>
): WebsiteDocument {
  const taken = new Set(
    document.pages.filter((page) => page.id !== pageId).map((page) => page.slug)
  );
  return sanitizeDocument({
    ...document,
    pages: document.pages.map((page) => {
      if (page.id !== pageId) return page;
      const title = patch.title ?? page.title;
      const slug = page.isHome
        ? "home"
        : allocateSlug(normalizePageSlug(patch.slug ?? page.slug, title), taken);
      return {
        ...page,
        title,
        slug,
        enabled: patch.enabled ?? page.enabled,
        showInNav: patch.showInNav ?? page.showInNav,
        seo: patch.seo ? { ...page.seo, ...patch.seo } : page.seo,
      };
    }),
  });
}

export function removePage(document: WebsiteDocument, pageId: string): WebsiteDocument {
  const page = document.pages.find((item) => item.id === pageId);
  if (!page || page.isHome) return document;
  return sanitizeDocument({
    ...document,
    pages: document.pages.filter((item) => item.id !== pageId),
  });
}

export function reorderPages(document: WebsiteDocument, from: number, to: number): WebsiteDocument {
  return sanitizeDocument({ ...document, pages: moveItem(document.pages, from, to) });
}

export function setHomepage(document: WebsiteDocument, pageId: string): WebsiteDocument {
  return sanitizeDocument({
    ...document,
    pages: document.pages.map((page) => ({
      ...page,
      isHome: page.id === pageId,
      type: page.id === pageId ? "home" : page.type === "home" ? "custom" : page.type,
    })),
  });
}

export function addSection(
  document: WebsiteDocument,
  pageId: string,
  type: WebsiteSectionType,
  options: { index?: number; id?: string } = {}
): WebsiteDocument {
  const next = sanitizeDocument({
    ...document,
    pages: document.pages.map((page) => {
      if (page.id !== pageId || page.sections.length >= WEBSITE_LIMITS.sectionsPerPage) {
        return page;
      }
      const created: WebsiteSection = {
        id: options.id ?? newId(),
        type,
        visible: true,
        settings: { ...emptySettings(), ...starterSettings(type) },
      };
      const sections = page.sections.slice();
      const at =
        typeof options.index === "number"
          ? Math.max(0, Math.min(sections.length, options.index))
          : sections.length;
      sections.splice(at, 0, created);
      return { ...page, sections };
    }),
  });
  return markCustomOrder(next, pageId);
}

export function updateSection(
  document: WebsiteDocument,
  pageId: string,
  sectionId: string,
  patch: Partial<WebsiteSection["settings"]> & { visible?: boolean }
): WebsiteDocument {
  return sanitizeDocument({
    ...document,
    pages: document.pages.map((page) => {
      if (page.id !== pageId) return page;
      return {
        ...page,
        sections: page.sections.map((section) => {
          if (section.id !== sectionId) return section;
          const { visible, ...settings } = patch;
          return {
            ...section,
            visible: visible ?? section.visible,
            settings: { ...section.settings, ...settings },
          };
        }),
      };
    }),
  });
}

export function removeSection(
  document: WebsiteDocument,
  pageId: string,
  sectionId: string
): WebsiteDocument {
  return markCustomOrder(sanitizeDocument({
    ...document,
    pages: document.pages.map((page) =>
      page.id === pageId
        ? { ...page, sections: page.sections.filter((section) => section.id !== sectionId) }
        : page
    ),
  }), pageId);
}

export function reorderSections(
  document: WebsiteDocument,
  pageId: string,
  from: number,
  to: number
): WebsiteDocument {
  return markCustomOrder(sanitizeDocument({
    ...document,
    pages: document.pages.map((page) =>
      page.id === pageId ? { ...page, sections: moveItem(page.sections, from, to) } : page
    ),
  }), pageId);
}

export function normalizeDocument(input: unknown): WebsiteDocument {
  const document = sanitizeDocument(input);
  if (document.pages.length === 0) {
    const created = createInitialDocument(document.theme);
    return syncAccommodationPages({
      ...created,
      profile: document.profile,
      design: document.design,
      accommodations: document.accommodations,
      gallery: document.gallery,
      wizardStep: document.wizardStep,
      wizardPath: document.wizardPath,
    });
  }
  return syncAccommodationPages(document);
}

export function prepareNewDocument(theme: WebsiteThemeId): WebsiteDocument {
  return syncAccommodationPages(createInitialDocument(theme));
}
