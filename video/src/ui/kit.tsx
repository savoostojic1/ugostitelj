import React, { CSSProperties, ReactNode } from "react";
import { Easing, interpolate } from "remotion";
import {
  CalendarDays,
  CalendarPlus,
  Check,
  ChevronDown,
  Copy,
  Globe,
  Home,
  Inbox,
  LayoutDashboard,
  LayoutGrid,
  Lock,
  MessageSquare,
  Plus,
  RefreshCw,
  Sparkles,
  SprayCan,
} from "lucide-react";
import { C, FONT, ICON_GRADIENT } from "../theme";

export const EASE = Easing.bezier(0.22, 1, 0.36, 1);

export const prog = (t: number, start: number, dur = 14, easing = EASE) =>
  interpolate(t, [start, start + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

/** 0 → 1 → 0 envelope for temporary highlights. */
export const pulse = (t: number, start: number, end: number, ramp = 10) =>
  prog(t, start, ramp) * (1 - prog(t, end, ramp));

export const fadeUp = (t: number, start: number, dur = 14, dist = 20): CSSProperties => {
  const p = prog(t, start, dur);
  return { opacity: p, transform: `translateY(${(1 - p) * dist}px)` };
};

export const typed = (text: string, t: number, start: number, charsPerFrame = 1.1) =>
  text.slice(0, Math.max(0, Math.floor((t - start) * charsPerFrame)));

export const glow = (p: number, color: string, ring = 3): CSSProperties =>
  p <= 0.001
    ? {}
    : {
        boxShadow: `0 0 0 ${ring * p}px color-mix(in srgb, ${color} ${Math.round(
          90 * p
        )}%, transparent), 0 0 ${44 * p}px color-mix(in srgb, ${color} ${Math.round(
          60 * p
        )}%, transparent)`,
      };

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Ease-out that lands slightly past the target and settles back. */
export const OVERSHOOT = Easing.bezier(0.3, 1.5, 0.5, 1);
const NUDGE = Easing.bezier(0.25, 1.9, 0.45, 1);
const EXIT = Easing.in(Easing.cubic);

const rand = (n: number) => {
  const x = Math.sin(n * 91.3458 + 47.23) * 47453.5453;
  return x - Math.floor(x);
};

const nudgeAt = (seed: number, k: number) => ({
  x: (rand(seed * 13.1 + k * 1.37) - 0.5) * 6,
  y: (rand(seed * 7.7 + k * 2.91) - 0.5) * 6,
  r: (rand(seed * 3.3 + k * 0.71) - 0.5) * 0.9,
});

/**
 * Slow organic hover plus a small, quick nudge to a new resting offset every
 * ~1.5 s. Pure function of the frame, so renders stay deterministic.
 */
export const float = (t: number, seed = 0, amp = 1) => {
  if (amp <= 0) return "";
  const s = seed * 2.17;
  let x = (0.6 * Math.sin(t / 43 + s) + 0.4 * Math.sin(t / 21 + s * 1.9)) * 4;
  let y = (0.65 * Math.sin(t / 37 + s * 1.3) + 0.35 * Math.sin(t / 17 + s * 0.6)) * 6;
  let r = 0.3 * Math.sin(t / 51 + s * 0.8);
  const period = 34 + Math.floor(rand(seed) * 16);
  const local = t + rand(seed + 0.5) * period;
  const k = Math.floor(local / period);
  const m = interpolate(local - k * period, [0, 8], [0, 1], { ...CLAMP, easing: NUDGE });
  const a = nudgeAt(seed, k - 1);
  const b = nudgeAt(seed, k);
  x += a.x + (b.x - a.x) * m;
  y += a.y + (b.y - a.y) * m;
  r += a.r + (b.r - a.r) * m;
  return `translate(${x * amp}px, ${y * amp}px) rotate(${r * amp}deg)`;
};

/** Frame (scene-relative) at which the next scene is fully faded in. */
export const SceneEnd = React.createContext<number>(Infinity);

const ACCENT_GRADIENT = "linear-gradient(90deg, #a78bfa 0%, #818cf8 45%, #22d3ee 100%)";

export type Word = { text: string; accent?: boolean; glue?: boolean };

export const toWords = (lead: string, accent?: string): Word[] => [
  ...lead.split(" ").map((text) => ({ text })),
  ...(accent ? accent.split(" ").map((text) => ({ text, accent: true })) : []),
];

/** Word-by-word entrance (rise, unblur, overshoot) and staggered exit. */
export const KineticText: React.FC<{
  t: number;
  start: number;
  words: Word[];
  exitAt?: number;
  stagger?: number;
  seed?: number;
  floatAmp?: number;
}> = ({ t, start, words, exitAt, stagger = 3, seed = 1, floatAmp = 0.7 }) => {
  const accents = words.filter((w) => w.accent).length;
  const settle = prog(t, start + words.length * stagger, 30);
  let ai = 0;
  return (
    <span style={{ display: "inline-block", transform: float(t, seed, floatAmp * settle) }}>
      {words.map((w, i) => {
        const ws = start + i * stagger + (w.accent ? 4 : 0);
        const p = prog(t, ws, 18);
        const land = prog(t, ws, 22, OVERSHOOT);
        const e = exitAt === undefined ? 0 : prog(t, exitAt + i * 2, 14, EXIT);
        const blur = (1 - p) * 12 + e * 10;
        const idx = w.accent ? ai++ : 0;
        return (
          <React.Fragment key={i}>
            {i > 0 && !w.glue ? " " : null}
            <span
              style={{
                display: "inline-block",
                opacity: p * (1 - e),
                filter: blur > 0.05 ? `blur(${blur}px)` : undefined,
                transformOrigin: "50% 100%",
                transform: `translateY(${(1 - land) * 40 - e * 34}px) rotate(${(1 - land) * 5}deg) scale(${
                  0.9 + 0.1 * land
                })`,
                ...(w.accent
                  ? {
                      backgroundImage: ACCENT_GRADIENT,
                      backgroundSize: `${accents * 100}% 100%`,
                      backgroundPosition: `${accents > 1 ? (idx / (accents - 1)) * 100 : 0}% 0`,
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color: "transparent",
                      paddingBottom: 6,
                    }
                  : null),
              }}
            >
              {w.text}
            </span>
          </React.Fragment>
        );
      })}
    </span>
  );
};

export const LogoMark: React.FC<{ size: number; shadow?: boolean }> = ({ size, shadow = true }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.28,
      background: ICON_GRADIENT,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      boxShadow: shadow
        ? `0 ${size * 0.2}px ${size * 0.7}px rgba(139,92,246,0.35)`
        : undefined,
    }}
  >
    <Sparkles size={size * 0.46} color="white" strokeWidth={2} />
  </div>
);

