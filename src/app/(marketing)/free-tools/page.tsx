import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calculator, CalendarRange, Sparkles, type LucideIcon } from "lucide-react";
import { MarketingBreadcrumbs } from "@/components/marketing/marketing-breadcrumbs";
import { pageMetadata } from "@/lib/seo/site";
import { FREE_TOOLS, FREE_TOOLS_PATH } from "@/lib/tools/free-tools";

export const metadata: Metadata = pageMetadata({
  title: "Free Tools for Vacation Rental Owners",
  description:
    "Free, no-sign-up tools for vacation rental owners: a rental income calculator and a calendar sync guide for Airbnb, Booking.com, Vrbo and more.",
  path: FREE_TOOLS_PATH,
});

const TOOL_ICONS: Record<string, LucideIcon> = {
  "vacation-rental-income-calculator": Calculator,
  "vacation-rental-calendar-sync-guide": CalendarRange,
};

export default function FreeToolsPage() {
  return (
    <>
      <MarketingBreadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Free tools", path: FREE_TOOLS_PATH },
        ]}
      />
      <section className="relative overflow-hidden px-4 pb-16 pt-12 md:px-8 md:pb-24 md:pt-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[min(560px,85vw)] w-[min(820px,120vw)] -translate-x-1/2 -translate-y-[28%] rounded-full bg-violet-600/20 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-4xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="marketing-eyebrow mb-3">Free tools</p>
            <h1 className="marketing-heading mx-auto text-3xl text-white sm:text-4xl md:text-[2.75rem]">
              Free Tools for Vacation Rental Owners
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-zinc-400">
              Simple helpers you can use without an account — from income estimates
              to step-by-step vacation rental calendar sync instructions.
            </p>
          </div>

          <ul
            aria-label="Available tools"
            className="mt-9 grid gap-4 sm:mt-10 sm:grid-cols-2"
          >
            {FREE_TOOLS.map((tool) => {
              const Icon = TOOL_ICONS[tool.slug] ?? Calculator;
              return (
                <li key={tool.slug} className="min-w-0">
                  <Link
                    href={tool.href}
                    className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_0_0_1px_rgba(139,92,246,0.04)] transition hover:border-violet-400/40 hover:bg-violet-500/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
                  >
                    <span className="mb-3.5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300 transition group-hover:bg-violet-500/25 group-hover:text-violet-200">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h2 className="text-base font-semibold leading-snug tracking-tight text-white transition group-hover:text-violet-100 sm:text-[1.05rem]">
                      {tool.title}
                    </h2>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-400">
                      {tool.summary}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-violet-300">
                      {tool.ctaLabel}
                      <ArrowRight
                        className="h-3.5 w-3.5 transition group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </span>
                  </Link>
                </li>
              );
            })}

            <li className="min-w-0">
              <div className="flex h-full flex-col rounded-2xl border border-dashed border-white/10 bg-white/[0.015] p-5">
                <span className="mb-3.5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04] text-zinc-500">
                  <Sparkles className="h-5 w-5" aria-hidden="true" />
                </span>
                <p className="text-base font-semibold leading-snug tracking-tight text-zinc-400 sm:text-[1.05rem]">
                  More tools coming soon
                </p>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-500">
                  We&apos;ll add more free helpers here for hosts as they are ready.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}
