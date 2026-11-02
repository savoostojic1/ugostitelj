"use client";

import { useEffect, useState } from "react";
import { resolvePublicApiUrl } from "@/lib/public/browser-origin";
import { parseJsonResponse } from "@/lib/public/parse-json-response";
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

    const endpoint = resolvePublicApiUrl(
      `/api/public/properties/${propertyId}/price?checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}`
    );

    fetch(endpoint)
      .then(async (res) => {
        const parsed = await parseJsonResponse<{
          stay_total?: unknown;
          error?: unknown;
        }>(res, { endpoint });
        if (!parsed.ok || !res.ok) throw new Error("Error");
        if (!cancelled) {
          setQuote(
            resolveStayPriceQuote(
              checkIn,
              checkOut,
              startingPrice,
              parseStartingPrice(parsed.data.stay_total)
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
