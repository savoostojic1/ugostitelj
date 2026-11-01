import { Plus_Jakarta_Sans } from "next/font/google";

/**
 * Serif display face uses a curated system stack in guide-theme.css
 * (--font-gg-serif) to avoid brittle Google Fonts fetch failures at build time.
 * Sans matches the rest of Hostvia.
 */
export const guestGuideSans = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-gg-sans",
  display: "swap",
});

export function guestGuideFontClassNames(): string {
  return guestGuideSans.variable;
}
