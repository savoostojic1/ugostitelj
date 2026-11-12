import type { WebsiteSectionType, WebsiteThemeId } from "@/lib/website-builder/types";

/**
 * Palette tokens. These are written as CSS custom properties on the website root,
 * so the published site and every preview share one source of truth.
 */
export interface PaletteTokens {
  bg: string;
  surface: string;
  ink: string;
  muted: string;
  accent: string;
  accentInk: string;
  line: string;
  deep: string;
  deepInk: string;
}

export interface ThemePalette {
  id: string;
  label: string;
  tokens: PaletteTokens;
}

export interface WebsiteThemeMeta {
  id: WebsiteThemeId;
  name: string;
  tagline: string;
  description: string;
  suitedFor: string;
  /** Typeface names shown in the builder. */
  typography: { display: string; text: string };
  /** One line describing how the theme moves. */
  motion: string;
  swatch: [string, string, string];
  palettes: ThemePalette[];
  /** Preferred order of homepage sections for this composition. */
  homeOrder: WebsiteSectionType[];
}

const line = (rgb: string, alpha = 0.14) => `rgba(${rgb}, ${alpha})`;

export const WEBSITE_THEME_META: WebsiteThemeMeta[] = [
  {
    id: "luxe",
    name: "Luxe",
    tagline: "Cinematic editorial",
    description:
      "Full-screen photography that settles slowly into place, refined serif headlines and an editorial rhythm for villas and boutique stays.",
    suitedFor: "Luxury villas, boutique hotels, premium homes",
    typography: { display: "Cormorant Garamond", text: "Outfit" },
    motion: "Slow, cinematic reveals and a pinned horizontal gallery",
    swatch: ["#F4EFE7", "#9A7B55", "#14110E"],
    palettes: [
      {
        id: "ivory",
        label: "Ivory",
        tokens: {
          bg: "#F4EFE7",
          surface: "#EAE2D6",
          ink: "#1A1612",
          muted: "#6E655B",
          accent: "#886C4B",
          accentInk: "#FBF8F3",
          line: line("26, 22, 18"),
          deep: "#14110E",
          deepInk: "#F4EFE7",
        },
      },
      {
        id: "noir",
        label: "Noir",
        tokens: {
          bg: "#0F0E0D",
          surface: "#1A1816",
          ink: "#EFE8DD",
          muted: "#9A9085",
          accent: "#C2A374",
          accentInk: "#0F0E0D",
          line: line("239, 232, 221"),
          deep: "#070606",
          deepInk: "#EFE8DD",
        },
      },
      {
        id: "olive",
        label: "Olive",
        tokens: {
          bg: "#EEEDE4",
          surface: "#E0DFD0",
          ink: "#1F231B",
          muted: "#63675A",
          accent: "#6B704D",
          accentInk: "#F6F5EE",
          line: line("31, 35, 27"),
          deep: "#23281F",
          deepInk: "#EEEDE4",
        },
      },
    ],
    homeOrder: [
      "hero",
      "welcome",
      "image_text",
      "featured_accommodation",
      "gallery",
      "amenities",
      "experiences",
      "reviews",
      "cta",
      "booking",
    ],
  },
  {
    id: "coastal",
    name: "Coastal",
    tagline: "Mediterranean light",
    description:
      "Arched windows, soft sea light and an unhurried flow for seaside apartments, island houses and homes by the water.",
    suitedFor: "Seaside apartments, island villas, coastal homes",
    typography: { display: "Fraunces", text: "Figtree" },
    motion: "Soft, drifting motion with gently floating imagery",
    swatch: ["#F6F3EC", "#1F6F78", "#0F3A45"],
    palettes: [
      {
        id: "tide",
        label: "Tide",
        tokens: {
          bg: "#F6F3EC",
          surface: "#E4ECEA",
          ink: "#10303A",
          muted: "#5B7178",
          accent: "#1F6F78",
          accentInk: "#F6F3EC",
          line: line("16, 48, 58"),
          deep: "#0F3A45",
          deepInk: "#F6F3EC",
        },
      },
      {
        id: "sand",
        label: "Sand",
        tokens: {
          bg: "#F8F1E6",
          surface: "#EFE2CC",
          ink: "#3A2A1C",
          muted: "#7C6A58",
          accent: "#A85E35",
          accentInk: "#FFF9F1",
          line: line("58, 42, 28"),
          deep: "#4A3020",
          deepInk: "#F8F1E6",
        },
      },
      {
        id: "navy",
        label: "Navy",
        tokens: {
          bg: "#F3F5F7",
          surface: "#DFE7EE",
          ink: "#0E1F3A",
          muted: "#57667D",
          accent: "#2B5CAB",
          accentInk: "#F3F5F7",
          line: line("14, 31, 58"),
          deep: "#0E1F3A",
          deepInk: "#F3F5F7",
        },
      },
    ],
    homeOrder: [
      "hero",
      "welcome",
      "featured_accommodation",
      "image_text",
      "gallery",
      "experiences",
      "amenities",
      "reviews",
      "cta",
      "booking",
    ],
  },
  {
    id: "nature",
    name: "Nature",
    tagline: "Layered landscape",
    description:
      "Layered parallax, field-note details and asymmetric storytelling for cabins, bungalows, lodges and mountain houses.",
    suitedFor: "Cabins, bungalows, lodges, mountain retreats",
    typography: { display: "Newsreader", text: "Instrument Sans" },
    motion: "Depth through layered parallax and curtain reveals",
    swatch: ["#EEEDE6", "#3E5B43", "#18221B"],
    palettes: [
      {
        id: "forest",
        label: "Forest",
        tokens: {
          bg: "#EEEDE6",
          surface: "#DEDFD2",
          ink: "#1C261F",
          muted: "#5C6A5F",
          accent: "#3E5B43",
          accentInk: "#F2F1EA",
          line: line("28, 38, 31"),
          deep: "#18221B",
          deepInk: "#E9E8DF",
        },
      },
      {
        id: "clay",
        label: "Clay",
        tokens: {
          bg: "#F2ECE4",
          surface: "#E5D8C8",
          ink: "#2B211A",
          muted: "#77685B",
          accent: "#9A5B3A",
          accentInk: "#FBF6F0",
          line: line("43, 33, 26"),
          deep: "#2B211A",
          deepInk: "#F2ECE4",
        },
      },
      {
        id: "mist",
        label: "Mist",
        tokens: {
          bg: "#EDF0F0",
          surface: "#DCE3E3",
          ink: "#1D2729",
          muted: "#5D6B6E",
          accent: "#4F6F73",
          accentInk: "#F4F7F7",
          line: line("29, 39, 41"),
          deep: "#1D2729",
          deepInk: "#EDF0F0",
        },
      },
    ],
    homeOrder: [
      "hero",
      "welcome",
      "image_text",
      "experiences",
      "featured_accommodation",
      "gallery",
      "amenities",
      "reviews",
      "cta",
      "booking",
    ],
  },
  {
    id: "minimal",
    name: "Minimal",
    tagline: "Architectural grid",
    description:
      "Large, exact typography, a strict grid and quiet architectural photography for modern apartments and city stays.",
    suitedFor: "Modern apartments, lofts, city stays",
    typography: { display: "Geist", text: "Geist Mono" },
    motion: "Precise, restrained movement and drawn hairlines",
    swatch: ["#F5F5F2", "#111111", "#E5482B"],
    palettes: [
      {
        id: "paper",
        label: "Paper",
        tokens: {
          bg: "#F5F5F2",
          surface: "#EAEAE5",
          ink: "#111111",
          muted: "#6B6B66",
          accent: "#CE4127",
          accentInk: "#FFFFFF",
          line: line("17, 17, 17", 0.16),
          deep: "#111111",
          deepInk: "#F5F5F2",
        },
      },
      {
        id: "ink",
        label: "Ink",
        tokens: {
          bg: "#0E0E0E",
          surface: "#1A1A1A",
          ink: "#F1F1EE",
          muted: "#8C8C88",
          accent: "#D9F24A",
          accentInk: "#0E0E0E",
          line: line("241, 241, 238", 0.16),
          deep: "#000000",
          deepInk: "#F1F1EE",
        },
      },
      {
        id: "stone",
        label: "Stone",
        tokens: {
          bg: "#E9E6E0",
          surface: "#DDD9D1",
          ink: "#22201D",
          muted: "#6E6A63",
          accent: "#3F5E7A",
          accentInk: "#F4F2EE",
          line: line("34, 32, 29", 0.16),
          deep: "#22201D",
          deepInk: "#E9E6E0",
        },
      },
    ],
    homeOrder: [
      "hero",
      "welcome",
      "featured_accommodation",
      "image_text",
      "amenities",
      "gallery",
      "experiences",
      "reviews",
      "faq",
      "cta",
      "booking",
    ],
  },
  {
    id: "escape",
    name: "Escape",
    tagline: "Immersive chapters",
    description:
      "Full-screen chapters, expressive type and scroll-led storytelling for wellness stays, retreats and one-of-a-kind places.",
    suitedFor: "Retreats, wellness stays, unique experiences",
    typography: { display: "Instrument Serif", text: "Jost" },
    motion: "Expressive, scroll-driven transitions and sticky stories",
    swatch: ["#F3EBE1", "#B4532F", "#24170F"],
    palettes: [
      {
        id: "terracotta",
        label: "Terracotta",
        tokens: {
          bg: "#F3EBE1",
          surface: "#E8D9C8",
          ink: "#2A1D16",
          muted: "#7A675A",
          accent: "#B4532F",
          accentInk: "#FBF4EC",
          line: line("42, 29, 22"),
          deep: "#24170F",
          deepInk: "#F3EBE1",
        },
      },
      {
        id: "dusk",
        label: "Dusk",
        tokens: {
          bg: "#1B1620",
          surface: "#261F2C",
          ink: "#F0E6E0",
          muted: "#A89AA3",
          accent: "#E39A6F",
          accentInk: "#1B1620",
          line: line("240, 230, 224"),
          deep: "#120E15",
          deepInk: "#F0E6E0",
        },
      },
      {
        id: "linen",
        label: "Linen",
        tokens: {
          bg: "#F5F2EC",
          surface: "#E9E4DA",
          ink: "#26302B",
          muted: "#6E766F",
          accent: "#58735D",
          accentInk: "#F5F2EC",
          line: line("38, 48, 43"),
          deep: "#1F2924",
          deepInk: "#F5F2EC",
        },
      },
    ],
    homeOrder: [
      "hero",
      "welcome",
      "experiences",
      "full_image",
      "featured_accommodation",
      "gallery",
      "amenities",
      "reviews",
      "cta",
      "booking",
    ],
  },
];

