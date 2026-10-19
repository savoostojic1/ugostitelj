"use client";

import { ArrowDownToLine, ArrowUpFromLine, CalendarDays, ExternalLink } from "lucide-react";
import { openInSystemBrowser } from "@/lib/pwa/standalone";

const AIRBNB_EXPORT_URL = "https://www.airbnb.com/hosting/calendar";
/** Sync calendars — the page Booking's own help uses for Copy link. */
const BOOKING_EXPORT_URL =
  "https://admin.booking.com/hotel/hoteladmin/extranet_ng/manage/sync/index.html";

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
          <p className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs leading-relaxed text-amber-100/90">
            On Booking.com, open{" "}
            <span className="font-medium text-amber-50">
              Decide what to export
            </span>{" "}
            and choose{" "}
            <span className="font-medium text-amber-50">Booked dates only</span>
            , then Save. Closed dates use the same label as real bookings, so
            exporting them brings those days in as guest stays.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => openInSystemBrowser(AIRBNB_EXPORT_URL)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm font-medium text-white transition hover:bg-white/[0.08]"
            >
              <ExternalLink className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
              Find Airbnb link
            </button>
            <button
              type="button"
              onClick={() => openInSystemBrowser(BOOKING_EXPORT_URL)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm font-medium text-white transition hover:bg-white/[0.08]"
            >
              <ExternalLink className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
              Find Booking link
            </button>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-zinc-500">
            Other platforms work too. Paste an iCal link from Vrbo, Google
            Calendar, or anywhere else, and choose Custom when you add it.
          </p>
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
