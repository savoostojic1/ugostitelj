import type { Metadata } from "next";
import Link from "next/link";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { MarketingBreadcrumbs } from "@/components/marketing/marketing-breadcrumbs";
import { pageMetadata } from "@/lib/seo/site";

export const metadata: Metadata = pageMetadata({
  title: "How to manage a vacation rental calendar",
  description:
    "A practical way for small hosts to combine Airbnb, Booking.com, and direct stays, including the limits of iCal sync.",
  path: "/guides/vacation-rental-calendar",
});

export default function VacationRentalCalendarGuidePage() {
  return (
    <>
      <MarketingBreadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Guides", path: "/guides" },
          { name: "Calendar", path: "/guides/vacation-rental-calendar" },
        ]}
      />
      <article className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
        <p className="text-sm font-medium text-violet-300">Guide</p>
        <h1 className="marketing-heading mt-3 text-4xl text-white">
          How to manage a vacation rental calendar
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-zinc-400">
          If you have more than one listing, the hard part is usually not the
          calendar grid. It is knowing which nights are already taken before
          you answer the next guest.
        </p>

        <div className="mt-10 space-y-10 text-base leading-relaxed text-zinc-300">
          <section>
            <h2 className="text-2xl font-semibold text-white">Start with one property at a time</h2>
            <p className="mt-3">
              Give each apartment, cottage, bungalow, or room its own calendar.
              A booking for one unit must not block a different unit. In the
              United Kingdom this is often called a holiday let. The operating
              problem is the same: one physical place, several places a guest
              might book it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">Collect the calendars you already have</h2>
            <p className="mt-3">
              Airbnb and Booking.com can export an iCal link for a listing.
              That link is a snapshot of busy dates, not a live connection to
              their booking systems. Paste one link per listing into the
              property it belongs to. Other tools that export iCal, such as
              Vrbo or Google Calendar, can be added as a custom source.
            </p>
            <p className="mt-3">
              On Booking.com, export booked dates only. Closed days can use the
              same label as a real stay, and then they show up as if a guest
              had booked them. On Airbnb, dates marked unavailable or blocked
              can be stored as blocks rather than guests.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">Put direct stays on the same calendar</h2>
            <p className="mt-3">
              A guest who writes by email, phone, or your own page is invisible
              to Airbnb until you record the stay. Add that reservation
              manually: property, dates, and where it came from. Overlapping an
              existing stay should be rejected so you do not stack two guests
              on purpose.
            </p>
            <p className="mt-3">
              If you publish a Hostvia inquiry site, accepting an inquiry
              creates that reservation. The public page does not charge the
              guest and does not confirm the stay by itself.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">Send busy dates back</h2>
            <p className="mt-3">
              Each property can export an iCal link. Current stays are included.
              Blocks go out as unavailable. Past stays are left out. You paste
              that link into Airbnb or Booking.com as an imported calendar.
              After that, a direct stay in Hostvia can close the same dates on
              the listing site, once that site reads the link.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">Expect a delay</h2>
            <p className="mt-3">
              While the Hostvia dashboard is open, connected calendars refresh
              about once an hour. You can also sync manually when you need a
              fresh copy. Airbnb and Booking.com refresh calendars they import
              on their own schedule. A new booking can exist on one site before
              the other site, or Hostvia, shows it.
            </p>
            <p className="mt-3">
              That is why iCal sync reduces double bookings and does not
              eliminate them. If two guests book the same night in the gap, you
              still have to resolve it. A certified channel manager with a
              platform API is faster. Hostvia does not use those APIs.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">A weekly check that is enough for a small portfolio</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5">
              <li>Open the combined calendar and the individual property calendars.</li>
              <li>Sync any feed that shows an error.</li>
              <li>Add direct stays that are not on a listing site yet.</li>
              <li>Confirm the export link is still imported on Airbnb and Booking.com.</li>
              <li>Look at arrivals and departures before you promise a same-day turnover.</li>
            </ol>
          </section>
        </div>

        <p className="mt-10 text-sm text-zinc-400">
          Related:{" "}
          <Link href="/features" className="text-violet-300 hover:underline">
            Features
          </Link>
          {" · "}
          <Link href="/how-it-works" className="text-violet-300 hover:underline">
            How it works
          </Link>
          {" · "}
          <Link href="/guides/vacation-rental-cleaning-schedule" className="text-violet-300 hover:underline">
            Cleaning schedule
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
