import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { WEBSITE_THEME_META } from "@/lib/website-builder/themes";

/**
 * Every palette must keep all text readable at WCAG AA (4.5:1): body, muted and
 * accent-coloured labels, buttons and their hover state, also inside the dark "deep" sections,
 * where the accent is mixed toward the light ink (see website-themes.css).
 */
const DEEP_ACCENT_SHARE = 0.45;

function channels(hex: string): number[] {
  const value = hex.replace("#", "");
  return [0, 2, 4].map((index) => parseInt(value.slice(index, index + 2), 16) / 255);
}
function luminance(rgb: number[]): number {
  return rgb
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
    .reduce((sum, v, index) => sum + v * [0.2126, 0.7152, 0.0722][index], 0);
}
function contrast(a: number[], b: number[]): number {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (high + 0.05) / (low + 0.05);
}
/** CSS color-mix(in srgb, a share, b). */
function mix(a: number[], b: number[], share: number): number[] {
  return a.map((v, index) => v * share + b[index] * (1 - share));
}

describe("palette contrast", () => {
  for (const theme of WEBSITE_THEME_META) {
    for (const palette of theme.palettes) {
      it(`${theme.id} · ${palette.id}`, () => {
        const t = Object.fromEntries(Object.entries(palette.tokens).filter(([, v]) => typeof v === "string" && v.startsWith("#")).map(([k, v]) => [k, channels(v as string)]));
        const check = (label: string, a: number[], b: number[], min: number) =>
          assert.ok(contrast(a, b) >= min, `${label}: ${contrast(a, b).toFixed(2)} < ${min}`);
        check("text on background", t.ink, t.bg, 4.5);
        check("text on surface", t.ink, t.surface, 4.5);
        // Muted text is body-sized (descriptions, calendar hints), so it needs AA too.
        check("muted on background", t.muted, t.bg, 4.5);
        check("muted on surface", t.muted, t.surface, 4.5);
        check("button (background colour on ink)", t.bg, t.ink, 4.5);
        check("button hover (accent ink on accent)", t.accentInk, t.accent, 4.5);
        check("text in deep sections", t.deepInk, t.deep, 4.5);
        // Accent colours small uppercase labels and numbers, so they need AA as well.
        check("accent labels on background", t.accent, t.bg, 4.5);
        check("accent labels on surface", t.accent, t.surface, 4.5);
        const deepAccent = mix(t.accent, t.deepInk, DEEP_ACCENT_SHARE);
        check("accent labels in deep sections", deepAccent, t.deep, 4.5);
        check("button hover in deep sections", t.deep, deepAccent, 4.5);
      });
    }
  }
});
