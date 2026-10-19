/** Mirrors the dark dashboard and light public-site tokens from src/app/globals.css. */
export const C = {
  bg: "#06060a",
  card: "#0e0e14",
  popover: "#12121a",
  secondary: "#16161f",
  accent: "#1a1a28",
  border: "rgba(255,255,255,0.08)",
  input: "rgba(255,255,255,0.1)",
  text: "#f4f4f5",
  muted: "#9494a8",
  zinc300: "#d4d4d8",
  zinc400: "#a1a1aa",
  zinc500: "#71717a",
  zinc600: "#52525b",
  violet: "#8b5cf6",
  violet300: "#c4b5fd",
  violet400: "#a78bfa",
  indigo: "#6366f1",
  cyan: "#22d3ee",
  checkIn: "#34d399",
  checkInRing: "#059669",
  checkOut: "#fb7185",
  checkOutRing: "#e11d48",
  stayover: "#60a5fa",
  stayoverRing: "#2563eb",
  empty: "#27272a",
  emptyText: "#a1a1aa",
  emptyRing: "#3f3f46",
  dateBg: "#18181b",
  dateText: "#e4e4e7",
  todayBg: "#1e1b4b",
  todayText: "#a5b4fc",
  todayRing: "#4338ca",
  rowToday: "#13131a",
  airbnb: "#ff5a5f",
  booking: "#003580",
  direct: "#059669",
} as const;

export const PUBLIC = {
  bg: "#ffffff",
  subtle: "#f7f7f5",
  fg: "#171717",
  muted: "#6b6b6b",
  border: "#e7e5e4",
  accent: "#0f172a",
} as const;

export const BRAND_GRADIENT =
  "linear-gradient(135deg, #8b5cf6 0%, #6366f1 45%, #22d3ee 100%)";
export const ICON_GRADIENT = "linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)";

export const FONT = "Geist, 'Helvetica Neue', Arial, sans-serif";

/** Dark-theme property palette (--calendar-property-1..4). */
export const PROPERTY_COLORS = ["#818cf8", "#f472b6", "#2dd4bf", "#fbbf24"];

export const propertyGradient = (solid: string) =>
  `linear-gradient(145deg, color-mix(in srgb, ${solid} 88%, white) 0%, ${solid} 100%)`;

/** Sample data used only inside this video. All names are fictional. */
export const PROPERTIES = [
  { name: "Sea View Apartment", color: PROPERTY_COLORS[0] },
  { name: "Olive Studio", color: PROPERTY_COLORS[1] },
  { name: "Pine Bungalow", color: PROPERTY_COLORS[2] },
  { name: "Stone House", color: PROPERTY_COLORS[3] },
];

export const HOST_SITE = {
  title: "Adriatic Stays",
  url: "adriaticstays.hostvia.me",
};
