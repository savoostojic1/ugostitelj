import {
  addAccommodation,
  prepareNewDocument,
  updateAccommodation,
  withProfile,
} from "@/lib/website-builder/document-ops";
import { mergeWebsiteModel } from "@/lib/website-builder/merge-properties";
import { starterPhotos } from "@/lib/website-builder/photo-library";
import { sanitizeDocument } from "@/lib/website-builder/sanitize";
import type {
  AccommodationKind,
  PublicWebsiteModel,
  WebsiteDocument,
  WebsiteSection,
  WebsiteThemeId,
} from "@/lib/website-builder/types";

interface SampleStay {
  name: string;
  kind: AccommodationKind;
  summary: string;
  capacity: number;
  price: number;
  amenities: string[];
  photos: number[];
}

interface SampleSpec {
  name: string;
  propertyType: string;
  location: string;
  shortDescription: string;
  heroEyebrow: string;
  welcome: { title: string; body: string };
  story: { eyebrow: string; title: string; body: string; photo: number };
  cta: string;
  experiences: { title: string; body: string }[];
  stays: SampleStay[];
}

/** Five fictional properties, one per theme. None of them is a real business. */
export const SAMPLE_SPECS: Record<WebsiteThemeId, SampleSpec> = {
  luxe: {
    name: "Villa Serena",
    propertyType: "Private villa",
    location: "Hvar, Croatia",
    shortDescription:
      "A private villa above the Adriatic, kept for slow mornings, long dinners and the light that arrives late.",
    heroEyebrow: "A private villa on the Adriatic",
    welcome: {
      title: "Four bedrooms, one long table, and the sea at the end of the garden.",
      body: "Villa Serena is let to one party at a time. The terrace faces west, the pool is warmed until October, and the house is looked after so you don't have to be.",
    },
    story: {
      eyebrow: "The house",
      title: "Built for evenings that run late",
      body: "Stone walls keep the rooms cool through August. When the sun goes down, the terrace becomes the dining room, and nobody watches the time.",
      photo: 6,
    },
    cta: "Reserve the season",
    experiences: [
      { title: "Morning", body: "Coffee on the terrace before the boats go out." },
      { title: "Afternoon", body: "A private boat to the Pakleni islands, lunch on the water." },
      { title: "Evening", body: "Dinner prepared by a local chef, served under the pines." },
    ],
    stays: [
      { name: "The Villa", kind: "villa", summary: "Four suites, a heated infinity pool and a west-facing terrace.", capacity: 8, price: 1450, amenities: ["Heated infinity pool", "Sea view", "Private chef on request", "Air conditioning", "Wine cellar", "Fast Wi-Fi"], photos: [1, 3] },
      { name: "Garden Suite", kind: "room", summary: "A separate suite in the olive garden, with its own entrance.", capacity: 2, price: 420, amenities: ["Garden terrace", "Rain shower", "Breakfast included"], photos: [4, 2] },
    ],
  },
  coastal: {
    name: "Casa Blu",
    propertyType: "Seaside apartments",
    location: "Oia, Santorini",
    shortDescription:
      "Two whitewashed apartments above the caldera, with terraces that face the sunset and steps down to the sea.",
    heroEyebrow: "Above the caldera",
    welcome: {
      title: "White walls, blue doors and the whole Aegean from the terrace.",
      body: "Casa Blu is two apartments in a restored captain's house. Mornings are bright and quiet; evenings belong to the sunset.",
    },
    story: {
      eyebrow: "Mornings",
      title: "Breakfast where the light begins",
      body: "The terraces catch the first sun. Bring the coffee outside, watch the ferries cross, and let the day decide itself.",
      photo: 3,
    },
    cta: "Plan your summer",
    experiences: [
      { title: "Swim", body: "Amoudi Bay is 300 steps down, and worth every one." },
      { title: "Sail", body: "A catamaran around the caldera, with lunch at anchor." },
      { title: "Sunset", body: "The best seat in Oia is on your own terrace." },
    ],
    stays: [
      { name: "Sea Apartment", kind: "apartment", summary: "Two bedrooms, an arched living room and a terrace with a plunge pool.", capacity: 4, price: 320, amenities: ["Caldera view", "Plunge pool", "Kitchen", "Air conditioning", "Wi-Fi"], photos: [4, 7] },
      { name: "Terrace Studio", kind: "apartment", summary: "A studio for two with a private sunset terrace.", capacity: 2, price: 190, amenities: ["Sunset terrace", "Kitchenette", "Wi-Fi"], photos: [2, 5] },
    ],
  },
  nature: {
    name: "Larch & Lake",
    propertyType: "Mountain cabins",
    location: "Dolomites, Italy",
    shortDescription:
      "Three timber cabins at the edge of a mountain lake, with wood stoves, wide windows and trails from the door.",
    heroEyebrow: "1,480 m above the sea",
    welcome: {
      title: "Wood smoke, cold water and a view that changes every hour.",
      body: "The cabins sit at the tree line above Lago di Braies. Walk out of the door and onto the trail; come back to a stove that's already lit.",
    },
    story: {
      eyebrow: "Field notes",
      title: "The lake is yours before breakfast",
      body: "By seven the mist has lifted and the water is still. Take the rowing boat, or just sit on the jetty with a cup of something hot.",
      photo: 4,
    },
    cta: "Find your season",
    experiences: [
      { title: "Spring", body: "Meadows in flower and the first long walks." },
      { title: "Summer", body: "Swims in the lake and dinners outside." },
      { title: "Winter", body: "Snowshoes, sauna and the stove all night." },
    ],
    stays: [
      { name: "Lake Cabin", kind: "cabin", summary: "Two bedrooms, a wood stove and windows over the water.", capacity: 4, price: 240, amenities: ["Wood stove", "Lake view", "Sauna", "Full kitchen", "Hiking trails"], photos: [1, 2] },
      { name: "Forest Bungalow", kind: "bungalow", summary: "A small bungalow among the larches, for two.", capacity: 2, price: 160, amenities: ["Wood stove", "Forest view", "Outdoor bath"], photos: [6, 3] },
    ],
  },
  minimal: {
    name: "Atelier 9",
    propertyType: "City apartments",
    location: "Lisbon, Portugal",
    shortDescription:
      "Two apartments in a restored 1930s building in Príncipe Real, designed for quiet, light and long stays.",
    heroEyebrow: "Príncipe Real, Lisbon",
    welcome: {
      title: "Light, oak and stone. Nothing that doesn't need to be here.",
      body: "Atelier 9 is a former print workshop turned into two apartments. High ceilings, original windows and furniture made in Lisbon.",
    },
    story: {
      eyebrow: "Detail",
      title: "Designed for staying, not visiting",
      body: "A desk by the window, a proper kitchen, blackout curtains. Everything needed for a week, a month, or longer.",
      photo: 7,
    },
    cta: "Check dates",
    experiences: [
      { title: "Coffee", body: "Three of the city's best roasters within four minutes." },
      { title: "Gardens", body: "Jardim do Príncipe Real is across the street." },
      { title: "Tram", body: "The 24E stops outside the door." },
    ],
    stays: [
      { name: "Loft", kind: "apartment", summary: "Open-plan loft with four-metre ceilings and a workspace.", capacity: 3, price: 185, amenities: ["Workspace", "Fast Wi-Fi", "Washer", "Air conditioning", "Full kitchen", "Lift"], photos: [4, 3] },
      { name: "Studio", kind: "apartment", summary: "A compact studio facing the garden.", capacity: 2, price: 120, amenities: ["Garden view", "Kitchenette", "Fast Wi-Fi"], photos: [1, 7] },
    ],
  },
  escape: {
    name: "Sora Retreat",
    propertyType: "Wellness retreat",
    location: "Ubud, Bali",
    shortDescription:
      "A small wellness retreat in the rice terraces outside Ubud, with daily yoga, a jungle spa and villas open to the trees.",
    heroEyebrow: "A retreat in the rice terraces",
    welcome: {
      title: "Arrive tired. Leave slower.",
      body: "Sora is six villas, a shala and a spa in a valley of rice terraces. Days follow the light: practice at dawn, rest at noon, ritual at dusk.",
    },
    story: {
      eyebrow: "Ritual",
      title: "Every evening ends at the water",
      body: "A warm soak, a cup of ginger tea, and the sound of the river below.",
      photo: 7,
    },
    cta: "Begin your retreat",
    experiences: [
      { title: "Dawn practice", body: "Yoga in the open shala as the valley wakes." },
      { title: "Jungle spa", body: "Balinese massage with warm stones and coconut oil." },
      { title: "Water temple", body: "A guided morning at Tirta Empul's sacred springs." },
    ],
    stays: [
      { name: "Jungle Villa", kind: "villa", summary: "A private villa open to the canopy, with its own plunge pool.", capacity: 2, price: 380, amenities: ["Plunge pool", "Daily yoga", "Outdoor shower", "Breakfast included", "Spa access"], photos: [5, 4] },
      { name: "Garden Pavilion", kind: "bungalow", summary: "A pavilion among frangipani trees, steps from the shala.", capacity: 2, price: 240, amenities: ["Garden terrace", "Daily yoga", "Breakfast included"], photos: [1, 3] },
    ],
  },
};

