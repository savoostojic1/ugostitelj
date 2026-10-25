import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import {
  CalendarDays,
  Globe,
  LayoutDashboard,
  LayoutGrid,
  Plus,
  Sparkles,
  SprayCan,
} from "lucide-react";
import {
  BG,
  C,
  CAPTION_H,
  CAPTION_W,
  CAPTION_X,
  CAPTION_Y,
  FONT,
  ICON_GRADIENT,
  PUBLIC,
  STAGE_H,
  STAGE_W,
  STAGE_X,
  STAGE_Y,
} from "./theme";

export const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

const EASE = Easing.bezier(0.22, 1, 0.36, 1);

export const prog = (t: number, start: number, dur = 12) =>
  interpolate(t, [start, start + dur], [0, 1], { ...CLAMP, easing: EASE });

export const Screen: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: BG, fontFamily: FONT, color: "#17171c" }}>
    {children}
  </AbsoluteFill>
);

export const Caption: React.FC<{ text: string }> = ({ text }) => (
  <div
    style={{
      position: "absolute",
      left: CAPTION_X,
      top: CAPTION_Y,
      width: CAPTION_W,
      height: CAPTION_H,
      display: "flex",
      alignItems: "flex-end",
      fontFamily: FONT,
      fontWeight: 700,
      fontSize: 48,
      letterSpacing: "-0.038em",
      lineHeight: 1.08,
      color: "#17171c",
    }}
  >
    {text}
  </div>
);

export const Logo: React.FC<{ size: number }> = ({ size }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: Math.round(size * 0.24),
      background: ICON_GRADIENT,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      boxShadow: `0 ${Math.round(size * 0.16)}px ${Math.round(size * 0.42)}px rgba(139,92,246,0.32)`,
    }}
  >
    <Sparkles size={Math.round(size * 0.46)} color="white" strokeWidth={2} />
  </div>
);

export const Wordmark: React.FC<{ size: number; light?: boolean }> = ({ size, light = false }) => (
  <span
    style={{
      fontFamily: FONT,
      fontSize: size,
      fontWeight: 600,
      letterSpacing: "-0.03em",
      color: light ? "#17171c" : "#ffffff",
      lineHeight: 1,
    }}
  >
    hostvia
    <span style={{ color: light ? "#6d28d9" : "#a78bfa" }}>.me</span>
  </span>
);

const NAV = [
  { id: "dashboard", icon: LayoutDashboard },
  { id: "cleanings", icon: SprayCan },
  { id: "calendars", icon: LayoutGrid },
  { id: "arrivals", icon: CalendarDays },
  { id: "site", icon: Globe },
] as const;

const Rail: React.FC<{ active: (typeof NAV)[number]["id"] }> = ({ active }) => (
  <div
    style={{
      width: 76,
      flexShrink: 0,
      background: "linear-gradient(180deg, #08080e 0%, #06060a 100%)",
      borderRight: "1px solid rgba(255,255,255,0.06)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      paddingTop: 16,
      gap: 8,
    }}
  >
    <Logo size={40} />
    <div style={{ height: 10 }} />
    {NAV.map((item) => {
      const on = item.id === active;
      const Icon = item.icon;
      return (
        <div
          key={item.id}
          style={{
            width: 52,
            height: 48,
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: on ? "#e9d5ff" : "#a1a1aa",
            background: on
              ? "linear-gradient(90deg, rgba(139,92,246,0.20), rgba(139,92,246,0.05))"
              : "transparent",
            boxShadow: on ? "inset 3px 0 0 #8b5cf6" : undefined,
          }}
        >
          <Icon size={24} strokeWidth={2} />
        </div>
      );
    })}
  </div>
);

const Dots: React.FC = () => (
  <div style={{ display: "flex", gap: 7, paddingLeft: 4 }}>
    {["#ff5f57", "#febc2e", "#28c840"].map((color) => (
      <div key={color} style={{ width: 12, height: 12, borderRadius: 99, background: color }} />
    ))}
  </div>
);

