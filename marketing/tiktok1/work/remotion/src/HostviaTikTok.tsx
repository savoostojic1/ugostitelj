import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/PlusJakartaSans";
import { CAPTIONS } from "./captions";
import {
  BRAND_FADE,
  BRAND_IN,
  f,
  FPS,
  PRODUCT_IN,
  PRODUCT_IN_DURATION,
  SCREEN_FADE,
  SCREENS,
  SHOT_FADE,
  SHOTS,
  type ScreenSpec,
  type ShotSpec,
} from "./timing";

const { fontFamily } = loadFont("normal", {
  weights: ["500", "600", "700"],
  subsets: ["latin"],
});

const ease = Easing.bezier(0.45, 0, 0.55, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Product card geometry. Right edge stays clear of the TikTok action rail.
const CARD = { left: 84, top: 170, width: 880, height: 1080, radius: 46 };
const PAGE_CSS_WIDTH = 390;
const CAPTION_TOP = 1300;

const Shot: React.FC<{ shot: ShotSpec; fadeIn: boolean; blurOut?: boolean }> = ({ shot, fadeIn, blurOut }) => {
  const frame = useCurrentFrame();
  const length = f(shot.to) - f(shot.from);
  const rate = (shot.sourceSeconds - 0.04) / (length / FPS);
  const progress = frame / length;
  const scale = interpolate(progress, [0, 1], shot.scale, clamp);
  const opacity = fadeIn ? interpolate(frame, [0, f(SHOT_FADE)], [0, 1], { ...clamp, easing: ease }) : 1;
  const blurStart = f(PRODUCT_IN - shot.from);
  const blur = blurOut ? interpolate(frame, [blurStart, blurStart + f(PRODUCT_IN_DURATION)], [0, 14], clamp) : 0;

  return (
    <AbsoluteFill style={{ opacity, overflow: "hidden" }}>
      <OffthreadVideo
        src={staticFile(shot.src)}
        playbackRate={rate}
        muted
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale})`,
          transformOrigin: shot.origin,
          filter: blur > 0 ? `blur(${blur}px)` : undefined,
        }}
      />
    </AbsoluteFill>
  );
};

const ScreenLayer: React.FC<{ screen: ScreenSpec; fadeIn: boolean }> = ({ screen, fadeIn }) => {
  const frame = useCurrentFrame();
  const length = f(screen.to) - f(screen.from);
  const t = interpolate(frame, [length * screen.move[0], length * screen.move[1]], [0, 1], { ...clamp, easing: ease });
  const y = interpolate(t, [0, 1], screen.y);
  const drift = interpolate(frame, [0, length], [1, 1.025], clamp);
  const zoom = interpolate(frame, [0, length], screen.zoom, clamp) * drift;
  const k = CARD.width / PAGE_CSS_WIDTH;
  const opacity = fadeIn ? interpolate(frame, [0, f(SCREEN_FADE)], [0, 1], { ...clamp, easing: ease }) : 1;
  const xShift = ((PAGE_CSS_WIDTH - PAGE_CSS_WIDTH / zoom) / 2) * k * zoom;

  return (
    <AbsoluteFill style={{ opacity, backgroundColor: "#060608" }}>
      <Img
        src={staticFile(screen.img)}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: CARD.width,
          height: screen.imgCssHeight * k,
          transformOrigin: "0 0",
          transform: `translate(${-xShift}px, ${-y * k * zoom}px) scale(${zoom})`,
        }}
      />
    </AbsoluteFill>
  );
};

const ProductSection: React.FC = () => {
  const frame = useCurrentFrame();
  const inLen = f(PRODUCT_IN_DURATION);
  const bgOpacity = interpolate(frame, [0, inLen], [0, 1], { ...clamp, easing: ease });
  const cardOpacity = interpolate(frame, [2, inLen + 4], [0, 1], { ...clamp, easing: ease });
  const cardLift = interpolate(frame, [0, inLen + 8], [36, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  const brandStart = f(BRAND_IN - PRODUCT_IN);
  const outOpacity = interpolate(frame, [brandStart, brandStart + f(BRAND_FADE)], [1, 0], { ...clamp, easing: ease });

  return (
    <AbsoluteFill style={{ opacity: outOpacity }}>
      <AbsoluteFill
        style={{
          opacity: bgOpacity,
          background:
            "radial-gradient(900px 700px at 20% 12%, rgba(139,92,246,0.16), transparent 70%), radial-gradient(800px 700px at 85% 80%, rgba(6,182,212,0.08), transparent 70%), #07070a",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: CARD.left,
          top: CARD.top,
          width: CARD.width,
          height: CARD.height,
          borderRadius: CARD.radius,
          overflow: "hidden",
          opacity: cardOpacity,
          transform: `translateY(${cardLift}px)`,
          boxShadow: "0 30px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.09)",
          backgroundColor: "#060608",
        }}
      >
        {SCREENS.map((screen, i) => (
          <Sequence
            key={screen.img}
            from={f(screen.from) - f(PRODUCT_IN)}
            durationInFrames={f(screen.to) - f(screen.from)}
            layout="none"
          >
            <AbsoluteFill>
              <ScreenLayer screen={screen} fadeIn={i > 0} />
            </AbsoluteFill>
          </Sequence>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const SparklesIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.07l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.947a2 2 0 0 0 1.437-1.437l1.582-6.135a.5.5 0 0 1 .963 0l1.581 6.135a2 2 0 0 0 1.437 1.437l6.135 1.581a.5.5 0 0 1 0 .964l-6.135 1.581a2 2 0 0 0-1.437 1.437l-1.581 6.135a.5.5 0 0 1-.963 0l-1.581-6.135a2 2 0 0 0-1.437-1.437z" />
    <path d="M20 3v4" />
    <path d="M22 5h-4" />
    <path d="M4 17v2" />
    <path d="M5 18H3" />
  </svg>
);

const Brand: React.FC = () => {
  const frame = useCurrentFrame();
  const fade = f(BRAND_FADE);
  const opacity = interpolate(frame, [0, fade], [0, 1], { ...clamp, easing: ease });
  const iconScale = interpolate(frame, [0, fade + 10], [0.94, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const wordOpacity = interpolate(frame, [6, fade + 8], [0, 1], { ...clamp, easing: ease });
  const wordLift = interpolate(frame, [6, fade + 12], [14, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  const settle = interpolate(frame, [0, f(32 - BRAND_IN)], [1, 1.04], clamp);
  const icon = 176;

  return (
    <AbsoluteFill
      style={{
        opacity,
        background:
          "radial-gradient(900px 800px at 50% 40%, rgba(139,92,246,0.14), transparent 70%), #07070a",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 560,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 44,
          transform: `scale(${settle})`,
        }}
      >
        <div
          style={{
            width: icon,
            height: icon,
            borderRadius: Math.round(icon * 0.22),
            background: "linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${iconScale})`,
            boxShadow: "0 20px 60px rgba(139,92,246,0.35)",
          }}
        >
          <SparklesIcon size={Math.round(icon * 0.44)} />
        </div>
        <div
          style={{
            fontFamily,
            fontWeight: 600,
            fontSize: 104,
            letterSpacing: -2.5,
            color: "white",
            opacity: wordOpacity,
            transform: `translateY(${wordLift}px)`,
          }}
        >
          hostvia<span style={{ color: "#a78bfa" }}>.me</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const renderCaptionText = (text: string) =>
  text.split(/(\*[^*]+\*)/g).filter(Boolean).map((part, i) =>
    part.startsWith("*") ? (
      <span key={i} style={{ color: "#d9ccff" }}>
        {part.slice(1, -1)}
      </span>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );

const Caption: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 4], [0, 1], clamp);
  const lift = interpolate(frame, [0, 6], [10, 0], { ...clamp, easing: Easing.out(Easing.cubic) });

  return (
    <div
      style={{
        position: "absolute",
        top: CAPTION_TOP,
        left: 70,
        width: 900,
        display: "flex",
        justifyContent: "center",
        opacity,
        transform: `translateY(${lift}px)`,
      }}
    >
      <div
        style={{
          fontFamily,
          fontWeight: 600,
          fontSize: 54,
          lineHeight: 1.22,
          letterSpacing: -0.5,
          color: "white",
          textAlign: "center",
          whiteSpace: "nowrap",
          padding: "14px 28px 16px",
          borderRadius: 20,
          backgroundColor: "rgba(8,8,12,0.34)",
          textShadow: "0 2px 14px rgba(0,0,0,0.55)",
        }}
      >
        {renderCaptionText(text)}
      </div>
    </div>
  );
};

export const HostviaTikTok: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#07070a" }}>
      {SHOTS.map((shot, i) => (
        <Sequence key={shot.src} from={f(shot.from)} durationInFrames={f(shot.to) - f(shot.from)}>
          <Shot shot={shot} fadeIn={i > 0} blurOut={i === SHOTS.length - 1} />
        </Sequence>
      ))}

      <Sequence from={f(PRODUCT_IN)}>
        <ProductSection />
      </Sequence>

      <Sequence from={f(BRAND_IN)}>
        <Brand />
      </Sequence>

      {CAPTIONS.map((c) => (
        <Sequence key={c.start} from={f(c.start)} durationInFrames={Math.max(1, f(c.end) - f(c.start))}>
          <Caption text={c.text} />
        </Sequence>
      ))}

      <Audio src={staticFile("audio/narration.mp3")} />
    </AbsoluteFill>
  );
};
