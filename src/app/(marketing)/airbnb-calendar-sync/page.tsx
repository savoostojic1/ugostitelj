import type { Metadata } from "next";
import Link from "next/link";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { LandingFaq } from "@/components/marketing/landing-faq";
import { MarketingBreadcrumbs } from "@/components/marketing/marketing-breadcrumbs";
import { PageHero } from "@/components/marketing/page-hero";
import { pageMetadata } from "@/lib/seo/site";

export const metadata: Metadata = pageMetadata({
  title: "Airbnb calendar sync",
  description:
    "How Hostvia imports Airbnb and Booking.com calendars with iCal, what an hourly refresh can and cannot guarantee, and how to lower double-booking risk.",
  path: "/airbnb-calendar-sync",
});

const faqs = [
  {
    question: "Does Hostvia connect to the Airbnb API?",
    answer:
      "No. You paste the iCal export link Airbnb already gives the listing. There is no API key and no official channel-manager connection.",
  },
  {
    question: "How often do calendars refresh?",
    answer:
      "While the Hostvia dashboard is open, connected calendars refresh about once an hour. You can also sync a feed by hand. Airbnb and Booking.com still read imported calendars on their own schedule.",
  },
  {
    question: "Will this make double bookings impossible?",
    answer:
      "No. A stay can be confirmed on one site before Hostvia, or the other site, has imported it. Sync shortens that gap. It does not close it.",
  },
  {
    question: "What should I export from Booking.com?",
    answer:
      "Booked dates only. Closed days can use the same label as a real stay, and then they show up in Hostvia as if a guest had booked them.",
  },
];

export default function AirbnbCalendarSyncPage() {
  return (
    <>
      <MarketingBreadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Calendar sync", path: "/airbnb-calendar-sync" },
        ]}
      />
      <PageHero
        eyebrow="Calendars"
        title="Airbnb calendar sync without an API"
        description="Paste the iCal link from a listing and see those stays next to your direct reservations. The copy is not live, and a new booking can exist on Airbnb before Hostvia shows it."
        primaryCta={{ label: "Create a free account", href: "/register" }}
        secondaryCta={{ label: "Read the calendar guide", href: "/guides/vacation-rental-calendar" }}
      />

      <section className="mx-auto max-w-3xl px-4 py-16 md:px-6">
        <h2 className="marketing-heading text-2xl text-white md:text-3xl">
          Why the links matter
        </h2>
        <p className="mt-4 text-base leading-relaxed text-zinc-400">
          If Airbnb has a guest and your own notes do not, you can promise the
          same night twice. The same thing happens the other way when a direct
          guest never gets written back onto the listing calendar. Sync is the
          habit of moving those busy dates in both directions, with a delay you
          should plan for.
        </p>
      </section>

      <section className="border-y border-white/5 bg-white/[0.02] py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <h2 className="marketing-heading text-2xl text-white md:text-3xl">
            What iCal actually is
          </h2>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-zinc-300">
            <p>
              Airbnb, Booking.com, and many other tools can export a calendar
              link. That file lists busy dates. It is not a live connection to
              their booking system. Hostvia reads the link, and you can give
              Hostvia&apos;s export link back to the listing site so it can read
              your direct stays.
            </p>
            <p>
              In Hostvia you choose Airbnb, Booking.com, or a custom source for
              each link, and you attach it to one property. Custom means any
              other public calendar link. It is not a separate integration
              with Vrbo, Google Calendar, or another listing site. One property
              should not share a calendar with a different physical unit.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 md:px-6">
        <h2 className="marketing-heading text-2xl text-white md:text-3xl">
          What Hostvia does with the feed
        </h2>
        <ul className="mt-6 space-y-3 text-sm leading-relaxed text-zinc-300">
          <li>Imports events onto that property&apos;s calendar.</li>
          <li>
            Shows Airbnb dates titled unavailable or blocked as “Manually
            blocked,” rather than as a guest stay.
          </li>
          <li>
            Lets you add a manual reservation for a direct guest, and refuses a
            date range that overlaps anything already on that calendar.
          </li>
          <li>
            Exports current stays. Blocks are sent as unavailable. Stays whose
            checkout is already in the past are omitted.
          </li>
          <li>
            Refreshes about once an hour while the dashboard is open, or
            immediately when you sync.
          </li>
        </ul>
        <p className="mt-6 text-sm leading-relaxed text-zinc-400">
          The other platform decides when it fetches the export. A direct stay
          can sit in Hostvia for a while before Airbnb or Booking.com shows the
          night as closed.
        </p>
      </section>

      <section className="border-y border-white/5 bg-white/[0.02] py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <h2 className="marketing-heading text-2xl text-white md:text-3xl">
            How to keep the gap smaller
          </h2>
          <ol className="mt-6 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-zinc-300">
            <li>Connect the import link before you publish an inquiry page.</li>
            <li>On Booking.com, export booked dates only, then save.</li>
            <li>Enter a direct stay in Hostvia the day you agree it, not at the weekend.</li>
            <li>Paste Hostvia&apos;s export link into each listing site you still use.</li>
            <li>If a feed shows an error, sync it before you confirm a same-day arrival.</li>
          </ol>
          <p className="mt-6 text-sm text-zinc-500">
            For platform-to-platform iCal steps (Airbnb, Booking.com, Vrbo and
            more), use the free{" "}
            <Link
              href="/free-tools/vacation-rental-calendar-sync-guide"
              className="text-violet-300 hover:underline"
            >
              vacation rental calendar sync guide
            </Link>
            . A longer Hostvia walkthrough is in the{" "}
            <Link
              href="/guides/vacation-rental-calendar"
              className="text-violet-300 hover:underline"
            >
              vacation rental calendar guide
            </Link>
            . Setup steps are on{" "}
            <Link href="/how-it-works" className="text-violet-300 hover:underline">
              How it works
            </Link>
            . Plan limits are on{" "}
            <Link href="/pricing" className="text-violet-300 hover:underline">
              Pricing
            </Link>
            .
          </p>
        </div>
      </section>

      <LandingFaq items={faqs} />
      <CtaBanner />
    </>
  );
}
