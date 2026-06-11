"use client";

import { useEffect, useRef, useState } from "react";
import { Building2, CalendarDays, Loader2 } from "lucide-react";
import { HostUnitCard } from "@/components/public/host-unit-card";
import { HostUnitAvailabilityCard } from "@/components/public/host-unit-availability-card";
import { PublicSectionHeader } from "@/components/public/public-section-header";
import { scrollBelowUnitsActions } from "@/lib/public/scroll-anchors";
import type { PublicHostProperty } from "@/lib/public/types";
import { cn } from "@/lib/utils";

export type UnitsViewMode = "none" | "units" | "availability";

interface HostAllUnitsSectionProps {
  username: string;
  viewMode?: UnitsViewMode;
  onViewModeChange?: (mode: UnitsViewMode) => void;
  scrollOnOpen?: number;
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
  scrollOnOpen = 0,
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
  const scrollAfterLoadRef = useRef(false);

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
      if (scrollAfterLoadRef.current) {
        scrollAfterLoadRef.current = false;
        scrollBelowUnitsActions();
      }
    }
  }

  function queueScrollBelowActions() {
    scrollAfterLoadRef.current = true;
  }

  useEffect(() => {
    if (viewMode !== "none") {
      void ensurePropertiesLoaded();
    }
  }, [viewMode]);

  useEffect(() => {
    if (scrollOnOpen > 0) {
      queueScrollBelowActions();
    }
  }, [scrollOnOpen]);

  useEffect(() => {
    if (viewMode === "none" || loading || !scrollAfterLoadRef.current || !loaded) {
      return;
    }

    scrollAfterLoadRef.current = false;
    scrollBelowUnitsActions();
  }, [viewMode, loading, loaded]);

  async function openView(mode: Exclude<UnitsViewMode, "none">) {
    queueScrollBelowActions();
    if (!loaded) setLoading(true);
    setViewMode(mode);
    await ensurePropertiesLoaded();
  }

  async function handleUnitsToggle() {
    if (viewMode === "units") {
      setViewMode("none");
      return;
    }

    await openView("units");
  }

  async function handleAvailabilityToggle() {
    if (viewMode === "availability") {
      setViewMode("none");
      return;
    }

    await openView("availability");
  }

  const count = properties.length;
  const expanded = viewMode !== "none";

  return (
    <section id="units" className="public-section--tinted">
      <div className="public-section-inner public-section--tinted-inner">
        <PublicSectionHeader
          index="02"
          kicker="Our accommodation"
          title="Browse all units"
          description="Explore the full selection and check available dates for each unit individually."
          icon={<Building2 className="h-3.5 w-3.5" />}
        />

        <div className="public-units-actions">
          <button
            type="button"
            onClick={(e) => {
              void handleUnitsToggle();
              e.currentTarget.blur();
            }}
            className={cn(
              "public-btn-choice",
              viewMode === "units" && "public-btn-choice--active"
            )}
          >
            <span className="public-btn-choice-icon" aria-hidden>
              <Building2 className="h-5 w-5" />
            </span>
            <span className="public-btn-choice-label">
              {viewMode === "units" ? "Hide units" : "Show all units"}
            </span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              void handleAvailabilityToggle();
              e.currentTarget.blur();
            }}
            className={cn(
              "public-btn-choice",
              viewMode === "availability" && "public-btn-choice--active"
            )}
          >
            <span className="public-btn-choice-icon" aria-hidden>
              <CalendarDays className="h-5 w-5" />
            </span>
            <span className="public-btn-choice-label">
              {viewMode === "availability"
                ? "Hide availability"
                : "View availability for all units"}
            </span>
          </button>
        </div>

        {expanded ? (
          <div id="units-expanded" className="public-units-expanded">
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
