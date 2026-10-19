import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { MESSAGES, MSG_GEOM, MessagesPage, SELECTED } from "../mocks/messages";
import { BrowserWindow, Caption, Cursor, STAGE, StageCamera, Toast, prog, pulse } from "../ui/kit";

const CLICK_OPEN = 50;
const CLICK_COPY = 84;

export const MessagesScene: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useCurrentFrame();
  const open = prog(t, CLICK_OPEN + 1, 10) * (1 - prog(t, CLICK_COPY + 8, 10));
  const hover = prog(t, 68, 8);
  const selected = pulse(t, CLICK_COPY, CLICK_COPY + 14, 4);
  const cardGlow = pulse(t, CLICK_COPY + 8, dur - 4, 12);

  return (
    <AbsoluteFill>
      <Caption t={t} start={8} lead="Your messages." accent="Ready to use." />
      <StageCamera t={t} dur={dur}>
        <BrowserWindow width={STAGE.width} height={STAGE.height} url="hostvia.me/dashboard/porouka">
          <MessagesPage t={t} open={open} hover={hover} selected={selected} cardGlow={cardGlow} />
          <Toast t={t} start={CLICK_COPY + 4} text={`"${MESSAGES[SELECTED].name}" copied`} />
          <Cursor
            t={t}
            keys={[
              { t: 30, x: 1060, y: 420 },
              { t: 46, x: MSG_GEOM.messagesButton.x, y: MSG_GEOM.messagesButton.y },
              { t: 56, x: MSG_GEOM.messagesButton.x, y: MSG_GEOM.messagesButton.y },
              { t: 76, x: MSG_GEOM.itemX, y: MSG_GEOM.itemY(SELECTED) },
            ]}
            clicks={[CLICK_OPEN, CLICK_COPY]}
            hideAt={118}
          />
        </BrowserWindow>
      </StageCamera>
    </AbsoluteFill>
  );
};
