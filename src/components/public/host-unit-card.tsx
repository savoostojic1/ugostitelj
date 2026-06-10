"use client";

import { useState } from "react";
import { format } from "date-fns";
import { sr } from "date-fns/locale";
import { CalendarDays, ChevronDown, MapPin, Send, Users } from "lucide-react";
import { PublicPropertyGallery } from "@/components/public/public-property-gallery";
import { PublicPropertyAvailabilityCalendar } from "@/components/public/public-property-availability-calendar";
import { usePublicStayPrice } from "@/hooks/use-public-stay-price";
import { formatEuro, parseStartingPrice } from "@/lib/public/stay-price";
import type { PublicHostProperty } from "@/lib/public/types";
import { cn } from "@/lib/utils";

interface HostUnitCardProps {
  property: PublicHostProperty;
  onReserve?: (dates: { checkIn: string; checkOut: string }) => void;
  reserving?: boolean;
}

export function HostUnitCard({
  property,
  onReserve,
  reserving,
}: HostUnitCardProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const startingPrice = parseStartingPrice(property.starting_price);
  const { quote: stayPrice, loading: priceLoading } = usePublicStayPrice(
    property.id,
    checkIn,
    checkOut,
    startingPrice
  );

  function handleRangeChange(nextCheckIn: string, nextCheckOut: string) {
    setCheckIn(nextCheckIn);
    setCheckOut(nextCheckOut);
  }

  return (
    <article className="public-card overflow-hidden">
      <div
        className={cn(
          "grid gap-0",
          property.gallery_urls.length > 0 || property.image_url
            ? "md:grid-cols-[minmax(0,16rem)_1fr]"
            : ""
        )}
      >
        {property.gallery_urls.length > 0 || property.image_url ? (
          <div className="p-3 md:p-4">
            <PublicPropertyGallery
              name={property.name}
              imageUrl={property.image_url}
              galleryUrls={property.gallery_urls}
              variant="card"
            />
          </div>
        ) : null}

        <div className="flex flex-col justify-between gap-5 p-5 md:p-6">
          <div>
            <h3 className="text-xl font-bold tracking-tight">{property.name}</h3>
            {property.address ? (
              <p className="mt-2 flex items-start gap-2 text-sm text-[var(--public-muted)]">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--public-accent)]" />
                {property.address}
              </p>
            ) : null}
            {property.capacity ? (
              <p className="mt-2 flex items-center gap-2 text-sm text-[var(--public-muted)]">
                <Users className="h-4 w-4 text-[var(--public-accent)]" />
                Do {property.capacity} gostiju
              </p>
            ) : null}
            {property.short_description ? (
              <p className="mt-3 text-[15px] leading-relaxed text-[var(--public-muted)]">
                {property.short_description}
              </p>
            ) : null}
            {startingPrice ? (
              <p className="mt-3 text-sm font-semibold text-[var(--public-accent)]">
                od {formatEuro(startingPrice)} po noći
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => setCalendarOpen((v) => !v)}
            className="public-btn public-btn-secondary w-full justify-between px-4 py-3 sm:w-auto"
            aria-expanded={calendarOpen}
          >
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-[var(--public-accent)]" />
              Pogledaj dostupnost
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                calendarOpen && "rotate-180"
              )}
            />
          </button>
        </div>
      </div>

      {calendarOpen ? (
        <div className="border-t border-[var(--public-border)] bg-[var(--public-bg-elevated)] p-4 md:p-6">
          <PublicPropertyAvailabilityCalendar
            propertyId={property.id}
            checkIn={checkIn}
            checkOut={checkOut}
            onRangeChange={handleRangeChange}
          />

          {checkIn && checkOut && onReserve ? (
            <div className="mt-5 flex flex-col gap-4 rounded-xl border border-[var(--public-border)] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[var(--public-fg)]">
                  {format(new Date(checkIn + "T12:00:00"), "d. MMM", {
                    locale: sr,
                  })}{" "}
                  –{" "}
                  {format(new Date(checkOut + "T12:00:00"), "d. MMM yyyy", {
                    locale: sr,
                  })}
                </p>
                {priceLoading ? (
                  <p className="mt-1 text-sm text-[var(--public-muted)]">
                    Računam cijenu…
                  </p>
                ) : stayPrice ? (
                  <p className="mt-1 text-sm text-[var(--public-muted)]">
                    {stayPrice.nights} noći · {formatEuro(stayPrice.total)} ukupno
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                disabled={reserving}
                onClick={() => onReserve({ checkIn, checkOut })}
                className="public-btn public-btn-primary shrink-0 px-6 py-3"
              >
                <Send className="h-4 w-4" />
                {reserving ? "Provjeravam…" : "Rezerviši"}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
