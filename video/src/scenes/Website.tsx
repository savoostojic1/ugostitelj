import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Check } from "lucide-react";
import { C, FONT, HOST_SITE } from "../theme";
import { PHONE_SEND_BUTTON, WEBSITE_T, WebsiteDesktop, WebsitePhone } from "../mocks/website";
import { BrowserWindow, Caption, Cursor, OVERSHOOT, float, prog } from "../ui/kit";

export const WebsiteScene: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useCurrentFrame();
  const enter = prog(t, 0, 26);
  const phone = prog(t, WEBSITE_T.phone, 26);
  const phoneLand = prog(t, WEBSITE_T.phone, 30, OVERSHOOT);
  const chip = prog(t, 166, 16);
  const chipLand = prog(t, 166, 22, OVERSHOOT);
  const chipOut = prog(t, dur - 14, 14);
  const push = interpolate(t, [0, dur], [1, 1.025]);

  return (
    <AbsoluteFill>
      <Caption t={t} start={8} lead="Your website." accent="Direct guest inquiries." />
      <div
        style={{
          position: "absolute",
          left: 150,
          top: 210,
          transformOrigin: "50% 50%",
          transform: `perspective(2600px) translateY(${(1 - enter) * 22}px) rotateX(${(1 - enter) * 4}deg) scale(${
            (0.98 + 0.02 * enter) * push
          })`,
        }}
      >
        <BrowserWindow width={1230} height={810} url={HOST_SITE.url} light>
          <WebsiteDesktop t={t} />
        </BrowserWindow>
      </div>
      <div
        style={{
          position: "absolute",
          left: 1420,
          top: 226,
          opacity: phone,
          transform: `translateY(${(1 - phoneLand) * 260}px) rotate(${(1 - phoneLand) * 4}deg) ${float(
            t,
            5,
            0.7 * phone
          )}`,
        }}
      >
        <WebsitePhone t={t} />
        <Cursor
          t={t}
          keys={[
            { t: 132, x: 330, y: 560 },
            { t: 146, x: PHONE_SEND_BUTTON.x, y: PHONE_SEND_BUTTON.y },
          ]}
          clicks={[WEBSITE_T.click]}
          hideAt={170}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 146,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 10,
          fontFamily: FONT,
          fontSize: 28,
          fontWeight: 500,
          color: "#d4d4d8",
          opacity: chip * (1 - chipOut),
          filter: chip < 0.99 || chipOut > 0.01 ? `blur(${(1 - chip) * 8 + chipOut * 8}px)` : undefined,
          transform: `translateY(${(1 - chipLand) * 18 - chipOut * 20}px) ${float(t, 9, 0.5 * chip)}`,
          zIndex: 60,
        }}
      >
        <Check size={26} color={C.checkIn} strokeWidth={3} />
        No booking commission from Hostvia.me
      </div>
    </AbsoluteFill>
  );
};
