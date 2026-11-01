import type { Metadata } from "next";
import { GuestGuidesDashboard } from "@/components/guest-guide/dashboard/guides-dashboard";
import { privatePageMetadata } from "@/lib/seo/site";

export const metadata: Metadata = privatePageMetadata(
  "Guest Guides",
  "Manage your free Hostvia digital guest guides."
);

export default function GuestGuidesPage() {
  return <GuestGuidesDashboard />;
}
