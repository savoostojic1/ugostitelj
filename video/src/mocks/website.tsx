import React, { CSSProperties } from "react";
import { Img, staticFile } from "remotion";
import { CalendarDays, Check, MapPin, Search, Users } from "lucide-react";
import { FONT, HOST_SITE, PUBLIC } from "../theme";
import { prog, typed } from "../ui/kit";

export const UNITS = [
  { name: "Stone House", photo: "photos/hero-coast-house.jpg", guests: 4, amenities: "Sea view · Terrace · Parking", price: 105 },
  { name: "Sea View Apartment", photo: "photos/apartment-bedroom.jpg", guests: 3, amenities: "WiFi · Air conditioning · Balcony", price: 95 },
  { name: "Pine Bungalow", photo: "photos/garden-bungalow.jpg", guests: 2, amenities: "Garden · Porch · Parking", price: 80 },
];

export const WEBSITE_T = {
  scroll: 36,
  phone: 58,
  name: 88,
  email: 101,
  phoneNo: 114,
  message: 123,
  click: 150,
  sent: 155,
};

const GUEST = {
  name: "Laura Bennett",
  email: "laura@example.com",
  phone: "+44 7700 900123",
  message: "Hi! Is parking available?",
};

const label: CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: PUBLIC.muted,
};

