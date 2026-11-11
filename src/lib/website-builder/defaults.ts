import { defaultPaletteId, orderForTheme } from "@/lib/website-builder/themes";
import type {
  AccommodationKind,
  SectionSettings,
  WebsiteDocument,
  WebsitePage,
  WebsiteSection,
  WebsiteSectionType,
  WebsiteThemeId,
} from "@/lib/website-builder/types";

export const KIND_LABELS: Record<AccommodationKind, string> = {
  apartment: "Apartment",
  room: "Room",
  bungalow: "Bungalow",
  villa: "Villa",
  holiday_home: "Holiday home",
  cabin: "Cabin",
  other: "Stay",
};

function nid(): string {
  return crypto.randomUUID();
}

function settings(partial: Partial<SectionSettings>): SectionSettings {
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
    ...partial,
  };
}

function section(type: WebsiteSectionType, partial: Partial<SectionSettings> = {}): WebsiteSection {
  return { id: nid(), type, visible: true, settings: settings(partial) };
}

const STARTER_OFF = new Set<WebsitePage["type"]>(["amenities", "experiences", "reviews", "faq"]);

function page(
  type: WebsitePage["type"],
  title: string,
  slug: string,
  sections: WebsiteSection[],
  options?: { isHome?: boolean; showInNav?: boolean }
): WebsitePage {
  return {
    id: nid(),
    type,
    title,
    slug,
    enabled: !STARTER_OFF.has(type),
    showInNav: options?.showInNav !== false,
    isHome: options?.isHome === true || type === "home",
    accommodationId: null,
    seo: {
      title: "",
      description: "",
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
      noindex: false,
    },
    sections,
  };
}

function themeExtras(theme: WebsiteThemeId): WebsiteSection[] {
  if (theme === "escape") {
    return [
      section("full_image", {
        eyebrow: "Chapter",
        title: "Where the day slows down",
        body: "",
      }),
    ];
  }
  if (theme === "minimal") {
    return [
      section("faq", {
        eyebrow: "Practical",
        title: "Before you arrive",
        items: [
          {
            id: nid(),
            title: "Is a request the same as a reservation?",
            body: "No. The host confirms availability first. Dates are held only after the host accepts.",
          },
          {
            id: nid(),
            title: "How do I get the keys?",
            body: "Arrival details are shared by the host once your stay is confirmed.",
          },
        ],
      }),
    ];
  }
  return [];
}

export function homeSectionsForTheme(theme: WebsiteThemeId, sections: WebsiteSection[]): WebsiteSection[] {
  return orderForTheme(sections, theme);
}