export function themeMeta(id: WebsiteThemeId): WebsiteThemeMeta {
  return WEBSITE_THEME_META.find((theme) => theme.id === id) ?? WEBSITE_THEME_META[0];
}

export function defaultPaletteId(theme: WebsiteThemeId): string {
  return themeMeta(theme).palettes[0]?.id ?? "ivory";
}

export function isPaletteForTheme(theme: WebsiteThemeId, paletteId: string): boolean {
  return themeMeta(theme).palettes.some((palette) => palette.id === paletteId);
}

export function paletteFor(theme: WebsiteThemeId, paletteId: string): ThemePalette {
  const meta = themeMeta(theme);
  return meta.palettes.find((palette) => palette.id === paletteId) ?? meta.palettes[0];
}

/** CSS custom properties for the website root element. */
export function paletteStyle(theme: WebsiteThemeId, paletteId: string): Record<string, string> {
  const { tokens } = paletteFor(theme, paletteId);
  return {
    "--wb-bg": tokens.bg,
    "--wb-surface": tokens.surface,
    "--wb-ink": tokens.ink,
    "--wb-muted": tokens.muted,
    "--wb-accent": tokens.accent,
    // The palette accent, kept unchanged where sections remap --wb-accent (deep tone).
    "--wb-accent-src": tokens.accent,
    "--wb-accent-ink": tokens.accentInk,
    "--wb-line": tokens.line,
    "--wb-deep": tokens.deep,
    "--wb-deep-ink": tokens.deepInk,
  };
}

/**
 * Reorder a page's sections to follow a theme's composition. Sections the theme
 * does not mention keep their relative order after the known ones.
 */
export function orderForTheme<T extends { type: WebsiteSectionType }>(
  sections: T[],
  theme: WebsiteThemeId
): T[] {
  const order = themeMeta(theme).homeOrder;
  const rank = (type: WebsiteSectionType) => {
    const index = order.indexOf(type);
    return index === -1 ? order.length : index;
  };
  return sections
    .map((section, index) => ({ section, index }))
    .sort((a, b) => rank(a.section.type) - rank(b.section.type) || a.index - b.index)
    .map((entry) => entry.section);
}