export const Browser: React.FC<{
  url: string;
  active?: (typeof NAV)[number]["id"] | null;
  top?: number;
  height?: number;
  children: React.ReactNode;
}> = ({ url, active = "dashboard", top = STAGE_Y, height = STAGE_H, children }) => (
  <div
    style={{
      position: "absolute",
      left: STAGE_X,
      top,
      width: STAGE_W,
      height,
      borderRadius: 22,
      overflow: "hidden",
      background: active ? C.bg : PUBLIC.bg,
      border: "1px solid rgba(255,255,255,0.72)",
      boxShadow: "0 28px 70px rgba(32, 24, 48, 0.16)",
      display: "flex",
      flexDirection: "column",
    }}
  >
    <div
      style={{
        height: 54,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "0 16px",
        background: "#0c0c12",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <Dots />
      <div
        style={{
          flex: 1,
          height: 34,
          borderRadius: 9,
          background: "#17171f",
          color: "#e4e4e7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          fontWeight: 600,
          letterSpacing: "-0.01em",
        }}
      >
        {url}
      </div>
    </div>
    <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
      {active ? <Rail active={active} /> : null}
      <div style={{ flex: 1, minWidth: 0, position: "relative", overflow: "hidden" }}>{children}</div>
    </div>
  </div>
);

export const PageHeader: React.FC<{
  eyebrow: string;
  title: string;
  description: string;
  aside?: React.ReactNode;
}> = ({ eyebrow, title, description, aside }) => (
  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
    <div>
      <div
        style={{
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: C.violet,
        }}
      >
        {eyebrow}
      </div>
      <div
        style={{
          marginTop: 6,
          fontSize: 40,
          fontWeight: 700,
          letterSpacing: "-0.03em",
          lineHeight: 1.05,
          color: "#fafafa",
        }}
      >
        {title}
      </div>
      <div style={{ marginTop: 8, fontSize: 20, color: "#a1a1aa", lineHeight: 1.3 }}>{description}</div>
    </div>
    {aside}
  </div>
);

export const OutlineButton: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      height: 42,
      padding: "0 14px",
      borderRadius: 10,
      border: "1px solid rgba(255,255,255,0.10)",
      background: "rgba(255,255,255,0.03)",
      color: "#d4d4d8",
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      fontSize: 16,
      fontWeight: 600,
    }}
  >
    {children}
  </div>
);

export const GradientButton: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      height: 42,
      padding: "0 16px",
      borderRadius: 10,
      background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 45%, #22d3ee 100%)",
      color: "white",
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      fontSize: 16,
      fontWeight: 700,
      boxShadow: "0 8px 20px rgba(139,92,246,0.28)",
    }}
  >
    <Plus size={18} />
    {children}
  </div>
);

export const Panel: React.FC<{
  title: string;
  icon: React.ReactNode;
  action?: string;
  children: React.ReactNode;
  glow?: number;
}> = ({ title, icon, action, children, glow = 0 }) => (
  <section
    style={{
      borderRadius: 16,
      border: "1px solid rgba(255,255,255,0.07)",
      background: "rgba(255,255,255,0.02)",
      boxShadow:
        glow > 0
          ? `0 0 0 ${2 + glow * 2}px rgba(167,139,250,${0.25 + glow * 0.45}), 0 8px 32px rgba(0,0,0,0.25)`
          : "inset 0 1px 0 rgba(255,255,255,0.04), 0 8px 32px rgba(0,0,0,0.25)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      minWidth: 0,
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        padding: "14px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(255,255,255,0.02)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "rgba(139,92,246,0.12)",
            color: "#a78bfa",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div style={{ fontSize: 20, fontWeight: 600, color: "white" }}>{title}</div>
      </div>
      {action ? <div style={{ fontSize: 16, fontWeight: 600, color: "#a1a1aa" }}>{action}</div> : null}
    </div>
    <div style={{ padding: 14 }}>{children}</div>
  </section>
);

export const ListItem: React.FC<{ title: string; subtitle: string; meta?: string }> = ({
  title,
  subtitle,
  meta,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
      padding: "12px 12px",
      borderRadius: 12,
      border: "1px solid rgba(255,255,255,0.05)",
      background: "rgba(255,255,255,0.02)",
      marginBottom: 8,
    }}
  >
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 22, fontWeight: 600, color: "white", lineHeight: 1.2 }}>{title}</div>
      <div style={{ marginTop: 3, fontSize: 17, color: "#71717a" }}>{subtitle}</div>
    </div>
    {meta ? (
      <div style={{ fontSize: 16, fontWeight: 600, color: "#a1a1aa", flexShrink: 0 }}>{meta}</div>
    ) : null}
  </div>
);

export const Pointer: React.FC<{ x: number; y: number; opacity?: number }> = ({
  x,
  y,
  opacity = 1,
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      opacity,
      zIndex: 5,
      filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.25))",
    }}
  >
    <svg width="32" height="32" viewBox="0 0 24 24">
      <path
        d="M5.2 2.4 L5.2 18.2 L9.3 14.6 L12.4 20.6 L15.1 19.3 L12 13.2 L17.6 13.2 Z"
        fill="white"
        stroke="#17171c"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

export const stageStyle: React.CSSProperties = {
  position: "absolute",
  left: STAGE_X,
  top: STAGE_Y,
  width: STAGE_W,
  height: STAGE_H,
};
