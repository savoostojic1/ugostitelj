import React from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  Globe,
  Home,
  Send,
  Users,
} from "lucide-react";
import { MONTH, PROPERTIES, STAYS, TODAY, WEEKDAYS, barSegments } from "./data";
import { C, PUBLIC, STAGE_W } from "./theme";
import {
  Browser,
  Caption,
  GradientButton,
  ListItem,
  Logo,
  OutlineButton,
  PageHeader,
  Panel,
  Pointer,
  Screen,
  Wordmark,
  prog,
  stageStyle,
} from "./ui";

const PAD = 26;

const DashboardBody: React.FC<{ t: number }> = ({ t }) => {
  const glow = Math.sin(Math.max(0, t - 18) / 18) * prog(t, 16, 10) * (1 - prog(t, 70, 12));
  return (
    <div style={{ padding: PAD, color: C.text, height: "100%" }}>
      <PageHeader
        eyebrow="Operations"
        title="Dashboard"
        description="Feb 11 – Feb 14 · 2 properties"
        aside={
          <div style={{ display: "flex", gap: 8 }}>
            <OutlineButton>
              <Globe size={18} /> Booking site
            </OutlineButton>
            <GradientButton>Add property</GradientButton>
          </div>
        }
      />
      <div
        style={{
          marginTop: 22,
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1.15fr",
          gap: 14,
          alignItems: "start",
        }}
      >
        <Panel title="Arrivals today" icon={<ArrowDownLeft size={18} />} glow={Math.max(0, glow)}>
          <ListItem title="Emma Cole" subtitle="Olive Bungalow" />
        </Panel>
        <Panel title="Departures today" icon={<ArrowUpRight size={18} />}>
          <ListItem title="Reservation" subtitle="Pine Bungalow" />
        </Panel>
        <Panel title="Upcoming arrivals" icon={<CalendarDays size={18} />} action="View all">
          <ListItem title="Emma Cole" subtitle="Olive Bungalow" meta="Feb 11" />
          <ListItem title="Reservation" subtitle="Pine Bungalow" meta="Feb 16" />
        </Panel>
      </div>
      <div style={{ marginTop: 16 }}>
        <Panel title="Properties" icon={<Home size={18} />} action="View all">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {PROPERTIES.map((property) => (
              <div
                key={property.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 14px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.05)",
                  background: "rgba(255,255,255,0.02)",
                }}
              >
                <span
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 99,
                    background: property.color,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 22, fontWeight: 600, color: "white" }}>{property.name}</div>
                  <div style={{ marginTop: 2, fontSize: 16, color: "#71717a" }}>2 bookings</div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
      <Pointer x={250} y={250} opacity={prog(t, 10, 8) * (1 - prog(t, 72, 8))} />
    </div>
  );
};

export const ProblemScene: React.FC<{ t: number }> = ({ t }) => {
  const cards = [
    {
      kicker: "Arrival · Airbnb",
      title: "Olive Bungalow",
      sub: "Guest arriving",
      accent: "#ff5a5f",
      wash: "#fff1f1",
    },
    {
      kicker: "Departure · Booking.com",
      title: "Pine Bungalow",
      sub: "Guest leaving the same day",
      accent: "#003580",
      wash: "#eef3fb",
    },
    {
      kicker: "Cleaning",
      title: "Pine Bungalow",
      sub: "Who’s preparing it after checkout?",
      accent: "#b45309",
      wash: "#fff6eb",
    },
  ];
  const focusAt = [14, 38, 62];

  return (
    <Screen>
      <Caption text="Managing a few vacation rentals?" />
      <div style={{ ...stageStyle, display: "flex", alignItems: "flex-start", paddingTop: 8 }}>
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 18 }}>
          {cards.map((card, i) => {
            const focus = Math.min(
              prog(t, focusAt[i], 8),
              1 - prog(t, focusAt[i] + 24, 8)
            );
            return (
              <div
                key={card.kicker}
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  gap: 22,
                  padding: "26px 28px",
                  borderRadius: 24,
                  background: "#fffcf8",
                  border: `2px solid ${focus > 0.2 ? card.accent : "#e6e1d6"}`,
                  boxShadow:
                    focus > 0
                      ? `0 16px 40px rgba(40,32,20,0.08), 0 0 0 ${Math.round(focus * 4)}px ${card.wash}`
                      : "0 10px 30px rgba(40,32,20,0.05)",
                  transform: `translateY(${-focus * 3}px)`,
                }}
              >
                <div
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: 20,
                    background: focus > 0.4 ? card.wash : "#f3f0e8",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      letterSpacing: "0.14em",
                      color: "#8a8478",
                    }}
                  >
                    THU
                  </div>
                  <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1 }}>
                    11
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: card.accent,
                    }}
                  >
                    {card.kicker}
                  </div>
                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 36,
                      fontWeight: 700,
                      letterSpacing: "-0.03em",
                      lineHeight: 1.1,
                    }}
                  >
                    {card.title}
                  </div>
                  <div style={{ marginTop: 6, fontSize: 22, color: "#5c574e" }}>{card.sub}</div>
                </div>
                <Pointer x={STAGE_W - 150} y={36} opacity={focus > 0.45 ? 1 : 0} />
              </div>
            );
          })}
        </div>
      </div>
    </Screen>
  );
};

