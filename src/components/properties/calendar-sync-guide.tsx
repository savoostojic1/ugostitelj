"use client";

import { ArrowDownToLine, ArrowUpFromLine, CalendarDays } from "lucide-react";

export function CalendarSyncGuide() {
  return (
    <div className="hostvia-panel p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
          <CalendarDays className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold text-white">
            How calendar sync works
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-zinc-500">
            Use import to pull Airbnb and Booking reservations into Hostvia. Use
            export to send Hostvia bookings back and block dates on those
            platforms.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-white">
            <ArrowDownToLine className="h-4 w-4 text-cyan-400" />
            Import (Airbnb & Booking → Hostvia)
          </div>
          <ol className="mt-3 space-y-2 text-sm leading-relaxed text-zinc-500">
            <li>
              <span className="font-medium text-zinc-400">1.</span> In Airbnb or
              Booking.com, open calendar settings and copy the{" "}
              <span className="text-zinc-400">export / iCal link</span> for this
              listing.
            </li>
            <li>
              <span className="font-medium text-zinc-400">2.</span> In the{" "}
              <span className="text-zinc-400">Import calendars</span> section
              below, click <span className="text-zinc-400">Add import link</span>{" "}
              and paste the URL.
            </li>
            <li>
              <span className="font-medium text-zinc-400">3.</span> Click{" "}
              <span className="text-zinc-400">Sync all</span> — reservations
              appear in Hostvia and on your calendar tab.
            </li>
          </ol>
        </div>

        <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-white">
            <ArrowUpFromLine className="h-4 w-4 text-violet-400" />
            Export (Hostvia → Airbnb & Booking)
          </div>
          <ol className="mt-3 space-y-2 text-sm leading-relaxed text-zinc-500">
            <li>
              <span className="font-medium text-zinc-400">1.</span> In the{" "}
              <span className="text-zinc-400">Export calendar</span> section
              below, copy the Hostvia link.
            </li>
            <li>
              <span className="font-medium text-zinc-400">2.</span> In Airbnb or
              Booking.com, choose{" "}
              <span className="text-zinc-400">import calendar</span> and paste
              that link.
            </li>
            <li>
              <span className="font-medium text-zinc-400">3.</span> Manual
              bookings and blocked dates from Hostvia will show as unavailable on
              Airbnb and Booking.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
