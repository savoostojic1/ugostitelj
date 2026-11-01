import type { Metadata } from "next";
import { GuestGuideBuilderShell } from "@/components/guest-guide/builder/builder-shell";
import { guestGuideFontClassNames } from "@/lib/guest-guide/fonts";
import { privatePageMetadata } from "@/lib/seo/site";

export const metadata: Metadata = privatePageMetadata(
  "Create guest guide",
  "Build your free Hostvia digital guest guide. Drafts are private and not indexed."
);

export default function CreateGuestGuidePage() {
  return (
    <div className={guestGuideFontClassNames()}>
      <GuestGuideBuilderShell />
    </div>
  );
}
