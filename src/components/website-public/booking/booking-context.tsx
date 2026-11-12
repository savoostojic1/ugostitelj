"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { resolvePublicApiUrl } from "@/lib/public/browser-origin";
import { parseJsonResponse } from "@/lib/public/parse-json-response";
import { parseStartingPrice, resolveStayPriceQuote, type StayPriceQuote } from "@/lib/public/stay-price";
import type { PublicReservationSpan } from "@/lib/public/types";
import type { PublicStay, PublicWebsiteModel } from "@/lib/website-builder/types";

/**
 * Shared inquiry state for one website page: the hero booking bar, the navigation
 * "Reserve" button, call-to-action buttons and the booking section all read and
 * write the same stay, dates and guests. Inquiries use the existing Hostvia
 * booking request endpoint; nothing here creates a reservation.
 */

export interface BookingState {
  stays: PublicStay[];
  stay: PublicStay | null;
  stayId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  /** True when the stay is connected to a Hostvia property and the site is live. */
  canSend: boolean;
  /**
   * Builder preview of a site whose stays are not connected yet: the booking bar and
   * panel still show, with a note that stays are connected in Hostvia later.
   */
  pending: boolean;
  preview: boolean;
  language: string;
  sheetOpen: boolean;
  setStay: (id: string) => void;
  setDates: (dates: { checkIn: string; checkOut: string }) => void;
  setGuests: (guests: number) => void;
  open: () => void;
  close: () => void;
  reservations: PublicReservationSpan[];
}

const BookingContext = createContext<BookingState | null>(null);

export function useBooking() {
  return useContext(BookingContext);
}

/**
 * Stays a guest can ask about: only those connected to a Hostvia property, because
 * dates, availability and prices come from there. The demo sites use their samples.
 */
export function bookableStays(model: PublicWebsiteModel): PublicStay[] {
  const connected = model.stays.filter((stay) => stay.propertyId && stay.propertySlug);
  if (connected.length) return connected;
  return model.demo ? model.stays : [];
}

export function BookingProvider({ model, children }: { model: PublicWebsiteModel; children: ReactNode }) {
  const stays = useMemo(() => bookableStays(model), [model]);
  const preferred = model.page.accommodationId && stays.some((stay) => stay.id === model.page.accommodationId) ? model.page.accommodationId : stays[0]?.id ?? "";
  const [stayId, setStayId] = useState(preferred);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuestsState] = useState(2);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [reservationCache, setReservationCache] = useState<Record<string, PublicReservationSpan[]>>({});

  useEffect(() => {
    if (!stays.some((stay) => stay.id === stayId)) setStayId(preferred);
  }, [preferred, stayId, stays]);

  const stay = stays.find((item) => item.id === stayId) ?? stays[0] ?? null;
  const propertyId = stay?.propertyId ?? null;

  // Booked nights for the selected stay, loaded once per property.
  useEffect(() => {
    if (!propertyId || model.preview || reservationCache[propertyId]) return;
    let cancelled = false;
    const endpoint = resolvePublicApiUrl(`/api/public/properties/${propertyId}/reservations`);
    fetch(endpoint)
      .then(async (response) => {
        const parsed = await parseJsonResponse<{ reservations?: PublicReservationSpan[] }>(response, { endpoint });
        if (cancelled || !parsed.ok || !response.ok) return;
        setReservationCache((current) => ({ ...current, [propertyId]: parsed.data.reservations ?? [] }));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [model.preview, propertyId, reservationCache]);

  const setGuests = useCallback(
    (value: number) => {
      const max = stay?.capacity ?? 30;
      setGuestsState(Math.max(1, Math.min(max, Math.round(value) || 1)));
    },
    [stay?.capacity]
  );

  const value = useMemo<BookingState>(
    () => ({
      stays,
      stay,
      stayId: stay?.id ?? "",
      checkIn,
      checkOut,
      guests,
      canSend: Boolean(stay?.propertySlug) && !model.preview,
      pending: model.preview && !model.demo && stays.length === 0,
      preview: model.preview,
      language: model.language,
      sheetOpen,
      setStay: (id) => {
        setStayId(id);
        setCheckIn("");
        setCheckOut("");
      },
      setDates: ({ checkIn: nextIn, checkOut: nextOut }) => {
        setCheckIn(nextIn);
        setCheckOut(nextOut);
      },
      setGuests,
      open: () => setSheetOpen(true),
      close: () => setSheetOpen(false),
      reservations: propertyId ? reservationCache[propertyId] ?? [] : [],
    }),
    [checkIn, checkOut, guests, model.demo, model.language, model.preview, propertyId, reservationCache, setGuests, sheetOpen, stay, stays]
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

/** Live quote from Hostvia's price rules when connected; the nightly rate otherwise. */
export function useStayQuote(stay: PublicStay | null, checkIn: string, checkOut: string, preview: boolean) {
  const [quote, setQuote] = useState<StayPriceQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const propertyId = stay?.propertyId ?? null;
  const nightly = stay?.pricePerNight ?? null;
  const currency = stay?.currencyCode ?? "EUR";

  useEffect(() => {
    if (!checkIn || !checkOut || checkOut <= checkIn) {
      setQuote(null);
      return;
    }
    if (!propertyId || preview) {
      setQuote(resolveStayPriceQuote(checkIn, checkOut, nightly, null, currency));
      return;
    }
    let cancelled = false;
    setLoading(true);
    const endpoint = resolvePublicApiUrl(
      `/api/public/properties/${propertyId}/price?checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}`
    );
    fetch(endpoint)
      .then(async (response) => {
        const parsed = await parseJsonResponse<{ stay_total?: unknown }>(response, { endpoint });
        const total = parsed.ok && response.ok ? parseStartingPrice(parsed.data.stay_total) : null;
        if (!cancelled) setQuote(resolveStayPriceQuote(checkIn, checkOut, nightly, total, currency));
      })
      .catch(() => {
        if (!cancelled) setQuote(resolveStayPriceQuote(checkIn, checkOut, nightly, null, currency));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [checkIn, checkOut, currency, nightly, preview, propertyId]);

  return { quote, loading };
}

export function formatDay(iso: string, language: string, withYear = false): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  try {
    return new Intl.DateTimeFormat(language, {
      day: "numeric",
      month: "short",
      ...(withYear ? { year: "numeric" } : {}),
      timeZone: "UTC",
    }).format(date);
  } catch {
    return iso;
  }
}
