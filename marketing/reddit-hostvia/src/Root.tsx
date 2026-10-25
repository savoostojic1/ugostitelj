import React from "react";
import { Composition, staticFile } from "remotion";
import { loadFont } from "@remotion/fonts";
import { RedditAd } from "./RedditAd";
import { CANVAS, DURATION, FPS } from "./theme";

for (const [file, weight] of [
  ["Geist-Regular", "400"],
  ["Geist-Medium", "500"],
  ["Geist-SemiBold", "600"],
  ["Geist-Bold", "700"],
] as const) {
  loadFont({ family: "Geist", url: staticFile(`fonts/${file}.woff2`), weight });
}

export const RemotionRoot: React.FC = () => (
  <Composition
    id="HostviaRedditAd"
    component={RedditAd}
    durationInFrames={DURATION}
    fps={FPS}
    width={CANVAS}
    height={CANVAS}
  />
);
