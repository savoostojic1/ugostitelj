"use client";

import { ArrowRight, MapPin } from "lucide-react";
import { PublicPropertyGallery } from "@/components/public/public-property-gallery";
import type {
  HostSearchParams,
  PublicPropertySearchResult,
} from "@/lib/public/types";
import {
  formatEuro,
  nightsLabel,
  parseStartingPrice,
  resolveStayPriceQuote,
} from "@/lib/public/stay-price";

interface HostPropertyResultCardProps {
  property: PublicPropertySearchResult;
  search: HostSearchParams;
  onReserve: () => void;
}

export function HostPropertyResultCard({
  property,
  search,
  onReserve,
}: HostPropertyResultCardProps) {
  const stayPrice = resolveStayPriceQuote(
    search.checkIn,
    search.checkOut,
    parseStartingPrice(property.starting_price),
    property.stay_total
  );

  return (
    <article className="group public-card public-card-interactive overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-stretch">
        <div className="relative w-full shrink-0 lg:w-[22rem]">
          <PublicPropertyGallery
            name={property.name}
            imageUrl={property.image_url}
            galleryUrls={property.gallery_urls}
            variant="card"
          />
          <div className="pointer-events-none absolute left-4 top-4 z-30">
            <span className="public-badge public-badge-success">Slobodno</span>
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-between gap-6 p-5 md:p-7">
          <div>
            <h3 className="text-xl font-bold tracking-tight md:text-2xl">
              {property.name}
            </h3>
            {property.address ? (
              <p className="mt-2.5 flex items-start gap-2 text-sm text-[var(--public-muted)]">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--public-accent)]" />
                <span>{property.address}</span>
              </p>
            ) : null}
            {property.short_description ? (
              <p className="mt-4 line-clamp-3 text-[15px] leading-relaxed text-[var(--public-muted)]">
                {property.short_description}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-4 border-t border-[var(--public-border)] pt-5 sm:flex-row sm:items-end sm:justify-between">
            {stayPrice ? (
              <div className="text-left">
                <p className="text-2xl font-bold tracking-tight text-[var(--public-fg)]">
                  {formatEuro(stayPrice.total)}
                </p>
                <p className="mt-1 text-sm text-[var(--public-muted)]">
                  ukupno za {nightsLabel(stayPrice.nights)}
                </p>
                <p className="mt-0.5 text-sm font-medium text-[var(--public-accent)]">
                  {stayPrice.usesDatePricing ? "prosjek " : ""}
                  {formatEuro(stayPrice.pricePerNight)} po noći
                </p>
              </div>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={onReserve}
              className="public-btn public-btn-primary w-full px-6 py-3.5 sm:w-auto"
            >
              Rezerviši
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
