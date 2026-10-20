import type { Metadata } from "next";
import Link from "next/link";
import { Heart, Target, Users } from "lucide-react";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { MarketingBreadcrumbs } from "@/components/marketing/marketing-breadcrumbs";
import { PageHero } from "@/components/marketing/page-hero";
import { Button } from "@/components/ui/button";
import { pageMetadata } from "@/lib/seo/site";

export const metadata: Metadata = pageMetadata({
  title: "About",
  description:
    "Hostvia was developed while managing five family-owned bungalows and used through a real rental season. It is built for small vacation rental operators.",
  path: "/about",
});

const values = [
  {
    icon: Target,
    title: "A smaller tool on purpose",
    description:
      "iCal links instead of a channel-manager API. Inquiries instead of charging the guest inside the product.",
  },
  {
    icon: Users,
    title: "Day-to-day work",
    description:
      "Calendars, arrivals, departures, a cleaning overview, and messages you can reuse.",
  },
  {
    icon: Heart,
    title: "Direct contact",
    description:
      "When a guest writes through your page, the conversation stays between you and the guest.",
  },
];

export default function AboutPage() {
  return (
    <>
      <MarketingBreadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ]}
      />
      <PageHero
        eyebrow="About"
        title="Made for owners who run the place themselves"
        description="Hostvia is a global product in English for vacation rental owners and small operators. The Free plan covers two properties. Pro is for a larger portfolio."
        primaryCta={{ label: "Create a free account", href: "/register" }}
      />

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="marketing-heading text-2xl md:text-3xl">How it started</h2>
            <div className="mt-6 space-y-4 text-muted-foreground">
              <p>
                Hostvia was developed from the work of managing five
                family-owned bungalows, and it was used throughout an actual
                rental season.
              </p>
              <p>
                The practical problems were ordinary ones: reservations living
                on more than one calendar, direct guests who were not on those
                calendars, and knowing which property had a departure that day.
              </p>
              <p>
                The product is still aimed at that scale. This site does not
                claim a large customer base.
              </p>
            </div>
          </div>
          <div className="marketing-card rounded-2xl border border-border bg-card p-8">
            <h2 className="text-lg font-semibold">Who it is for</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>Owners of apartments, cottages, bungalows, or rooms</li>
              <li>People who list on Airbnb, Booking.com, or both</li>
              <li>People who also take inquiries directly</li>
              <li>Small operators who need more than two properties</li>
            </ul>
            <Button className="mt-6" variant="outline" asChild>
              <Link href="/features">View features</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card/30 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="marketing-heading text-center text-2xl md:text-3xl">
            What we keep simple
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {values.map((value) => (
              <div key={value.title} className="rounded-2xl border border-border bg-card p-6">
                <value.icon className="h-8 w-8 text-primary" />
                <h3 className="mt-4 text-lg font-semibold">{value.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
