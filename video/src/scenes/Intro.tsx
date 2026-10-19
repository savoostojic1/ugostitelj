import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FONT } from "../theme";
import { DashboardPage } from "../mocks/dashboard";
import {
  BrowserWindow,
  KineticText,
  LogoMark,
  OVERSHOOT,
  STAGE,
  SceneEnd,
  Word,
  Wordmark,
  float,
  prog,
  toWords,
} from "../ui/kit";

const QUESTION: Word[] = [...toWords("What do you get with", "Hostvia.me"), { text: "?", glue: true }];

export const IntroScene: React.FC = () => {
  const t = useCurrentFrame();
  const end = React.useContext(SceneEnd);
  const logoIn = prog(t, 0, 20);
  const logoLand = prog(t, 0, 26, OVERSHOOT);
  const move = prog(t, 38, 26);
  const dash = prog(t, 40, 32);

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: 330,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 30,
          opacity: logoIn * (1 - move),
          filter: logoIn < 0.99 || move > 0.01 ? `blur(${(1 - logoIn) * 14 + move * 8}px)` : undefined,
          transform: `translateY(${(1 - logoLand) * 30 - move * 140}px) scale(${0.86 + 0.14 * logoLand}) ${float(
            t,
            3,
            0.8 * logoIn
          )}`,
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
          top: interpolate(move, [0, 1], [530, 62]),
          textAlign: "center",
          fontFamily: FONT,
          fontSize: interpolate(move, [0, 1], [74, 68]),
          fontWeight: 700,
          letterSpacing: "-0.035em",
          color: "white",
          zIndex: 10,
        }}
      >
        <KineticText t={t} start={10} words={QUESTION} exitAt={end - 18} seed={7} />
      </div>
      <div
        style={{
          position: "absolute",
          left: STAGE.left,
          top: STAGE.top,
          width: STAGE.width,
          height: STAGE.height,
          opacity: dash,
          transformOrigin: "50% 0%",
          transform: `perspective(2600px) translateY(${(1 - dash) * 620}px) rotateX(${(1 - dash) * 16}deg)`,
        }}
      >
        <BrowserWindow width={STAGE.width} height={STAGE.height} url="hostvia.me/dashboard">
          <DashboardPage t={t - 40} />
        </BrowserWindow>
      </div>
    </AbsoluteFill>
  );
};
