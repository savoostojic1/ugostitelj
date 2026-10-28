import React from "react";
import { Composition } from "remotion";
import { HostviaTikTok } from "./HostviaTikTok";
import { DURATION, FPS, HEIGHT, WIDTH } from "./timing";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="HostviaTikTok1"
    component={HostviaTikTok}
    durationInFrames={DURATION}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
);
