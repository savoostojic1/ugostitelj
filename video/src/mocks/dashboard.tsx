import React from "react";
import { ArrowDownLeft, ArrowRight, ArrowUpRight, BarChart3, CalendarDays, Globe, Plus, TrendingUp } from "lucide-react";
import { C, PROPERTIES } from "../theme";
import { MONTH, STAYS, TODAY, occupancyPercent } from "../data";
import { AppShell, GradientButton, OutlineButton, PageHeader, Panel, prog } from "../ui/kit";

const Item: React.FC<{ title: string; subtitle: string; meta?: string }> = ({ title, subtitle, meta }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "11px 14px",
      borderRadius: 12,
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.06)",
      marginBottom: 8,
    }}
  >
    <div>
      <div style={{ fontSize: 16, fontWeight: 600 }}>{title}</div>
      <div style={{ fontSize: 14, color: C.zinc500, marginTop: 2 }}>{subtitle}</div>
    </div>
    {meta ? <div style={{ fontSize: 14, color: C.zinc500 }}>{meta}</div> : null}
  </div>
);

const StatCard: React.FC<{ label: string; value: number; icon: React.ReactNode; accent: string }> = ({
  label,
  value,
  icon,
  accent,
}) => (
  <div
    style={{
      flex: 1,
      borderRadius: 18,
      padding: "18px 22px",
      background: "rgba(255,255,255,0.025)",
      border: "1px solid rgba(255,255,255,0.08)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}
  >
    <div>
      <div style={{ fontSize: 15, color: C.zinc400 }}>{label}</div>
      <div style={{ fontSize: 38, fontWeight: 700, marginTop: 4 }}>{value}</div>
    </div>
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: 14,
        background: `color-mix(in srgb, ${accent} 16%, transparent)`,
        color: accent,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {icon}
    </div>
  </div>
);

export const DashboardPage: React.FC<{ t: number }> = ({ t }) => {
  const a = (i: number) => {
    const p = prog(t, 4 + i * 4, 18);
    return { opacity: p, transform: `translateY(${(1 - p) * 16}px)` };
  };
  const arrivals = STAYS.filter((s) => s.checkIn === TODAY);
  const departures = STAYS.filter((s) => s.checkOut === TODAY);
  const upcoming = STAYS.filter((s) => s.checkIn > TODAY)
    .sort((x, y) => x.checkIn - y.checkIn)
    .slice(0, 3);
  const week = STAYS.filter((s) => s.checkIn >= TODAY && s.checkIn <= TODAY + 7).length;

  return (
    <AppShell active="Dashboard">
      <div style={a(0)}>
        <PageHeader
          eyebrow="Operations"
          title="Dashboard"
          description={`This week · ${PROPERTIES.length} properties`}
          actions={
            <>
              <OutlineButton>
                <Globe size={17} /> Booking site
              </OutlineButton>
              <GradientButton>
                <Plus size={17} /> Add property
              </GradientButton>
            </>
          }
        />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18, marginBottom: 18 }}>
        <div
          style={{
            ...a(1),
            position: "relative",
            overflow: "hidden",
            borderRadius: 20,
            padding: "24px 28px",
            background: "linear-gradient(135deg, rgba(139,92,246,0.16), rgba(34,211,238,0.06))",
            border: "1px solid rgba(167,139,250,0.22)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.violet300 }}>
              <TrendingUp size={18} />
              <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                Occupancy
              </span>
            </div>
            <div style={{ fontSize: 64, fontWeight: 700, letterSpacing: "-0.04em", marginTop: 8 }}>
              {occupancyPercent()}%
            </div>
            <div style={{ fontSize: 15, color: C.zinc400, maxWidth: 360, marginTop: 4 }}>
              Portfolio occupancy across the next 28 days.
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              [arrivals.length, "Arrivals today", C.checkIn],
              [departures.length, "Departures today", C.checkOut],
            ].map(([v, l, c]) => (
              <div
                key={l as string}
                style={{
                  borderRadius: 14,
                  padding: "14px 18px",
                  background: "rgba(0,0,0,0.22)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  minWidth: 150,
                }}
              >
                <div style={{ fontSize: 32, fontWeight: 700, color: c as string }}>{v}</div>
                <div style={{ fontSize: 14, color: C.zinc500 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ ...a(2), display: "flex", flexDirection: "column", gap: 18 }}>
          <StatCard label="Reservations this week" value={week} icon={<CalendarDays size={22} />} accent={C.cyan} />
          <StatCard label="Active properties" value={PROPERTIES.length} icon={<BarChart3 size={22} />} accent={C.violet} />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18 }}>
        <Panel title="Arrivals today" icon={<ArrowDownLeft size={18} />} style={a(3)}>
          {arrivals.map((s, i) => (
            <Item key={i} title={s.guest} subtitle={PROPERTIES[s.prop].name} />
          ))}
        </Panel>
        <Panel title="Departures today" icon={<ArrowUpRight size={18} />} style={a(4)}>
          {departures.map((s, i) => (
            <Item key={i} title={s.guest} subtitle={PROPERTIES[s.prop].name} />
          ))}
        </Panel>
        <Panel
          title="Upcoming arrivals"
          icon={<CalendarDays size={18} />}
          action={
            <span style={{ fontSize: 14, color: C.zinc400, display: "flex", alignItems: "center", gap: 4 }}>
              View all <ArrowRight size={14} />
            </span>
          }
          style={a(5)}
        >
          {upcoming.map((s, i) => (
            <Item key={i} title={s.guest} subtitle={PROPERTIES[s.prop].name} meta={`${MONTH.short} ${s.checkIn}`} />
          ))}
        </Panel>
      </div>
    </AppShell>
  );
};
