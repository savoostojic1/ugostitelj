import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { MarketingAuthButton } from "@/components/marketing/marketing-auth-button";
import { MarketingBreadcrumbs } from "@/components/marketing/marketing-breadcrumbs";
import { PageHero } from "@/components/marketing/page-hero";
import { SyncLimitationNote } from "@/components/marketing/sync-limitation-note";
import { howItWorksSteps } from "@/lib/marketing/content";
import { pageMetadata } from "@/lib/seo/site";
import { FREE_PROPERTY_LIMIT } from "@/lib/subscriptions/plans";

export const metadata: Metadata = pageMetadata({
  title: "How Hostvia works",
  description:
    "Create an account, add a property, connect an iCal calendar, and publish an inquiry site. Free includes two properties.",
  path: "/how-it-works",
});

const setupDetails = [
  {
    title: "Create an account and add a property",
    items: [
      "Register with your name, email, and password",
      `Add a property name. The Free plan includes ${FREE_PROPERTY_LIMIT} active properties`,
      "Add a description, guest capacity, amenities, and a nightly price when you are ready",
    ],
  },
  {
    title: "Connect calendars",
    items: [
      "Copy the iCal export link from Airbnb or Booking.com",
      "On Booking.com, export booked dates only",
      "Paste the link in Hostvia and run a sync. You can also export Hostvia dates back",
    ],
  },
  {
    title: "Publish the inquiry site",
    items: [
      "Choose a public address and add a cover photo and contact details",
      "Turn on the properties you want guests to see",
      "Share the link. Guests can search dates and send an inquiry",
    ],
  },
  {
    title: "Reply to inquiries",
    items: [
      "Read the guest, dates, and message in the dashboard",
      "Accept to create a reservation, or decline",
      "Copy a saved message into email, WhatsApp, or another app you already use",
    ],
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <MarketingBreadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "How it works", path: "/how-it-works" },
        ]}
      />
      <PageHero
        eyebrow="How it works"
        title="From a new account to the first inquiry"
        description="The public site is optional. You can start with calendars and the dashboard, then publish a page when you want guests to write to you directly."
        primaryCta={{ label: "Create a free account", href: "/register" }}
        secondaryCta={{ label: "View pricing", href: "/pricing" }}
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
                <h2 className="text-xl font-semibold">{step.title}</h2>
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
          <h2 className="marketing-heading text-2xl md:text-3xl">What you do in the product</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {setupDetails.map((section) => (
              <div key={section.title} className="rounded-2xl border border-border bg-card p-6">
                <h3 className="font-semibold">{section.title}</h3>
                <ul className="mt-4 space-y-3">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <SyncLimitationNote />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <div className="marketing-card rounded-2xl border border-primary/20 bg-primary/5 p-8 md:p-10">
          <h2 className="marketing-heading text-2xl">A practical order</h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Add the property, then connect calendars so existing stays are
            visible before you publish the public page. That way a guest cannot
            inquire about dates you already know are taken.
          </p>
          <MarketingAuthButton className="mt-6" loggedOutLabel="Create a free account" showArrow />
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
