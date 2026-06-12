import type { Metadata } from "next";
import { Check } from "lucide-react";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { MarketingAuthButton } from "@/components/marketing/marketing-auth-button";
import { PageHero } from "@/components/marketing/page-hero";
import { pricingPlans } from "@/lib/marketing/content";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pricing — Hostvia",
  description:
    "Currently free access to all Hostvia features — calendar, booking site and inquiries.",
};

export default function CijenePage() {
  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title="Simple and transparent"
        description="All features are currently free during early access. No hidden costs, no credit card required to sign up."
        primaryCta={{ label: "Start free", href: "/register" }}
      />

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <div className="grid gap-8 lg:grid-cols-2">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative rounded-2xl border p-8",
                plan.highlighted
                  ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                  : "border-border bg-card"
              )}
            >
              {plan.highlighted ? (
                <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  Recommended
                </span>
              ) : null}
              <h3 className="text-xl font-semibold">{plan.name}</h3>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-bold tracking-tight">
                  {plan.price}
                </span>
                {plan.period ? (
                  <span className="text-muted-foreground">/ {plan.period}</span>
                ) : null}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {plan.description}
              </p>
              <ul className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
              <MarketingAuthButton
                className="mt-8 w-full"
                variant={plan.highlighted ? "default" : "outline"}
                loggedOutHref={plan.href}
                loggedOutLabel={plan.cta}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-card/30 py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center md:px-6">
          <h2 className="marketing-heading text-2xl">What&apos;s included?</h2>
          <p className="mt-4 text-muted-foreground">
            The free plan includes everything a host needs for day-to-day work:
            calendar sync, booking site, inquiries, date-based pricing,
            gallery, map, manual bookings and iCal export.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            The Pro plan will be available later for larger portfolios and teams.
            We will notify you in advance before any pricing changes.
          </p>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
