export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

// Narration: 31.556 s (ffprobe). The video ends on the last audio sample.
export const AUDIO_SECONDS = 31.556;
export const DURATION = Math.ceil(AUDIO_SECONDS * FPS);

export const f = (seconds: number) => Math.round(seconds * FPS);

export type ShotSpec = {
  src: string;
  sourceSeconds: number;
  from: number;
  to: number;
  scale: [number, number];
  origin: string;
  sourceStart?: number;
};

// Cut points sit in or near measured narration pauses (silencedetect -38 dB).
// The 60 fps clips play at ~0.46x so each output frame is still (almost always) a new source frame.
export const SHOTS: ShotSpec[] = [
  { src: "clips/IMG_5917.mov", sourceSeconds: 2.068, from: 0, to: 4.5, scale: [1.0, 1.07], origin: "40% 55%" },
  { src: "clips/IMG_5970.mov", sourceSeconds: 1.266, from: 4.0, to: 6.75, scale: [1.04, 1.0], origin: "35% 50%" },
  { src: "clips/IMG_7860.mov", sourceSeconds: 2.801, from: 6.25, to: 12.2, scale: [1.0, 1.06], origin: "55% 45%" },
  {
    src: "clips/2624387e4e4f4af9b64da4c4dd46c8d0.mov",
    sourceSeconds: 3.341,
    from: 11.7,
    to: 15.4,
    scale: [1.02, 1.08],
    origin: "50% 55%",
  },
];

export const SHOT_FADE = 0.5;

export const PRODUCT_IN = 14.9;
export const PRODUCT_IN_DURATION = 0.5;

export type ScreenSpec = {
  img: string;
  imgCssHeight: number;
  from: number;
  to: number;
  // Camera position in CSS pixels of the 390 px wide mobile page.
  y: [number, number];
  zoom: [number, number];
  // Portion of the segment (0–1) during which the camera moves.
  move: [number, number];
};

export const SCREENS: ScreenSpec[] = [
  { img: "ui/dashboard-top.png", imgCssHeight: 600, from: PRODUCT_IN, to: 20.3, y: [0, 0], zoom: [1.0, 1.035], move: [0, 1] },
  { img: "ui/calendars.png", imgCssHeight: 1020, from: 20.0, to: 23.3, y: [44, 262], zoom: [1, 1], move: [0.3, 0.95] },
  { img: "ui/arrivals.png", imgCssHeight: 700, from: 23.0, to: 24.4, y: [84, 104], zoom: [1, 1], move: [0, 1] },
  { img: "ui/cleanings.png", imgCssHeight: 1300, from: 24.1, to: 27.6, y: [56, 600], zoom: [1, 1], move: [0.24, 0.68] },
  { img: "ui/dashboard-properties.png", imgCssHeight: 599, from: 27.25, to: 29.5, y: [44, 64], zoom: [1, 1], move: [0, 1] },
];

export const SCREEN_FADE = 0.3;

export const BRAND_IN = 29.1;
export const BRAND_FADE = 0.45;
