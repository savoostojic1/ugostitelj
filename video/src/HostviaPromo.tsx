import React from "react";
import { AbsoluteFill, Easing, Html5Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { AUDIO_OFFSET, SCENES, TOTAL_FRAMES, VO, XFADE } from "./timing";
import { C } from "./theme";
import { IllustrativeTag, SceneEnd, prog } from "./ui/kit";
import { IntroScene } from "./scenes/Intro";
import { CalendarScene } from "./scenes/Calendar";
import { BookingScene } from "./scenes/Booking";
import { CleaningScene } from "./scenes/Cleaning";
import { WebsiteScene } from "./scenes/Website";
import { MessagesScene } from "./scenes/Messages";
import { OutroScene } from "./scenes/Outro";

export type HostviaPromoProps = {
  showIllustrativeTag: boolean;
};

const SCENE_COMPONENTS: Record<string, React.FC<{ dur: number }>> = {
  intro: IntroScene,
  calendar: CalendarScene,
  booking: BookingScene,
  cleaning: CleaningScene,
  website: WebsiteScene,
  messages: MessagesScene,
  outro: OutroScene,
};

const Background: React.FC = () => {
  const f = useCurrentFrame();
  const drift = interpolate(f, [0, TOTAL_FRAMES], [0, 1]);
  return (
    <AbsoluteFill
      style={{
        background: [
          `radial-gradient(1100px 700px at ${12 + drift * 10}% ${-5 + drift * 8}%, rgba(139,92,246,0.24), transparent 62%)`,
          `radial-gradient(1000px 700px at ${92 - drift * 8}% ${105 - drift * 6}%, rgba(34,211,238,0.13), transparent 60%)`,
          `radial-gradient(900px 500px at 50% 50%, rgba(99,102,241,0.06), transparent 70%)`,
          C.bg,
        ].join(", "),
      }}
    />
  );
};

/** Frames the outgoing scene lingers (fading out) after the next one is fully in. */
const TAIL = 10;

/**
 * Cross-dissolve: each scene fades in on top of the previous one, which stays
 * opaque until the incoming scene is fully in, so the background never shows
 * through mid-transition. It then fades out over TAIL so anything the new
 * scene doesn't cover dissolves instead of popping.
 */
const Dissolve: React.FC<{ first: boolean; last: boolean; end: number; children: React.ReactNode }> = ({
  first,
  last,
  end,
  children,
}) => {
  const t = useCurrentFrame();
  const ease = Easing.inOut(Easing.quad);
  const a = (first ? 1 : prog(t, 0, XFADE, ease)) * (last ? 1 : 1 - prog(t, end, TAIL, ease));
  return <AbsoluteFill style={{ opacity: a }}>{children}</AbsoluteFill>;
};

export const HostviaPromo: React.FC<HostviaPromoProps> = ({ showIllustrativeTag }) => {
  const f = useCurrentFrame();
  const tagOpacity = prog(f, 44, 12) * (1 - prog(f, VO.brandName + 40, 12));

  return (
    <AbsoluteFill>
      <Background />
      {SCENES.map((s, i) => {
        const first = i === 0;
        const last = i === SCENES.length - 1;
        const from = first ? 0 : s.from - XFADE / 2;
        const end = (last ? TOTAL_FRAMES : s.to + XFADE / 2) - from;
        const Scene = SCENE_COMPONENTS[s.id];
        return (
          <Sequence key={s.id} from={from} durationInFrames={last ? end : end + TAIL} name={s.id}>
            <SceneEnd.Provider value={last ? Infinity : end}>
              <Dissolve first={first} last={last} end={end}>
                <Scene dur={end} />
              </Dissolve>
            </SceneEnd.Provider>
          </Sequence>
        );
      })}
      <IllustrativeTag visible={showIllustrativeTag} opacity={tagOpacity} />
      <Sequence from={AUDIO_OFFSET} name="voiceover">
        <Html5Audio src={staticFile("audio/hostvia-voiceover.mp3")} volume={1} />
      </Sequence>
    </AbsoluteFill>
  );
};
