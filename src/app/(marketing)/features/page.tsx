import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { MarketingBreadcrumbs } from "@/components/marketing/marketing-breadcrumbs";
import { PageHero } from "@/components/marketing/page-hero";
import { SyncLimitationNote } from "@/components/marketing/sync-limitation-note";
import { Button } from "@/components/ui/button";
import { coreFeatures, dashboardFeatures } from "@/lib/marketing/content";
import { pageMetadata } from "@/lib/seo/site";

export const metadata: Metadata = pageMetadata({
  title: "Vacation rental management features",
  description:
    "iCal calendar sync, a multi-property dashboard, arrivals, a cleaning overview, saved messages, and a public site for direct guest inquiries.",
  path: "/features",
});

export default function FeaturesPage() {
  return (
    <>
      <MarketingBreadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Features", path: "/features" },
        ]}
      />
      <PageHero
        eyebrow="Features"
        title="Tools for running a few vacation rentals"
        description="Hostvia combines calendar import and export, an operations dashboard, and a public page for guest inquiries. It does not use the Airbnb or Booking.com APIs."
        primaryCta={{ label: "Create a free account", href: "/register" }}
      />

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <div className="max-w-2xl">
          <h2 className="marketing-heading text-2xl md:text-3xl">Core features</h2>
          <p className="mt-3 text-muted-foreground">
            The same tools are on the Free and Pro plans. Pro removes the
            two-property limit.
          </p>
        </div>
        <FeatureGrid features={coreFeatures} className="mt-10" />
      </section>

      <section className="border-y border-border bg-card/30 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="max-w-2xl">
            <h2 className="marketing-heading text-2xl md:text-3xl">
              Dashboard and day-to-day work
            </h2>
            <p className="mt-3 text-muted-foreground">
              Arrivals, departures, manual reservations, a cleaning overview,
              and messages you can copy into the channel you already use.
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
            <h2 className="text-xl font-semibold">iCal import</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Airbnb and Booking.com provide an iCal link for each listing.
              Paste it into Hostvia. Reservations import on the next sync. You
              can sync manually, and the dashboard also refreshes about once an
              hour while it is open.
            </p>
          </div>
          <div className="marketing-card rounded-2xl border border-border bg-card p-8">
            <h2 className="text-xl font-semibold">Export back to the platforms</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Each property has an export link. Current stays are included.
              Blocks export as unavailable. Past stays are not sent. The other
              platform reads that link on its own schedule.
            </p>
          </div>
          <div className="marketing-card rounded-2xl border border-border bg-card p-8">
            <h2 className="text-xl font-semibold">Prices by date</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Set a base nightly price in euros, then add prices for specific
              date ranges. On the public site, the guest sees the total for the
              nights they selected when those prices exist.
            </p>
          </div>
          <div className="marketing-card rounded-2xl border border-border bg-card p-8">
            <h2 className="text-xl font-semibold">Inquiries, not instant checkout</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              A guest sends a name, email, phone, and an optional message. You
              review it and contact them. Accepting creates a reservation.
              Declining does not. Hostvia does not charge the guest.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <SyncLimitationNote />
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          <Button asChild>
            <Link href="/booking-site">
              Booking site
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/how-it-works">How to get started</Link>
          </Button>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
