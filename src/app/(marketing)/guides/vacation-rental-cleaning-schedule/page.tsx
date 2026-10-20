import type { Metadata } from "next";
import Link from "next/link";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { MarketingBreadcrumbs } from "@/components/marketing/marketing-breadcrumbs";
import { pageMetadata } from "@/lib/seo/site";

export const metadata: Metadata = pageMetadata({
  title: "How to organize a vacation rental cleaning schedule",
  description:
    "How small hosts can plan cleans from arrivals and departures, and what a calendar overview still leaves to you.",
  path: "/guides/vacation-rental-cleaning-schedule",
});

export default function CleaningScheduleGuidePage() {
  return (
    <>
      <MarketingBreadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Guides", path: "/guides" },
          {
            name: "Cleaning",
            path: "/guides/vacation-rental-cleaning-schedule",
          },
        ]}
      />
      <article className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
        <p className="text-sm font-medium text-violet-300">Guide</p>
        <h1 className="marketing-heading mt-3 text-4xl text-white">
          How to organize a vacation rental cleaning schedule
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-zinc-400">
          Most missed cleans are not a mystery. A departure was on one
          calendar, the next arrival was on another, and nobody had both in
          front of them.
        </p>

        <div className="mt-10 space-y-10 text-base leading-relaxed text-zinc-300">
          <section>
            <h2 className="text-2xl font-semibold text-white">Treat a departure as the clean</h2>
            <p className="mt-3">
              For a whole-property rental, the useful unit of work is the
              checkout. If three properties depart on Friday, there are three
              cleans that day, even if a new guest arrives at only one of them.
              A mid-stay day still needs the property to be occupied and left
              alone unless the guest asked for service.
            </p>
            <p className="mt-3">
              Hostvia&apos;s Cleanings page is that view: for each day and each
              property it shows an arrival, a departure, a stay in the middle,
              or an empty day. The cleaning count for the day equals the number
              of departures. Arrival rows can show where the stay came from,
              such as Airbnb, Booking.com, or a direct reservation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">Look at the gap, not only the checkout date</h2>
            <p className="mt-3">
              A same-day turnover is a different job from a checkout with two
              empty nights after it. The arrivals list tells you whether
              someone new is coming today, tomorrow, or later in the week. Use
              that with the cleaning view before you tell a cleaner the place
              can wait until the next morning.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">What this view does not do</h2>
            <p className="mt-3">
              It does not assign a cleaner, text them, track whether they
              accepted the job, or mark the clean as finished. It also does not
              store access codes for a cleaner. If you need dispatch, photo
              proof, or cleaner payroll, you still do that outside Hostvia.
            </p>
            <p className="mt-3">
              Team access can let a staff login open the sections you allow,
              such as cleanings and arrivals, without opening billing. That is
              a permission setting, not an assignment system.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">Keep the source calendars honest</h2>
            <p className="mt-3">
              A cleaning list is only as current as the reservations behind it.
              Direct stays have to be entered, and imported calendars refresh
              about once an hour while the dashboard is open, or when you sync
              them. A booking that has not imported yet will not create a
              departure on the cleaning view.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">A simple routine</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5">
              <li>Each evening, open tomorrow&apos;s departures and arrivals.</li>
              <li>Count cleans as departures, not as every occupied property.</li>
              <li>Mark same-day turnovers yourself so the cleaner knows the next guest is waiting.</li>
              <li>Send the list in the chat or email you already use with your cleaner.</li>
              <li>After a cancellation, sync or edit the reservation before you cancel the clean.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">Messages you send every time</h2>
            <p className="mt-3">
              House rules, arrival instructions, and a checkout reminder are
              worth saving once. Hostvia stores those texts so you can copy
              them. It does not send them to the guest for you, and it does not
              keep a conversation thread inside the product.
            </p>
          </section>
        </div>

        <p className="mt-10 text-sm text-zinc-400">
          Related:{" "}
          <Link href="/features" className="text-violet-300 hover:underline">
            Features
          </Link>
          {" · "}
          <Link href="/guides/vacation-rental-calendar" className="text-violet-300 hover:underline">
            Calendar guide
          </Link>
          {" · "}
          <Link href="/booking-site" className="text-violet-300 hover:underline">
            Inquiry site
          </Link>
          {" · "}
          <Link href="/pricing" className="text-violet-300 hover:underline">
            Pricing
          </Link>
        </p>
      </article>
      <CtaBanner />
    </>
  );
}
