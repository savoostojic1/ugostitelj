"use client";

import { useEffect, useState } from "react";
import {
  parseStartingPrice,
  resolveStayPriceQuote,
  type StayPriceQuote,
} from "@/lib/public/stay-price";

export function usePublicStayPrice(
  propertyId: string,
  checkIn: string,
  checkOut: string,
  startingPrice: number | null,
  prefetchedStayTotal?: number | null
) {
  const [quote, setQuote] = useState<StayPriceQuote | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!checkIn || !checkOut || checkOut <= checkIn) {
      setQuote(null);
      return;
    }

    const prefetched = parseStartingPrice(prefetchedStayTotal);
    if (prefetched !== null) {
      setQuote(
        resolveStayPriceQuote(checkIn, checkOut, startingPrice, prefetched)
      );
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetch(
      `/api/public/properties/${propertyId}/price?checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}`
    )
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Greška");
        if (!cancelled) {
          setQuote(
            resolveStayPriceQuote(
              checkIn,
              checkOut,
              startingPrice,
              parseStartingPrice(data.stay_total)
            )
          );
        }
      })
      .catch(() => {
        if (!cancelled) {
          setQuote(resolveStayPriceQuote(checkIn, checkOut, startingPrice, null));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [propertyId, checkIn, checkOut, startingPrice, prefetchedStayTotal]);

  return { quote, loading };
}
