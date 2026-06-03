import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 112,
        }}
      >
        <div
          style={{
            fontSize: 280,
            fontWeight: 700,
            color: "white",
            lineHeight: 1,
            marginTop: -16,
          }}
        >
          U
        </div>
      </div>
    ),
    { ...size }
  );
}
