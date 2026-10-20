import Link from "next/link";
import type { Metadata } from "next";
import { privatePageMetadata } from "@/lib/seo/site";

export const metadata: Metadata = privatePageMetadata(
  "Page not found",
  "This Hostvia page does not exist."
);

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "50vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        textAlign: "center",
      }}
    >
      <h2 style={{ fontSize: 18, fontWeight: 600 }}>Page not found</h2>
      <Link href="/" style={{ color: "#818cf8" }}>
        Back to home
      </Link>
    </div>
  );
}
