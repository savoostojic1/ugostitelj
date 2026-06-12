import { ImageResponse } from "next/og";
import { HostviaAppIconMarkup } from "@/lib/brand/hostvia-app-icon";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(<HostviaAppIconMarkup size={512} />, { ...size });
}
