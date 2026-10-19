/**
 * All scene boundaries are derived from measured pauses in
 * public/audio/hostvia-voiceover.mp3 (37.88 s, speech ends at 37.68 s).
 *
 * Phrase (voiceover seconds)                     speech start → end
 * 1 "What do you get with Hostvia.me?"            0.00 →  1.98
 * 2 "Manage all your properties…"                 2.50 →  7.90
 * 3 "Add manual bookings…"                        8.35 → 13.74
 * 4 "Organize your cleaning schedules…"          14.23 → 20.68
 * 5 "Get your own accommodation website…"        21.20 → 27.92
 * 6 "Save your most frequently used…"            28.36 → 32.37
 * 7a "Hostvia.me."                               32.88 → 34.05
 * 7b "Everything you need to manage…"            34.52 → 37.68
 *
 * Cuts are placed inside each pause, slightly before the next phrase starts.
 */
export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

/** Short silent lead-in so the video opens cleanly on the logo. */
export const AUDIO_OFFSET = 12;

export const at = (voiceSeconds: number) =>
  Math.round(AUDIO_OFFSET + voiceSeconds * FPS);

export const TOTAL_FRAMES = 1200;

/** Crossfade length between scenes. */
export const XFADE = 12;

export const CUTS = {
  calendar: at(2.25),
  booking: at(8.12),
  cleaning: at(13.98),
  website: at(20.94),
  messages: at(28.14),
  outro: at(32.62),
} as const;

export const VO = {
  brandName: at(32.88),
  tagline: at(34.52),
  speechEnd: at(37.68),
} as const;

export interface SceneSpan {
  id: string;
  from: number;
  to: number;
}

export const SCENES: SceneSpan[] = [
  { id: "intro", from: 0, to: CUTS.calendar },
  { id: "calendar", from: CUTS.calendar, to: CUTS.booking },
  { id: "booking", from: CUTS.booking, to: CUTS.cleaning },
  { id: "cleaning", from: CUTS.cleaning, to: CUTS.website },
  { id: "website", from: CUTS.website, to: CUTS.messages },
  { id: "messages", from: CUTS.messages, to: CUTS.outro },
  { id: "outro", from: CUTS.outro, to: TOTAL_FRAMES },
];
