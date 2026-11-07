"use client";

import { useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { appLocale } from "@/lib/dates/locale";
import { MapPin, Send, Users } from "lucide-react";
import { PublicPropertyAvailabilityCalendar } from "@/components/public/public-property-availability-calendar";
import { usePublicStayPrice } from "@/hooks/use-public-stay-price";
import { formatPropertyPrice, publicBookingPriceLines } from "@/lib/currency/format";
import { parseStartingPrice } from "@/lib/public/stay-price";
import type { PublicHostProperty } from "@/lib/public/types";

interface HostUnitAvailabilityCardProps {
  property: PublicHostProperty;
  onReserve?: (dates: { checkIn: string; checkOut: string }) => void;
  reserving?: boolean;
}

export function HostUnitAvailabilityCard({
  property,
  onReserve,
  reserving,
}: HostUnitAvailabilityCardProps) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const startingPrice = parseStartingPrice(property.starting_price);
  const { quote: stayPrice, loading: priceLoading } = usePublicStayPrice(
    property.id,
    checkIn,
    checkOut,
    startingPrice,
    undefined,
    property.currency_code
  );

  const hasImage = Boolean(property.image_url);

  return (
    <article className="public-card flex h-full flex-col overflow-hidden transition hover:border-[var(--public-border-strong)] hover:shadow-[var(--public-shadow-md)]">
      <div className="border-b border-[var(--public-border)] p-4">
        <div className="flex gap-3">
          {hasImage ? (
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[var(--public-bg-subtle)]">
              <Image
                src={property.image_url!}
                alt=""
                fill
                className="object-cover"
                sizes="64px"
                unoptimized
              />
            </div>
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[var(--public-accent-soft)] text-lg font-bold text-[var(--public-accent)]">
              {property.name.charAt(0)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-bold tracking-tight">
              {property.name}
            </h3>
            {property.capacity ? (
              <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--public-muted)]">
                <Users className="h-3.5 w-3.5 shrink-0 text-[var(--public-accent)]" />
                <span>Up to {property.capacity} guests</span>
              </p>
            ) : null}
            {property.address ? (
              <p className="mt-1 flex items-start gap-1.5 text-xs text-[var(--public-muted)]">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--public-accent)]" />
                <span className="line-clamp-2">{property.address}</span>
              </p>
            ) : null}
            {startingPrice ? (
              <p className="mt-2 text-xs font-semibold text-[var(--public-accent)]">
                from {formatPropertyPrice(startingPrice, property.currency_code)} / night
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col bg-[var(--public-bg-subtle)]/40 p-3">
        <PublicPropertyAvailabilityCalendar
          propertyId={property.id}
          checkIn={checkIn}
          checkOut={checkOut}
          onRangeChange={(nextIn, nextOut) => {
            setCheckIn(nextIn);
            setCheckOut(nextOut);
          }}
          compact
          showLegend={false}
        />

        {checkIn && checkOut && onReserve ? (
          <div className="mt-3 space-y-2 rounded-xl border border-[var(--public-border)] bg-white p-3">
            <p
              className="text-xs font-semibold text-[var(--public-fg)]"
              translate="no"
            >
              {`${format(new Date(checkIn + "T12:00:00"), "d. MMM", { locale: appLocale })} – ${format(new Date(checkOut + "T12:00:00"), "d. MMM yyyy", {
                locale: appLocale,
              })}`}
            </p>
            {priceLoading ? (
              <p className="text-[11px] text-[var(--public-muted)]">
                <span>Calculating price…</span>
              </p>
            ) : stayPrice ? (
              <p className="text-[11px] text-[var(--public-muted)]">
                <span translate="no">
                  {publicBookingPriceLines({
                    total: stayPrice.total,
                    nightlyRate: stayPrice.pricePerNight,
                    nights: stayPrice.nights,
                    currencyCode: property.currency_code,
                  }).stayLine}
                </span>
              </p>
            ) : null}
            <button
              type="button"
              disabled={reserving}
              onClick={() => onReserve({ checkIn, checkOut })}
              className="public-btn public-btn-primary w-full py-2.5 text-sm"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{reserving ? "Checking…" : "Reserve"}</span>
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}
