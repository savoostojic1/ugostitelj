import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { CleaningPhone, CleaningsPage, TeamAccessCard } from "../mocks/cleanings";
import { BrowserWindow, Caption, OVERSHOOT, STAGE, StageCamera, float, prog, pulse } from "../ui/kit";

export const CleaningScene: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useCurrentFrame();
  const share = prog(t, 134, 26);
  const shareLand = prog(t, 134, 32, OVERSHOOT);
  const card = prog(t, 150, 20);
  const cardLand = prog(t, 150, 26, OVERSHOOT);
  const emph = {
    count: pulse(t, 28, 74),
    checkOut: pulse(t, 78, 112),
    checkIn: pulse(t, 104, 140),
  };

  return (
    <AbsoluteFill>
      <Caption t={t} start={8} lead="Cleaning." accent="Arrivals. Departures." />
      <StageCamera t={t} dur={dur}>
        <BrowserWindow width={STAGE.width} height={STAGE.height} url="hostvia.me/dashboard/cleanings">
          <CleaningsPage t={t} emph={emph} />
          <div style={{ position: "absolute", inset: 0, background: `rgba(6,6,10,${0.5 * share})` }} />
        </BrowserWindow>
      </StageCamera>
      <div
        style={{
          position: "absolute",
          left: 1440,
          top: 236,
          opacity: share,
          transform: `translateX(${(1 - shareLand) * 420}px) rotate(${(1 - shareLand) * 6}deg) ${float(
            t,
            4,
            0.7 * share
          )}`,
        }}
      >
        <CleaningPhone emph={{ count: pulse(t, 160, 210), checkOut: 0, checkIn: 0 }} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 990,
          top: 760,
          opacity: card,
          filter: card < 0.99 ? `blur(${(1 - card) * 8}px)` : undefined,
          transform: `translateY(${(1 - cardLand) * 40}px) ${float(t, 8, 0.6 * card)}`,
        }}
      >
        <TeamAccessCard />
      </div>
    </AbsoluteFill>
  );
};
