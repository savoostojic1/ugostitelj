"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, Globe, Sparkles, Users } from "lucide-react";
import { trackHostviaEvent } from "@/lib/analytics/track";
import { FREE_PROPERTY_LIMIT } from "@/lib/subscriptions/plans";

const CAPABILITIES = [
  {
    icon: CalendarDays,
    text: "Manage rental calendars in one place, with iCal sync for Airbnb, Booking.com and other iCal sources.",
  },
  {
    icon: Users,
    text: "Organize guest arrivals and departures for today, tomorrow and the rest of the week.",
  },
  {
    icon: Sparkles,
    text: "Plan cleaning schedules from a day-by-day view of departures and turnovers.",
  },
  {
    icon: Globe,
    text: "Create a public website for your rental and receive direct inquiries from guests.",
  },
];

export function HostviaToolCta({
  tool,
  title = "Your rental business deserves an easier way to stay organized.",
  description = "Knowing your estimated profit is just the beginning. Keep your rental calendars, guest arrivals and cleaning schedules organized in one simple dashboard with Hostvia.",
}: {
  tool: string;
  title?: string;
  description?: string;
}) {
  return (
    <section
      aria-labelledby="hostvia-tool-cta-heading"
      className="relative overflow-hidden rounded-3xl border border-white/10 print:hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/25 via-indigo-600/15 to-cyan-600/15" />
      <div className="relative grid gap-8 px-6 py-10 sm:px-10 md:py-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div>
          <h2 id="hostvia-tool-cta-heading" className="marketing-heading text-2xl text-white md:text-3xl">
            {title}
          </h2>
          <p className="mt-4 max-w-xl leading-relaxed text-zinc-300">{description}</p>
          <p className="mt-4 text-sm text-zinc-400">
            The Free plan covers up to {FREE_PROPERTY_LIMIT} active properties. No card required.
          </p>
          <div className="marketing-cta-row mt-8">
            <Link
              href="/register"
              onClick={() => trackHostviaEvent("hostvia_signup_cta_clicked", { location: tool })}
              className="hostvia-btn-gradient inline-flex h-12 items-center justify-center gap-2 rounded-xl px-7 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#06060a]"
            >
              Try Hostvia Free
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/"
              onClick={() => trackHostviaEvent("hostvia_homepage_cta_clicked", { location: tool })}
              className="inline-flex h-12 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-7 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
            >
              Explore Hostvia
            </Link>
          </div>
        </div>
        <ul className="grid gap-3">
          {CAPABILITIES.map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="flex gap-3 rounded-2xl border border-white/10 bg-[#06060a]/50 p-4 text-sm leading-relaxed text-zinc-300"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-300">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              {text}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
