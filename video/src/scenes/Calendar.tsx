import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C } from "../theme";
import { STAYS } from "../data";
import { CalendarsPage } from "../mocks/calendar";
import { BrowserWindow, Caption, STAGE, StageCamera, prog, pulse } from "../ui/kit";

/** Centre of the first property card in window coordinates. */
const FOCUS = { x: 599, y: 381 };
const ZOOM = 0.7;

export const CalendarScene: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useCurrentFrame();
  const z = prog(t, 72, 42);
  const stay = STAYS[1];

  return (
    <AbsoluteFill>
      <Caption t={t} start={8} lead="All your properties." accent="One calendar." scrim={z} />
      <StageCamera
        t={t}
        dur={dur}
        origin={`${FOCUS.x}px ${FOCUS.y}px`}
        extra={`translate(${(STAGE.width / 2 - FOCUS.x) * z}px, ${(430 - FOCUS.y) * z}px) scale(${1 + ZOOM * z})`}
      >
        <BrowserWindow width={STAGE.width} height={STAGE.height} url="hostvia.me/dashboard/calendars">
          <CalendarsPage
            t={t}
            dim={z}
            focusGlow={pulse(t, 96, 176, 12)}
            focusStay={{ stay, p: pulse(t, 104, 176, 12) }}
            focusMarkers={[
              { day: stay.checkIn, label: "Arrival", color: C.checkInRing, p: prog(t, 104, 12) },
              { day: stay.checkOut, label: "Departure", color: C.checkOutRing, p: prog(t, 118, 12) },
            ]}
          />
        </BrowserWindow>
      </StageCamera>
    </AbsoluteFill>
  );
};
