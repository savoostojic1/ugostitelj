"use client";

import { Loader2, Minus, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HostSearchParams } from "@/lib/public/types";
import { HostSearchDateRange } from "@/components/public/host-search-date-range";

interface HostSearchBarProps {
  value: HostSearchParams;
  onChange: (value: HostSearchParams) => void;
  onSearch: () => void;
  loading?: boolean;
  compact?: boolean;
  floating?: boolean;
}

export function HostSearchBar({
  value,
  onChange,
  onSearch,
  loading,
  compact,
  floating,
}: HostSearchBarProps) {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearch();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "public-search-shell w-full",
        floating && "public-animate-in public-animate-in-delay-2"
      )}
    >
      <div
        className={cn(
          "flex flex-col md:flex-row md:items-stretch",
          compact ? "p-2.5" : "p-3 md:p-4"
        )}
      >
        <div className="flex min-w-0 flex-1 flex-col md:flex-row md:items-stretch">
          <HostSearchDateRange
            checkIn={value.checkIn}
            checkOut={value.checkOut}
            onChange={({ checkIn, checkOut }) =>
              onChange({ ...value, checkIn, checkOut })
            }
            compact={compact}
          />

          <div
            className={cn(
              "flex flex-col justify-center border-b border-[var(--public-border)] px-4 md:w-40 md:border-b-0 md:border-r md:px-5",
              compact ? "min-h-[4.5rem] py-2.5" : "min-h-[5.25rem] py-3.5"
            )}
          >
            <span className="public-label mb-2">Guests</span>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                aria-label="Fewer guests"
                disabled={value.guests <= 1}
                onClick={() =>
                  onChange({
                    ...value,
                    guests: Math.max(1, value.guests - 1),
                  })
                }
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--public-border)] bg-[var(--public-bg-subtle)] text-[var(--public-muted)] transition hover:border-[var(--public-border-strong)] hover:text-[var(--public-fg)] disabled:opacity-40"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-[1.5rem] flex-1 text-center text-[15px] font-semibold tabular-nums">
                {value.guests}
              </span>
              <button
                type="button"
                aria-label="More guests"
                onClick={() =>
                  onChange({ ...value, guests: value.guests + 1 })
                }
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--public-border)] bg-[var(--public-bg-subtle)] text-[var(--public-muted)] transition hover:border-[var(--public-border-strong)] hover:text-[var(--public-fg)]"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="pt-2 md:flex md:items-center md:pt-0 md:pl-3">
          <button
            type="submit"
            disabled={loading || !value.checkIn || !value.checkOut}
            className={cn(
              "public-btn public-btn-primary w-full px-6 md:w-auto",
              compact ? "h-11 md:min-w-[8rem]" : "h-12 md:min-h-[3rem] md:min-w-[9rem] md:px-8"
            )}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            {loading ? "Searching…" : "Search"}
          </button>
        </div>
      </div>
    </form>
  );
}
