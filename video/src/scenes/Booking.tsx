import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { BOOKING_T, BookingPage } from "../mocks/booking";
import { BrowserWindow, Caption, Cursor, STAGE, StageCamera, Toast, prog } from "../ui/kit";

/** "Add reservation" button centre in window coordinates. */
const SUBMIT = { x: 564, y: 742 };

export const BookingScene: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useCurrentFrame();
  const zoomIn = prog(t, 8, 34);
  const pan = prog(t, 112, 30);
  const originX = interpolate(pan, [0, 1], [560, 1180]);

  return (
    <AbsoluteFill>
      <Caption t={t} start={8} lead="Manual bookings." accent="Clear overview." />
      <StageCamera t={t} dur={dur} origin={`${originX}px 470px`} extra={`scale(${1 + 0.07 * zoomIn})`}>
        <BrowserWindow width={STAGE.width} height={STAGE.height} url="hostvia.me/dashboard/manual-reservations/new">
          <BookingPage t={t} />
          <Toast t={t} start={BOOKING_T.click + 4} text="Manual reservation added" placement="top" />
        </BrowserWindow>
        <Cursor
          t={t}
          keys={[
            { t: 98, x: 900, y: 560 },
            { t: 116, x: SUBMIT.x, y: SUBMIT.y },
          ]}
          clicks={[BOOKING_T.click]}
          hideAt={146}
        />
      </StageCamera>
    </AbsoluteFill>
  );
};
