import React from "react";
import { Composition, Still, staticFile } from "remotion";
import { ContactSheet, SHEET } from "./ContactSheet";
import { loadFont } from "@remotion/fonts";
import { HostviaPromo, HostviaPromoProps } from "./HostviaPromo";
import { FPS, HEIGHT, TOTAL_FRAMES, WIDTH } from "./timing";

for (const [file, weight] of [
  ["Geist-Regular", "400"],
  ["Geist-Medium", "500"],
  ["Geist-SemiBold", "600"],
  ["Geist-Bold", "700"],
] as const) {
  loadFont({ family: "Geist", url: staticFile(`fonts/${file}.woff2`), weight });
}

const defaultProps: HostviaPromoProps = { showIllustrativeTag: true };

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="HostviaPromo"
      component={HostviaPromo}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={defaultProps}
    />
    <Still id="ContactSheet" component={ContactSheet} width={SHEET.width} height={SHEET.height} />
  </>
);