export const DashboardScene: React.FC<{ t: number }> = ({ t }) => (
  <Screen>
    <Caption text="I built Hostvia to make it simpler." />
    <Browser url="hostvia.me/dashboard" active="dashboard" top={206} height={700}>
      <div style={{ opacity: prog(t, 0, 10), transform: `translateY(${(1 - prog(t, 0, 12)) * 12}px)` }}>
        <DashboardBody t={t} />
      </div>
    </Browser>
  </Screen>
);

const MonthGrid: React.FC<{ prop: 0 | 1; emphasize?: boolean }> = ({ prop, emphasize }) => {
  const cellW = 120;
  const cellH = 56;
  const gap = 4;
  const stays = STAYS.filter((stay) => stay.prop === prop);
  const property = PROPERTIES[prop];

  return (
    <div
      style={{
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.07)",
        background: "rgba(255,255,255,0.02)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div style={{ width: 5, height: 28, borderRadius: 99, background: property.color }} />
        <div style={{ fontSize: 26, fontWeight: 700, color: "white" }}>{property.name}</div>
      </div>
      <div style={{ padding: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(7, ${cellW}px)`, gap, marginBottom: 8 }}>
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              style={{
                textAlign: "center",
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: "#71717a",
              }}
            >
              {day}
            </div>
          ))}
        </div>
        {Array.from({ length: 4 }).map((_, row) => (
          <div key={row} style={{ position: "relative", height: cellH, marginBottom: gap }}>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(7, ${cellW}px)`, gap, height: "100%" }}>
              {Array.from({ length: 7 }).map((__, col) => {
                const day = row * 7 + col + 1;
                const today = day === TODAY;
                return (
                  <div
                    key={col}
                    style={{
                      borderRadius: 10,
                      background: today ? "rgba(129,140,248,0.16)" : "rgba(255,255,255,0.03)",
                      boxShadow: today ? "inset 0 0 0 2px #818cf8" : undefined,
                      color: today ? "#c7d2fe" : "#e4e4e7",
                      fontSize: 18,
                      fontWeight: 700,
                      padding: "4px 0 0 8px",
                    }}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
            {stays.flatMap((stay) =>
              barSegments(stay)
                .filter((seg) => seg.row === row)
                .map((seg) => {
                  const width = (seg.endCol - seg.startCol + 1) * cellW + (seg.endCol - seg.startCol) * gap;
                  const arrival = emphasize && stay.checkIn === TODAY && seg.label.length > 0;
                  return (
                    <div
                      key={`${stay.checkIn}-${seg.startCol}`}
                      style={{
                        position: "absolute",
                        left: seg.startCol * (cellW + gap),
                        width,
                        top: 30,
                        height: 22,
                        borderRadius: 7,
                        background: stay.color,
                        color: "white",
                        fontSize: 14,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        paddingLeft: 8,
                        boxSizing: "border-box",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        boxShadow: arrival ? "0 0 0 3px rgba(255,255,255,0.85)" : undefined,
                      }}
                    >
                      {seg.label}
                    </div>
                  );
                })
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const CalendarScene: React.FC<{ t: number }> = ({ t }) => (
  <Screen>
    <Caption text="Bookings. Arrivals. Cleaning." />
    <Browser url="hostvia.me/dashboard/calendars" active="calendars">
      <div style={{ padding: PAD }}>
        <PageHeader
          eyebrow="Calendar view"
          title="Calendars"
          description="Occupancy across all properties"
          aside={
            <div
              style={{
                height: 44,
                padding: "0 16px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(0,0,0,0.2)",
                color: "white",
                display: "flex",
                alignItems: "center",
                fontSize: 18,
                fontWeight: 700,
              }}
            >
              {MONTH}
            </div>
          }
        />
        <div
          style={{
            marginTop: 18,
            display: "flex",
            flexDirection: "column",
            gap: 14,
            opacity: prog(t, 0, 8),
          }}
        >
          <MonthGrid prop={0} emphasize={prog(t, 16, 10) > 0.4} />
          <MonthGrid prop={1} />
        </div>
      </div>
    </Browser>
  </Screen>
);

const Badge: React.FC<{ label: string; bg: string; ring: string; letter?: string; letterBg?: string }> = ({
  label,
  bg,
  ring,
  letter,
  letterBg,
}) => (
  <div
    style={{
      width: "100%",
      boxSizing: "border-box",
      borderRadius: 10,
      background: bg,
      boxShadow: `0 0 0 2px ${ring}`,
      color: "white",
      padding: "8px 10px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
      fontSize: 16,
      fontWeight: 800,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
    }}
  >
    <span>{label}</span>
    {letter ? (
      <span
        style={{
          minWidth: 22,
          height: 22,
          padding: "0 5px",
          borderRadius: 5,
          background: letterBg,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
          boxShadow: "0 0 0 2px rgba(255,255,255,0.7)",
        }}
      >
        {letter}
      </span>
    ) : null}
  </div>
);

const PropertyCard: React.FC<{
  name: string;
  color: string;
  badge: React.ReactNode;
}> = ({ name, color, badge }) => (
  <div
    style={{
      flex: 1,
      minHeight: 168,
      borderRadius: 22,
      padding: "18px 16px",
      background: `linear-gradient(145deg, color-mix(in srgb, ${color} 88%, white) 0%, ${color} 100%)`,
      boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      color: "white",
    }}
  >
    <div style={{ fontSize: 24, fontWeight: 700, textAlign: "center", lineHeight: 1.15 }}>{name}</div>
    {badge}
  </div>
);

export const CleaningScene: React.FC<{ t: number }> = ({ t }) => (
  <Screen>
    <Caption text="Bookings. Arrivals. Cleaning." />
    <Browser url="hostvia.me/dashboard/cleanings" active="cleanings" top={206} height={560}>
      <div style={{ padding: PAD, opacity: prog(t, 0, 8) }}>
        <PageHeader
          eyebrow="Operations"
          title="Cleanings"
          description="Reservations, check-ins, check-outs and cleaning count by day"
        />
        <div
          style={{
            marginTop: 22,
            borderRadius: 18,
            border: "1px solid rgba(255,255,255,0.07)",
            background: "rgba(255,255,255,0.02)",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "16px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: "white" }}>{MONTH}</div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              padding: 18,
              background: C.rowToday,
            }}
          >
            <div
              style={{
                width: 128,
                height: 148,
                borderRadius: 22,
                background: C.todayBg,
                color: C.todayText,
                boxShadow: `0 0 0 2px ${C.todayRing}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1 }}>11</div>
              <div style={{ marginTop: 8, fontSize: 18, fontWeight: 700, color: C.checkOut }}>1 cleaning</div>
            </div>
            <PropertyCard
              name="Olive Bungalow"
              color={PROPERTIES[0].color}
              badge={
                <Badge
                  label="Check in"
                  bg={C.checkIn}
                  ring={C.checkInRing}
                  letter="D"
                  letterBg={C.direct}
                />
              }
            />
            <PropertyCard
              name="Pine Bungalow"
              color={PROPERTIES[1].color}
              badge={<Badge label="Checkout" bg={C.checkOut} ring={C.checkOutRing} />}
            />
          </div>
        </div>
        <Pointer x={760} y={248} opacity={prog(t, 12, 8)} />
      </div>
    </Browser>
  </Screen>
);

export const WebsiteScene: React.FC<{ t: number }> = ({ t }) => {
  const sent = t >= 32;
  return (
    <Screen>
      <Caption text="Your own website for direct inquiries." />
      <Browser url="olivepine.hostvia.me" active={null} top={206} height={680}>
        <div style={{ height: "100%", background: PUBLIC.bg, color: PUBLIC.fg, padding: 22 }}>
          <div style={{ display: "grid", gridTemplateColumns: "0.86fr 1.14fr", gap: 16, height: "100%" }}>
            <div
              style={{
                background: PUBLIC.card,
                border: `1px solid ${PUBLIC.border}`,
                borderRadius: 20,
                padding: 22,
                boxShadow: "0 12px 40px rgba(13,110,110,0.08)",
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: PUBLIC.muted,
                }}
              >
                Your stay
              </div>
              <div style={{ marginTop: 8, fontSize: 32, fontWeight: 700, letterSpacing: "-0.03em" }}>
                Olive Bungalow
              </div>
              <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 12, fontSize: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, color: PUBLIC.muted }}>
                  <CalendarRange size={20} color="#0f9488" />
                  11 February – 15 February 2027
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, color: PUBLIC.muted }}>
                  <Users size={20} color="#0f9488" />2 guests
                </div>
              </div>
              <div
                style={{
                  marginTop: 20,
                  borderRadius: 14,
                  border: `1px solid ${PUBLIC.border}`,
                  background: PUBLIC.subtle,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: PUBLIC.muted,
                  }}
                >
                  Price
                </div>
                <div style={{ marginTop: 4, fontSize: 32, fontWeight: 700 }}>€360</div>
                <div style={{ marginTop: 4, fontSize: 16, color: PUBLIC.muted }}>total for 4 nights</div>
                <div style={{ marginTop: 2, fontSize: 16, fontWeight: 600, color: "#0f9488" }}>€90 per night</div>
              </div>
            </div>
            <div
              style={{
                position: "relative",
                background: PUBLIC.card,
                border: `1px solid ${PUBLIC.border}`,
                borderRadius: 20,
                overflow: "hidden",
                boxShadow: "0 12px 40px rgba(13,110,110,0.08)",
              }}
            >
              <div style={{ display: sent ? "none" : "block", padding: "22px 22px 18px" }}>
                <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.03em" }}>Your details</div>
                <div style={{ marginTop: 6, fontSize: 17, color: PUBLIC.muted, lineHeight: 1.35 }}>
                  Leave your contact info — the host will reach out to confirm
                </div>
                <Field label="Full name" value="Laura Bennett" />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <Field label="Email" value="laura@example.com" />
                  <Field label="Phone" value="+1 555 010 0198" />
                </div>
                <div
                  style={{
                    marginTop: 16,
                    height: 58,
                    borderRadius: 12,
                    background: PUBLIC.button,
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    fontSize: 20,
                    fontWeight: 700,
                    transform: `scale(${1 - prog(t, 26, 6) * 0.03 + prog(t, 32, 6) * 0.03})`,
                  }}
                >
                  Send request <Send size={18} />
                </div>
              </div>
              <div
                style={{
                  display: sent ? "flex" : "none",
                  minHeight: 420,
                  background: PUBLIC.card,
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  padding: 32,
                }}
              >
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 18,
                    background: PUBLIC.successSoft,
                    color: PUBLIC.success,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CheckCircle2 size={36} />
                </div>
                <div style={{ marginTop: 16, fontSize: 34, fontWeight: 700, letterSpacing: "-0.03em" }}>
                  Request sent
                </div>
                <div style={{ marginTop: 10, fontSize: 18, lineHeight: 1.4, color: PUBLIC.muted, maxWidth: 460 }}>
                  Thank you, Laura Bennett. The host will confirm availability for Olive Bungalow and reach out at
                  laura@example.com.
                </div>
              </div>
              <Pointer x={360} y={292} opacity={sent ? 0 : prog(t, 12, 8)} />
            </div>
          </div>
        </div>
      </Browser>
    </Screen>
  );
};

const Field: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{ marginTop: 12 }}>
    <div
      style={{
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: PUBLIC.muted,
      }}
    >
      {label}
    </div>
    <div
      style={{
        marginTop: 6,
        height: 46,
        borderRadius: 12,
        border: `1px solid ${PUBLIC.border}`,
        background: PUBLIC.subtle,
        display: "flex",
        alignItems: "center",
        padding: "0 12px",
        fontSize: 18,
        fontWeight: 600,
      }}
    >
      {value}
    </div>
  </div>
);

export const CtaScene: React.FC<{ t: number }> = ({ t }) => {
  const rise = prog(t, 0, 12);
  return (
    <Screen>
      <div
        style={{
          position: "absolute",
          left: 76,
          top: 42,
          opacity: rise,
          transform: `translateY(${(1 - rise) * 10}px)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Logo size={64} />
          <Wordmark size={42} light />
        </div>
        <div
          style={{
            marginTop: 22,
            fontSize: 46,
            fontWeight: 700,
            letterSpacing: "-0.038em",
            lineHeight: 1.08,
            color: "#17171c",
          }}
        >
          Built for small vacation rental owners.
        </div>
        <div style={{ marginTop: 10, fontSize: 32, fontWeight: 700, color: "#4338ca" }}>
          Start free — up to 2 properties.
        </div>
        <div style={{ marginTop: 8, fontSize: 26, fontWeight: 600, color: "#5c5766" }}>hostvia.me</div>
      </div>
      <Browser url="hostvia.me/dashboard" active="dashboard" top={292} height={700}>
        <DashboardBody t={120} />
      </Browser>
    </Screen>
  );
};
