import React, { CSSProperties } from "react";
import { Check, SprayCan } from "lucide-react";
import { C, FONT, PROPERTIES, propertyGradient } from "../theme";
import {
  DAY_LABEL,
  DayType,
  MONTH,
  SOURCE_LETTER,
  Source,
  TODAY,
  cleaningCount,
  dayCard,
  formatCleaningCount,
  formatFreeDays,
  freeDaysUntilMonthEnd,
  weekdayOf,
} from "../data";
import { AppShell, LogoMark, PageHeader, Wordmark, glow, prog } from "../ui/kit";
import { MonthNav } from "./calendar";

export const CLEANING_DAYS = [TODAY, TODAY + 1, TODAY + 2];

const BADGE: Record<DayType, CSSProperties> = {
  check_in: { background: "#10b981", boxShadow: "0 0 0 2px #059669" },
  check_out: { background: "#f43f5e", boxShadow: "0 0 0 2px #e11d48" },
  stayover: { background: "#3b82f6", boxShadow: "0 0 0 2px #2563eb" },
  empty: { background: C.empty, color: C.emptyText, boxShadow: `0 0 0 1px ${C.emptyRing}` },
};

const ORIGIN_BG: Record<Source, string> = { airbnb: "#ff5a5f", booking: "#003580", direct: "#059669" };

export interface Emphasis {
  checkOut: number;
  checkIn: number;
  count: number;
}

const Badge: React.FC<{ type: DayType; origin?: Source; size: number; emph: Emphasis }> = ({
  type,
  origin,
  size,
  emph,
}) => {
  const g = type === "check_out" ? emph.checkOut : type === "check_in" ? emph.checkIn : 0;
  const color = type === "check_out" ? "#fb7185" : "#34d399";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 6,
        width: "100%",
        borderRadius: 8,
        padding: `${size * 0.3}px ${size * 0.6}px`,
        fontSize: size,
        fontWeight: 700,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        color: "white",
        ...BADGE[type],
        ...(g > 0.01 ? glow(g, color, 3) : {}),
        transform: `scale(${1 + 0.05 * g})`,
      }}
    >
      <span>{DAY_LABEL[type]}</span>
      {type === "check_in" && origin ? (
        <span
          style={{
            minWidth: size * 1.35,
            height: size * 1.35,
            borderRadius: 5,
            background: ORIGIN_BG[origin],
            boxShadow: "0 0 0 1.5px rgba(255,255,255,0.6)",
            fontSize: size * 0.85,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {SOURCE_LETTER[origin]}
        </span>
      ) : null}
    </div>
  );
};

export const EventCard: React.FC<{
  prop: number;
  day: number;
  width: number | string;
  height: number;
  nameSize: number;
  badgeSize: number;
  emph: Emphasis;
}> = ({ prop, day, width, height, nameSize, badgeSize, emph }) => {
  const card = dayCard(prop, day);
  const emptyOnly = card.types.length === 1 && card.types[0] === "empty";
  const p = PROPERTIES[prop];
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 18,
        padding: "10px 12px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        textAlign: "center",
        background: emptyOnly ? "rgba(22,22,31,0.8)" : propertyGradient(p.color),
        boxShadow: emptyOnly
          ? "inset 0 0 0 1px rgba(255,255,255,0.08)"
          : "inset 0 0 0 1px rgba(255,255,255,0.2), 0 8px 20px -8px rgba(0,0,0,0.6)",
        color: emptyOnly ? C.text : "white",
      }}
    >
      <div style={{ fontSize: nameSize, fontWeight: 700, lineHeight: 1.15, textShadow: emptyOnly ? undefined : "0 1px 2px rgba(0,0,0,0.25)" }}>
        {p.name}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
        {card.types.map((type) => (
          <Badge key={type} type={type} origin={card.origin} size={badgeSize} emph={emph} />
        ))}
      </div>
    </div>
  );
};

