"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { format, addDays } from "date-fns";
import { appLocale } from "@/lib/dates/locale";
import { ArrowRight } from "lucide-react";
import { parseDateOnly } from "@/lib/dates/calendar-date";
import {
  PublicMiniCalendar,
  type PublicCalendarMode,
} from "@/components/public/public-mini-calendar";
import { cn } from "@/lib/utils";

interface HostSearchDateRangeProps {
  checkIn: string;
  checkOut: string;
  onChange: (dates: { checkIn: string; checkOut: string }) => void;
  compact?: boolean;
}

export function minCheckOutDate(checkIn: string): string {
  if (!checkIn) return format(new Date(), "yyyy-MM-dd");
  return format(addDays(parseDateOnly(checkIn), 1), "yyyy-MM-dd");
}

export function HostSearchDateRange({
  checkIn,
  checkOut,
  onChange,
  compact,
}: HostSearchDateRangeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<PublicCalendarMode>("check-in");
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const today = format(new Date(), "yyyy-MM-dd");
  const checkInLabel = checkIn
    ? format(parseDateOnly(checkIn), "d. MMM yyyy", { locale: appLocale })
    : "Add date";
  const checkOutLabel = checkOut
    ? format(parseDateOnly(checkOut), "d. MMM yyyy", { locale: appLocale })
    : "Add date";

  function updatePosition() {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const panelWidth = 296;
    const margin = 12;
    let left = rect.left;
    if (left + panelWidth > window.innerWidth - margin) {
      left = window.innerWidth - panelWidth - margin;
    }
    left = Math.max(margin, left);

    let top = rect.bottom + margin;
    const panelHeight = 380;
    if (top + panelHeight > window.innerHeight - margin) {
      top = Math.max(margin, rect.top - panelHeight - margin);
    }

    setPosition({ top, left });
  }

  function openCalendar(nextMode: PublicCalendarMode) {
    setMode(nextMode);
    setOpen(true);
    requestAnimationFrame(updatePosition);
  }

  function handleDaySelect(isoDate: string) {
    if (mode === "check-in" || !checkIn) {
      const nextOut =
        checkOut && checkOut > isoDate ? checkOut : "";
      onChange({ checkIn: isoDate, checkOut: nextOut });
      setMode("check-out");
      return;
    }

    if (isoDate <= checkIn) {
      onChange({ checkIn: isoDate, checkOut: "" });
      setMode("check-out");
      return;
    }

    onChange({ checkIn, checkOut: isoDate });
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;

    updatePosition();

    function onPointerDown(e: MouseEvent) {
      const target = e.target as Node;
      if (
        containerRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    function onScrollOrResize() {
      updatePosition();
    }

    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onScrollOrResize);
    window.addEventListener("scroll", onScrollOrResize, true);

    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener("scroll", onScrollOrResize, true);
    };
  }, [open]);

  return (
    <>
      <div
        ref={containerRef}
        className={cn(
          "flex min-w-0 flex-[2] border-b border-[var(--public-border)] md:border-b-0 md:border-r",
          compact ? "min-h-[4.5rem]" : "min-h-[5.25rem]"
        )}
      >
        <button
          type="button"
          onClick={() => openCalendar("check-in")}
          className={cn(
            "flex min-w-0 flex-1 flex-col justify-center px-4 text-left transition md:px-5",
            "hover:bg-[var(--public-bg-subtle)]",
            open && mode === "check-in" && "bg-[var(--public-bg-subtle)]",
            compact ? "py-2.5" : "py-3.5"
          )}
        >
          <span className="public-label mb-1.5">Check-in</span>
          <span
            className={cn(
              "truncate text-[15px] font-semibold leading-tight",
              checkIn ? "text-[var(--public-fg)]" : "text-[var(--public-muted)]"
            )}
          >
            {checkInLabel}
          </span>
        </button>

        <div
          className="flex w-10 shrink-0 items-center justify-center text-[var(--public-muted-soft)] md:w-12"
          aria-hidden
        >
          <ArrowRight className="h-4 w-4" />
        </div>

        <button
          type="button"
          onClick={() => openCalendar(checkIn ? "check-out" : "check-in")}
          className={cn(
            "flex min-w-0 flex-1 flex-col justify-center px-4 text-left transition md:px-5",
            "hover:bg-[var(--public-bg-subtle)]",
            open && mode === "check-out" && "bg-[var(--public-bg-subtle)]",
            compact ? "py-2.5" : "py-3.5"
          )}
        >
          <span className="public-label mb-1.5">Check-out</span>
          <span
            className={cn(
              "truncate text-[15px] font-semibold leading-tight",
              checkOut
                ? "text-[var(--public-fg)]"
                : "text-[var(--public-muted)]"
            )}
          >
            {checkOutLabel}
          </span>
        </button>
      </div>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="public-site">
            <div
              ref={panelRef}
              role="dialog"
              aria-label="Select stay dates"
              className="public-calendar-popover fixed z-[200]"
              style={{ top: position.top, left: position.left }}
            >
              <PublicMiniCalendar
                mode={mode}
                checkIn={checkIn}
                checkOut={checkOut}
                onSelect={handleDaySelect}
                minDateIso={today}
              />
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
