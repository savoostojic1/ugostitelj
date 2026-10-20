import { ImageResponse } from "next/og";

export const alt = "Hostvia — vacation rental tools for small hosts";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#07070d",
          color: "white",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 28,
            fontWeight: 700,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
            }}
          />
          Hostvia
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1, maxWidth: 900 }}>
            Vacation rental tools for small hosts
          </div>
          <div style={{ fontSize: 28, color: "#c4c4ce", maxWidth: 860 }}>
            Calendars, arrivals, cleaning overview, and a site for direct guest inquiries.
          </div>
        </div>
        <div style={{ fontSize: 24, color: "#a1a1aa" }}>hostvia.me</div>
      </div>
    ),
    { ...size }
  );
}
