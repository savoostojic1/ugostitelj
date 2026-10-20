import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { TrackPricingView } from "@/components/analytics/track-pricing-view";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { MarketingBreadcrumbs } from "@/components/marketing/marketing-breadcrumbs";
import { PageHero } from "@/components/marketing/page-hero";
import { PricingSection } from "@/components/marketing/pricing-section";
import { pricingPlans, pricingSectionCopy } from "@/lib/marketing/content";
import { pageMetadata } from "@/lib/seo/site";
import { FREE_PROPERTY_LIMIT, PRO_MONTHLY_PRICE_USD } from "@/lib/subscriptions/plans";

export const metadata: Metadata = pageMetadata({
  title: "Vacation rental software pricing",
  description: `Start free with up to ${FREE_PROPERTY_LIMIT} properties. Pro is $${PRO_MONTHLY_PRICE_USD} per month and removes that property limit.`,
  path: "/pricing",
});

export default function PricingPage() {
  const plan = pricingPlans[0];

  return (
    <>
      <TrackPricingView />
      <MarketingBreadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Pricing", path: "/pricing" },
        ]}
      />
      <PageHero
        eyebrow="Pricing"
        title={pricingSectionCopy.headline}
        description={pricingSectionCopy.subheadline}
        primaryCta={{ label: "Create a free account", href: "/register" }}
      />

      <PricingSection compact showHeadline={false} />

      <section className="border-y border-white/5 bg-white/[0.02] py-16 md:py-20">
        <div className="marketing-container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="marketing-heading text-2xl text-white">Free plan</h2>
            <p className="mt-4 text-sm leading-relaxed text-zinc-400 sm:text-base">
              Up to {FREE_PROPERTY_LIMIT} active properties. The inquiry site,
              calendar sync, reservations, dashboard, arrivals, cleaning
              overview, and saved messages are included. No card is required.
            </p>
          </div>
          <ul className="mx-auto mt-10 grid max-w-2xl gap-3 sm:grid-cols-2">
            {plan.features.map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3 text-sm text-zinc-300"
              >
                <Check className="h-4 w-4 shrink-0 text-cyan-400" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="marketing-container">
          <div className="mx-auto max-w-3xl">
            <h2 className="marketing-heading text-2xl text-white">Pro plan</h2>
            <p className="mt-4 text-sm leading-relaxed text-zinc-400 sm:text-base">
              Pro is ${PRO_MONTHLY_PRICE_USD} per month for the whole account,
              not per property. It is for accounts that need more than{" "}
              {FREE_PROPERTY_LIMIT} active properties. Billing is through
              Stripe. If the account returns to Free, the two oldest properties
              stay active and the others lock until you delete them or upgrade
              again.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-zinc-400">
              Free and Pro use the same product features. Pro does not add a
              separate portfolio tool or a separate support channel.
            </p>
            <p className="mt-8 text-sm text-zinc-500">
              You cancel in the Stripe billing portal. Access continues until
              the end of the period already paid.{" "}
              <Link href="/terms" className="text-violet-300 hover:underline">
                Terms
              </Link>
              {" · "}
              <Link href="/privacy" className="text-violet-300 hover:underline">
                Privacy
              </Link>
              {" · "}
              <Link href="/refund-policy" className="text-violet-300 hover:underline">
                Refunds and cancellation
              </Link>
            </p>
          </div>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
