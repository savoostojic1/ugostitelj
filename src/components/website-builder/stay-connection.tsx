"use client";

import Link from "next/link";
import { AlertTriangle, CalendarCheck2, Link2 } from "lucide-react";
import { Button } from "@/components/website-builder/ui";
import type { WebsiteStudioApi } from "@/components/website-builder/use-website-studio";
import type { WebsiteAccommodation, WebsiteDocument } from "@/lib/website-builder/types";

/** Stays not linked to a Hostvia property this account can see. */
export function unconnectedStays(document: WebsiteDocument, studio: Pick<WebsiteStudioApi, "properties">): WebsiteAccommodation[] {
  const owned = new Set(studio.properties.map((property) => property.id));
  return document.accommodations.filter((stay) => !stay.propertyId || !owned.has(stay.propertyId));
}

/**
 * Explains that prices, calendars and bookings come from Hostvia, and warns while any
 * stay is not connected yet: those stays show no price and cannot receive inquiries.
 */
export function StayConnectionNotice({
  studio,
  document,
  onConnect,
  compact,
}: {
  studio: WebsiteStudioApi;
  document: WebsiteDocument;
  onConnect?: () => void;
  compact?: boolean;
}) {
  const waiting = unconnectedStays(document, studio);
  if (!document.accommodations.length && studio.authenticated) return null;

  if (!studio.authenticated) {
    return (
      <div className="rounded-2xl border border-sky-400/20 bg-sky-400/[0.06] p-4" role="note">
        <p className="flex items-center gap-2 text-[13px] font-semibold text-sky-100">
          <CalendarCheck2 className="h-4 w-4" /> Prices and availability come from Hostvia
        </p>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-sky-100/70">
          Describe your stays here. When you create your free account in the last step, each stay becomes a Hostvia property, or connects to one you already have. You set the price and calendar there, and the website shows them live. Until then, guests see “Price on request” and cannot send inquiries.
        </p>
      </div>
    );
  }

  if (waiting.length) {
    return (
      <div className="rounded-2xl border border-amber-400/25 bg-amber-400/[0.07] p-4" role="alert">
        <p className="flex items-center gap-2 text-[13px] font-semibold text-amber-100">
          <AlertTriangle className="h-4 w-4" />
          {waiting.length === 1 ? `“${waiting[0].name}” is not connected yet` : `${waiting.length} stays are not connected yet`}
        </p>
        {!compact ? (
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-amber-100/70">
            Guests cannot send inquiries for {waiting.length === 1 ? "it" : "them"} and no price is shown. Connect each stay to a Hostvia property, new or existing, and its price, calendar and availability update by themselves.
          </p>
        ) : null}
        {onConnect ? (
          <Button size="sm" className="mt-3" onClick={onConnect}>
            <Link2 className="h-3.5 w-3.5" /> Connect stays
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.05] p-4" role="note">
      <p className="flex items-center gap-2 text-[13px] font-semibold text-emerald-100">
        <CalendarCheck2 className="h-4 w-4" /> Every stay is live from Hostvia
      </p>
      {!compact ? (
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-emerald-100/70">
          Change prices and calendars in{" "}
          <Link href="/dashboard/properties" className="text-emerald-100 underline underline-offset-4">
            Properties
          </Link>
          . The website follows automatically. New stays you add later appear here to connect.
        </p>
      ) : null}
    </div>
  );
}
