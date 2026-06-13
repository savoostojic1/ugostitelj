"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  CalendarDays,
  Check,
  CreditCard,
  Globe,
  Layers,
  RefreshCw,
  Sparkles,
  Zap,
} from "lucide-react";
import { MarketingPrimaryCta } from "@/components/marketing/marketing-primary-cta";
import { pricingPlans, pricingSectionCopy } from "@/lib/marketing/content";
import { cn } from "@/lib/utils";

interface PricingSectionProps {
  compact?: boolean;
  showHeadline?: boolean;
}

const featureDetails: Record<
  string,
  { icon: LucideIcon; accent: "violet" | "cyan" | "indigo" }
> = {
  "Up to 2 properties": { icon: Layers, accent: "violet" },
  "Direct booking website": { icon: Globe, accent: "cyan" },
  "Calendar sync": { icon: CalendarDays, accent: "indigo" },
  Reservations: { icon: CalendarDays, accent: "violet" },
  Dashboard: { icon: BarChart3, accent: "cyan" },
  "Airbnb & Booking imports": { icon: RefreshCw, accent: "indigo" },
};

const accentStyles = {
  violet: {
    icon: "bg-violet-500/15 text-violet-300 ring-violet-500/25",
    card: "hover:border-violet-500/20 hover:bg-violet-500/[0.04]",
  },
  cyan: {
    icon: "bg-cyan-500/15 text-cyan-300 ring-cyan-500/25",
    card: "hover:border-cyan-500/20 hover:bg-cyan-500/[0.04]",
  },
  indigo: {
    icon: "bg-indigo-500/15 text-indigo-300 ring-indigo-500/25",
    card: "hover:border-indigo-500/20 hover:bg-indigo-500/[0.04]",
  },
} as const;

export function PricingSection({
  compact = false,
  showHeadline = true,
}: PricingSectionProps) {
  const plan = pricingPlans[0];

  return (
    <section
      className={cn(
        "relative overflow-hidden",
        compact ? "py-10 sm:py-12" : "marketing-section"
      )}
    >
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
      >
        <div className="absolute left-1/2 top-1/2 h-[420px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-[100px]" />
        <div className="absolute right-[10%] top-[20%] h-48 w-48 rounded-full bg-cyan-500/8 blur-[80px]" />
      </div>

      <div className={cn("relative", compact ? "px-4 md:px-6" : "marketing-container")}>
        {showHeadline ? (
          <div className="mx-auto max-w-2xl text-center">
            <p className="marketing-eyebrow mb-4 justify-center">
              <Sparkles className="h-3.5 w-3.5 text-violet-400" />
              {pricingSectionCopy.eyebrow}
            </p>
            <h2 className="marketing-heading text-3xl text-white md:text-4xl">
              {pricingSectionCopy.headline}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:mt-4 sm:text-base">
              {pricingSectionCopy.subheadline}
            </p>
          </div>
        ) : null}

        <div
          className={cn(
            "mx-auto max-w-4xl",
            showHeadline ? "mt-10 sm:mt-12" : "mt-0"
          )}
        >
          <div className="hostvia-glow-card overflow-hidden">
            <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-stretch">
              {/* Price + CTA */}
              <div className="relative flex min-h-full flex-col border-b border-white/8 bg-gradient-to-br from-violet-500/[0.08] via-[#0a0a12] to-[#080810] p-6 sm:p-8 lg:border-b-0 lg:border-r lg:p-10">
                <div
                  className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-violet-500/20 blur-3xl"
                  aria-hidden
                />
                <div
                  className="pointer-events-none absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl"
                  aria-hidden
                />

                <div className="relative flex flex-1 flex-col">
                  <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-cyan-200">
                    <Sparkles className="h-3 w-3" />
                    Free plan
                  </span>

                  <div className="mt-8">
                    <p className="text-sm font-medium text-zinc-400">Start at</p>
                    <div className="mt-2 flex items-end gap-2">
                      <span className="hostvia-gradient-text text-6xl font-bold leading-none tracking-tight sm:text-7xl">
                        0€
                      </span>
                      <span className="pb-2 text-base text-zinc-500">/ month</span>
                    </div>
                  </div>

                  <p className="relative mt-6 max-w-sm text-base leading-relaxed text-zinc-300">
                    {plan.description}
                  </p>

                  <ul className="relative mt-8 space-y-3">
                    {[
                      { icon: Layers, text: "Up to 2 properties included" },
                      { icon: CreditCard, text: "No credit card required" },
                      { icon: Zap, text: "Ready in minutes" },
                    ].map(({ icon: Icon, text }) => (
                      <li
                        key={text}
                        className="flex items-center gap-3 text-sm text-zinc-400"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] ring-1 ring-inset ring-white/10">
                          <Icon className="h-4 w-4 text-violet-300" />
                        </span>
                        {text}
                      </li>
                    ))}
                  </ul>

                  <div className="relative mt-auto pt-10 lg:pt-12">
                    <MarketingPrimaryCta
                      loggedOutHref={plan.href}
                      loggedOutLabel={plan.cta}
                      loggedInHref="/dashboard"
                      loggedInLabel="Go to dashboard"
                      className="h-14 w-full text-base font-bold shadow-[0_0_40px_-8px_rgba(139,92,246,0.65)] transition hover:shadow-[0_0_48px_-6px_rgba(139,92,246,0.8)]"
                    />

                    <p className="mt-4 text-center text-[11px] leading-relaxed text-zinc-600 lg:text-left">
                      {pricingSectionCopy.upgradeNote}
                    </p>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="relative bg-gradient-to-br from-white/[0.04] via-white/[0.02] to-transparent p-6 sm:p-8 lg:p-10">
                <div
                  className="pointer-events-none absolute -right-10 bottom-0 h-32 w-32 rounded-full bg-cyan-500/10 blur-3xl"
                  aria-hidden
                />

                <div className="relative flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
                      Included
                    </p>
                    <p className="mt-1 text-sm text-zinc-400">
                      All core tools, no limits on usage
                    </p>
                  </div>
                  <span className="hidden rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-medium text-zinc-500 sm:inline">
                    {plan.features.length} features
                  </span>
                </div>

                <ul className="relative mt-6 grid grid-cols-1 gap-2.5">
                  {plan.features.map((feature) => {
                    const meta = featureDetails[feature] ?? {
                      icon: Check,
                      accent: "violet" as const,
                    };
                    const Icon = meta.icon;
                    const styles = accentStyles[meta.accent];

                    return (
                      <li
                        key={feature}
                        className={cn(
                          "group flex items-center gap-3 rounded-xl border border-white/8 bg-[#0a0a10]/60 px-3.5 py-3 transition duration-200",
                          styles.card
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset transition group-hover:scale-105",
                            styles.icon
                          )}
                        >
                          <Icon className="h-4 w-4" strokeWidth={2} />
                        </span>
                        <span className="text-sm font-medium leading-snug text-zinc-200">
                          {feature}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-center text-xs text-zinc-500">
            <span>No commission on direct bookings</span>
            <span className="hidden h-1 w-1 rounded-full bg-zinc-700 sm:inline" />
            <span>Cancel anytime</span>
            <span className="hidden h-1 w-1 rounded-full bg-zinc-700 sm:inline" />
            {!compact ? (
              <Link href="/kontakt" className="text-zinc-500 transition hover:text-zinc-300">
                Questions? Contact us
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