export const Wordmark: React.FC<{ fontSize: number }> = ({ fontSize }) => (
  <span
    style={{
      fontFamily: FONT,
      fontSize,
      fontWeight: 600,
      letterSpacing: "-0.03em",
      color: "white",
      lineHeight: 1,
    }}
  >
    hostvia<span style={{ color: C.violet400 }}>.me</span>
  </span>
);

export const BrowserWindow: React.FC<{
  width: number;
  height: number;
  url: string;
  light?: boolean;
  children: ReactNode;
  style?: CSSProperties;
}> = ({ width, height, url, light = false, children, style }) => (
  <div
    style={{
      width,
      height,
      borderRadius: 22,
      overflow: "hidden",
      background: light ? "#ffffff" : C.bg,
      border: `1px solid ${light ? "rgba(0,0,0,0.10)" : "rgba(255,255,255,0.10)"}`,
      boxShadow:
        "0 60px 140px -30px rgba(0,0,0,0.75), 0 30px 60px -30px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03)",
      display: "flex",
      flexDirection: "column",
      fontFamily: FONT,
      ...style,
    }}
  >
    <div
      style={{
        height: 46,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        padding: "0 18px",
        gap: 8,
        background: light ? "#f4f4f5" : "#0b0b11",
        borderBottom: `1px solid ${light ? "#e4e4e7" : "rgba(255,255,255,0.06)"}`,
      }}
    >
      {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
        <span key={c} style={{ width: 13, height: 13, borderRadius: 99, background: c }} />
      ))}
      <div
        style={{
          margin: "0 auto",
          minWidth: 420,
          height: 28,
          borderRadius: 8,
          background: light ? "#ffffff" : "rgba(255,255,255,0.05)",
          border: `1px solid ${light ? "#e4e4e7" : "rgba(255,255,255,0.06)"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "0 16px",
          fontSize: 15,
          color: light ? "#52525b" : C.zinc400,
        }}
      >
        <Lock size={13} strokeWidth={2.4} />
        {url}
      </div>
      <div style={{ width: 55 }} />
    </div>
    <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>{children}</div>
  </div>
);

const NAV: { label: string; items: [string, typeof Home][] }[] = [
  {
    label: "Overview",
    items: [
      ["Dashboard", LayoutDashboard],
      ["Cleanings", SprayCan],
      ["Calendars", LayoutGrid],
      ["Arrivals", CalendarDays],
    ],
  },
  {
    label: "Properties",
    items: [
      ["All properties", Home],
      ["Manual bookings", CalendarPlus],
    ],
  },
  {
    label: "Direct bookings",
    items: [
      ["Booking site", Globe],
      ["Inquiries", Inbox],
      ["Messages", MessageSquare],
    ],
  },
];

export const Sidebar: React.FC<{ active: string }> = ({ active }) => (
  <div
    style={{
      width: 248,
      flexShrink: 0,
      height: "100%",
      background: "#09090e",
      borderRight: "1px solid rgba(255,255,255,0.06)",
      display: "flex",
      flexDirection: "column",
    }}
  >
    <div style={{ height: 72, display: "flex", alignItems: "center", gap: 12, padding: "0 22px" }}>
      <LogoMark size={38} shadow={false} />
      <Wordmark fontSize={21} />
    </div>
    <div style={{ flex: 1, padding: "6px 12px" }}>
      {NAV.map((g) => (
        <div key={g.label} style={{ marginBottom: 18 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: C.zinc500,
              padding: "0 12px 8px",
            }}
          >
            {g.label}
          </div>
          {g.items.map(([label, Icon]) => {
            const on = label === active;
            return (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  height: 40,
                  padding: "0 12px",
                  borderRadius: 10,
                  fontSize: 16,
                  fontWeight: on ? 600 : 500,
                  color: on ? "white" : C.zinc400,
                  background: on ? "rgba(139,92,246,0.16)" : "transparent",
                  boxShadow: on ? "inset 0 0 0 1px rgba(167,139,250,0.25)" : undefined,
                }}
              >
                <Icon size={18} strokeWidth={2} color={on ? C.violet300 : C.zinc500} />
                {label}
              </div>
            );
          })}
        </div>
      ))}
    </div>
    <div style={{ padding: 14, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <GradientButton style={{ width: "100%", justifyContent: "center" }}>
        <Plus size={17} /> Add property
      </GradientButton>
    </div>
  </div>
);

export const GradientButton: React.FC<{ children: ReactNode; style?: CSSProperties }> = ({
  children,
  style,
}) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      height: 42,
      padding: "0 18px",
      borderRadius: 11,
      fontSize: 16,
      fontWeight: 600,
      color: "white",
      background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 60%, #06b6d4 140%)",
      boxShadow: "0 8px 24px -8px rgba(139,92,246,0.6)",
      ...style,
    }}
  >
    {children}
  </div>
);

export const OutlineButton: React.FC<{ children: ReactNode; style?: CSSProperties }> = ({
  children,
  style,
}) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      height: 42,
      padding: "0 16px",
      borderRadius: 11,
      fontSize: 16,
      fontWeight: 500,
      color: C.zinc300,
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.10)",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Topbar: React.FC<{ messagesStyle?: CSSProperties }> = ({ messagesStyle }) => (
  <div
    style={{
      height: 64,
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: 10,
      padding: "0 32px",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
    }}
  >
    <OutlineButton style={{ height: 38, ...messagesStyle }}>
      <Copy size={16} /> Messages <ChevronDown size={16} />
    </OutlineButton>
    <OutlineButton style={{ height: 38 }}>
      <RefreshCw size={16} /> Sync
    </OutlineButton>
  </div>
);

/** Dashboard chrome: sidebar + topbar + padded content area. */
export const AppShell: React.FC<{
  active: string;
  children: ReactNode;
  messagesStyle?: CSSProperties;
}> = ({ active, children, messagesStyle }) => (
  <div style={{ position: "absolute", inset: 0, display: "flex", background: C.bg, color: C.text }}>
    <Sidebar active={active} />
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
      <Topbar messagesStyle={messagesStyle} />
      <div style={{ flex: 1, padding: "26px 36px", position: "relative", minWidth: 0 }}>{children}</div>
    </div>
  </div>
);

export const PageHeader: React.FC<{
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}> = ({ eyebrow, title, description, actions }) => (
  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 22 }}>
    <div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: C.violet300,
        }}
      >
        {eyebrow}
      </div>
      <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-0.03em", marginTop: 6 }}>{title}</div>
      <div style={{ fontSize: 17, color: C.zinc400, marginTop: 6 }}>{description}</div>
    </div>
    {actions ? <div style={{ display: "flex", gap: 10 }}>{actions}</div> : null}
  </div>
);

export const Panel: React.FC<{
  title?: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  style?: CSSProperties;
  bodyStyle?: CSSProperties;
}> = ({ title, icon, action, children, style, bodyStyle }) => (
  <div
    style={{
      borderRadius: 18,
      background: "rgba(255,255,255,0.025)",
      border: "1px solid rgba(255,255,255,0.08)",
      overflow: "hidden",
      ...style,
    }}
  >
    {title ? (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "16px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          fontSize: 17,
          fontWeight: 600,
        }}
      >
        <span style={{ color: C.violet300, display: "flex" }}>{icon}</span>
        {title}
        <div style={{ marginLeft: "auto" }}>{action}</div>
      </div>
    ) : null}
    <div style={{ padding: 18, ...bodyStyle }}>{children}</div>
  </div>
);

export const Toast: React.FC<{ t: number; start: number; end?: number; text: string; placement?: "top" | "bottom" }> = ({
  t,
  start,
  end = 9999,
  text,
  placement = "bottom",
}) => {
  const p = prog(t, start, 12) * (1 - prog(t, end, 10));
  if (p <= 0) return null;
  const land = prog(t, start, 18, OVERSHOOT);
  const dir = placement === "top" ? -1 : 1;
  return (
    <div
      style={{
        position: "absolute",
        right: 28,
        ...(placement === "top" ? { top: 80 } : { bottom: 28 }),
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "16px 22px",
        borderRadius: 14,
        background: C.popover,
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 20px 50px -10px rgba(0,0,0,0.7)",
        fontFamily: FONT,
        fontSize: 18,
        fontWeight: 500,
        color: C.text,
        opacity: p,
        filter: p < 0.99 ? `blur(${(1 - p) * 6}px)` : undefined,
        transform: `translateY(${(1 - land) * 30 * dir}px) scale(${0.94 + 0.06 * land}) ${float(
          t,
          start * 0.37,
          0.5 * prog(t, start + 18, 20)
        )}`,
        zIndex: 50,
      }}
    >
      <span
        style={{
          width: 26,
          height: 26,
          borderRadius: 99,
          background: "rgba(52,211,153,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Check size={16} color={C.checkIn} strokeWidth={3} />
      </span>
      {text}
    </div>
  );
};

/** On-screen pointer. Positions are in the coordinate space of its parent. */
export const Cursor: React.FC<{
  t: number;
  keys: { t: number; x: number; y: number }[];
  clicks?: number[];
  hideAt?: number;
}> = ({ t, keys, clicks = [], hideAt = 99999 }) => {
  const times = keys.map((k) => k.t);
  const opts = {
    extrapolateLeft: "clamp" as const,
    extrapolateRight: "clamp" as const,
    easing: Easing.inOut(Easing.cubic),
  };
  const x = interpolate(t, times, keys.map((k) => k.x), opts);
  const y = interpolate(t, times, keys.map((k) => k.y), opts);
  const opacity = prog(t, keys[0].t - 8, 8) * (1 - prog(t, hideAt, 8));
  if (opacity <= 0) return null;
  let press = 0;
  let ripple: { r: number } | null = null;
  for (const c of clicks) {
    press = Math.max(press, prog(t, c - 3, 3) * (1 - prog(t, c, 5)));
    if (t >= c && t < c + 20) ripple = { r: prog(t, c, 18) };
  }
  return (
    <div style={{ position: "absolute", left: x, top: y, zIndex: 100, opacity, pointerEvents: "none" }}>
      {ripple ? (
        <div
          style={{
            position: "absolute",
            left: -30 * (0.3 + ripple.r),
            top: -30 * (0.3 + ripple.r),
            width: 60 * (0.3 + ripple.r),
            height: 60 * (0.3 + ripple.r),
            borderRadius: 999,
            border: `3px solid rgba(167,139,250,${0.8 * (1 - ripple.r)})`,
            background: `rgba(167,139,250,${0.2 * (1 - ripple.r)})`,
          }}
        />
      ) : null}
      <svg
        width={34}
        height={34}
        viewBox="0 0 24 24"
        style={{
          transform: `scale(${1 - 0.15 * press})`,
          transformOrigin: "4px 3px",
          filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.45))",
        }}
      >
        <path
          d="M4 3l15 8.2-6.6 1.5-3.4 6.1L4 3z"
          fill="white"
          stroke="#111"
          strokeWidth={1.4}
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export const Caption: React.FC<{
  t: number;
  start: number;
  lead: string;
  accent?: string;
  top?: number;
  scrim?: number;
  exitAt?: number;
}> = ({ t, start, lead, accent, top = 62, scrim = 0, exitAt }) => {
  const end = React.useContext(SceneEnd);
  const exit = exitAt ?? (Number.isFinite(end) ? end - 22 : undefined);
  return (
    <>
      {scrim > 0 ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: 300,
            zIndex: 55,
            opacity: scrim,
            background: "linear-gradient(180deg, rgba(6,6,10,0.94) 0%, rgba(6,6,10,0.8) 50%, rgba(6,6,10,0) 100%)",
          }}
        />
      ) : null}
    <div
      style={{
        position: "absolute",
        top,
        left: 0,
        right: 0,
        textAlign: "center",
        fontFamily: FONT,
        fontSize: 68,
        fontWeight: 700,
        letterSpacing: "-0.035em",
        lineHeight: 1.1,
        color: "white",
        zIndex: 60,
      }}
    >
      <KineticText t={t} start={start} words={toWords(lead, accent)} exitAt={exit} seed={top + lead.length} />
    </div>
    </>
  );
};

export const IllustrativeTag: React.FC<{ visible: boolean; opacity?: number }> = ({ visible, opacity = 1 }) =>
  visible ? (
    <div
      style={{
        position: "absolute",
        right: 30,
        bottom: 16,
        fontFamily: FONT,
        fontSize: 15,
        fontWeight: 500,
        letterSpacing: "0.02em",
        color: "rgba(255,255,255,0.38)",
        opacity,
        zIndex: 70,
      }}
    >
      Illustrative interface · sample data
    </div>
  ) : null;

/** Standard placement of the main product window, with entrance and slow push-in. */
export const STAGE = { left: 160, top: 206, width: 1600, height: 824 };

export const StageCamera: React.FC<{
  t: number;
  dur: number;
  children: ReactNode;
  enter?: boolean;
  extra?: string;
  origin?: string;
}> = ({ t, dur, children, enter = true, extra = "", origin = "50% 50%" }) => {
  const e = enter ? prog(t, 0, 26) : 1;
  const push = interpolate(t, [0, dur], [1, 1.025]);
  return (
    <div
      style={{
        position: "absolute",
        left: STAGE.left,
        top: STAGE.top,
        width: STAGE.width,
        height: STAGE.height,
        transformOrigin: origin,
        transform: `perspective(2600px) translateY(${(1 - e) * 22}px) rotateX(${(1 - e) * 4}deg) scale(${
          (0.98 + 0.02 * e) * push
        }) ${extra}`,
      }}
    >
      {children}
    </div>
  );
};
