import type { Metadata } from "next";
import { Check } from "lucide-react";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { PageHero } from "@/components/marketing/page-hero";
import { PricingSection } from "@/components/marketing/pricing-section";
import { pricingPlans, pricingSectionCopy } from "@/lib/marketing/content";

export const metadata: Metadata = {
  title: "Pricing — Hostvia",
  description:
    "Start free with up to 2 properties. All core features included — no credit card required.",
};

export default function CijenePage() {
  const plan = pricingPlans[0];

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
        <div className="marketing-container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="marketing-heading text-2xl text-white">
              Everything you need to start
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-zinc-400 sm:text-base">
              Property management, calendar sync, reservations, dashboard, direct
              booking website, and guest messaging — free for up to 2 properties.
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

      <CtaBanner />
    </>
  );
}
