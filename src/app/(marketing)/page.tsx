import Link from "next/link";
import {
  ArrowRight,
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
      <section className="relative overflow-hidden px-4 pb-24 pt-16 md:px-8 md:pb-32 md:pt-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[120px]" />
          <div className="absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-cyan-500/8 blur-[100px]" />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2 lg:gap-12">
          <div>
            <div className="marketing-eyebrow mb-6">
              <Sparkles className="h-3.5 w-3.5 text-violet-400" />
              Hospitality platform
            </div>
            <h1 className="marketing-heading text-4xl text-white sm:text-5xl lg:text-[3.5rem]">
              Your booking website and{" "}
              <span className="hostvia-gradient-text">
                reservation dashboard
              </span>{" "}
              in one place.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-zinc-400">
              Receive direct bookings, sync your calendars and manage every
              property from a single platform. No commissions on direct
              reservations.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/register"
                className="hostvia-btn-gradient inline-flex h-12 items-center gap-2 rounded-xl px-7 text-sm font-semibold"
              >
                Start free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/funkcije"
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-7 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Explore features
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-6 text-sm text-zinc-500">
              <span className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-violet-400" />
                Setup in minutes
              </span>
              <span className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-cyan-400" />
                Own booking website
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-indigo-400" />
                iCal sync
              </span>
            </div>
          </div>

          <HostviaHeroMockup />
        </div>
      </section>

      {/* Value props strip */}
      <section className="border-y border-white/5 bg-white/[0.02] py-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-12 gap-y-4 px-4 text-center text-sm text-zinc-500 md:px-8">
          <span>
            <strong className="text-white">0%</strong> commission on direct
            bookings
          </span>
          <span className="hidden h-4 w-px bg-white/10 sm:block" />
          <span>
            <strong className="text-white">Airbnb + Booking</strong> calendar
            sync
          </span>
          <span className="hidden h-4 w-px bg-white/10 sm:block" />
          <span>
            <strong className="text-white">Real-time</strong> availability
          </span>
        </div>
      </section>

      {/* Feature 1: Direct Booking Website */}
      <section className="px-4 py-24 md:px-8 md:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div className="order-2 lg:order-1">
              <div className="hostvia-glow-card overflow-hidden p-1">
                <div className="rounded-[1.1rem] bg-[#0a0a10] p-6">
                  <div className="mb-4 h-32 rounded-xl bg-gradient-to-br from-violet-600/30 via-indigo-600/20 to-cyan-600/10" />
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
            <div className="order-1 lg:order-2">
              <p className="marketing-eyebrow mb-4">Direct Booking Website</p>
              <h2 className="marketing-heading text-3xl text-white md:text-4xl">
                Your own booking site.{" "}
                <span className="hostvia-gradient-text">No commissions.</span>
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-zinc-400">
                Every host gets a beautiful public page with property gallery,
                date search, live pricing and a booking inquiry form. Share your
                link and receive reservations directly.
              </p>
              <ul className="mt-8 space-y-4">
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
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/20">
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
      <section className="border-y border-white/5 bg-white/[0.02] px-4 py-24 md:px-8 md:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <p className="marketing-eyebrow mb-4">Reservation Dashboard</p>
              <h2 className="marketing-heading text-3xl text-white md:text-4xl">
                Operations center for{" "}
                <span className="hostvia-gradient-text">every property</span>
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-zinc-400">
                See occupancy, arrivals, departures and free nights at a glance.
                Manage all reservations from one beautiful dashboard.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  { label: "Occupancy", value: "78%", icon: BarChart3 },
                  { label: "Arrivals today", value: "3", icon: Calendar },
                  { label: "Departures", value: "2", icon: Layers },
                  { label: "Free nights", value: "6", icon: Sparkles },
                ].map((s) => (
                  <div key={s.label} className="hostvia-stat-card">
                    <s.icon className="mb-2 h-4 w-4 text-violet-400" />
                    <p className="text-2xl font-bold text-white">{s.value}</p>
                    <p className="text-xs text-zinc-500">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="hostvia-glow-card p-6">
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
                  <div className={`h-2 w-2 rounded-full ${r.color}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{r.guest}</p>
                    <p className="text-xs text-zinc-500">{r.property}</p>
                  </div>
                  <span className="text-xs text-zinc-500">{r.type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature 3 & 4 grid */}
      <section className="px-4 py-24 md:px-8 md:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="marketing-eyebrow mb-4 justify-center">Platform</p>
            <h2 className="marketing-heading text-3xl text-white md:text-4xl">
              Everything you need to run hospitality
            </h2>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-2">
            <div className="hostvia-glow-card p-8">
              <Calendar className="h-8 w-8 text-violet-400" />
              <h3 className="mt-4 text-xl font-semibold text-white">
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
            <div className="hostvia-glow-card p-8">
              <Layers className="h-8 w-8 text-cyan-400" />
              <h3 className="mt-4 text-xl font-semibold text-white">
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
      <section className="border-y border-white/5 bg-white/[0.02] px-4 py-24 md:px-8 md:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="marketing-eyebrow mb-4 justify-center">Hosts</p>
            <h2 className="marketing-heading text-3xl text-white md:text-4xl">
              Trusted by property owners
            </h2>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="hostvia-glow-card flex flex-col p-8">
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
      <section className="px-4 py-24 md:px-8 md:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="marketing-eyebrow mb-4 justify-center">Pricing</p>
            <h2 className="marketing-heading text-3xl text-white md:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-zinc-400">
              Start free. Scale when you&apos;re ready.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-4xl gap-8 lg:grid-cols-2">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={cn(
                  "relative rounded-2xl p-8",
                  plan.highlighted
                    ? "hostvia-glow-card bg-gradient-to-b from-violet-500/10 to-transparent"
                    : "border border-white/10 bg-white/[0.02]"
                )}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 left-6 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 px-3 py-1 text-xs font-bold text-white">
                    Most popular
                  </span>
                )}
                <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-5xl font-bold tracking-tight text-white">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-zinc-500">/ {plan.period}</span>
                  )}
                </div>
                <p className="mt-3 text-sm text-zinc-400">{plan.description}</p>
                <ul className="mt-8 space-y-3">
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
                <Link
                  href={plan.href}
                  className={cn(
                    "mt-8 flex h-11 items-center justify-center rounded-xl text-sm font-semibold transition",
                    plan.highlighted
                      ? "hostvia-btn-gradient"
                      : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                  )}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 pb-24 md:px-8">
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-600" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
          <div className="relative px-8 py-16 text-center md:px-16 md:py-20">
            <h2 className="marketing-heading text-3xl text-white md:text-4xl">
              Ready to get your booking website?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-white/80">
              Join property owners who manage reservations smarter and receive
              direct bookings without platform fees.
            </p>
            <Link
              href="/register"
              className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-white px-8 text-sm font-bold text-violet-700 transition hover:bg-white/90"
            >
              Start free today
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
