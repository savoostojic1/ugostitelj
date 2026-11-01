import type { Metadata } from "next";
import { MarketingBreadcrumbs } from "@/components/marketing/marketing-breadcrumbs";
import { GuestGuideLandingPage } from "@/components/guest-guide/landing/landing-page";
import { JsonLd } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/site";
import { faqJsonLd } from "@/lib/seo/structured-data";
import { FREE_TOOLS_PATH } from "@/lib/tools/free-tools";
import {
  GUEST_GUIDE_DESCRIPTION,
  GUEST_GUIDE_FAQ,
  GUEST_GUIDE_PATH,
  GUEST_GUIDE_SEO_TITLE,
} from "@/lib/guest-guide/content";
import { guestGuideFontClassNames } from "@/lib/guest-guide/fonts";

export const metadata: Metadata = pageMetadata({
  title: GUEST_GUIDE_SEO_TITLE,
  description: GUEST_GUIDE_DESCRIPTION,
  path: GUEST_GUIDE_PATH,
  absoluteTitle: true,
});

export default function GuestGuideGeneratorPage() {
  return (
    <>
      <JsonLd data={faqJsonLd(GUEST_GUIDE_FAQ)} />
      <MarketingBreadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Free tools", path: FREE_TOOLS_PATH },
          { name: "Guest guide generator", path: GUEST_GUIDE_PATH },
        ]}
      />
      <article className={`gg-landing ${guestGuideFontClassNames()}`}>
        <GuestGuideLandingPage />
      </article>
    </>
  );
}
