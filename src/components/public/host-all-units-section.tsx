"use client";

import { useEffect, useState } from "react";
import { Building2, CalendarDays, Loader2 } from "lucide-react";
import { HostUnitCard } from "@/components/public/host-unit-card";
import { HostUnitAvailabilityCard } from "@/components/public/host-unit-availability-card";
import type { PublicHostProperty } from "@/lib/public/types";
import { cn } from "@/lib/utils";

export type UnitsViewMode = "none" | "units" | "availability";

interface HostAllUnitsSectionProps {
  username: string;
  viewMode?: UnitsViewMode;
  onViewModeChange?: (mode: UnitsViewMode) => void;
  onUnitReserve?: (
    property: PublicHostProperty,
    dates: { checkIn: string; checkOut: string }
  ) => void;
  reservingPropertyId?: string | null;
}

export function HostAllUnitsSection({
  username,
  viewMode: viewModeProp,
  onViewModeChange,
  onUnitReserve,
  reservingPropertyId,
}: HostAllUnitsSectionProps) {
  const [internalViewMode, setInternalViewMode] = useState<UnitsViewMode>("none");
  const viewMode = viewModeProp ?? internalViewMode;
  const setViewMode = onViewModeChange ?? setInternalViewMode;
  const [properties, setProperties] = useState<PublicHostProperty[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  async function ensurePropertiesLoaded() {
    if (loaded) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/public/properties?username=${encodeURIComponent(username)}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load");
      setProperties(data.properties ?? []);
      setLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (viewMode !== "none") {
      void ensurePropertiesLoaded();
    }
  }, [viewMode]);

  async function handleUnitsToggle() {
    if (viewMode === "units") {
      setViewMode("none");
      return;
    }

    setViewMode("units");
    await ensurePropertiesLoaded();
  }

  async function handleAvailabilityToggle() {
    if (viewMode === "availability") {
      setViewMode("none");
      return;
    }

    setViewMode("availability");
    await ensurePropertiesLoaded();
  }

  const count = properties.length;
  const expanded = viewMode !== "none";

  return (
    <section
      id="jedinice"
      className="border-t border-[var(--public-border)] bg-[var(--public-bg-subtle)]"
    >
      <div className="mx-auto max-w-6xl px-5 py-16 md:px-10 md:py-20">
        <div className="public-animate-in mx-auto max-w-2xl text-center">
          <p className="public-eyebrow mb-3 justify-center">
            <Building2 className="h-3.5 w-3.5" />
            Our accommodation
          </p>
          <h2 className="public-heading text-3xl md:text-4xl">
            Browse all our units
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-[var(--public-muted)]">
            Explore the full selection and check available dates for each unit
            individually.
          </p>

          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleUnitsToggle}
              className={cn(
                "public-btn px-6 py-3.5 sm:px-8",
                viewMode === "units"
                  ? "public-btn-primary"
                  : "public-btn-secondary"
              )}
            >
              <Building2 className="h-4 w-4" />
              {viewMode === "units" ? "Hide units" : "Show all units"}
            </button>
            <button
              type="button"
              onClick={handleAvailabilityToggle}
              className={cn(
                "public-btn px-6 py-3.5 sm:px-8",
                viewMode === "availability"
                  ? "public-btn-primary"
                  : "public-btn-secondary"
              )}
            >
              <CalendarDays className="h-4 w-4" />
              {viewMode === "availability"
                ? "Hide availability"
                : "View availability for all units"}
            </button>
          </div>
        </div>

        {expanded ? (
          <div className="mt-12">
            {loading ? (
              <div className="flex items-center justify-center py-16 text-sm text-[var(--public-muted)]">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading units…
              </div>
            ) : error ? (
              <div className="public-card mx-auto max-w-lg px-6 py-8 text-center text-red-700">
                {error}
              </div>
            ) : count === 0 ? (
              <div className="public-card mx-auto max-w-lg px-6 py-12 text-center">
                <p className="font-medium">No published units at the moment</p>
              </div>
            ) : viewMode === "units" ? (
              <div
                className={cn(
                  "grid gap-6",
                  count === 1 ? "mx-auto max-w-3xl" : "md:grid-cols-1"
                )}
              >
                <p className="text-center text-sm text-[var(--public-muted)] md:col-span-full">
                  {count} {count === 1 ? "unit" : "units"}
                </p>
                {properties.map((property) => (
                  <HostUnitCard
                    key={property.id}
                    property={property}
                    onReserve={
                      onUnitReserve
                        ? (dates) => onUnitReserve(property, dates)
                        : undefined
                    }
                    reserving={reservingPropertyId === property.id}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="public-card mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-4 px-5 py-4 text-sm text-[var(--public-muted)]">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 rounded bg-emerald-500" />
                    Available
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 rounded bg-stone-100 ring-1 ring-stone-200" />
                    Occupied
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 rounded bg-[var(--public-accent)]" />
                    Your selection
                  </span>
                </div>

                <p className="text-center text-sm text-[var(--public-muted)]">
                  {count} {count === 1 ? "unit" : "units"} · click dates to
                  reserve
                </p>

                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {properties.map((property) => (
                    <HostUnitAvailabilityCard
                      key={property.id}
                      property={property}
                      onReserve={
                        onUnitReserve
                          ? (dates) => onUnitReserve(property, dates)
                          : undefined
                      }
                      reserving={reservingPropertyId === property.id}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
