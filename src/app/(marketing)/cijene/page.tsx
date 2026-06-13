import type { Metadata } from "next";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { PageHero } from "@/components/marketing/page-hero";
import { PricingSection } from "@/components/marketing/pricing-section";
import { pricingSectionCopy } from "@/lib/marketing/content";

export const metadata: Metadata = {
  title: "Pricing — Hostvia",
  description:
    "Start free with up to 2 properties. Upgrade to Pro for unlimited properties at 20€/month launch price.",
};

export default function CijenePage() {
  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title={pricingSectionCopy.headline}
        description={pricingSectionCopy.subheadline}
        primaryCta={{ label: "Start free", href: "/register" }}
      />

      <PricingSection compact showHeadline={false} />

      <section className="border-y border-white/5 bg-white/[0.02] py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center md:px-6">
          <h2 className="marketing-heading text-2xl text-white">
            What&apos;s included in Free?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Property management, calendar sync with Airbnb and Booking.com,
            reservations, dashboard, direct booking website, and guest messaging
            tools — free for up to 2 properties. No credit card required.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            When you grow beyond two properties, Pro unlocks unlimited listings
            for {20}€/month (launch price, regular {30}€/month). Billing is
            handled securely by Stripe.
          </p>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
