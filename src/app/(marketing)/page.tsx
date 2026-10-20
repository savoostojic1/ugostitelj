import type { Metadata } from "next";
import Link from "next/link";
import {
  Calendar,
  Globe,
  Layers,
  Sparkles,
  Zap,
} from "lucide-react";
import { HostviaHeroMockup } from "@/components/marketing/hostvia-hero-mockup";
import { HostviaPromoVideo } from "@/components/marketing/hostvia-promo-video";
import { MarketingPrimaryCta } from "@/components/marketing/marketing-primary-cta";
import { PricingSection } from "@/components/marketing/pricing-section";
import { JsonLd } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/site";
import { softwareApplicationJsonLd } from "@/lib/seo/structured-data";
import { FREE_PROPERTY_LIMIT, PRO_MONTHLY_PRICE_USD } from "@/lib/subscriptions/plans";

export const metadata: Metadata = pageMetadata({
  title: "Hostvia — Vacation rental management for small hosts",
  description:
    "Manage up to two vacation rentals free. Sync Airbnb and Booking.com calendars, plan arrivals and cleaning, and publish a site for direct guest inquiries.",
  path: "/",
  absoluteTitle: true,
});

const audiences = [
  "Owners who list on Airbnb or Booking.com and also take guests directly",
  "People running one or two rentals who want the Free plan",
  "Small operators who need more than two properties",
  "Owners who want arrivals, departures, and a cleaning overview together",
];