export function createInitialDocument(theme: WebsiteThemeId = "luxe"): WebsiteDocument {
  const pages: WebsitePage[] = [
    page(
      "home",
      "Home",
      "home",
      homeSectionsForTheme(theme, [
        ...themeExtras(theme),
        section("hero", {
          eyebrow: "A private stay",
          title: "Your property",
          body: "A private house for slower days, long lunches, and the kind of quiet guests remember.",
          ctaLabel: "Request dates",
          ctaHref: "#booking",
        }),
        section("welcome", {
          eyebrow: "Welcome",
          title: "The house, kept for staying",
          body: "Morning light across the table. A walk before the day gets loud. Space enough for the people you came with, and a kitchen that is actually used.",
        }),
        section("image_text", {
          eyebrow: "The day",
          title: "Slow hours, close to the house",
          body: "Breakfast stays on the table. Someone swims, someone reads, and the afternoon is arranged around a long lunch rather than a schedule.",
          imagePosition: "right",
        }),
        section("featured_accommodation", {
          eyebrow: "The stay",
          title: "Featured accommodation",
          body: "A closer look at the space guests can book, with the nightly price from Hostvia.",
        }),
        section("amenities", {
          eyebrow: "In the house",
          title: "What is here",
          body: "The practical things, written so a guest can picture an ordinary day.",
          items: [
            { id: nid(), title: "A kitchen for long meals", body: "" },
            { id: nid(), title: "Quiet bedrooms", body: "" },
            { id: nid(), title: "A table outdoors", body: "" },
            { id: nid(), title: "Fast Wi-Fi", body: "" },
            { id: nid(), title: "Space to work", body: "" },
            { id: nid(), title: "Linen and towels", body: "" },
          ],
        }),
        section("experiences", {
          eyebrow: "Around you",
          title: "How the days go",
          body: "Replace these with the walks, tables and evenings that belong to your house.",
          items: [
            { id: nid(), title: "Morning", body: "Light first, then coffee, then whatever the weather suggests." },
            { id: nid(), title: "Midday", body: "A market, a swim, or the table left out longer than planned." },
            { id: nid(), title: "Evening", body: "The house gets quieter. People stay close." },
          ],
        }),
        section("gallery", {
          eyebrow: "Gallery",
          title: "Inside and out",
          body: "Rooms, the view, and the details guests remember.",
        }),
        section("cta", {
          eyebrow: "Dates",
          title: "Ask about a stay",
          body: "Send a booking inquiry. The host confirms availability before a reservation is held.",
          ctaLabel: "Check availability",
          ctaHref: "#booking",
        }),
        section("booking", {
          title: "Booking inquiry",
          body: "Choose dates and tell the host who is coming. This is a request, not an instant reservation.",
        }),
      ]),
      { isHome: true }
    ),
    page("about", "About", "about", [
      section("welcome", {
        eyebrow: "The house",
        title: "About this stay",
        body: "Share the story of the property, the host, and what a good day here looks like.",
      }),
      section("image_text", {
        title: "How the place lives",
        body: "A few details guests remember: morning light, the walk outside, the table where people gather.",
        imagePosition: "right",
      }),
    ]),
    page("accommodation", "Accommodation", "accommodation", [
      section("hero", {
        eyebrow: "Stay",
        title: "Accommodation",
        body: "Every space you can book, with the price and currency from Hostvia.",
      }),
      section("accommodation_grid", {
        title: "Choose a space",
        body: "Each accommodation keeps its own calendar and nightly price.",
      }),
    ]),
    page("amenities", "Amenities", "amenities", [
      section("amenities", {
        eyebrow: "In the house",
        title: "Amenities",
        body: "What is here for guests. These update from the connected property when you sync.",
        items: [
          { id: nid(), title: "Kitchen", body: "" },
          { id: nid(), title: "Outdoor dining", body: "" },
          { id: nid(), title: "Quiet bedrooms", body: "" },
          { id: nid(), title: "Wi-Fi", body: "" },
          { id: nid(), title: "Linen and towels", body: "" },
          { id: nid(), title: "A place to work", body: "" },
        ],
      }),
    ]),
    page("gallery", "Gallery", "gallery", [
      section("gallery", {
        eyebrow: "Photographs",
        title: "Gallery",
        body: "A quiet sequence of the rooms, the landscape, and the details.",
      }),
      section("full_image", { title: "A wider view" }),
    ]),
    page("location", "Location", "location", [
      section("location", {
        eyebrow: "Where",
        title: "Location",
        body: "Describe the setting without giving away a private entrance guests do not need yet.",
      }),
    ]),
    page("experiences", "Experiences", "experiences", [
      section("experiences", {
        eyebrow: "Around you",
        title: "Experiences",
        body: "A few ways to spend the day nearby.",
        items: [
          { id: nid(), title: "Morning", body: "A walk, a swim, or coffee before the day starts." },
          { id: nid(), title: "Table", body: "Markets, long lunches, and a kitchen worth cooking in." },
          { id: nid(), title: "Evening", body: "The slow part of the day, close to the house." },
        ],
      }),
    ]),
    page("reviews", "Guest notes", "reviews", [
      section("reviews", {
        eyebrow: "From guests",
        title: "Notes from people who stayed",
        body: "Add only words you have permission to publish.",
        items: [],
      }),
    ]),
    page("faq", "Questions", "faq", [
      section("faq", {
        eyebrow: "Practical",
        title: "Questions",
        items: [
          {
            id: nid(),
            title: "Is a request the same as a reservation?",
            body: "No. Sending the form asks the host to confirm. The dates are reserved only after the host accepts.",
          },
          {
            id: nid(),
            title: "When do I hear back?",
            body: "The host receives the inquiry and replies with availability.",
          },
        ],
      }),
    ]),
    page("contact", "Contact", "contact", [
      section("contact", {
        eyebrow: "Host",
        title: "Contact",
        body: "Write with questions about the house. For dates, use the booking inquiry so availability stays accurate.",
      }),
      section("newsletter", {
        eyebrow: "News",
        title: "Hear about future dates",
        body: "Hostvia does not run a mailing list from this section. Guests can write to the host from the contact details.",
        ctaLabel: "Contact the host",
        ctaHref: "/contact",
      }),
    ]),
  ];

  return {
    version: 1,
    theme,
    profile: {
      name: "",
      propertyType: "",
      location: "",
      shortDescription: "",
      language: "en",
      contactEmail: "",
      contactPhone: "",
      logoUrl: "",
      mapEmbedUrl: "",
    },
    design: {
      paletteId: defaultPaletteId(theme),
      animation: "elegant",
      headingScale: "standard",
      hideBranding: false,
      customOrder: false,
      heroBooking: true,
    },
    accommodations: [],
    gallery: [],
    pages,
    wizardStep: 1,
    wizardPath: null,
  };
}

