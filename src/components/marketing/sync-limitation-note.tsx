import Link from "next/link";

export function SyncLimitationNote() {
  return (
    <aside className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-6 text-left sm:p-8">
      <h2 className="text-lg font-semibold text-white">
        What calendar sync does not do
      </h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-zinc-300">
        <p>
          Hostvia connects calendars with iCal links. It does not use the
          Airbnb or Booking.com channel-manager APIs, and it does not update
          every platform the moment a booking is made.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            While the dashboard is open, connected calendars refresh about once
            an hour. You can also sync manually.
          </li>
          <li>
            Airbnb and Booking.com refresh imported calendars on their own
            schedule. A stay can exist on one platform before another platform
            shows it.
          </li>
          <li>
            On Booking.com, export booked dates only. Closed days can otherwise
            come in labeled like guest stays.
          </li>
          <li>
            Airbnb dates marked unavailable or blocked are stored as blocks, not
            as guests.
          </li>
          <li>
            Importing and exporting calendars lowers the chance of a double
            booking. It does not remove that chance.
          </li>
        </ul>
        <p>
          <Link
            href="/guides/vacation-rental-calendar"
            className="font-medium text-violet-200 hover:underline"
          >
            Read the calendar guide
          </Link>
        </p>
      </div>
    </aside>
  );
}
