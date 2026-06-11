import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { PageHero } from "@/components/marketing/page-hero";
import { Button } from "@/components/ui/button";
import {
  coreFeatures,
  dashboardFeatures,
} from "@/lib/marketing/content";

export const metadata: Metadata = {
  title: "Features — Hostvia",
  description:
    "iCal sync, multiple units, booking site, date-based pricing, booking inquiries and an operations dashboard for hosts.",
};

export default function FunkcijePage() {
  return (
    <>
      <PageHero
        eyebrow="Features"
        title="A complete toolkit for modern hosts"
        description="Hostvia combines platform sync, an operations calendar and a public site for direct inquiries — no API integrations and no hassle."
        primaryCta={{ label: "Start free", href: "/register" }}
      />

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <div className="max-w-2xl">
          <h2 className="marketing-heading text-2xl md:text-3xl">
            Core features
          </h2>
          <p className="mt-3 text-muted-foreground">
            Everything you need to run your accommodation professionally,
            whether you have one apartment or an entire property.
          </p>
        </div>
        <FeatureGrid features={coreFeatures} className="mt-10" />
      </section>

      <section className="border-y border-border bg-card/30 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="max-w-2xl">
            <h2 className="marketing-heading text-2xl md:text-3xl">
              Dashboard & operations
            </h2>
            <p className="mt-3 text-muted-foreground">
              Beyond sync, Hostvia helps with day-to-day work — arrivals,
              messages, manual bookings and export.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {dashboardFeatures.map((feature) => (
              <div
                key={feature.title}
                className="marketing-card rounded-2xl border border-border bg-card p-6"
              >
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="marketing-card rounded-2xl border border-border bg-card p-8">
            <h3 className="text-xl font-semibold">iCal sync</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Airbnb and Booking.com provide an iCal link for each listing.
              Paste it into Hostvia and reservations import automatically. No API
              keys or technical knowledge required.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Calendars refresh in the background. Trigger a manual sync
              whenever you want a quick check.
            </p>
          </div>
          <div className="marketing-card rounded-2xl border border-border bg-card p-8">
            <h3 className="text-xl font-semibold">Export back to platforms</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Manual bookings and blocks you enter in Hostvia can be exported as
              an iCal link. Add it to Airbnb or Booking.com so platforms see
              the same dates — reducing the risk of double bookings.
            </p>
          </div>
          <div className="marketing-card rounded-2xl border border-border bg-card p-8">
            <h3 className="text-xl font-semibold">Date-based pricing</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Set a base nightly rate, then add rules for specific periods —
              seasons, holidays, weekends. Guests on your public site see the
              exact total for their selected stay.
            </p>
          </div>
          <div className="marketing-card rounded-2xl border border-border bg-card p-8">
            <h3 className="text-xl font-semibold">Booking inquiries</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Guests fill out a form with their name, email and phone. You
              receive the inquiry in your dashboard, review the details and
              contact the guest directly. You decide whether to accept the
              booking.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          <Button asChild>
            <Link href="/javni-sajt">
              Booking site in detail
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/kako-radi">How to get started</Link>
          </Button>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
