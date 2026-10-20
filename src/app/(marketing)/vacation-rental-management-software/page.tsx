import type { Metadata } from "next";
import Link from "next/link";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { LandingFaq } from "@/components/marketing/landing-faq";
import { MarketingBreadcrumbs } from "@/components/marketing/marketing-breadcrumbs";
import { PageHero } from "@/components/marketing/page-hero";
import { PlanComparison } from "@/components/marketing/plan-comparison";
import { pageMetadata } from "@/lib/seo/site";
import { FREE_PROPERTY_LIMIT, PRO_MONTHLY_PRICE_USD } from "@/lib/subscriptions/plans";

export const metadata: Metadata = pageMetadata({
  title: "Vacation rental management software",
  description:
    "Hostvia helps small vacation rental owners keep calendars, arrivals, cleaning days, and guest inquiries in one account. Free for two properties.",
  path: "/vacation-rental-management-software",
});

const faqs = [
  {
    question: "Is Hostvia a channel manager?",
    answer:
      "No. It imports and exports iCal links. It does not use the Airbnb or Booking.com channel-manager APIs, and it does not update every platform the moment a booking is made.",
  },
  {
    question: "Can I start without a public website?",
    answer:
      "Yes. The inquiry site is optional. You can use the account for calendars, manual reservations, arrivals, and the cleaning view.",
  },
  {
    question: "What happens above two properties?",
    answer: `The Free plan keeps ${FREE_PROPERTY_LIMIT} active properties. Pro is $${PRO_MONTHLY_PRICE_USD} per month for the whole account and removes that limit. If the account returns to Free, the two oldest properties stay active and the others lock.`,
  },
];

export default function VacationRentalManagementSoftwarePage() {
  return (
    <>
      <MarketingBreadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Management software", path: "/vacation-rental-management-software" },
        ]}
      />
      <PageHero
        eyebrow="For small portfolios"
        title="Vacation rental management software for owners who run the place"
        description="Hostvia is for people who manage their own apartments, cottages, bungalows, or rooms. It keeps listing calendars, direct stays, arrivals, and a cleaning overview together."
        primaryCta={{ label: "Create a free account", href: "/register" }}
        secondaryCta={{ label: "See pricing", href: "/pricing" }}
      />

      <section className="mx-auto max-w-3xl px-4 py-16 md:px-6">
        <h2 className="marketing-heading text-2xl text-white md:text-3xl">
          The work that usually lives in too many tabs
        </h2>
        <div className="mt-6 space-y-4 text-base leading-relaxed text-zinc-400">
          <p>
            A small vacation rental operation rarely fails because of a missing
            report. It fails because tonight&apos;s arrival is on Airbnb, the
            direct guest is in a message thread, and the cleaner is working from
            yesterday&apos;s list.
          </p>
          <p>
            Hostvia was built while managing five family-owned bungalows and
            was used through a real rental season. Those bungalows are the
            origin of the product, not a customer count.
          </p>
        </div>
      </section>

      <section className="border-y border-white/5 bg-white/[0.02] py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <h2 className="marketing-heading text-2xl text-white md:text-3xl">
            What you can do in the account
          </h2>
          <ul className="mt-6 space-y-4 text-sm leading-relaxed text-zinc-300">
            <li>
              Keep each property on its own calendar, with Airbnb, Booking.com,
              and other iCal sources imported into that property.
            </li>
            <li>
              Add a direct stay by hand so a guest who did not book on a listing
              site still blocks the dates.
            </li>
            <li>
              Export current stays back out. Blocks go out as unavailable. Stays
              that have already ended are left out.
            </li>
            <li>
              See today&apos;s arrivals and departures, and a monthly cleaning
              view where the cleaning count equals the number of departures.
            </li>
            <li>
              Publish one inquiry site for the properties you choose. Guests see
              dates and a stay total in euros when you have entered prices.
              Hostvia does not charge them.
            </li>
            <li>
              Save texts you copy into email or a chat app. Hostvia does not
              send those messages for you.
            </li>
          </ul>
          <p className="mt-6 text-sm text-zinc-500">
            <Link href="/features" className="text-violet-300 hover:underline">
              Feature details
            </Link>
            {" · "}
            <Link href="/how-it-works" className="text-violet-300 hover:underline">
              Setup order
            </Link>
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 md:px-6">
        <h2 className="marketing-heading text-2xl text-white md:text-3xl">
          A fit for some owners, not all
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 p-6">
            <h3 className="font-semibold text-white">Useful if you</h3>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-zinc-400">
              <li>Run one or a few places yourself</li>
              <li>Already list on Airbnb, Booking.com, or both</li>
              <li>Also take guests by message or phone</li>
              <li>Need to see who arrives and which departure needs a clean</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 p-6">
            <h3 className="font-semibold text-white">Look elsewhere if you need</h3>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-zinc-400">
              <li>The guest to pay inside the software</li>
              <li>A certified channel-manager API</li>
              <li>Cleaner dispatch, proof photos, or payroll</li>
              <li>Owner statements for a large agency</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="border-y border-white/5 bg-white/[0.02] py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <h2 className="marketing-heading text-2xl text-white md:text-3xl">
            Free and Pro
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-zinc-400">
            {`Free includes ${FREE_PROPERTY_LIMIT} active properties. Pro is $${PRO_MONTHLY_PRICE_USD} per month for the account, not per property. Pro does not add a separate support desk.`}
          </p>
          <div className="mt-8">
            <PlanComparison />
          </div>
          <p className="mt-6 text-sm text-zinc-500">
            Calendar import is about hourly while the dashboard is open, and you
            can sync by hand.{" "}
            <Link href="/airbnb-calendar-sync" className="text-violet-300 hover:underline">
              How Airbnb calendar sync behaves
            </Link>
          </p>
        </div>
      </section>

      <LandingFaq items={faqs} />
      <CtaBanner />
    </>
  );
}
