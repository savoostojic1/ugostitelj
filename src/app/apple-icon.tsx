import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #818cf8 0%, #6366f1 100%)",
          borderRadius: 40,
        }}
      >
        <div
          style={{
            fontSize: 108,
            fontWeight: 700,
            color: "white",
            lineHeight: 1,
            marginTop: -6,
          }}
        >
          U
        </div>
      </div>
    ),
    { ...size }
  );
}
