import { ImageResponse } from "next/og";
import { HostviaAppIconMarkup } from "@/lib/brand/hostvia-app-icon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(<HostviaAppIconMarkup size={180} />, { ...size });
}
