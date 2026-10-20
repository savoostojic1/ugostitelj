import type { Metadata } from "next";
import Link from "next/link";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { LandingFaq } from "@/components/marketing/landing-faq";
import { MarketingBreadcrumbs } from "@/components/marketing/marketing-breadcrumbs";
import { PageHero } from "@/components/marketing/page-hero";
import { PlanComparison } from "@/components/marketing/plan-comparison";
import { pageMetadata } from "@/lib/seo/site";
import { FREE_PROPERTY_LIMIT } from "@/lib/subscriptions/plans";

export const metadata: Metadata = pageMetadata({
  title: "Property management software for small hosts",
  description:
    "A smaller operations tool for hosts with a few vacation rentals: calendars, arrivals, a cleaning overview, and an optional inquiry site.",
  path: "/property-management-software-for-small-hosts",
});

const faqs = [
  {
    question: "Do I need software for one rental?",
    answer:
      "Only if the dates, the direct guests, and the turnover list are getting hard to hold in your head. One property is allowed on the Free plan. You can also keep using the listing sites alone.",
  },
  {
    question: "Can staff see the cleaning days without seeing billing?",
    answer:
      "You can create a team login and choose which sections it can open, such as arrivals and the cleaning view. That login does not assign a cleaner or mark a clean finished.",
  },
  {
    question: "Does the paid plan add agency tools?",
    answer:
      "No. Pro removes the two-property limit. It does not add in-app guest payments, cleaner dispatch, or a separate portfolio product.",
  },
];

export default function SmallHostSoftwarePage() {
  return (
    <>
      <MarketingBreadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Small hosts", path: "/property-management-software-for-small-hosts" },
        ]}
      />
      <PageHero
        eyebrow="Small operations"
        title="Property management software sized for a few rentals"
        description="If you look after one place, or a handful, you need to know which nights are taken and which departure needs a clean. You do not need an agency platform to do that."
        primaryCta={{ label: "Start with two properties", href: "/register" }}
        secondaryCta={{ label: "Compare plans", href: "/pricing" }}
      />

      <section className="mx-auto max-w-3xl px-4 py-16 md:px-6">
        <h2 className="marketing-heading text-2xl text-white md:text-3xl">
          A small portfolio still has moving parts
        </h2>
        <div className="mt-6 space-y-4 text-base leading-relaxed text-zinc-400">
          <p>
            Two apartments can be harder to track than one, because a booking
            on the second unit does not belong on the first calendar, and a
            same-day turnover on only one of them is easy to miss.
          </p>
          <p>
            The useful daily picture is short: which property, which dates, who
            arrives, who leaves, and whether that departure is the clean. Price
            rules and a public inquiry page can wait until the dates are
            trustworthy.
          </p>
        </div>
      </section>

      <section className="border-y border-white/5 bg-white/[0.02] py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <h2 className="marketing-heading text-2xl text-white md:text-3xl">
            What Hostvia covers at this size
          </h2>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-zinc-300">
            <p>
              Each active property has its own calendar. Imported stays, manual
              stays, and blocks sit on that calendar. The dashboard shows
              arrivals and departures, and the cleaning page turns departures
              into a count for the day.
            </p>
            <p>
              A team login can be limited to the sections you choose. Use that
              if someone else needs the arrival list. It is a permission, not a
              job assignment.
            </p>
            <p>
              The Free plan includes {FREE_PROPERTY_LIMIT} active properties and
              does not ask for a card. Details are on the{" "}
              <Link href="/pricing" className="text-violet-300 hover:underline">
                pricing page
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 md:px-6">
        <h2 className="marketing-heading text-2xl text-white md:text-3xl">
          When a larger system is the better buy
        </h2>
        <p className="mt-4 text-base leading-relaxed text-zinc-400">
          Move on if the business needs the guest to pay by card inside the
          software, a channel manager with platform APIs, cleaner dispatch with
          completion tracking, or accounting for many owners. Hostvia does not
          include those.
        </p>
        <p className="mt-4 text-sm text-zinc-500">
          If the question is specifically the calendar, read{" "}
          <Link href="/airbnb-calendar-sync" className="text-violet-300 hover:underline">
            Airbnb calendar sync
          </Link>
          . If it is the turnover list, read{" "}
          <Link
            href="/vacation-rental-cleaning-management"
            className="text-violet-300 hover:underline"
          >
            cleaning management
          </Link>
          .
        </p>
      </section>

      <section className="border-y border-white/5 bg-white/[0.02] py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <h2 className="marketing-heading text-2xl text-white md:text-3xl">
            Plans
          </h2>
          <div className="mt-8">
            <PlanComparison />
          </div>
        </div>
      </section>

      <LandingFaq items={faqs} />
      <CtaBanner />
    </>
  );
}
