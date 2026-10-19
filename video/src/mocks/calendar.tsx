import React, { CSSProperties } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { C, PROPERTIES } from "../theme";
import {
  MONTH,
  MONTH_ROWS,
  SOURCE_COLOR,
  SOURCE_LABEL,
  STAYS,
  Stay,
  TODAY,
  WEEKDAYS,
  staySegments,
} from "../data";
import { AppShell, PageHeader, glow, prog } from "../ui/kit";

export interface GridMarker {
  day: number;
  label: string;
  color: string;
  p: number;
}

export const MonthGrid: React.FC<{
  t: number;
  prop: number;
  stays: Stay[];
  cellW: number;
  cellH: number;
  gap?: number;
  barH: number;
  dayFont?: number;
  drawStart?: number;
  labels?: boolean;
  glowStay?: { stay: Stay; p: number };
  revealStay?: { stay: Stay; p: number };
  markers?: GridMarker[];
}> = ({
  t,
  prop,
  stays,
  cellW,
  cellH,
  gap = 4,
  barH,
  dayFont = 14,
  drawStart = 0,
  labels = false,
  glowStay,
  revealStay,
  markers = [],
}) => {
  const own = stays.filter((s) => s.prop === prop);
  const night = (d: number) => own.some((s) => s.checkIn <= d && d < s.checkOut);
  const step = cellW + gap;
  const width = 7 * cellW + 6 * gap;

  return (
    <div style={{ width, position: "relative" }}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(7, ${cellW}px)`, gap, marginBottom: 6 }}>
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            style={{
              textAlign: "center",
              fontSize: Math.max(11, dayFont - 2),
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: C.zinc500,
            }}
          >
            {w}
          </div>
        ))}
      </div>
      {Array.from({ length: MONTH_ROWS }).map((_, row) => (
        <div key={row} style={{ position: "relative", height: cellH, marginBottom: gap }}>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(7, ${cellW}px)`, gap, height: "100%" }}>
            {Array.from({ length: 7 }).map((__, col) => {
              const day = row * 7 + col - MONTH.firstCol + 1;
              if (day < 1 || day > MONTH.days) return <div key={col} />;
              const staying = night(day);
              const isToday = day === TODAY;
              return (
                <div
                  key={col}
                  style={{
                    position: "relative",
                    borderRadius: 8,
                    background: staying ? "rgba(139,92,246,0.09)" : "rgba(16,185,129,0.09)",
                    boxShadow: isToday ? "inset 0 0 0 1.5px rgba(167,139,250,0.55)" : undefined,
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      left: 7,
                      top: 5,
                      fontSize: dayFont,
                      fontWeight: isToday ? 700 : 500,
                      color: isToday ? "#ddd6fe" : staying ? C.zinc300 : "rgba(110,231,183,0.9)",
                    }}
                  >
                    {day}
                  </span>
                </div>
              );
            })}
          </div>
          {own.map((stay, si) => {
            const isRevealStay = revealStay && revealStay.stay === stay;
            const p = isRevealStay ? revealStay!.p : prog(t, drawStart + si * 4 + prop * 3, 18);
            if (p <= 0) return null;
            const g = glowStay && glowStay.stay === stay ? glowStay.p : 0;
            return staySegments(stay)
              .filter((s) => s.row === row)
              .map((seg, k) => {
                const x0 = seg.startsHere ? (seg.startCol + 0.5) * step : seg.startCol * step;
                const x1 = seg.endsHere ? (seg.endCol + 0.5) * step : seg.endCol * step + cellW;
                const style: CSSProperties = {
                  position: "absolute",
                  left: x0,
                  width: Math.max(0, x1 - x0),
                  top: cellH - barH - 5,
                  height: barH,
                  background: SOURCE_COLOR[stay.src],
                  borderTopLeftRadius: seg.startsHere ? 99 : 3,
                  borderBottomLeftRadius: seg.startsHere ? 99 : 3,
                  borderTopRightRadius: seg.endsHere ? 99 : 3,
                  borderBottomRightRadius: seg.endsHere ? 99 : 3,
                  transformOrigin: "left center",
                  transform: `scaleX(${p})`,
                  opacity: Math.min(1, p * 1.6),
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: seg.startsHere ? 12 : 8,
                  fontSize: barH * 0.58,
                  fontWeight: 600,
                  color: "white",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  ...glow(g, SOURCE_COLOR[stay.src], 3),
                };
                return (
                  <div key={`${si}-${k}`} style={style}>
                    {labels && x1 - x0 > 110 && seg.startsHere ? stay.guest : null}
                  </div>
                );
              });
          })}
        </div>
      ))}
      {markers.map((m) => {
        if (m.p <= 0) return null;
        const idx = MONTH.firstCol + m.day - 1;
        const row = Math.floor(idx / 7);
        const col = idx % 7;
        const headerH = Math.max(11, dayFont - 2) * 1.2 + 6;
        return (
          <div
            key={m.label}
            style={{
              position: "absolute",
              left: col * step,
              top: headerH + row * (cellH + gap),
              width: cellW,
              height: cellH,
              borderRadius: 8,
              opacity: m.p,
              transform: `scale(${1.12 - 0.12 * m.p})`,
              zIndex: 5,
              ...glow(m.p, m.color, 2.5),
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 3,
                top: 3,
                padding: "2px 6px",
                borderRadius: 6,
                background: m.color,
                color: "white",
                fontSize: 11,
                fontWeight: 700,
                whiteSpace: "nowrap",
              }}
            >
              {m.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const SourceLegend: React.FC<{ size?: number }> = ({ size = 15 }) => (
  <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
    {(["airbnb", "booking", "direct"] as const).map((s) => (
      <div key={s} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: size, color: C.zinc400 }}>
        <span style={{ width: 22, height: 8, borderRadius: 99, background: SOURCE_COLOR[s] }} />
        {SOURCE_LABEL[s]}
      </div>
    ))}
  </div>
);

export const MonthNav: React.FC = () => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 4,
      padding: 4,
      borderRadius: 10,
      border: "1px solid rgba(255,255,255,0.08)",
      background: "rgba(0,0,0,0.2)",
      color: C.zinc300,
      fontSize: 15,
    }}
  >
    <ChevronLeft size={18} style={{ margin: "0 6px" }} />
    <span style={{ padding: "4px 10px" }}>Today</span>
    <ChevronRight size={18} style={{ margin: "0 6px" }} />
  </div>
);

