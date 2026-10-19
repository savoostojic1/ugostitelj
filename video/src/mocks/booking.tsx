import React, { CSSProperties, ReactNode } from "react";
import { CalendarDays, ChevronDown, Link2, Plus } from "lucide-react";
import { C, PROPERTIES } from "../theme";
import { MONTH, NEW_BOOKING, STAYS, weekdayOf } from "../data";
import { AppShell, GradientButton, PageHeader, Panel, glow, prog, pulse, typed } from "../ui/kit";
import { MonthGrid, SourceLegend } from "./calendar";

/** Local-frame choreography of the booking form, shared with the scene's cursor. */
export const BOOKING_T = {
  guest: 22,
  dates: 44,
  source: 64,
  phone: 80,
  price: 92,
  click: 120,
  reveal: 126,
  export: 140,
};

const Field: React.FC<{ label: string; children: ReactNode; focus?: number; style?: CSSProperties }> = ({
  label,
  children,
  focus = 0,
  style,
}) => (
  <div style={{ flex: 1, ...style }}>
    <div style={{ fontSize: 15, fontWeight: 600, color: C.zinc300, marginBottom: 8 }}>{label}</div>
    <div
      style={{
        height: 50,
        borderRadius: 12,
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${focus > 0.5 ? "rgba(167,139,250,0.7)" : "rgba(255,255,255,0.10)"}`,
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        fontSize: 18,
        color: C.text,
        gap: 10,
        ...glow(focus, C.violet, 2),
      }}
    >
      {children}
    </div>
  </div>
);

const Caret: React.FC<{ on: boolean; t: number }> = ({ on, t }) =>
  on && Math.floor(t / 8) % 2 === 0 ? (
    <span style={{ width: 2, height: 22, background: C.violet300, marginLeft: -8 }} />
  ) : null;

const Placeholder: React.FC<{ text: string }> = ({ text }) => <span style={{ color: C.zinc600 }}>{text}</span>;

export const BookingForm: React.FC<{ t: number }> = ({ t }) => {
  const T = BOOKING_T;
  const guest = typed(NEW_BOOKING.guest, t, T.guest, 0.9);
  const source = typed("Instagram", t, T.source, 0.9);
  const phone = typed("+1 555 014 2233", t, T.phone, 1.6);
  const price = typed("480", t, T.price, 0.4);
  const datesP = prog(t, T.dates, 10);
  const active = (start: number, end: number) => pulse(t, start - 4, end, 6);
  const pressed = pulse(t, T.click - 2, T.click + 4, 3);

  return (
    <Panel title="Add reservation" icon={<Plus size={18} />} style={{ height: "100%" }} bodyStyle={{ padding: 24 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <Field label="Property">
          <span style={{ width: 11, height: 11, borderRadius: 99, background: PROPERTIES[0].color }} />
          {PROPERTIES[0].name}
          <ChevronDown size={18} color={C.zinc500} style={{ marginLeft: "auto" }} />
        </Field>
        <div style={{ display: "flex", gap: 16 }}>
          <Field label="Guest name" focus={active(T.guest, T.dates - 2)}>
            {guest ? guest : <Placeholder text="e.g. John Smith" />}
            <Caret on={t >= T.guest && t < T.dates - 2} t={t} />
          </Field>
          <Field label="Phone number" focus={active(T.phone, T.price - 2)}>
            {phone ? phone : <Placeholder text="e.g. +1 555 123 4567" />}
          </Field>
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: C.zinc300, marginBottom: 8 }}>Stay dates</div>
          <div style={{ display: "flex", gap: 16 }}>
            {[
              ["Check-in", NEW_BOOKING.checkIn],
              ["Check-out", NEW_BOOKING.checkOut],
            ].map(([l, d], i) => {
              const p = prog(t, T.dates + i * 6, 10);
              return (
                <div
                  key={l as string}
                  style={{
                    flex: 1,
                    height: 62,
                    borderRadius: 12,
                    border: `1px solid ${p > 0.5 ? "rgba(167,139,250,0.55)" : "rgba(255,255,255,0.10)"}`,
                    background: p > 0.5 ? "rgba(139,92,246,0.10)" : "rgba(255,255,255,0.03)",
                    padding: "8px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    ...glow(active(T.dates + i * 6, T.dates + 16 + i * 4), C.violet, 2),
                  }}
                >
                  <CalendarDays size={20} color={i === 0 ? C.checkIn : C.checkOut} />
                  <div>
                    <div style={{ fontSize: 13, color: C.zinc500, fontWeight: 600 }}>{l}</div>
                    <div style={{ fontSize: 18, fontWeight: 600, opacity: datesP > 0 ? p : 0 }}>
                      {`${weekdayOf(d as number)}, ${MONTH.short} ${d}`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <Field label="Booking source" focus={active(T.source, T.phone - 2)}>
            {source ? source : <Placeholder text="e.g. Direct, Instagram, referral" />}
          </Field>
          <Field label="Price (€)" focus={active(T.price, T.click - 12)} style={{ flex: 0.7 }}>
            {price ? (
              <>
                <span style={{ color: C.zinc500 }}>€</span>
                {price}
              </>
            ) : (
              <Placeholder text="e.g. 120" />
            )}
          </Field>
        </div>
        <GradientButton
          style={{
            height: 52,
            justifyContent: "center",
            fontSize: 18,
            transform: `scale(${1 - 0.03 * pressed})`,
            marginTop: 4,
          }}
        >
          Add reservation
        </GradientButton>
      </div>
    </Panel>
  );
};

export const BookingPage: React.FC<{ t: number }> = ({ t }) => {
  const T = BOOKING_T;
  const reveal = prog(t, T.reveal, 18);
  const barGlow = pulse(t, T.reveal + 8, T.reveal + 50, 10);
  const exportP = prog(t, T.export, 16);
  const exportGlow = pulse(t, T.export + 6, T.export + 40, 10);
  const enter = (i: number) => {
    const p = prog(t, 4 + i * 5, 18);
    return { opacity: p, transform: `translateY(${(1 - p) * 16}px)` };
  };

  return (
    <AppShell active="Manual bookings">
      <div style={enter(0)}>
        <PageHeader
          eyebrow="Bookings"
          title="Manual bookings"
          description="Reservations you enter manually, outside Airbnb/Booking calendars"
        />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "560px 1fr", gap: 26, height: 540 }}>
        <div style={enter(1)}>
          <BookingForm t={t} />
        </div>
        <div style={{ ...enter(2), display: "flex", flexDirection: "column", gap: 16 }}>
          <Panel
            title={PROPERTIES[0].name}
            icon={<span style={{ width: 11, height: 11, borderRadius: 99, background: PROPERTIES[0].color, display: "block" }} />}
            action={<span style={{ fontSize: 16, color: C.zinc400 }}>{MONTH.label}</span>}
            bodyStyle={{ padding: "14px 18px 10px" }}
          >
            <MonthGrid
              t={t}
              prop={0}
              stays={[...STAYS, NEW_BOOKING]}
              cellW={90}
              cellH={50}
              gap={4}
              barH={20}
              dayFont={14}
              drawStart={10}
              labels
              revealStay={{ stay: NEW_BOOKING, p: reveal }}
              glowStay={{ stay: NEW_BOOKING, p: barGlow }}
            />
            <div style={{ marginTop: 4 }}>
              <SourceLegend size={14} />
            </div>
          </Panel>
          <div
            style={{
              borderRadius: 16,
              padding: "14px 18px",
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              gap: 14,
              alignItems: "center",
              opacity: 0.35 + 0.65 * exportP,
              ...glow(exportGlow, C.cyan, 2),
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                flexShrink: 0,
                background: "rgba(34,211,238,0.12)",
                color: C.cyan,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Link2 size={22} />
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 600 }}>Calendar export link</div>
              <div style={{ fontSize: 15, color: C.zinc400, marginTop: 3, lineHeight: 1.35 }}>
                Manual bookings are included in the export you add to Airbnb and Booking.com.
                They pick it up on their own sync schedule.
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};