export const SECTION_DESCRIPTIONS: Record<WebsiteSectionType, string> = {
  hero: "Opening image and headline",
  welcome: "A short introduction in large type",
  featured_accommodation: "One stay in detail, with live price",
  accommodation_grid: "Every stay guests can book",
  gallery: "Your photographs, composed by the theme",
  amenities: "What is in the house",
  image_text: "A photograph beside a short story",
  full_image: "A full-width photograph",
  video: "A YouTube or Vimeo film",
  location: "Where the property is, with a map",
  experiences: "Things to do, as a story",
  reviews: "Words from past guests",
  faq: "Practical questions and answers",
  cta: "A large invitation to book",
  contact: "Email, phone and address",
  booking: "Dates, guests and an inquiry form",
  newsletter: "A short note with a link",
  text: "A plain block of text",
};

/** Sections whose text lives in a list of items (FAQ, experiences, reviews, amenities). */
export const ITEM_SECTIONS = new Set<WebsiteSectionType>(["faq", "experiences", "reviews", "amenities"]);

/** Sensible starting content when a section is added from the library. */
export function starterSettings(type: WebsiteSectionType): Partial<SectionSettings> {
  switch (type) {
    case "hero":
      return { eyebrow: "Welcome", ctaLabel: "Request dates", ctaHref: "#booking" };
    case "welcome":
      return { eyebrow: "The house", title: "A few words about the stay", body: "Write two or three sentences a guest would remember." };
    case "image_text":
      return { eyebrow: "Story", title: "A detail worth a photograph", body: "Describe a room, a view, or a moment in the day.", imagePosition: "right" };
    case "full_image":
      return { title: "" };
    case "gallery":
      return { eyebrow: "Gallery", title: "Inside and out" };
    case "amenities":
      return { eyebrow: "In the house", title: "What is here", items: [{ id: nid(), title: "Wi-Fi", body: "" }, { id: nid(), title: "Kitchen", body: "" }, { id: nid(), title: "Linen and towels", body: "" }] };
    case "experiences":
      return { eyebrow: "Around you", title: "How the days go", items: [{ id: nid(), title: "Morning", body: "A walk, a swim, coffee outside." }, { id: nid(), title: "Afternoon", body: "A market, a long lunch, a nap." }, { id: nid(), title: "Evening", body: "The house gets quieter." }] };
    case "reviews":
      return { eyebrow: "From guests", title: "Notes from people who stayed", items: [{ id: nid(), title: "Guest name", body: "Add words a guest has given you permission to publish." }] };
    case "faq":
      return { eyebrow: "Practical", title: "Questions", items: [{ id: nid(), title: "What time is check-in?", body: "Check-in is from 3 pm. Let the host know your arrival time." }] };
    case "cta":
      return { eyebrow: "Dates", title: "Ask about a stay", body: "Send a booking inquiry. The host confirms availability.", ctaLabel: "Check availability", ctaHref: "#booking" };
    case "contact":
      return { eyebrow: "Host", title: "Contact" };
    case "booking":
      return { title: "Booking inquiry", body: "Choose dates and tell the host who is coming. This is a request, not an instant reservation." };
    case "location":
      return { eyebrow: "Where", title: "Location" };
    case "featured_accommodation":
      return { eyebrow: "The stay", title: "Featured accommodation" };
    case "accommodation_grid":
      return { eyebrow: "Stay", title: "Choose a space" };
    case "video":
      return { title: "A short film" };
    case "newsletter":
      return { eyebrow: "Note", title: "A note from the host", ctaLabel: "Contact the host", ctaHref: "/contact" };
    case "text":
      return { title: "Heading", body: "Write anything here." };
    default:
      return {};
  }
}

export function sectionLabel(type: WebsiteSectionType): string {
  const labels: Record<WebsiteSectionType, string> = {
    hero: "Hero",
    welcome: "Welcome",
    featured_accommodation: "Featured accommodation",
    accommodation_grid: "Accommodation grid",
    gallery: "Gallery",
    amenities: "Amenities",
    image_text: "Image and text",
    full_image: "Full-width image",
    video: "Video",
    location: "Location",
    experiences: "Experiences",
    reviews: "Reviews",
    faq: "FAQ",
    cta: "Call to action",
    contact: "Contact",
    booking: "Booking inquiry",
    newsletter: "Note",
    text: "Text",
  };
  return labels[type];
}
