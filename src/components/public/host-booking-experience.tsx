"use client";

import { useState } from "react";
import Image from "next/image";
import { format, addDays } from "date-fns";
import { appLocale } from "@/lib/dates/locale";
import {
  CalendarDays,
  CalendarSearch,
  MapPin,
  SearchX,
  Sparkles,
} from "lucide-react";
import type { UnitsViewMode } from "@/components/public/host-all-units-section";
import { toast } from "sonner";
import { HostSearchBar } from "@/components/public/host-search-bar";
import { HostPropertyResultCard } from "@/components/public/host-property-result-card";
import { HostAllUnitsSection } from "@/components/public/host-all-units-section";
import { HostReservePanel } from "@/components/public/host-reserve-panel";
import { PublicSectionHeader } from "@/components/public/public-section-header";
import type {
  HostSearchParams,
  PublicHostProfile,
  PublicHostProperty,
  PublicPropertySearchResult,
} from "@/lib/public/types";

interface HostBookingExperienceProps {
  host: PublicHostProfile;
  username: string;
}

function defaultSearch(): HostSearchParams {
  const checkIn = format(addDays(new Date(), 1), "yyyy-MM-dd");
  const checkOut = format(addDays(new Date(), 3), "yyyy-MM-dd");
  return { checkIn, checkOut, guests: 2 };
}