export const DateTile: React.FC<{ day: number; emph: number; horizontal?: boolean; scale?: number }> = ({
  day,
  emph,
  horizontal = false,
  scale = 1,
}) => {
  const n = cleaningCount(day);
  const isToday = day === TODAY;
  return (
    <div
      style={{
        width: horizontal ? "100%" : 104 * scale,
        height: horizontal ? 58 * scale : 112 * scale,
        flexShrink: 0,
        borderRadius: 18 * scale,
        display: "flex",
        flexDirection: horizontal ? "row" : "column",
        alignItems: "center",
        justifyContent: horizontal ? "space-between" : "center",
        padding: horizontal ? `0 ${16 * scale}px` : 0,
        gap: 4 * scale,
        background: isToday ? C.todayBg : C.dateBg,
        color: isToday ? C.todayText : C.dateText,
        boxShadow: isToday ? `0 0 0 2px ${C.todayRing}` : undefined,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 * scale }}>
        <span style={{ fontSize: 40 * scale, fontWeight: 700, lineHeight: 1 }}>{day}</span>
        {horizontal ? (
          <span style={{ fontSize: 15 * scale, fontWeight: 600, opacity: 0.8 }}>
            {weekdayOf(day)}, {MONTH.short}
          </span>
        ) : null}
      </div>
      {!horizontal ? (
        <span style={{ fontSize: 12 * scale, fontWeight: 600, opacity: 0.7 }}>{weekdayOf(day)}</span>
      ) : null}
      <span
        style={{
          fontSize: 14 * scale,
          fontWeight: 700,
          color: n > 0 ? "#fb7185" : C.zinc500,
          padding: `${2 * scale}px ${8 * scale}px`,
          borderRadius: 99,
          ...(n > 0 ? glow(emph, "#fb7185", 2) : {}),
          background: n > 0 && emph > 0.01 ? `rgba(244,63,94,${0.18 * emph})` : undefined,
        }}
      >
        {formatCleaningCount(n)}
      </span>
    </div>
  );
};

export const CleaningsPage: React.FC<{ t: number; emph: Emphasis }> = ({ t, emph }) => {
  const enter = (i: number) => {
    const p = prog(t, 4 + i * 5, 18);
    return { opacity: p, transform: `translateY(${(1 - p) * 16}px)` };
  };
  const total = PROPERTIES.reduce((sum, _, i) => sum + freeDaysUntilMonthEnd(i), 0);

  return (
    <AppShell active="Cleanings">
      <div style={enter(0)}>
        <PageHeader
          eyebrow="Operations"
          title="Cleanings"
          description="Reservations, check-ins, check-outs and cleaning count by day"
        />
      </div>
      <div
        style={{
          ...enter(1),
          borderRadius: 18,
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.02)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "12px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            gap: 10,
          }}
        >
          <SprayCan size={18} color={C.violet300} />
          <span style={{ fontSize: 17, fontWeight: 600 }}>Monthly calendar</span>
          <span style={{ marginLeft: "auto", fontSize: 18, fontWeight: 600, marginRight: 14 }}>{MONTH.label}</span>
          <MonthNav />
        </div>
        <div style={{ padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.015)" }}>
          <div style={{ fontSize: 15, display: "flex", gap: 14, alignItems: "baseline" }}>
            <span style={{ fontWeight: 600 }}>Free days until end of month</span>
            <span style={{ color: C.zinc400 }}>
              Total: <b style={{ color: C.text }}>{formatFreeDays(total)}</b>
            </span>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            {PROPERTIES.map((p, i) => (
              <div
                key={p.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 12px",
                  borderRadius: 11,
                  border: "1px solid rgba(255,255,255,0.10)",
                  background: "rgba(255,255,255,0.04)",
                  fontSize: 14,
                }}
              >
                <span style={{ width: 10, height: 10, borderRadius: 99, background: p.color }} />
                <span style={{ fontWeight: 600 }}>{p.name}</span>
                <span style={{ color: C.zinc400 }}>{formatFreeDays(freeDaysUntilMonthEnd(i))}</span>
              </div>
            ))}
          </div>
        </div>
        {CLEANING_DAYS.map((day, r) => (
          <div
            key={day}
            style={{
              ...enter(2 + r),
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "10px 20px",
              borderBottom: r < 2 ? "1px solid rgba(255,255,255,0.08)" : undefined,
              background: day === TODAY ? C.rowToday : undefined,
            }}
          >
            <DateTile day={day} emph={emph.count} />
            {PROPERTIES.map((_, i) => (
              <EventCard key={i} prop={i} day={day} width={262} height={112} nameSize={18} badgeSize={14} emph={emph} />
            ))}
          </div>
        ))}
      </div>
    </AppShell>
  );
};

