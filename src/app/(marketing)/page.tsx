import Link from "next/link";
import {
  BarChart3,
  Calendar,
  Globe,
  Layers,
  Quote,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import { HostviaHeroMockup } from "@/components/marketing/hostvia-hero-mockup";
import { MarketingPlanCta } from "@/components/marketing/marketing-plan-cta";
import { MarketingPrimaryCta } from "@/components/marketing/marketing-primary-cta";
import { pricingPlans } from "@/lib/marketing/content";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    name: "Marko P.",
    role: "3 apartments, Budva",
    quote:
      "I finally have one calendar for Airbnb and Booking, plus my own site where guests send inquiries directly to me. No more inbox chaos.",
    rating: 5,
  },
  {
    name: "Ana K.",
    role: "Villa with 6 units, Kotor",
    quote:
      "The dashboard shows arrivals and occupancy at a glance. It looks professional — guests tell me the site feels like a serious platform.",
    rating: 5,
  },
  {
    name: "Stefan M.",
    role: "Bungalows, Ulcinj",
    quote:
      "Setup took 15 minutes. iCal sync works reliably, and direct bookings save us commission every season.",
    rating: 5,
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="marketing-hero">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[min(600px,80vw)] w-[min(800px,120vw)] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[120px]" />
          <div className="absolute right-0 top-1/3 h-[min(400px,60vw)] w-[min(400px,70vw)] rounded-full bg-cyan-500/8 blur-[100px]" />
        </div>

        <div className="marketing-container relative grid items-center gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          <div className="text-center lg:text-left">
            <div className="marketing-eyebrow mb-5 justify-center lg:justify-start">
              <Sparkles className="h-3.5 w-3.5 text-violet-400" />
              Hospitality platform
            </div>
            <h1 className="marketing-heading text-4xl text-white sm:text-5xl lg:text-[3.25rem] xl:text-[3.5rem]">
              Your booking website and{" "}
              <span className="hostvia-gradient-text">
                reservation dashboard
              </span>{" "}
              in one place.
            </h1>
            <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-zinc-400 sm:text-lg lg:mx-0">
              Receive direct bookings, sync your calendars and manage every
              property from a single platform. No commissions on direct
              reservations.
            </p>
            <div className="marketing-cta-row mt-8 sm:mt-10">
              <MarketingPrimaryCta />
              <Link
                href="/funkcije"
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-7 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Explore features
              </Link>
            </div>
            <div className="marketing-trust-row mt-8 justify-center text-sm text-zinc-500 sm:mt-10 lg:justify-start">
              <span className="flex items-center justify-center gap-2 sm:justify-start">
                <Zap className="h-4 w-4 shrink-0 text-violet-400" />
                Setup in minutes
              </span>
              <span className="flex items-center justify-center gap-2 sm:justify-start">
                <Globe className="h-4 w-4 shrink-0 text-cyan-400" />
                Own booking website
              </span>
              <span className="flex items-center justify-center gap-2 sm:justify-start">
                <Calendar className="h-4 w-4 shrink-0 text-indigo-400" />
                iCal sync
              </span>
            </div>
          </div>

          <div className="w-full lg:justify-self-end">
            <HostviaHeroMockup />
          </div>
        </div>
      </section>

      {/* Value props strip */}
      <section className="border-y border-white/5 bg-white/[0.02] py-5 sm:py-6">
        <div className="marketing-container grid gap-4 text-center text-sm text-zinc-500 sm:grid-cols-3 sm:gap-6">
          <span>
            <strong className="text-white">0%</strong> commission on direct
            bookings
          </span>
          <span>
            <strong className="text-white">Airbnb + Booking</strong> calendar
            sync
          </span>
          <span>
            <strong className="text-white">Real-time</strong> availability
          </span>
        </div>
      </section>

      {/* Feature 1: Direct Booking Website */}
      <section className="marketing-section">
        <div className="marketing-container">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div className="order-2 lg:order-1">
              <div className="hostvia-glow-card mx-auto max-w-md overflow-hidden p-1 lg:max-w-none">
                <div className="rounded-[1.1rem] bg-[#0a0a10] p-4 sm:p-6">
                  <div className="mb-4 h-28 rounded-xl bg-gradient-to-br from-violet-600/30 via-indigo-600/20 to-cyan-600/10 sm:h-32" />
                  <p className="font-semibold text-white">Sea View Apartment</p>
                  <p className="mt-1 text-sm text-zinc-500">Budva · 4 guests</p>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((n) => (
                      <div
                        key={n}
                        className="aspect-[4/3] rounded-lg bg-white/5"
                      />
                    ))}
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[10px]">
                    {["Check-in", "Check-out", "Guests"].map((l) => (
                      <div
                        key={l}
                        className="rounded-lg border border-white/10 py-2 text-zinc-500"
                      >
                        {l}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-2.5 text-center text-xs font-semibold text-white">
                    Send inquiry · €320 total
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 text-center lg:order-2 lg:text-left">
              <p className="marketing-eyebrow mb-4 justify-center lg:justify-start">
                Direct Booking Website
              </p>
              <h2 className="marketing-heading text-3xl text-white md:text-4xl">
                Your own booking site.{" "}
                <span className="hostvia-gradient-text">No commissions.</span>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-zinc-400 sm:mt-5 sm:text-lg">
                Every host gets a beautiful public page with property gallery,
                date search, live pricing and a booking inquiry form. Share your
                link and receive reservations directly.
              </p>
              <ul className="mt-6 space-y-3 text-left sm:mt-8 sm:space-y-4">
                {[
                  "Property gallery & cover image",
                  "Availability calendar per unit",
                  "Live stay pricing",
                  "Mobile-responsive design",
                  "Google Maps integration",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-sm text-zinc-300"
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-500/20">
                      <Globe className="h-3 w-3 text-violet-400" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 2: Dashboard */}
      <section className="marketing-section border-y border-white/5 bg-white/[0.02]">
        <div className="marketing-container">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div className="text-center lg:text-left">
              <p className="marketing-eyebrow mb-4 justify-center lg:justify-start">
                Reservation Dashboard
              </p>
              <h2 className="marketing-heading text-3xl text-white md:text-4xl">
                Operations center for{" "}
                <span className="hostvia-gradient-text">every property</span>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-zinc-400 sm:mt-5 sm:text-lg">
                See occupancy, arrivals, departures and free nights at a glance.
                Manage all reservations from one beautiful dashboard.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-4">
                {[
                  { label: "Occupancy", value: "78%", icon: BarChart3 },
                  { label: "Arrivals today", value: "3", icon: Calendar },
                  { label: "Departures", value: "2", icon: Layers },
                  { label: "Free nights", value: "6", icon: Sparkles },
                ].map((s) => (
                  <div key={s.label} className="hostvia-stat-card text-left">
                    <s.icon className="mb-2 h-4 w-4 text-violet-400" />
                    <p className="text-xl font-bold text-white sm:text-2xl">
                      {s.value}
                    </p>
                    <p className="text-xs text-zinc-500">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="hostvia-glow-card mx-auto w-full max-w-md p-4 sm:p-6 lg:max-w-none">
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">
                This week
              </p>
              {[
                {
                  guest: "Sarah M.",
                  property: "Downtown Studio",
                  type: "Check-in",
                  color: "bg-emerald-500",
                },
                {
                  guest: "James L.",
                  property: "Sea View Apartment",
                  type: "Check-out",
                  color: "bg-rose-500",
                },
                {
                  guest: "Elena R.",
                  property: "Sunset Villa",
                  type: "Stayover",
                  color: "bg-indigo-500",
                },
              ].map((r) => (
                <div
                  key={r.guest}
                  className="mb-3 flex items-center gap-3 rounded-xl bg-white/5 p-3 last:mb-0"
                >
                  <div className={`h-2 w-2 shrink-0 rounded-full ${r.color}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">
                      {r.guest}
                    </p>
                    <p className="truncate text-xs text-zinc-500">
                      {r.property}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-zinc-500">{r.type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature 3 & 4 grid */}
      <section className="marketing-section">
        <div className="marketing-container">
          <div className="mx-auto max-w-2xl text-center">
            <p className="marketing-eyebrow mb-4 justify-center">Platform</p>
            <h2 className="marketing-heading text-3xl text-white md:text-4xl">
              Everything you need to run hospitality
            </h2>
          </div>
          <div className="mt-10 grid gap-4 sm:mt-12 sm:gap-6 md:grid-cols-2">
            <div className="hostvia-glow-card p-6 sm:p-8">
              <Calendar className="h-8 w-8 text-violet-400" />
              <h3 className="mt-4 text-lg font-semibold text-white sm:text-xl">
                Multi-property calendar
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                Color-coded reservations across all listings. Monthly view with
                check-ins, check-outs and stayovers clearly visible.
              </p>
              <div className="mt-6 flex gap-1">
                {["#8b5cf6", "#6366f1", "#22d3ee", "#10b981", "#f472b6"].map(
                  (c) => (
                    <div
                      key={c}
                      className="h-2 flex-1 rounded-full"
                      style={{ backgroundColor: c }}
                    />
                  )
                )}
              </div>
            </div>
            <div className="hostvia-glow-card p-6 sm:p-8">
              <Layers className="h-8 w-8 text-cyan-400" />
              <h3 className="mt-4 text-lg font-semibold text-white sm:text-xl">
                Property management
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                Multiple listings, reservation history, booking sources
                (Airbnb, Booking, Direct) and iCal export — all per property.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["Airbnb", "Booking", "Direct", "Manual"].map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-400"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="marketing-section border-y border-white/5 bg-white/[0.02]">
        <div className="marketing-container">
          <div className="mx-auto max-w-2xl text-center">
            <p className="marketing-eyebrow mb-4 justify-center">Hosts</p>
            <h2 className="marketing-heading text-3xl text-white md:text-4xl">
              Trusted by property owners
            </h2>
          </div>
          <div className="mt-10 grid gap-4 sm:mt-12 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="hostvia-glow-card flex flex-col p-6 sm:p-8"
              >
                <Quote className="h-8 w-8 text-violet-500/40" />
                <p className="mt-4 flex-1 text-sm leading-relaxed text-zinc-300">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-6 flex items-center gap-1">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="mt-3 font-semibold text-white">{t.name}</p>
                <p className="text-xs text-zinc-500">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="marketing-section">
        <div className="marketing-container">
          <div className="mx-auto max-w-2xl text-center">
            <p className="marketing-eyebrow mb-4 justify-center">Pricing</p>
            <h2 className="marketing-heading text-3xl text-white md:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-3 text-sm text-zinc-400 sm:mt-4 sm:text-base">
              Start free. Scale when you&apos;re ready.
            </p>
          </div>
          <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:mt-12 sm:gap-6 lg:grid-cols-2 lg:gap-8">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={cn(
                  "relative rounded-2xl p-6 sm:p-8",
                  plan.highlighted
                    ? "hostvia-glow-card bg-gradient-to-b from-violet-500/10 to-transparent"
                    : "border border-white/10 bg-white/[0.02]"
                )}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 left-5 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 px-3 py-1 text-xs font-bold text-white sm:left-6">
                    Most popular
                  </span>
                )}
                <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
                <div className="mt-4 flex flex-wrap items-baseline gap-2">
                  <span className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-zinc-500">/ {plan.period}</span>
                  )}
                </div>
                <p className="mt-3 text-sm text-zinc-400">{plan.description}</p>
                <ul className="mt-6 space-y-2.5 sm:mt-8 sm:space-y-3">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-sm text-zinc-300"
                    >
                      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-400" />
                      {f}
                    </li>
                  ))}
                </ul>
                <MarketingPlanCta
                  loggedOutHref={plan.href}
                  loggedOutLabel={plan.cta}
                  highlighted={plan.highlighted}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="marketing-container pb-12 pt-4 sm:pb-16 md:pb-20">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-600" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
          <div className="relative px-5 py-12 text-center sm:px-10 sm:py-16 md:px-16 md:py-20">
            <h2 className="marketing-heading text-2xl text-white sm:text-3xl md:text-4xl">
              Ready to get your booking website?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-white/80 sm:mt-4 sm:text-base">
              Join property owners who manage reservations smarter and receive
              direct bookings without platform fees.
            </p>
            <MarketingPrimaryCta
              className="mt-6 w-full sm:mt-8 sm:w-auto"
              tone="light"
              loggedOutLabel="Start free today"
            />
          </div>
        </div>
      </section>
    </>
  );
}