export const WebsiteDesktop: React.FC<{ t: number }> = ({ t }) => {
  const scroll = prog(t, WEBSITE_T.scroll, 50) * 230;
  return (
    <div style={{ position: "absolute", inset: 0, background: PUBLIC.bg, color: PUBLIC.fg, fontFamily: FONT, overflow: "hidden" }}>
      <div style={{ transform: `translateY(${-scroll}px)` }}>
        <div style={{ height: 64, display: "flex", alignItems: "center", padding: "0 40px", borderBottom: `1px solid ${PUBLIC.border}` }}>
          <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>{HOST_SITE.title}</span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 30, fontSize: 16, color: PUBLIC.muted, fontWeight: 500 }}>
            <span>Accommodation</span>
            <span>Availability</span>
            <span>Contact</span>
          </div>
        </div>
        <div style={{ position: "relative", height: 380 }}>
          <Img src={staticFile(UNITS[0].photo)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.55) 100%)" }} />
          <div style={{ position: "absolute", left: 48, bottom: 78, color: "white" }}>
            <div style={{ fontSize: 54, fontWeight: 700, letterSpacing: "-0.03em" }}>{HOST_SITE.title}</div>
            <div style={{ fontSize: 20, marginTop: 6, display: "flex", alignItems: "center", gap: 8, opacity: 0.92 }}>
              <MapPin size={18} /> Stone houses and garden stays by the sea
            </div>
          </div>
        </div>
        <div
          style={{
            margin: "-40px 48px 0",
            position: "relative",
            background: "white",
            borderRadius: 18,
            boxShadow: "0 20px 50px -18px rgba(0,0,0,0.35)",
            border: `1px solid ${PUBLIC.border}`,
            display: "flex",
            alignItems: "center",
            padding: 10,
            gap: 6,
          }}
        >
          {[
            ["Check-in", "Jul 7", <CalendarDays key="a" size={18} />],
            ["Check-out", "Jul 11", <CalendarDays key="b" size={18} />],
            ["Guests", "2 guests", <Users key="c" size={18} />],
          ].map(([l, v, icon]) => (
            <div key={l as string} style={{ flex: 1, padding: "8px 18px", borderRight: `1px solid ${PUBLIC.border}` }}>
              <div style={label}>{l as string}</div>
              <div style={{ fontSize: 18, fontWeight: 600, marginTop: 4, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: PUBLIC.muted, display: "flex" }}>{icon as React.ReactNode}</span>
                {v as string}
              </div>
            </div>
          ))}
          <div
            style={{
              height: 54,
              padding: "0 28px",
              borderRadius: 12,
              background: PUBLIC.accent,
              color: "white",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 17,
              fontWeight: 600,
              marginLeft: 6,
            }}
          >
            <Search size={18} /> Search
          </div>
        </div>
        <div style={{ padding: "36px 48px" }}>
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em" }}>Our accommodation</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 22, marginTop: 20 }}>
            {UNITS.map((u) => (
              <div key={u.name} style={{ borderRadius: 18, overflow: "hidden", border: `1px solid ${PUBLIC.border}`, background: "white" }}>
                <Img src={staticFile(u.photo)} style={{ width: "100%", height: 210, objectFit: "cover", display: "block" }} />
                <div style={{ padding: "16px 18px" }}>
                  <div style={{ fontSize: 21, fontWeight: 700 }}>{u.name}</div>
                  <div style={{ fontSize: 15, color: PUBLIC.muted, marginTop: 4 }}>
                    Up to {u.guests} guests · {u.amenities}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
                    <span style={{ fontSize: 18 }}>
                      <b>€{u.price}</b> <span style={{ color: PUBLIC.muted, fontSize: 15 }}>/ night</span>
                    </span>
                    <span style={{ padding: "9px 18px", borderRadius: 10, background: PUBLIC.accent, color: "white", fontSize: 15, fontWeight: 600 }}>
                      Reserve
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const PhoneInput: React.FC<{ label: string; value: string; placeholder: string; focus: boolean; tall?: boolean }> = ({
  label: l,
  value,
  placeholder,
  focus,
  tall,
}) => (
  <div style={{ marginBottom: 10 }}>
    <div style={{ ...label, fontSize: 11, marginBottom: 5 }}>{l}</div>
    <div
      style={{
        height: tall ? 58 : 42,
        borderRadius: 10,
        border: `1.5px solid ${focus ? PUBLIC.accent : PUBLIC.border}`,
        background: PUBLIC.subtle,
        padding: tall ? "10px 12px" : "0 12px",
        display: "flex",
        alignItems: tall ? "flex-start" : "center",
        fontSize: 15,
        color: value ? PUBLIC.fg : "#a3a3a3",
      }}
    >
      {value || placeholder}
    </div>
  </div>
);

/** Phone layout; "Send request" sits at a fixed spot so the cursor can target it. */
export const PHONE_SEND_BUTTON = { x: 202, y: 720 };

export const WebsitePhone: React.FC<{ t: number }> = ({ t }) => {
  const T = WEBSITE_T;
  const formOut = prog(t, T.sent, 6);
  const sent = prog(t, T.sent + 5, 14);
  const name = typed(GUEST.name, t, T.name, 1.3);
  const email = typed(GUEST.email, t, T.email, 1.6);
  const phone = typed(GUEST.phone, t, T.phoneNo, 1.9);
  const message = typed(GUEST.message, t, T.message, 1.4);
  const press = prog(t, T.click - 2, 2) * (1 - prog(t, T.click + 1, 4));
  const u = UNITS[0];

  return (
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
      <div style={{ width: "100%", height: "100%", borderRadius: 46, overflow: "hidden", background: PUBLIC.bg, color: PUBLIC.fg, position: "relative" }}>
        <div style={{ position: "relative", height: 190 }}>
          <Img src={staticFile(u.photo)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <span style={{ width: 110, height: 30, borderRadius: 99, background: "#000", position: "absolute", left: 123, top: 10 }} />
        </div>
        <div style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>{u.name}</div>
          <div style={{ fontSize: 14, color: PUBLIC.muted, marginTop: 2 }}>{HOST_SITE.title} · Up to {u.guests} guests</div>

          <div style={{ position: "relative", marginTop: 14 }}>
            <div style={{ opacity: 1 - formOut }}>
              <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                <div style={{ flex: 1.2, borderRadius: 12, background: PUBLIC.subtle, padding: "10px 12px" }}>
                  <div style={{ ...label, fontSize: 10 }}>Your stay</div>
                  <div style={{ fontSize: 15, fontWeight: 600, marginTop: 4 }}>Jul 7 – Jul 11</div>
                </div>
                <div style={{ flex: 1, borderRadius: 12, background: PUBLIC.subtle, padding: "10px 12px" }}>
                  <div style={{ ...label, fontSize: 10 }}>Price</div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>
                    €420 <span style={{ fontWeight: 500, color: PUBLIC.muted, fontSize: 12 }}>4 nights</span>
                  </div>
                </div>
              </div>
              <PhoneInput label="Name" value={name} placeholder="Your name" focus={t >= T.name && t < T.email} />
              <PhoneInput label="Email" value={email} placeholder="you@email.com" focus={t >= T.email && t < T.phoneNo} />
              <PhoneInput label="Phone" value={phone} placeholder="+1 555 000 0000" focus={t >= T.phoneNo && t < T.message} />
              <PhoneInput
                label="Message"
                value={message}
                placeholder="Additional notes, questions about the stay…"
                focus={t >= T.message && t < T.click}
                tall
              />
            </div>
            {sent > 0 ? (
              <div style={{ position: "absolute", inset: 0, opacity: sent, transform: `translateY(${(1 - sent) * 12}px)`, paddingTop: 20 }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 99,
                    background: "#dcfce7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transform: `scale(${0.6 + 0.4 * sent})`,
                  }}
                >
                  <Check size={34} color="#16a34a" strokeWidth={3} />
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, marginTop: 18 }}>Request sent</div>
                <div style={{ fontSize: 16, lineHeight: 1.5, color: PUBLIC.muted, marginTop: 10 }}>
                  Thank you, {GUEST.name}. The host will confirm availability for{" "}
                  <b style={{ color: PUBLIC.fg }}>{u.name}</b> and reach out at {GUEST.email}.
                </div>
              </div>
            ) : null}
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            left: 20,
            right: 20,
            bottom: 22,
            height: 52,
            borderRadius: 14,
            background: PUBLIC.accent,
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 17,
            fontWeight: 600,
            opacity: 1 - formOut,
            transform: `scale(${1 - 0.04 * press})`,
          }}
        >
          Send request
        </div>
      </div>
    </div>
  );
};
