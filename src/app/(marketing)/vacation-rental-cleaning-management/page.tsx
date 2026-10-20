import type { Metadata } from "next";
import Link from "next/link";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { LandingFaq } from "@/components/marketing/landing-faq";
import { MarketingBreadcrumbs } from "@/components/marketing/marketing-breadcrumbs";
import { PageHero } from "@/components/marketing/page-hero";
import { pageMetadata } from "@/lib/seo/site";

export const metadata: Metadata = pageMetadata({
  title: "Vacation rental cleaning management",
  description:
    "Plan turnover cleaning from arrivals and departures. Hostvia shows which properties check out, and it does not assign cleaners or mark a clean finished.",
  path: "/vacation-rental-cleaning-management",
});

const faqs = [
  {
    question: "Does Hostvia text my cleaner?",
    answer:
      "No. The cleaning page is a calendar view. You still send the list in the chat or email you already use.",
  },
  {
    question: "How is a cleaning counted?",
    answer:
      "On a given day, the cleaning count equals the number of departures. A property that is occupied in the middle of a stay is shown as occupied, not as a clean, unless that day is also a checkout.",
  },
  {
    question: "Can my cleaner open Hostvia?",
    answer:
      "You can give a team login access to the cleaning view and arrivals, and withhold billing. They still cannot be assigned a job inside Hostvia, and the product does not record that a clean is done.",
  },
];

export default function CleaningManagementPage() {
  return (
    <>
      <MarketingBreadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Cleaning", path: "/vacation-rental-cleaning-management" },
        ]}
      />
      <PageHero
        eyebrow="Turnovers"
        title="Vacation rental cleaning management from the departure list"
        description="Most missed cleans start as a checkout that lived on a different calendar from the next arrival. Hostvia puts those departures on one monthly view. It does not run the cleaning company for you."
        primaryCta={{ label: "Create a free account", href: "/register" }}
        secondaryCta={{
          label: "Read the cleaning guide",
          href: "/guides/vacation-rental-cleaning-schedule",
        }}
      />

      <section className="mx-auto max-w-3xl px-4 py-16 md:px-6">
        <h2 className="marketing-heading text-2xl text-white md:text-3xl">
          Why turnovers slip
        </h2>
        <p className="mt-4 text-base leading-relaxed text-zinc-400">
          A same-day changeover is a different job from a checkout with two
          empty nights after it. If the departure is on Booking.com and the
          next arrival is a direct guest you have not written down, the cleaner
          hears about it too late. The fix starts with one list of who leaves
          and who arrives, not with a second task app.
        </p>
      </section>

      <section className="border-y border-white/5 bg-white/[0.02] py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <h2 className="marketing-heading text-2xl text-white md:text-3xl">
            The view Hostvia actually gives you
          </h2>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-zinc-300">
            <p>
              The Cleanings page is a month laid out by property. Each day can
              show an arrival, a departure, a stay in the middle, or an empty
              day. The number of cleans that day is the number of departures.
              An arrival can show where the stay came from, such as Airbnb,
              Booking.com, or a direct reservation.
            </p>
            <p>
              Arrivals and departures are also split into today, tomorrow, and
              the rest of the week. Use that beside the cleaning month when you
              need to know whether the next guest is waiting.
            </p>
            <p>
              The list is only as current as the reservations behind it. Direct
              stays have to be entered. Imported calendars refresh about once an
              hour while the dashboard is open, or when you sync them. A booking
              that has not imported yet will not create a departure.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 md:px-6">
        <h2 className="marketing-heading text-2xl text-white md:text-3xl">
          A small-operation routine
        </h2>
        <div className="mt-6 space-y-4 text-sm leading-relaxed text-zinc-300">
          <p>
            Take two units, Apartment A and Apartment B, on a Friday. A checks
            out and a new guest arrives the same day. B is in the middle of a
            stay. The cleaning count for Friday is one, because only A departs.
            B stays on the calendar as occupied.
          </p>
          <p>
            Write that one clean into the message you already send the cleaner,
            and say that A is a same-day turnover. If the departing guest
            cancels on Thursday, change the reservation first. Otherwise Friday
            still shows a departure that no longer exists.
          </p>
        </div>
        <p className="mt-6 text-sm leading-relaxed text-zinc-400">
          House rules and arrival notes can be saved and copied. Hostvia does
          not deliver them to the guest. More of the operating habit is in the{" "}
          <Link
            href="/guides/vacation-rental-cleaning-schedule"
            className="text-violet-300 hover:underline"
          >
            cleaning schedule guide
          </Link>
          . The account limits are on{" "}
          <Link href="/pricing" className="text-violet-300 hover:underline">
            Pricing
          </Link>
          .
        </p>
      </section>

      <section className="border-y border-white/5 bg-white/[0.02] py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <h2 className="marketing-heading text-2xl text-white md:text-3xl">
            What this is not
          </h2>
          <p className="mt-4 text-base leading-relaxed text-zinc-400">
            Hostvia does not assign a cleaner, send a job notification, store a
            door code for them, collect photo proof, or track whether the clean
            was paid. If that is the product you need, this page will not
            replace it. The{" "}
            <Link href="/features" className="text-violet-300 hover:underline">
              feature list
            </Link>{" "}
            is the boundary.
          </p>
        </div>
      </section>

      <LandingFaq items={faqs} />
      <CtaBanner />
    </>
  );
}
