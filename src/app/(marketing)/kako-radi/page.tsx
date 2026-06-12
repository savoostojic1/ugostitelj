import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { MarketingAuthButton } from "@/components/marketing/marketing-auth-button";
import { PageHero } from "@/components/marketing/page-hero";
import { Button } from "@/components/ui/button";
import { howItWorksSteps } from "@/lib/marketing/content";

export const metadata: Metadata = {
  title: "How it works — Hostvia",
  description:
    "Sign up, connect iCal calendars, publish your booking site and receive inquiries — step by step.",
};

const setupDetails = [
  {
    title: "Sign up and add your first unit",
    items: [
      "Create an account with email and password",
      "Add your first unit — name, capacity, basic details",
      "Set your base nightly rate",
    ],
  },
  {
    title: "Connect calendars",
    items: [
      "Find the iCal export link in Airbnb or Booking.com",
      "Paste the link in your unit settings in Hostvia",
      "Wait for the first sync — reservations appear in your calendar",
    ],
  },
  {
    title: "Public profile and site",
    items: [
      "Open Booking site in your dashboard",
      "Add business name, location, cover photo and contact details",
      "Publish your site — you get a link to share",
    ],
  },
  {
    title: "Receiving inquiries",
    items: [
      "Guest searches dates on your public site",
      "They see price, availability and send an inquiry",
      "You review the inquiry in your dashboard and contact the guest",
    ],
  },
];

export default function KakoRadiPage() {
  return (
    <>
      <PageHero
        eyebrow="How it works"
        title="From sign-up to your first inquiry"
        description="Hostvia is designed to be simple. Here is the exact sequence of steps hosts follow when getting started."
        primaryCta={{ label: "Create account", href: "/register" }}
        secondaryCta={{ label: "View pricing", href: "/cijene" }}
      />

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <div className="grid gap-8 lg:grid-cols-2">
          {howItWorksSteps.map((step, index) => (
            <div
              key={step.step}
              className="relative flex gap-6 rounded-2xl border border-border bg-card p-6"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                {index + 1}
              </div>
              <div>
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-card/30 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="marketing-heading text-2xl md:text-3xl">
            Detailed guide
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Each step in practice — what you actually do in the dashboard.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {setupDetails.map((section) => (
              <div
                key={section.title}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <h3 className="font-semibold">{section.title}</h3>
                <ul className="mt-4 space-y-3">
                  {section.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <div className="marketing-card rounded-2xl border border-primary/20 bg-primary/5 p-8 md:p-10">
          <h2 className="marketing-heading text-2xl">Tip for a faster start</h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Connect calendars first to see existing reservations. Then add
            photos and publish your public site. That way you immediately have
            both an operations overview and a channel for direct inquiries.
          </p>
          <MarketingAuthButton
            className="mt-6"
            loggedOutLabel="Get started now"
            showArrow
          />
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