/** Phone view as seen by a team member who only has Cleanings + Arrivals access. */
export const CleaningPhone: React.FC<{ emph: Emphasis }> = ({ emph }) => (
  <div
    style={{
      width: 380,
      height: 780,
      borderRadius: 56,
      padding: 12,
      background: "#1c1c22",
      boxShadow: "0 0 0 2px #2e2e36, 0 60px 120px -20px rgba(0,0,0,0.85)",
      fontFamily: FONT,
    }}
  >
    <div style={{ width: "100%", height: "100%", borderRadius: 46, overflow: "hidden", background: C.bg, color: C.text, position: "relative" }}>
      <div style={{ height: 44, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 30px", fontSize: 15, fontWeight: 600 }}>
        <span>9:41</span>
        <span style={{ width: 110, height: 30, borderRadius: 99, background: "#000", position: "absolute", left: 123, top: 9 }} />
        <span style={{ fontSize: 13 }}>●●●</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 20px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <LogoMark size={28} shadow={false} />
        <Wordmark fontSize={18} />
      </div>
      <div style={{ padding: "14px 18px" }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: C.violet300 }}>
          Operations
        </div>
        <div style={{ fontSize: 26, fontWeight: 700, marginTop: 2 }}>Cleanings</div>
        {[TODAY, TODAY + 2].map((day) => (
          <div key={day} style={{ marginTop: 14 }}>
            <DateTile day={day} emph={emph.count} horizontal scale={0.9} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
              {PROPERTIES.map((_, i) => (
                <EventCard key={i} prop={i} day={day} width="100%" height={96} nameSize={13} badgeSize={10} emph={emph} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const TeamAccessCard: React.FC = () => (
  <div
    style={{
      width: 420,
      borderRadius: 20,
      padding: "18px 20px",
      background: "rgba(18,18,26,0.96)",
      border: "1px solid rgba(255,255,255,0.12)",
      boxShadow: "0 40px 80px -20px rgba(0,0,0,0.8)",
      fontFamily: FONT,
      color: C.text,
    }}
  >
    <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: C.violet300 }}>
      Team · Give access
    </div>
    <div style={{ fontSize: 22, fontWeight: 700, marginTop: 6 }}>Cleaning team</div>
    <div style={{ fontSize: 15, color: C.zinc400, marginTop: 10, marginBottom: 8, fontWeight: 600 }}>Can view</div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {[
        ["Cleanings", true],
        ["Arrivals", true],
        ["Calendars", true],
        ["Booking site", false],
      ].map(([l, on]) => (
        <span
          key={l as string}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            borderRadius: 99,
            fontSize: 15,
            fontWeight: 600,
            background: on ? "rgba(52,211,153,0.14)" : "rgba(255,255,255,0.04)",
            color: on ? "#6ee7b7" : C.zinc500,
            border: `1px solid ${on ? "rgba(52,211,153,0.35)" : "rgba(255,255,255,0.08)"}`,
          }}
        >
          {on ? <Check size={14} strokeWidth={3} /> : null}
          {l}
        </span>
      ))}
    </div>
  </div>
);
