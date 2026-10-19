import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { C, FONT } from "./theme";

/** Frames extracted from the rendered MP4 into public/contact/ (see README). */
export const SHEET_FRAMES: { time: number; scene: string }[] = [
  { time: 1.0, scene: "1 · Intro" },
  { time: 2.3, scene: "1 · Intro" },
  { time: 4.0, scene: "2 · Calendars" },
  { time: 7.2, scene: "2 · Calendars" },
  { time: 10.0, scene: "3 · Manual bookings" },
  { time: 11.5, scene: "3 · Manual bookings" },
  { time: 13.3, scene: "3 · Manual bookings" },
  { time: 16.0, scene: "4 · Cleanings" },
  { time: 18.5, scene: "4 · Cleanings" },
  { time: 20.3, scene: "4 · Cleanings (shared)" },
  { time: 23.0, scene: "5 · Public website" },
  { time: 27.8, scene: "5 · Public website" },
  { time: 30.0, scene: "6 · Saved messages" },
  { time: 32.0, scene: "6 · Saved messages" },
  { time: 33.8, scene: "7 · Montage" },
  { time: 39.9, scene: "7 · Final frame" },
];

export const SHEET = { width: 1920, height: 1310 };

export const ContactSheet: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg, fontFamily: FONT, color: C.text, padding: "28px 16px" }}>
    <div style={{ fontSize: 30, fontWeight: 700, padding: "0 4px 18px" }}>
      Hostvia.me promo — contact sheet{" "}
      <span style={{ fontSize: 20, fontWeight: 500, color: C.zinc400 }}>
        frames from out/hostvia-promo.mp4 · 1920×1080 · 30 fps · 40.0 s
      </span>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 460px)", gap: 16 }}>
      {SHEET_FRAMES.map((f, i) => (
        <div key={i}>
          <Img
            src={staticFile(`contact/${String(i + 1).padStart(2, "0")}.png`)}
            style={{ width: 460, height: 259, display: "block", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 17, marginTop: 6, color: C.zinc300 }}>
            <span>{f.scene}</span>
            <span style={{ color: C.zinc500 }}>{f.time.toFixed(1)} s</span>
          </div>
        </div>
      ))}
    </div>
  </AbsoluteFill>
);
