import type { Metadata } from "next";
import { GuestGuideDemoPreviewPage } from "@/components/guest-guide/landing/demo-preview-page";
import { privatePageMetadata } from "@/lib/seo/site";

export const metadata: Metadata = privatePageMetadata(
  "Guest guide live preview",
  "Fullscreen Hostvia guest guide demo preview. Not indexed."
);

export default async function GuestGuideDemoPage({
  searchParams,
}: {
  searchParams: Promise<{ theme?: string }>;
}) {
  const params = await searchParams;
  return <GuestGuideDemoPreviewPage initialTheme={params.theme} />;
}
