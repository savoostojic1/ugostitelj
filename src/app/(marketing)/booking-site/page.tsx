import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Image, MapPin, Search, Send } from "lucide-react";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { MarketingAuthButton } from "@/components/marketing/marketing-auth-button";
import { MarketingBreadcrumbs } from "@/components/marketing/marketing-breadcrumbs";
import { PageHero } from "@/components/marketing/page-hero";
import { Button } from "@/components/ui/button";
import { publicSiteFeatures } from "@/lib/marketing/content";
import { pageMetadata } from "@/lib/seo/site";

export const metadata: Metadata = pageMetadata({
  title: "Direct booking website for vacation rentals",
  description:
    "Publish a Hostvia page where guests check dates, see a stay total, and send an inquiry. Hostvia does not charge the guest or confirm the stay.",
  path: "/booking-site",
});

const guestFlow = [
  {
    icon: Search,
    title: "Search",
    description: "The guest chooses check-in, check-out, and how many people are staying.",
  },
  {
    icon: CalendarDays,
    title: "Availability",
    description: "They see published properties that are free for those dates and large enough.",
  },
  {
    icon: Image,
    title: "Details",
    description: "Photos, capacity, amenities, description, and the stay total when prices exist.",
  },
  {
    icon: Send,
    title: "Inquiry",
    description: "They leave contact details. You accept or decline. Accepting creates a reservation.",
  },
];

export default function BookingSitePage() {
  return (
    <>
      <MarketingBreadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Booking site", path: "/booking-site" },
        ]}
      />
      <PageHero
        eyebrow="Booking site"
        title="A page for direct guest inquiries"
        description="Each account can publish one guest-facing site for its properties. Guests search dates and send an inquiry. A public page does not by itself create more bookings."
        primaryCta={{ label: "Create a free account", href: "/register" }}
        secondaryCta={{ label: "View pricing", href: "/pricing" }}
      />

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="marketing-heading text-2xl md:text-3xl">Your address</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              After you publish, guests use an address such as{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                hostvia.me/host/your-name
              </code>
              . Where booking subdomains are enabled, the same site can also be
              served on a subdomain of hostvia.me. Share the link in email or
              on social profiles you already use.
            </p>
            <ul className="mt-6 space-y-4">
              {[
                "Cover photo, name, and short description",
                "Phone, email, Instagram, and Facebook when you add them",
                "A map from a Google Maps link you provide",
                "Every published property on the same site",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-card p-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              What the page is
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              It is an inquiry form with availability and pricing, not a
              checkout. Hostvia does not take a card payment for the stay and
              does not guarantee that a published page will receive inquiries.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Dates already on the calendar cannot be chosen as a new check-in.
              Those dates depend on the last successful calendar sync, so they
              can lag behind Airbnb or Booking.com.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card/30 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="marketing-heading text-2xl md:text-3xl">What guests see</h2>
          <FeatureGrid features={publicSiteFeatures} columns={2} className="mt-10" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <h2 className="marketing-heading text-2xl md:text-3xl">From search to inquiry</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {guestFlow.map((step, index) => (
            <div key={step.title} className="relative rounded-2xl border border-border bg-card p-6">
              <span className="text-xs font-bold text-primary">Step {index + 1}</span>
              <step.icon className="mt-4 h-8 w-8 text-primary" />
              <h3 className="mt-4 font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-4">
          <MarketingAuthButton
            loggedOutLabel="Create a free account"
            loggedInLabel="Open booking site settings"
            loggedInHref="/dashboard/public-site"
            showArrow
          />
          <Button variant="outline" asChild>
            <Link href="/guides/vacation-rental-calendar">Calendar guide</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/vacation-rental-management-software">
              Operations software
            </Link>
          </Button>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
