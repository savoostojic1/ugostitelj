import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarDays,
  Image,
  MapPin,
  Search,
  Send,
} from "lucide-react";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { MarketingAuthButton } from "@/components/marketing/marketing-auth-button";
import { PageHero } from "@/components/marketing/page-hero";
import { Button } from "@/components/ui/button";
import { publicSiteFeatures } from "@/lib/marketing/content";

export const metadata: Metadata = {
  title: "Booking site — Hostvia",
  description:
    "A professional guest-facing page with date search, gallery, map and direct booking inquiries — no commission.",
};

const guestFlow = [
  {
    icon: Search,
    title: "Search",
    description: "Guest picks check-in, check-out and number of guests.",
  },
  {
    icon: CalendarDays,
    title: "Availability",
    description: "They see only available units with the full stay price.",
  },
  {
    icon: Image,
    title: "Browse",
    description: "Gallery, capacity, amenities and unit description.",
  },
  {
    icon: Send,
    title: "Inquiry",
    description: "Fill out the contact form — you receive the inquiry in your dashboard.",
  },
];

export default function JavniSajtPage() {
  return (
    <>
      <PageHero
        eyebrow="Booking site"
        title="Your page for direct bookings"
        description="Every host gets their own guest-facing page. Date search, accurate pricing, gallery and map — all in one place, with no middleman."
        primaryCta={{ label: "Create account", href: "/register" }}
        secondaryCta={{ label: "View pricing", href: "/cijene" }}
      />

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="marketing-heading text-2xl md:text-3xl">
              Your link, your brand
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              After publishing you get an address like{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                hostvia.me/host/your-account
              </code>
              . Share it on Instagram, in your email signature or on your Google
              profile — guests come directly to you.
            </p>
            <ul className="mt-6 space-y-4">
              {[
                "Cover photo and host profile",
                "Contact phone, email and social links",
                "Google Maps location",
                "All your units in one place",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-gradient-to-br from-teal-50 to-indigo-50 p-8 dark:from-teal-950/30 dark:to-indigo-950/30">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Example URL
            </p>
            <p className="mt-3 text-2xl font-bold tracking-tight">
              hostvia.me/host/sea-apartments
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Guests see your brand, search accommodation and send an inquiry —
              without leaving for an OTA platform.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card/30 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="marketing-heading text-2xl md:text-3xl">
            What guests see
          </h2>
          <FeatureGrid features={publicSiteFeatures} columns={2} className="mt-10" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <h2 className="marketing-heading text-2xl md:text-3xl">
          Guest journey to inquiry
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {guestFlow.map((step, index) => (
            <div
              key={step.title}
              className="relative rounded-2xl border border-border bg-card p-6"
            >
              <span className="text-xs font-bold text-primary">
                Step {index + 1}
              </span>
              <step.icon className="mt-4 h-8 w-8 text-primary" />
              <h3 className="mt-4 font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-card/30 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="marketing-card rounded-2xl border border-border bg-card p-8 md:p-10">
            <h2 className="marketing-heading text-2xl">
              Direct inquiries = 0% commission
            </h2>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Booking inquiries are not instant payment — that is the advantage.
              You talk to the guest, agree on details and payment directly. No
              middleman taking a cut of direct bookings.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <MarketingAuthButton
                loggedOutLabel="Publish your site"
                loggedInLabel="Open booking site settings"
                loggedInHref="/dashboard/public-site"
                showArrow
              />
              <Button variant="outline" asChild>
                <Link href="/faq">FAQ</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
