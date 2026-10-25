import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { CalendarScene, CleaningScene, CtaScene, DashboardScene, ProblemScene, WebsiteScene } from "./scenes";
import { CLAMP } from "./ui";
import { DURATION, FADE, LOOP_DONE, LOOP_IN } from "./theme";

const enter = (frame: number, from: number, until: number) => {
  if (frame < from || frame >= until) return 0;
  if (from === 0) return 1;
  return interpolate(frame, [from, from + FADE], [0, 1], CLAMP);
};

/**
 * 15.0s, 30fps. Scene cuts sit on the storyboard beats, with a little extra
 * time on the website and the closing card so the type stays readable.
 * The last frames match the opening so the GIF can loop.
 */
export const RedditAd: React.FC = () => {
  const frame = useCurrentFrame();
  const reprise = frame < LOOP_IN ? 0 : interpolate(frame, [LOOP_IN, LOOP_DONE], [0, 1], CLAMP);

  return (
    <AbsoluteFill>
      <Layer opacity={enter(frame, 0, 90 + FADE)}>
        <ProblemScene t={frame} />
      </Layer>
      <Layer opacity={enter(frame, 90, 180 + FADE)}>
        <DashboardScene t={frame - 90} />
      </Layer>
      <Layer opacity={enter(frame, 180, 240 + FADE)}>
        <CalendarScene t={frame - 180} />
      </Layer>
      <Layer opacity={enter(frame, 240, 294 + FADE)}>
        <CleaningScene t={frame - 240} />
      </Layer>
      <Layer opacity={enter(frame, 294, 360 + FADE)}>
        <WebsiteScene t={frame - 294} />
      </Layer>
      <Layer opacity={enter(frame, 360, DURATION)}>
        <CtaScene t={frame - 360} />
      </Layer>
      <Layer opacity={reprise}>
        <ProblemScene t={0} />
      </Layer>
    </AbsoluteFill>
  );
};

const Layer: React.FC<{ opacity: number; children: React.ReactNode }> = ({ opacity, children }) => {
  if (opacity <= 0.001) return null;
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};
