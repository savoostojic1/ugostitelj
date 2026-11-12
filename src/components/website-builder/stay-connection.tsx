"use client";

import Link from "next/link";
import { AlertTriangle, ArrowUpRight, CalendarCheck2 } from "lucide-react";
import type { WebsiteStudioApi } from "@/components/website-builder/use-website-studio";
import { websiteProperties } from "@/lib/website-builder/property-stays";

const PROPERTIES_PATH = "/dashboard/properties";

/**
 * Explains where the website's stays come from: the host's public Hostvia properties,
 * exactly like the booking site. Nothing is connected by hand.
 */
export function StayConnectionNotice({ studio, compact }: { studio: WebsiteStudioApi; compact?: boolean }) {
  if (!studio.authenticated) {
    return (
      <div className="rounded-2xl border border-sky-400/20 bg-sky-400/[0.06] p-4" role="note">
        <p className="flex items-center gap-2 text-[13px] font-semibold text-sky-100">
          <CalendarCheck2 className="h-4 w-4" /> Your stays come from Hostvia
        </p>
        {!compact ? (
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-sky-100/70">
            After you create your free account, add your accommodation in Hostvia once, with its photos, price and calendar. It appears on this website automatically, just like on your booking site, and guests can send booking inquiries for it.
          </p>
        ) : null}
      </div>
    );
  }

  const shown = websiteProperties(studio.properties);
  const hidden = studio.properties.length - shown.length;

  if (!shown.length) {
    return (
      <div className="rounded-2xl border border-amber-400/25 bg-amber-400/[0.07] p-4" role="alert">
        <p className="flex items-center gap-2 text-[13px] font-semibold text-amber-100">
          <AlertTriangle className="h-4 w-4" /> No stays on your website yet
        </p>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-amber-100/70">
          {hidden
            ? `Your ${hidden === 1 ? "property is" : `${hidden} properties are`} hidden from your booking site. Make ${hidden === 1 ? "it" : "them"} public in Properties and ${hidden === 1 ? "it appears" : "they appear"} here.`
            : "Add your accommodation in Properties. It appears here automatically with its photos, price and availability."}
        </p>
        <Link href={PROPERTIES_PATH} className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-semibold text-amber-100 underline underline-offset-4">
          Open Properties <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.05] p-4" role="note">
      <p className="flex items-center gap-2 text-[13px] font-semibold text-emerald-100">
        <CalendarCheck2 className="h-4 w-4" />
        {shown.length === 1 ? "1 stay is live from Hostvia" : `${shown.length} stays are live from Hostvia`}
      </p>
      {!compact ? (
        <>
          <ul className="mt-2 space-y-1 text-[12.5px] text-emerald-100/80">
            {shown.map((property) => (
              <li key={property.id} className="truncate">· {property.name}</li>
            ))}
          </ul>
          <p className="mt-2 text-[12.5px] leading-relaxed text-emerald-100/70">
            The same stays as on your booking site. Change photos, prices and calendars in{" "}
            <Link href={PROPERTIES_PATH} className="text-emerald-100 underline underline-offset-4">
              Properties
            </Link>
            {hidden ? `; ${hidden} hidden ${hidden === 1 ? "property is" : "properties are"} not shown` : ""}.
          </p>
        </>
      ) : null}
    </div>
  );
}
