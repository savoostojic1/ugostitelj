"use client";

import { useMemo, useState } from "react";
import { Check, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { findStayRangeConflict } from "@/lib/reservations/availability";
import { formatReservationLabel } from "@/lib/reservations/display";
import { getPropertyCalendarColor } from "@/lib/properties/property-colors";
import { cn } from "@/lib/utils";
import type { Property, Reservation } from "@/types/database";

interface PropertyStayPickerProps {
  properties: Property[];
  reservations: Reservation[];
  reservationsLoading?: boolean;
  value: string;
  onChange: (propertyId: string) => void;
  checkIn: string;
  checkOut: string;
  excludeReservationId?: string;
  currentPropertyId?: string;
}

type StayFit =
  | { kind: "pending" }
  | { kind: "free" }
  | { kind: "busy"; label: string };

function comparePropertyNames(a: Property, b: Property) {
  return a.name.localeCompare(b.name, undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

export function PropertyStayPicker({
  properties,
  reservations,
  reservationsLoading = false,
  value,
  onChange,
  checkIn,
  checkOut,
  excludeReservationId,
  currentPropertyId,
}: PropertyStayPickerProps) {
  const [query, setQuery] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);
  const isEdit = !!currentPropertyId;
  const datesChosen = Boolean(checkIn && checkOut && checkOut > checkIn);

  const ordered = useMemo(
    () => [...properties].sort(comparePropertyNames),
    [properties]
  );

  const fitById = useMemo(() => {
    const map = new Map<string, StayFit>();
    if (!datesChosen || reservationsLoading) {
      for (const property of ordered) map.set(property.id, { kind: "pending" });
      return map;
    }

    const byProperty = new Map<string, Reservation[]>();
    for (const reservation of reservations) {
      const list = byProperty.get(reservation.property_id);
      if (list) list.push(reservation);
      else byProperty.set(reservation.property_id, [reservation]);
    }

    for (const property of ordered) {
      const conflict = findStayRangeConflict(
        byProperty.get(property.id) ?? [],
        checkIn,
        checkOut,
        excludeReservationId
      );
      map.set(
        property.id,
        conflict
          ? {
              kind: "busy",
              label: formatReservationLabel(conflict.title, conflict.platform),
            }
          : { kind: "free" }
      );
    }
    return map;
  }, [
    ordered,
    reservations,
    datesChosen,
    reservationsLoading,
    checkIn,
    checkOut,
    excludeReservationId,
  ]);

  const freeCount = ordered.filter(
    (property) => fitById.get(property.id)?.kind === "free"
  ).length;
  const busyCount = ordered.filter(
    (property) => fitById.get(property.id)?.kind === "busy"
  ).length;
  const showAvailability = datesChosen && !reservationsLoading;
  const showSearch = ordered.length > 6;
  const showAvailableToggle = showAvailability && busyCount > 0 && freeCount > 0;

  const visible = ordered.filter((property) => {
    if (query.trim()) {
      const needle = query.trim().toLowerCase();
      if (!property.name.toLowerCase().includes(needle)) return false;
    }
    if (!availableOnly || !showAvailability) return true;
    if (property.id === value) return true;
    return fitById.get(property.id)?.kind === "free";
  });

  const selectedFit = value ? fitById.get(value) : undefined;

  function statusLine(propertyId: string) {
    const fit = fitById.get(propertyId);
    const property = ordered.find((item) => item.id === propertyId);
    const capacity =
      property?.capacity && property.capacity > 0
        ? `Up to ${property.capacity} guests`
        : null;

    if (!showAvailability || !fit || fit.kind === "pending") {
      return capacity;
    }
    if (fit.kind === "busy") return `Taken · ${fit.label}`;
    if (isEdit && propertyId === value && propertyId === currentPropertyId) {
      return "Current booking";
    }
    if (isEdit && propertyId === value) return "Moving here";
    if (isEdit) return "Free — move here";
    if (propertyId === value) return "Selected";
    return capacity ? `Free · ${capacity}` : "Free for these dates";
  }

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="space-y-1">
          <Label id="property-stay-label">Property</Label>
          {isEdit && ordered.length > 1 ? (
            <p className="text-xs text-muted-foreground">
              Tap a free property to move this booking. Dates stay the same.
            </p>
          ) : null}
        </div>
        {showAvailability ? (
          <p className="text-xs tabular-nums text-muted-foreground">
            <span className="font-medium text-emerald-300">{freeCount}</span>
            {" free"}
            {busyCount > 0 ? ` · ${busyCount} taken` : ""}
          </p>
        ) : null}
      </div>

      {showSearch || showAvailableToggle ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {showSearch ? (
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") event.preventDefault();
                }}
                placeholder="Search properties"
                aria-label="Search properties"
                className="h-8 pl-8 text-sm"
              />
            </div>
          ) : null}
          {showAvailableToggle ? (
            <button
              type="button"
              onClick={() => setAvailableOnly((current) => !current)}
              aria-pressed={availableOnly}
              className={cn(
                "h-8 shrink-0 rounded-lg border px-3 text-xs font-medium transition",
                availableOnly
                  ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-200"
                  : "border-border text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              Available only
            </button>
          ) : null}
        </div>
      ) : null}

      <div
        role="radiogroup"
        aria-labelledby="property-stay-label"
        className={cn(
          "grid gap-2",
          ordered.length > 1 && "sm:grid-cols-2"
        )}
      >
        {visible.map((property) => {
          const selected = property.id === value;
          const fit = fitById.get(property.id);
          const colorIndex = ordered.findIndex((item) => item.id === property.id);
          const color = getPropertyCalendarColor(colorIndex).solid;
          const line = statusLine(property.id);
          const busy = fit?.kind === "busy";

          return (
            <button
              key={property.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(property.id)}
              className={cn(
                "flex min-w-0 items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition",
                selected
                  ? "border-violet-400/55 bg-violet-500/15 shadow-[inset_0_0_0_1px_rgba(167,139,250,0.35)]"
                  : busy
                    ? "border-border/80 bg-background/30 hover:border-amber-400/30 hover:bg-amber-500/5"
                    : showAvailability && fit?.kind === "free"
                      ? "border-emerald-500/25 bg-emerald-500/[0.06] hover:border-emerald-400/45 hover:bg-emerald-500/10"
                      : "border-border bg-background/40 hover:border-violet-400/30 hover:bg-accent/60"
              )}
            >
              <span
                className="h-9 w-1 shrink-0 rounded-full"
                style={{ background: color }}
                aria-hidden
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">
                  {property.name}
                </span>
                {line ? (
                  <span
                    className={cn(
                      "mt-0.5 block truncate text-xs",
                      busy
                        ? "text-amber-200/90"
                        : showAvailability && fit?.kind === "free"
                          ? "text-emerald-300/90"
                          : "text-muted-foreground"
                    )}
                  >
                    {line}
                  </span>
                ) : null}
              </span>
              {selected ? (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500 text-white">
                  <Check className="h-3 w-3" />
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
          {query.trim()
            ? "No property matches that search."
            : "No other property is free for these dates."}
        </p>
      ) : null}

      {selectedFit?.kind === "busy" ? (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
          These dates overlap with {selectedFit.label}. Pick a free property or
          change the dates.
        </p>
      ) : null}
    </div>
  );
}
