/** Tokens taken from the dark dashboard and the light public site in src/app/globals.css. */

export const FONT = "Geist, 'Helvetica Neue', Arial, sans-serif";

export const CANVAS = 1200;
export const FPS = 30;
export const DURATION = 450;
export const FADE = 10;

/** Problem scene returns over the end so the GIF can loop. */
export const LOOP_IN = 428;
export const LOOP_DONE = 444;

export const CAPTION_X = 76;
export const CAPTION_Y = 44;
export const CAPTION_W = 1048;
export const CAPTION_H = 124;
export const STAGE_X = 60;
export const STAGE_Y = 188;
export const STAGE_W = CANVAS - STAGE_X * 2;
export const STAGE_H = CANVAS - STAGE_Y - 48;

export const BG =
  "radial-gradient(820px 520px at 0% 0%, rgba(139,92,246,0.10), transparent 62%), radial-gradient(760px 480px at 100% 100%, rgba(15,148,136,0.09), transparent 58%), #f4f2ec";

export const C = {
  bg: "#06060a",
  text: "#f4f4f5",
  muted: "#a1a1aa",
  zinc500: "#71717a",
  border: "rgba(255,255,255,0.08)",
  violet: "#a78bfa",
  violetSoft: "rgba(139,92,246,0.16)",
  checkIn: "#34d399",
  checkInRing: "#059669",
  checkOut: "#fb7185",
  checkOutRing: "#e11d48",
  stayover: "#60a5fa",
  stayoverRing: "#2563eb",
  empty: "#27272a",
  emptyText: "#a1a1aa",
  todayBg: "#1e1b4b",
  todayText: "#a5b4fc",
  todayRing: "#4338ca",
  rowToday: "#13131a",
  dateBg: "#18181b",
  airbnb: "#ff5a5f",
  booking: "#003580",
  direct: "#059669",
} as const;

export const PUBLIC = {
  bg: "#fafcfc",
  card: "#ffffff",
  subtle: "#f4f8f8",
  fg: "#1a2424",
  muted: "#5c6b6b",
  border: "rgba(15,118,110,0.14)",
  accentSoft: "#e8f7f5",
  success: "#15803d",
  successSoft: "#dcfce7",
  button: "linear-gradient(135deg, #0f7a7a 0%, #0d6e6e 45%, #0a5858 100%)",
} as const;

export const ICON_GRADIENT = "linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)";

/** Dark-theme --calendar-property-1 and --calendar-property-2. */
export const PROPERTY_COLORS = ["#818cf8", "#f472b6"] as const;

/** Same sequence as COMPACT_RESERVATION_COLORS, applied in check-in order. */
export const BAR_COLORS = ["#2563eb", "#dc2626", "#16a34a", "#ea580c"] as const;