export default function HomePage() {
  return (
    <>
      <JsonLd data={softwareApplicationJsonLd()} />
      <section className="marketing-hero">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[min(600px,80vw)] w-[min(800px,120vw)] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[120px]" />
          <div className="absolute right-0 top-1/3 h-[min(400px,60vw)] w-[min(400px,70vw)] rounded-full bg-cyan-500/8 blur-[100px]" />
        </div>

        <div className="marketing-container relative grid items-center gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          <div className="text-center lg:text-left">
            <div className="marketing-eyebrow mb-5 justify-center lg:justify-start">
              <Sparkles className="h-3.5 w-3.5 text-violet-400" />
              For vacation rental owners
            </div>
            <h1 className="marketing-heading text-4xl text-white sm:text-5xl lg:text-[3.25rem] xl:text-[3.5rem]">
              One place to run a small{" "}
              <span className="hostvia-gradient-text">vacation rental</span>{" "}
              business.
            </h1>
            <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-zinc-400 sm:text-lg lg:mx-0">
              Hostvia is for owners and small operators who are tired of
              checking Airbnb, Booking.com, and direct messages separately. Keep
              calendars, arrivals, cleaning days, and guest inquiries together.
            </p>
            <div className="marketing-cta-row mt-8 sm:mt-10">
              <MarketingPrimaryCta loggedOutLabel="Create a free account" />
              <Link
                href="/features"
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-7 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                See what it includes
              </Link>
            </div>
            <div className="marketing-trust-row mt-8 justify-center text-sm text-zinc-500 sm:mt-10 lg:justify-start">
              <span className="flex items-center justify-center gap-2 sm:justify-start">
                <Zap className="h-4 w-4 shrink-0 text-violet-400" />
                Free for {FREE_PROPERTY_LIMIT} properties
              </span>
              <span className="flex items-center justify-center gap-2 sm:justify-start">
                <Globe className="h-4 w-4 shrink-0 text-cyan-400" />
                Public inquiry site
              </span>
              <span className="flex items-center justify-center gap-2 sm:justify-start">
                <Calendar className="h-4 w-4 shrink-0 text-indigo-400" />
                iCal import and export
              </span>
            </div>
          </div>

          <div className="hidden w-full lg:block lg:justify-self-end">
            <HostviaHeroMockup />
          </div>
          <div className="w-full lg:hidden">
            <HostviaPromoVideo />
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden border-y border-white/[0.07] bg-[#0e0e14] py-6 sm:py-8 lg:py-24">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_45%,black,transparent)]"
        />
        <div className="marketing-container">
          <div className="mx-auto mb-10 hidden max-w-2xl text-center lg:block">
            <p className="marketing-eyebrow mb-4 justify-center">Product tour</p>
            <h2 className="marketing-heading text-3xl text-white md:text-4xl">
              See the dashboard{" "}
              <span className="hostvia-gradient-text">in one short video</span>
            </h2>
            <p className="mt-4 text-base leading-relaxed text-zinc-400 sm:text-lg">
              Calendars, manual reservations, the cleaning overview, the booking
              site, and saved guest messages.
            </p>
          </div>
          <div className="hidden lg:block">
            <HostviaPromoVideo />
          </div>
          <div className="mx-auto grid max-w-5xl gap-4 text-center text-sm text-zinc-500 sm:grid-cols-3 lg:mt-12 sm:gap-0 sm:divide-x sm:divide-white/[0.07]">
            <span>
              <strong className="text-white">No commission</strong> on direct
              inquiries
            </span>
            <span>
              <strong className="text-white">Airbnb + Booking.com</strong> iCal
            </span>
            <span>
              <strong className="text-white">About hourly</strong> calendar
              refresh
            </span>
          </div>
        </div>
      </section>

      <section className="marketing-section">
        <div className="marketing-container">
          <div className="mx-auto max-w-2xl text-center">
            <p className="marketing-eyebrow mb-4 justify-center">Who it is for</p>
            <h2 className="marketing-heading text-3xl text-white md:text-4xl">
              Built for small accommodation operators
            </h2>
            <p className="mt-4 text-base leading-relaxed text-zinc-400">
              Use it if you manage your own apartments, cottages, bungalows, or
              rooms. Hostvia does not take guest payments, and it does not
              replace the listing sites you already use.
            </p>
          </div>
          <ul className="mx-auto mt-10 grid max-w-4xl gap-3 sm:grid-cols-2">
            {audiences.map((item) => (
              <li
                key={item}
                className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-4 text-sm leading-relaxed text-zinc-300"
              >
                {item}
              </li>
            ))}
          </ul>
          <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-zinc-500">
            <Link href="/about" className="text-violet-300 hover:underline">
              Read how it started
            </Link>
            {" · "}
            <Link href="/how-it-works" className="text-violet-300 hover:underline">
              See the setup steps
            </Link>
          </p>
        </div>
      </section>

      <section className="marketing-section border-y border-white/5 bg-white/[0.02]">
        <div className="marketing-container">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div className="order-2 lg:order-1">
              <div className="hostvia-glow-card mx-auto max-w-md overflow-hidden p-1 lg:max-w-none">
                <div className="rounded-[1.1rem] bg-[#0a0a10] p-4 sm:p-6">
                  <div className="mb-4 h-28 rounded-xl bg-gradient-to-br from-violet-600/30 via-indigo-600/20 to-cyan-600/10 sm:h-32" />
                  <p className="font-semibold text-white">Coastal apartment</p>
                  <p className="mt-1 text-sm text-zinc-500">Example listing · 4 guests</p>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="aspect-[4/3] rounded-lg bg-white/5" />
                    ))}
                  </div>
                  <div className="mt-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-2.5 text-center text-xs font-semibold text-white">
                    Send inquiry
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 text-center lg:order-2 lg:text-left">
              <p className="marketing-eyebrow mb-4 justify-center lg:justify-start">
                Direct inquiries
              </p>
              <h2 className="marketing-heading text-3xl text-white md:text-4xl">
                A public page guests can use to ask about dates
              </h2>
              <p className="mt-4 text-base leading-relaxed text-zinc-400 sm:mt-5 sm:text-lg">
                Publish photos, a description, availability, and a stay total
                when you have entered prices. The guest sends an inquiry.
                Hostvia does not charge them and does not confirm the stay for
                you.
              </p>
              <ul className="mt-6 space-y-3 text-left sm:mt-8 sm:space-y-4">
                {[
                  "Gallery and cover image",
                  "Availability per property",
                  "Stay total from your nightly prices",
                  "You accept or decline in the dashboard",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-zinc-300">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-500/20">
                      <Globe className="h-3 w-3 text-violet-400" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/booking-site"
                className="mt-6 inline-flex text-sm font-semibold text-violet-300 hover:underline"
              >
                How the booking site works
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="marketing-section">
        <div className="marketing-container">
          <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
            <div className="text-center lg:text-left">
              <p className="marketing-eyebrow mb-4 justify-center lg:justify-start">
                Day to day
              </p>
              <h2 className="marketing-heading text-3xl text-white md:text-4xl">
                See who is arriving, who is leaving, and which days need cleaning
              </h2>
              <p className="mt-4 text-base leading-relaxed text-zinc-400 sm:mt-5 sm:text-lg">
                The dashboard shows occupancy for the next 28 days, today&apos;s
                arrivals and departures, and a monthly cleaning view. A cleaning
                count equals the number of departures that day. Hostvia does not
                assign cleaners or mark a clean as finished.
              </p>
              <p className="mt-4 text-sm text-zinc-500">
                <Link href="/guides/vacation-rental-cleaning-schedule" className="text-violet-300 hover:underline">
                  Cleaning schedule guide
                </Link>
                {" · "}
                <Link href="/guides/vacation-rental-calendar" className="text-violet-300 hover:underline">
                  Calendar guide
                </Link>
              </p>
            </div>
            <div className="hostvia-glow-card mx-auto w-full max-w-md p-4 sm:p-6 lg:max-w-none">
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-zinc-500">
                Example view
              </p>
              <p className="mb-4 text-xs text-zinc-600">
                Sample numbers, not live account data.
              </p>
              {[
                { label: "Occupancy, next 28 days", value: "Shown per account" },
                { label: "Arrivals today", value: "Listed by property" },
                { label: "Departures today", value: "Listed by property" },
                { label: "Cleanings", value: "One per departure" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="mb-3 flex items-center justify-between gap-3 rounded-xl bg-white/5 p-3 last:mb-0"
                >
                  <span className="text-sm text-zinc-300">{item.label}</span>
                  <span className="text-xs text-zinc-500">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="marketing-section border-y border-white/5 bg-white/[0.02]">
        <div className="marketing-container grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="marketing-eyebrow mb-4">Where it came from</p>
            <h2 className="marketing-heading text-3xl text-white md:text-4xl">
              Developed while managing five family-owned bungalows
            </h2>
            <div className="mt-5 space-y-4 text-base leading-relaxed text-zinc-400">
              <p>
                Hostvia started from that work and was used through an actual
                rental season: calendars from more than one listing site, direct
                guests, and the practical question of which property needed
                cleaning after a departure.
              </p>
              <p>
                It is a product for that kind of operation. It is not presented
                here as a large network of paying customers.
              </p>
            </div>
            <Link
              href="/about"
              className="mt-6 inline-flex text-sm font-semibold text-violet-300 hover:underline"
            >
              About Hostvia
            </Link>
          </div>
          <div className="hostvia-glow-card p-6 sm:p-8">
            <Layers className="h-8 w-8 text-violet-400" />
            <h3 className="mt-4 text-xl font-semibold text-white">How to start</h3>
            <ol className="mt-4 space-y-3 text-sm leading-relaxed text-zinc-400">
              <li>1. Create an account. The Free plan does not ask for a card.</li>
              <li>2. Add a property. Free includes {FREE_PROPERTY_LIMIT} active properties.</li>
              <li>3. Paste an Airbnb or Booking.com iCal link if you use those sites.</li>
              <li>4. Publish the inquiry site when you want guests to write to you directly.</li>
            </ol>
            <p className="mt-4 text-sm text-zinc-500">
              More than {FREE_PROPERTY_LIMIT} properties needs Pro at $
              {PRO_MONTHLY_PRICE_USD} per month for the account.{" "}
              <Link href="/pricing" className="text-violet-300 hover:underline">
                Compare plans
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <PricingSection />

      <section className="marketing-container pb-12 pt-4 sm:pb-16 md:pb-20">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-600" />
          <div className="relative px-5 py-12 text-center sm:px-10 sm:py-16 md:px-16 md:py-20">
            <h2 className="marketing-heading text-2xl text-white sm:text-3xl md:text-4xl">
              Start with the Free plan
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-white/80 sm:mt-4 sm:text-base">
              Up to {FREE_PROPERTY_LIMIT} properties, with calendars, the
              dashboard, and an inquiry site. Upgrade only if you need more
              properties.
            </p>
            <MarketingPrimaryCta
              className="mt-6 w-full sm:mt-8 sm:w-auto"
              tone="light"
              loggedOutLabel="Create a free account"
            />
          </div>
        </div>
      </section>
    </>
  );
}
