"use client";

import { useState } from "react";
import Image from "next/image";
import { format, addDays } from "date-fns";
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
    requestAnimationFrame(() => {
      document
        .getElementById("jedinice")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
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
        throw new Error(data.error ?? "Pretraga nije uspjela");
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
          toast.error("Jedinica nije dostupna za odabrane datume");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Greška");
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
      <section className="relative isolate overflow-visible">
        <div className="absolute inset-0 overflow-hidden">
          {hasCover ? (
            <>
              <Image
                src={host.cover_image_url!}
                alt=""
                fill
                priority
                className="object-cover"
                sizes="100vw"
                unoptimized
              />
              <div
                className="absolute inset-0"
                style={{ background: "var(--public-hero-overlay)" }}
              />
            </>
          ) : (
            <div
              className="absolute inset-0"
              style={{ background: "var(--public-hero-overlay-soft)" }}
            />
          )}
        </div>

        <div className="relative mx-auto flex min-h-[28rem] w-full max-w-6xl flex-col items-center px-5 py-12 md:min-h-[34rem] md:px-10 md:py-16">
          <div className="flex w-full flex-1 flex-col items-center justify-center py-6 text-center md:py-10">
            <div className="public-animate-in public-hero-text public-hero-center flex w-full max-w-3xl flex-col items-center">
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
                <p className="public-eyebrow mb-4">Smještaj</p>
              )}

              <h1 className="public-heading text-4xl md:text-6xl">
                {host.business_name}
              </h1>

              {host.description ? (
                <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/85 md:mt-5 md:text-lg">
                  {host.description}
                </p>
              ) : null}
            </div>
          </div>

          <div className="relative z-10 w-full max-w-5xl shrink-0 pt-2 md:pt-4">
            <HostSearchBar
              value={search}
              onChange={setSearch}
              onSearch={runSearch}
              loading={loading}
              floating
            />
          </div>
        </div>
      </section>

      <section
        id="booking-results"
        className="mx-auto max-w-6xl px-5 pb-20 pt-12 md:px-10 md:pb-24 md:pt-14"
      >
        {selectedProperty && appliedSearch ? (
          <HostReservePanel
            property={selectedProperty}
            search={appliedSearch}
            onBack={() => setSelectedProperty(null)}
          />
        ) : !hasSearched ? (
          <div className="public-card public-animate-in flex flex-col items-center px-8 py-16 text-center md:px-12 md:py-20">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--public-accent-soft)] text-[var(--public-accent)]">
              <CalendarSearch className="h-7 w-7" />
            </div>
            <h2 className="public-heading text-2xl">Pronađite slobodan smještaj</h2>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-[var(--public-muted)]">
              Unesite datume boravka i broj gostiju — prikazaćemo samo dostupne
              opcije za vaš termin
            </p>
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
            <h2 className="public-heading text-2xl">Nema slobodnog smještaja</h2>
            {appliedSearch ? (
              <p className="mt-2 text-sm font-medium text-[var(--public-fg)]">
                {format(new Date(appliedSearch.checkIn + "T12:00:00"), "d. MMM")} –{" "}
                {format(new Date(appliedSearch.checkOut + "T12:00:00"), "d. MMM yyyy")} ·{" "}
                {appliedSearch.guests}{" "}
                {appliedSearch.guests === 1 ? "gost" : "gostiju"}
              </p>
            ) : null}
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-[var(--public-muted)]">
              Za ovaj termin nema slobodnih jedinica. Pogledajte kalendare svih
              jedinica i pronađite drugi slobodan termin.
            </p>
            <button
              type="button"
              onClick={openAllUnitsAvailability}
              className="public-btn public-btn-primary mt-8 px-8 py-3.5"
            >
              <CalendarDays className="h-4 w-4" />
              Pogledaj dostupnost svih jedinica
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            <div className="public-animate-in flex flex-col gap-3 border-b border-[var(--public-border)] pb-8 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="public-eyebrow mb-2">
                  <Sparkles className="h-3.5 w-3.5 text-[var(--public-accent)]" />
                  Rezultati pretrage
                </p>
                <h2 className="public-heading text-2xl md:text-3xl">
                  {results.length}{" "}
                  {results.length === 1
                    ? "slobodan smještaj"
                    : "slobodna smještaja"}
                </h2>
              </div>
              {appliedSearch ? (
                <p className="text-sm text-[var(--public-muted)]">
                  {format(new Date(appliedSearch.checkIn + "T12:00:00"), "d. MMM")} –{" "}
                  {format(new Date(appliedSearch.checkOut + "T12:00:00"), "d. MMM yyyy")} ·{" "}
                  {appliedSearch.guests}{" "}
                  {appliedSearch.guests === 1 ? "gost" : "gostiju"}
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
      </section>

      {hasSearched && !selectedProperty ? (
        <div className="sticky bottom-0 z-40 border-t border-[var(--public-border)] bg-[var(--public-bg-elevated)]/95 px-4 py-4 shadow-[var(--public-shadow-md)] backdrop-blur-xl md:hidden">
          <HostSearchBar
            value={search}
            onChange={setSearch}
            onSearch={runSearch}
            loading={loading}
            compact
          />
        </div>
      ) : null}

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