export function HostBookingExperience({
  host,
  username,
}: HostBookingExperienceProps) {
  const [search, setSearch] = useState<HostSearchParams>(defaultSearch);
  const [appliedSearch, setAppliedSearch] = useState<HostSearchParams | null>(
    null
  );
  const [results, setResults] = useState<PublicPropertySearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] =
    useState<PublicPropertySearchResult | null>(null);
  const [reservingPropertyId, setReservingPropertyId] = useState<string | null>(
    null
  );
  const [unitsViewMode, setUnitsViewMode] = useState<UnitsViewMode>("none");

  const hasCover = Boolean(host.cover_image_url);

  function openAllUnitsAvailability() {
    setUnitsViewMode("availability");
  }

  async function runSearch(
    override?: HostSearchParams,
    options?: { selectPropertyId?: string }
  ) {
    const query = override ?? search;
    setLoading(true);
    setError(null);
    if (!options?.selectPropertyId) {
      setSelectedProperty(null);
    }

    try {
      const params = new URLSearchParams({
        username,
        checkIn: query.checkIn,
        checkOut: query.checkOut,
        guests: String(query.guests),
      });

      const res = await fetch(`/api/public/availability?${params}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Search failed");
      }

      const properties: PublicPropertySearchResult[] = data.properties ?? [];
      setResults(properties);
      setAppliedSearch(query);
      setHasSearched(true);
      setSearch(query);

      if (options?.selectPropertyId) {
        const match = properties.find((p) => p.id === options.selectPropertyId);
        if (match) {
          setSelectedProperty(match);
          document
            .getElementById("booking-results")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          toast.error("This unit is not available for the selected dates");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
      setReservingPropertyId(null);
    }
  }

  async function handleUnitReserve(
    property: PublicHostProperty,
    dates: { checkIn: string; checkOut: string }
  ) {
    setReservingPropertyId(property.id);
    await runSearch(
      { ...search, checkIn: dates.checkIn, checkOut: dates.checkOut },
      { selectPropertyId: property.id }
    );
  }

  return (
    <div>
      <section className="public-hero">
        <div className="public-hero-media" aria-hidden>
          {hasCover ? (
            <Image
              src={host.cover_image_url!}
              alt=""
              fill
              priority
              className="object-cover"
              sizes="100vw"
              unoptimized
            />
          ) : (
            <div className="public-hero-fallback absolute inset-0" />
          )}
          <div className="public-hero-scrim absolute inset-0" />
        </div>

        <div className="public-hero-inner">
          <div className="public-hero-copy">
            <div className="public-animate-in public-hero-text public-hero-center flex flex-col items-center">
              <p className="public-hero-welcome">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                Welcome
              </p>

              {host.logo_url ? (
                <div className="mb-5 flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-white/95 p-2 shadow-lg backdrop-blur-sm md:mb-6">
                  <Image
                    src={host.logo_url}
                    alt=""
                    width={48}
                    height={48}
                    className="h-full w-full object-contain"
                    unoptimized
                  />
                </div>
              ) : null}

              {host.location ? (
                <p className="public-eyebrow mb-4">
                  <MapPin className="h-3.5 w-3.5" />
                  {host.location}
                </p>
              ) : (
                <p className="public-eyebrow mb-4">Accommodation</p>
              )}

              <h1 className="public-heading text-4xl md:text-6xl">
                {host.business_name}
              </h1>

              {host.description ? (
                <p className="public-hero-description mx-auto mt-4 max-w-2xl text-base leading-relaxed md:mt-5 md:text-lg">
                  {host.description}
                </p>
              ) : (
                <p className="public-hero-description mx-auto mt-4 max-w-xl text-base leading-relaxed md:mt-5 md:text-lg">
                  We look forward to hosting you — pick your dates and find the
                  perfect stay.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="booking-results" className="public-section--sheet">
        <div className="public-hero-search">
          <HostSearchBar
            value={search}
            onChange={setSearch}
            onSearch={runSearch}
            loading={loading}
            floating
          />
        </div>
        <div className="public-section-inner public-section--sheet-inner">
        {selectedProperty && appliedSearch ? (
          <HostReservePanel
            property={selectedProperty}
            search={appliedSearch}
            onBack={() => setSelectedProperty(null)}
          />
        ) : !hasSearched ? (
          <div className="space-y-8">
            <PublicSectionHeader
              index="01"
              kicker="Availability"
              title="Find your stay"
              description="Pick dates and guests above — we'll show only units free for your trip."
              icon={<CalendarSearch className="h-3.5 w-3.5" />}
            />
            <div className="public-card public-card-featured public-animate-in flex flex-col items-center px-8 py-14 text-center md:px-12 md:py-16">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--public-accent-soft)] text-[var(--public-accent)]">
                <CalendarSearch className="h-7 w-7" />
              </div>
              <p className="max-w-md text-[15px] leading-relaxed text-[var(--public-muted)]">
                Use the search bar to check real-time availability across all
                units.
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="public-card border-red-200/80 bg-red-50 px-6 py-12 text-center">
            <p className="font-semibold text-red-800">{error}</p>
          </div>
        ) : results.length === 0 ? (
          <div className="public-card public-animate-in flex flex-col items-center px-6 py-16 text-center md:px-10 md:py-20">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500">
              <SearchX className="h-7 w-7" />
            </div>
            <h2 className="public-heading text-2xl">No available accommodation</h2>
            {appliedSearch ? (
              <p className="mt-2 text-sm font-medium text-[var(--public-fg)]">
                {format(new Date(appliedSearch.checkIn + "T12:00:00"), "d. MMM", { locale: appLocale })} –{" "}
                {format(new Date(appliedSearch.checkOut + "T12:00:00"), "d. MMM yyyy", { locale: appLocale })} ·{" "}
                {appliedSearch.guests}{" "}
                {appliedSearch.guests === 1 ? "guest" : "guests"}
              </p>
            ) : null}
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-[var(--public-muted)]">
              No units are free for these dates. Browse all unit calendars and
              find another available date.
            </p>
            <button
              type="button"
              onClick={openAllUnitsAvailability}
              className="public-btn public-btn-primary mt-8 px-8 py-3.5"
            >
              <CalendarDays className="h-4 w-4" />
              View availability for all units
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <PublicSectionHeader
                index="01"
                kicker="Search results"
                title={`${results.length} ${results.length === 1 ? "unit available" : "units available"}`}
                icon={<Sparkles className="h-3.5 w-3.5" />}
                align="left"
                className="mb-0 max-w-xl"
              />
              {appliedSearch ? (
                <p className="shrink-0 rounded-full border border-[var(--public-border)] bg-[var(--public-tint)] px-4 py-2 text-sm text-[var(--public-muted)]">
                  {format(new Date(appliedSearch.checkIn + "T12:00:00"), "d MMM", { locale: appLocale })} –{" "}
                  {format(new Date(appliedSearch.checkOut + "T12:00:00"), "d MMM yyyy", { locale: appLocale })} ·{" "}
                  {appliedSearch.guests}{" "}
                  {appliedSearch.guests === 1 ? "guest" : "guests"}
                </p>
              ) : null}
            </div>

            <div className="public-stagger-children space-y-6">
              {results.map((property) =>
                appliedSearch ? (
                  <HostPropertyResultCard
                    key={property.id}
                    property={property}
                    search={appliedSearch}
                    onReserve={() => setSelectedProperty(property)}
                  />
                ) : null
              )}
            </div>
          </div>
        )}
        </div>
      </section>

      <HostAllUnitsSection
        username={username}
        viewMode={unitsViewMode}
        onViewModeChange={setUnitsViewMode}
        onUnitReserve={handleUnitReserve}
        reservingPropertyId={reservingPropertyId}
      />
    </div>
  );
}