export const PropertyCalendarCard: React.FC<{
  t: number;
  prop: number;
  style?: CSSProperties;
  headGlow?: number;
  grid: Omit<React.ComponentProps<typeof MonthGrid>, "t" | "prop" | "stays"> & { stays?: Stay[] };
}> = ({ t, prop, style, headGlow = 0, grid }) => {
  const p = PROPERTIES[prop];
  const stays = grid.stays ?? STAYS;
  const count = stays.filter((s) => s.prop === prop).length;
  return (
    <div
      style={{
        borderRadius: 18,
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.08)",
        padding: "14px 14px 10px",
        ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, height: 30 }}>
        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: 99,
            background: p.color,
            boxShadow: `0 0 12px ${p.color}`,
          }}
        />
        <span
          style={{
            fontSize: 19,
            fontWeight: 600,
            letterSpacing: "-0.01em",
            padding: "2px 8px",
            margin: "0 -8px",
            borderRadius: 8,
            ...glow(headGlow, p.color, 2),
          }}
        >
          {p.name}
        </span>
        <span style={{ marginLeft: "auto", fontSize: 14, color: C.zinc500 }}>
          {count} booking{count === 1 ? "" : "s"}
        </span>
      </div>
      <MonthGrid t={t} prop={prop} {...grid} stays={stays} />
    </div>
  );
};

/** "Calendars" page: one compact month calendar per property. */
export const CalendarsPage: React.FC<{
  t: number;
  dim?: number;
  focusMarkers?: GridMarker[];
  focusGlow?: number;
  focusStay?: { stay: Stay; p: number };
}> = ({ t, dim = 0, focusMarkers, focusGlow = 0, focusStay }) => (
  <AppShell active="Calendars">
    <div style={{ opacity: 1 - dim * 0.75 }}>
      <PageHeader
        eyebrow="Calendar view"
        title="Calendars"
        description="Occupancy across all properties"
        actions={
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            <SourceLegend />
            <span style={{ fontSize: 19, fontWeight: 600 }}>{MONTH.label}</span>
            <MonthNav />
          </div>
        }
      />
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      {PROPERTIES.map((_, i) => {
        const appear = prog(t, 6 + i * 4, 16);
        return (
          <PropertyCalendarCard
            key={i}
            t={t}
            prop={i}
            headGlow={i === 0 ? focusGlow : 0}
            style={{
              opacity: appear * (i === 0 ? 1 : 1 - dim * 0.75),
              transform: `translateY(${(1 - appear) * 18}px)`,
            }}
            grid={{
              cellW: 82,
              cellH: 33,
              gap: 4,
              barH: 9,
              dayFont: 13,
              drawStart: 16,
              markers: i === 0 ? focusMarkers : undefined,
              glowStay: i === 0 ? focusStay : undefined,
            }}
          />
        );
      })}
    </div>
  </AppShell>
);
