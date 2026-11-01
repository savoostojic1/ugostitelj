import type { GuestGuideTheme } from "@/lib/guest-guide/types";

export interface ThemeDefinition {
  id: GuestGuideTheme;
  name: string;
  tagline: string;
  description: string;
  swatch: [string, string, string];
}

export const THEME_DEFINITIONS: ThemeDefinition[] = [
  {
    id: "signature-beige",
    name: "Signature Beige",
    tagline: "Editorial & warm",
    description:
      "Warm cream and beige tones with elegant serif headings — a refined hospitality magazine feel.",
    swatch: ["#F3EDE3", "#C4A484", "#2C241B"],
  },
  {
    id: "mediterranean-escape",
    name: "Mediterranean Escape",
    tagline: "Sunlit & natural",
    description:
      "Olive green, sand and warm white with large lifestyle photography and an open coastal atmosphere.",
    swatch: ["#F7F3EA", "#6B7F4A", "#1F2A1A"],
  },
  {
    id: "midnight-luxury",
    name: "Midnight Luxury",
    tagline: "Boutique & dark",
    description:
      "Deep charcoal backgrounds, restrained gold accents and boutique-hotel typography.",
    swatch: ["#12110F", "#C6A75E", "#F4EFE4"],
  },
];

export function getThemeDefinition(theme: GuestGuideTheme): ThemeDefinition {
  return (
    THEME_DEFINITIONS.find((item) => item.id === theme) ?? THEME_DEFINITIONS[0]
  );
}