function stabilize(document: WebsiteDocument): WebsiteDocument {
  const stayIds = new Map(document.accommodations.map((stay, index) => [stay.id, `sample-stay-${index + 1}`]));
  return {
    ...document,
    accommodations: document.accommodations.map((stay, index) => ({
      ...stay,
      id: stayIds.get(stay.id) ?? `sample-stay-${index + 1}`,
    })),
    pages: document.pages.map((page, pageIndex) => ({
      ...page,
      id: `sample-page-${pageIndex + 1}`,
      accommodationId: page.accommodationId ? stayIds.get(page.accommodationId) ?? null : null,
      sections: page.sections.map((section, sectionIndex) => ({
        ...section,
        id: `sample-p${pageIndex + 1}-s${sectionIndex + 1}`,
        settings: {
          ...section.settings,
          accommodationId: section.settings.accommodationId
            ? stayIds.get(section.settings.accommodationId) ?? ""
            : "",
          items: section.settings.items.map((item, itemIndex) => ({
            ...item,
            id: `sample-p${pageIndex + 1}-s${sectionIndex + 1}-i${itemIndex + 1}`,
          })),
        },
      })),
    })),
  };
}

export function sampleDocument(theme: WebsiteThemeId): WebsiteDocument {
  const spec = SAMPLE_SPECS[theme];
  const photos = starterPhotos(theme);
  let document = withProfile(prepareNewDocument(theme), {
    name: spec.name,
    propertyType: spec.propertyType,
    location: spec.location,
    shortDescription: spec.shortDescription,
    contactEmail: "stay@example.com",
  });
  for (const stay of spec.stays) {
    document = addAccommodation(document, { name: stay.name, kind: stay.kind });
  }
  spec.stays.forEach((stay, index) => {
    const id = document.accommodations[index]?.id;
    if (!id) return;
    document = updateAccommodation(document, id, {
      summary: stay.summary,
      capacity: stay.capacity,
      pricePerNight: stay.price,
      currencyCode: "EUR",
      amenities: stay.amenities,
      photos: stay.photos.map((n) => photos[n]).filter(Boolean),
      location: spec.location,
    });
  });
  document.gallery = photos;
  const patch = (section: WebsiteSection, isHome: boolean): WebsiteSection => {
    const s = section.settings;
    switch (section.type) {
      case "hero":
        return isHome ? { ...section, settings: { ...s, eyebrow: spec.heroEyebrow, body: spec.shortDescription } } : section;
      case "welcome":
        return isHome ? { ...section, settings: { ...s, title: spec.welcome.title, body: spec.welcome.body } } : section;
      case "image_text":
        return isHome
          ? {
              ...section,
              settings: {
                ...s,
                eyebrow: spec.story.eyebrow,
                title: spec.story.title,
                body: spec.story.body,
                imageUrl: photos[spec.story.photo]?.url ?? "",
                imageAlt: photos[spec.story.photo]?.alt ?? "",
              },
            }
          : section;
      case "experiences":
        return {
          ...section,
          settings: {
            ...s,
            items: spec.experiences.map((item, index) => ({ id: `x-${index}`, ...item })),
          },
        };
      case "cta":
        return { ...section, settings: { ...s, ctaLabel: spec.cta } };
      case "reviews":
        return {
          ...section,
          settings: {
            ...s,
            items: [
              { id: "r-1", title: "Sample guest, June", body: "Sample review. Hosts add only words a guest has agreed to publish." },
            ],
          },
        };
      default:
        return section;
    }
  };
  document.pages = document.pages.map((page) => ({
    ...page,
    sections: page.sections.map((section) => patch(section, page.isHome)),
  }));
  return sanitizeDocument(stabilize(document));
}

export function sampleWebsiteModel(theme: WebsiteThemeId, pageType: "home" | string = "home"): PublicWebsiteModel {
  const document = sampleDocument(theme);
  const page =
    document.pages.find((item) => (pageType === "home" ? item.isHome : item.type === pageType)) ??
    document.pages[0];
  return mergeWebsiteModel({
    document,
    properties: [],
    username: "sample",
    page,
    preview: true,
    sampleRates: true,
  });
}
