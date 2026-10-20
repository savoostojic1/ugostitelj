import type { Metadata } from "next";
import Link from "next/link";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { MarketingBreadcrumbs } from "@/components/marketing/marketing-breadcrumbs";
import { PageHero } from "@/components/marketing/page-hero";
import { Button } from "@/components/ui/button";
import { faqItems } from "@/lib/marketing/content";
import { JsonLd } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/site";
import { faqJsonLd } from "@/lib/seo/structured-data";

export const metadata: Metadata = pageMetadata({
  title: "Vacation rental software FAQ",
  description:
    "Answers about iCal sync limits, the Free plan, Pro, guest inquiries, and what the cleaning overview does and does not do.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <>
      <JsonLd data={faqJsonLd(faqItems)} />
      <MarketingBreadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "FAQ", path: "/faq" },
        ]}
      />
      <PageHero
        eyebrow="FAQ"
        title="Questions before you create an account"
        description="Calendar sync, the Free plan, inquiries, and the limits of the cleaning view."
        primaryCta={{ label: "Create a free account", href: "/register" }}
        secondaryCta={{ label: "Contact", href: "/contact" }}
      />

      <section className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-20">
        <FaqAccordion items={faqItems} />
        <div className="mt-10 rounded-2xl border border-border bg-card p-6 text-center">
          <h2 className="font-medium">Still stuck on setup?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Email us about a calendar link or the inquiry site. We cannot see
            your Airbnb or Booking.com account.
          </p>
          <Button className="mt-4" variant="outline" asChild>
            <Link href="/contact">Contact</Link>
          </Button>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
