import React, { ReactNode } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FONT, HOST_SITE } from "../theme";
import { CalendarsPage } from "../mocks/calendar";
import { CleaningsPage } from "../mocks/cleanings";
import { DashboardPage } from "../mocks/dashboard";
import { WebsiteDesktop } from "../mocks/website";
import {
  BrowserWindow,
  Caption,
  KineticText,
  LogoMark,
  OVERSHOOT,
  STAGE,
  Wordmark,
  float,
  prog,
  toWords,
} from "../ui/kit";

const MINI = 0.4;
const W = STAGE.width * MINI;
const H = STAGE.height * MINI;
const GAP = 34;

const Mini: React.FC<{ i: number; t: number; out: number; children: ReactNode }> = ({ i, t, out, children }) => {
  const col = i % 2;
  const row = Math.floor(i / 2);
  const p = prog(t, i * 4, 22);
  const left = 960 + (col === 0 ? -W - GAP / 2 : GAP / 2);
  const top = 222 + row * (H + GAP);
  const drift = interpolate(t, [0, 90], [0, col === 0 ? -14 : 14]);
  return (
    <div
      style={{
        position: "absolute",
        left: left + drift,
        top,
        width: W,
        height: H,
        opacity: p * (1 - out),
        filter: out > 0.01 ? `blur(${out * 8}px)` : undefined,
        transform: `translateY(${(1 - p) * 40 + out * (row === 0 ? -40 : 40)}px) scale(${
          0.94 + 0.06 * p - 0.06 * out
        }) ${float(t, 20 + i, 0.6 * p)}`,
      }}
    >
      <div style={{ width: STAGE.width, height: STAGE.height, transform: `scale(${MINI})`, transformOrigin: "0 0" }}>
        {children}
      </div>
    </div>
  );
};

export const OutroScene: React.FC = () => {
  const t = useCurrentFrame();
  const out = prog(t, 56, 24);
  const logo = prog(t, 64, 26);
  const logoLand = prog(t, 64, 30, OVERSHOOT);
  const done = { count: 0, checkIn: 0, checkOut: 0 };

  return (
    <AbsoluteFill>
      <Caption t={t} start={4} lead="Hostvia.me" exitAt={50} />
      <Mini i={0} t={t} out={out}>
        <BrowserWindow width={STAGE.width} height={STAGE.height} url="hostvia.me/dashboard/calendars">
          <CalendarsPage t={300} />
        </BrowserWindow>
      </Mini>
      <Mini i={1} t={t} out={out}>
        <BrowserWindow width={STAGE.width} height={STAGE.height} url="hostvia.me/dashboard/cleanings">
          <CleaningsPage t={300} emph={done} />
        </BrowserWindow>
      </Mini>
      <Mini i={2} t={t} out={out}>
        <BrowserWindow width={STAGE.width} height={STAGE.height} url={HOST_SITE.url} light>
          <WebsiteDesktop t={0} />
        </BrowserWindow>
      </Mini>
      <Mini i={3} t={t} out={out}>
        <BrowserWindow width={STAGE.width} height={STAGE.height} url="hostvia.me/dashboard">
          <DashboardPage t={300} />
        </BrowserWindow>
      </Mini>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 400,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 30,
          opacity: logo,
          filter: logo < 0.99 ? `blur(${(1 - logo) * 14}px)` : undefined,
          transform: `translateY(${(1 - logoLand) * 34}px) scale(${0.86 + 0.14 * logoLand}) ${float(t, 11, 0.8 * logo)}`,
        }}
      >
        <LogoMark size={124} />
        <Wordmark fontSize={108} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 590,
          textAlign: "center",
          fontFamily: FONT,
          fontSize: 50,
          fontWeight: 500,
          letterSpacing: "-0.02em",
          color: "#d4d4d8",
        }}
      >
        <KineticText t={t} start={72} words={toWords("Manage your properties in one place.")} seed={13} floatAmp={0.5} />
      </div>
    </AbsoluteFill>
  );
};
