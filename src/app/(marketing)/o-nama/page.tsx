import type { Metadata } from "next";
import Link from "next/link";
import { Heart, MapPin, Target, Users } from "lucide-react";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { PageHero } from "@/components/marketing/page-hero";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About — Hostvia",
  description:
    "Hostvia is a platform for short-term rental hosts in Montenegro and the region — calendar, booking site and direct inquiries.",
};

const values = [
  {
    icon: Target,
    title: "Simplicity",
    description:
      "Technology should make work easier, not harder. iCal instead of APIs, inquiries instead of complex payment flows.",
  },
  {
    icon: Users,
    title: "Host-first",
    description:
      "We build tools hosts use every day — calendar, arrivals, messages, direct contact with guests.",
  },
  {
    icon: MapPin,
    title: "Local focus",
    description:
      "We understand how hospitality works in the region — seasonality, multiple sales channels, direct bookings via social media.",
  },
  {
    icon: Heart,
    title: "Direct relationships",
    description:
      "We believe hosts and guests should communicate directly. Fewer middlemen, more control over your business.",
  },
];

export default function ONamaPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="Built for hosts in the region"
        description="Hostvia was born from the need to manage Airbnb, Booking.com and direct guest inquiries from one place — without complicated integrations."
        primaryCta={{ label: "Start free", href: "/register" }}
      />

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="marketing-heading text-2xl md:text-3xl">
              Our story
            </h2>
            <div className="mt-6 space-y-4 text-muted-foreground">
              <p>
                Short-term rental hosts spend too much time switching between
                platforms, checking calendars and answering the same guest
                questions. Hostvia solves this by combining an operations
                calendar with a public site for direct inquiries.
              </p>
              <p>
                We started with iCal sync — a simple way to keep all
                reservations in one place. Then we added the booking site,
                date-based pricing, gallery and inquiries so hosts could attract
                guests directly, without commission.
              </p>
              <p>
                Today Hostvia is used by hosts who want a more professional way
                to run their accommodation — whether they have one apartment or
                multiple units.
              </p>
            </div>
          </div>
          <div className="marketing-card rounded-2xl border border-border bg-card p-8">
            <h3 className="text-lg font-semibold">Who we build for</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>• Apartment and studio owners</li>
              <li>• Small apartment complexes and bungalows</li>
              <li>• Hosts on Airbnb and Booking.com</li>
              <li>• Hosts who want direct bookings</li>
              <li>• Operators with multiple units in Montenegro and the region</li>
            </ul>
            <Button className="mt-6" variant="outline" asChild>
              <Link href="/funkcije">View features</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card/30 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="marketing-heading text-center text-2xl md:text-3xl">
            Our values
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {values.map((value) => (
              <div
                key={value.title}
                className="rounded-2xl border border-border bg-card p-6"
              >
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
