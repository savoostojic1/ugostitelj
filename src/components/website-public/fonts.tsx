import {
  Cormorant_Garamond,
  Figtree,
  Fraunces,
  Geist,
  Geist_Mono,
  Instrument_Sans,
  Instrument_Serif,
  Jost,
  Newsreader,
  Outfit,
} from "next/font/google";

/*
 * preload: false — every published page carries the variables for all themes,
 * but a browser only downloads a face that the page actually uses.
 */
const luxeSerif = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-wb-luxe-serif",
  display: "swap",
  preload: false,
});
const luxeSans = Outfit({
  subsets: ["latin", "latin-ext"],
  variable: "--font-wb-luxe-sans",
  display: "swap",
  preload: false,
});
const coastalSerif = Fraunces({
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  axes: ["SOFT", "opsz"],
  variable: "--font-wb-coastal-serif",
  display: "swap",
  preload: false,
});
const coastalSans = Figtree({
  subsets: ["latin", "latin-ext"],
  variable: "--font-wb-coastal-sans",
  display: "swap",
  preload: false,
});
const natureSerif = Newsreader({
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-wb-nature-serif",
  display: "swap",
  preload: false,
});
const natureSans = Instrument_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-wb-nature-sans",
  display: "swap",
  preload: false,
});
const minimalSans = Geist({
  subsets: ["latin", "latin-ext"],
  variable: "--font-wb-minimal-sans",
  display: "swap",
  preload: false,
});
const minimalMono = Geist_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-wb-minimal-mono",
  display: "swap",
  preload: false,
});
const escapeSerif = Instrument_Serif({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-wb-escape-serif",
  display: "swap",
  preload: false,
});
const escapeSans = Jost({
  subsets: ["latin", "latin-ext"],
  variable: "--font-wb-escape-sans",
  display: "swap",
  preload: false,
});

export const websiteFontClassName = [
  luxeSerif.variable,
  luxeSans.variable,
  coastalSerif.variable,
  coastalSans.variable,
  natureSerif.variable,
  natureSans.variable,
  minimalSans.variable,
  minimalMono.variable,
  escapeSerif.variable,
  escapeSans.variable,
].join(" ");
