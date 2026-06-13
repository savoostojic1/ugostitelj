"use client";

import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { MarketingPlanCta } from "@/components/marketing/marketing-plan-cta";
import { pricingPlans, pricingSectionCopy } from "@/lib/marketing/content";
import { cn } from "@/lib/utils";
import {
  PRO_LAUNCH_PRICE_EUR,
  PRO_REGULAR_PRICE_EUR,
} from "@/lib/subscriptions/plans";

interface PricingSectionProps {
  compact?: boolean;
  showHeadline?: boolean;
}

export function PricingSection({
  compact = false,
  showHeadline = true,
}: PricingSectionProps) {
  return (
    <section className={cn(compact ? "" : "marketing-section")}>
      <div className={cn(compact ? "" : "marketing-container")}>
        {showHeadline ? (
          <div className="mx-auto max-w-2xl text-center">
            <p className="marketing-eyebrow mb-4 justify-center">
              {pricingSectionCopy.eyebrow}
            </p>
            <h2 className="marketing-heading text-3xl text-white md:text-4xl">
              {pricingSectionCopy.headline}
            </h2>
            <p className="mt-3 text-sm text-zinc-400 sm:mt-4 sm:text-base">
              {pricingSectionCopy.subheadline}
            </p>
          </div>
        ) : null}

        <div
          className={cn(
            "mx-auto grid max-w-5xl gap-5 sm:gap-6 lg:grid-cols-2 lg:gap-8",
            showHeadline ? "mt-10 sm:mt-12" : "mt-0"
          )}
        >
          {pricingPlans.map((plan) => {
            const isPro = plan.tier === "pro";

            return (
              <div
                key={plan.name}
                className={cn(
                  "relative overflow-hidden rounded-2xl p-6 sm:p-8",
                  isPro
                    ? "border border-violet-500/30 bg-gradient-to-b from-violet-500/15 via-[#0c0c14] to-[#080810] shadow-[0_0_60px_-12px_rgba(139,92,246,0.45)]"
                    : "border border-white/10 bg-white/[0.02]"
                )}
              >
                {isPro ? (
                  <>
                    <div
                      className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-violet-500/25 blur-3xl"
                      aria-hidden
                    />
                    <span className="absolute -top-px left-6 inline-flex items-center gap-1 rounded-b-lg bg-gradient-to-r from-violet-500 to-cyan-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                      <Sparkles className="h-3 w-3" />
                      Launch Discount
                    </span>
                  </>
                ) : null}

                <h3 className="text-xl font-semibold text-white">{plan.name}</h3>

                <div className="mt-5 flex flex-wrap items-end gap-2">
                  {isPro ? (
                    <>
                      <span className="text-lg text-zinc-500 line-through">
                        {PRO_REGULAR_PRICE_EUR}€
                      </span>
                      <span className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                        {PRO_LAUNCH_PRICE_EUR}€
                      </span>
                      <span className="pb-1 text-zinc-500">/ month</span>
                    </>
                  ) : (
                    <>
                      <span className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                        0€
                      </span>
                      <span className="pb-1 text-zinc-500">/ month</span>
                    </>
                  )}
                </div>

                <p className="mt-3 text-sm text-zinc-400">{plan.description}</p>

                <ul className="mt-6 space-y-2.5 sm:mt-8 sm:space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2.5 text-sm text-zinc-300"
                    >
                      <Check
                        className={cn(
                          "mt-0.5 h-4 w-4 shrink-0",
                          isPro ? "text-violet-400" : "text-cyan-400"
                        )}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>

                <MarketingPlanCta
                  loggedOutHref={plan.href}
                  loggedOutLabel={plan.cta}
                  loggedInHref={isPro ? "/dashboard/properties?upgrade=1" : "/dashboard"}
                  loggedInLabel={isPro ? "Upgrade to Pro" : "Go to dashboard"}
                  highlighted={isPro}
                  className="mt-8"
                />
              </div>
            );
          })}
        </div>

        {!compact ? (
          <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-zinc-500">
            Pro billing is handled securely by Stripe. Cancel anytime from your
            account.{" "}
            <Link href="/cijene" className="text-violet-300 hover:underline">
              View full pricing
            </Link>
          </p>
        ) : null}
      </div>
    </section>
  );
}
