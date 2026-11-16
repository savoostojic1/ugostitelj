import { resolvePublicApiUrl } from "@/lib/public/browser-origin";
import { parseJsonResponse } from "@/lib/public/parse-json-response";
import { parseStartingPrice } from "@/lib/public/stay-price";

/**
 * Stay totals from Hostvia's price rules, shared by every quote on a page. Each
 * stay/dates pair is asked for once; later asks reuse the answer (or the request
 * still in flight), so dates already seen show their price instantly. Failed
 * requests are not remembered, so the next ask tries again.
 */
const totals = new Map<string, number | null>();
const pending = new Map<string, Promise<number | null>>();
const key = (propertyId: string, checkIn: string, checkOut: string) => `${propertyId}|${checkIn}|${checkOut}`;

type Fetcher = (url: string) => Promise<Response>;
let fetcher: Fetcher = (url) => fetch(url);

/** Tests swap the network for a stub. */
export function setStayTotalFetcher(next: Fetcher | null) {
  fetcher = next ?? ((url) => fetch(url));
  totals.clear();
  pending.clear();
}

/** The remembered total, or undefined when these dates were never priced. */
export function cachedStayTotal(propertyId: string, checkIn: string, checkOut: string): number | null | undefined {
  const k = key(propertyId, checkIn, checkOut);
  return totals.has(k) ? (totals.get(k) ?? null) : undefined;
}

export function fetchStayTotal(propertyId: string, checkIn: string, checkOut: string): Promise<number | null> {
  const k = key(propertyId, checkIn, checkOut);
  if (totals.has(k)) return Promise.resolve(totals.get(k) ?? null);
  const inFlight = pending.get(k);
  if (inFlight) return inFlight;
  const endpoint = resolvePublicApiUrl(
    `/api/public/properties/${propertyId}/price?checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}`
  );
  const request = fetcher(endpoint)
    .then(async (response) => {
      const parsed = await parseJsonResponse<{ stay_total?: unknown }>(response, { endpoint });
      if (!response.ok || !parsed.ok) return null;
      const total = parseStartingPrice(parsed.data.stay_total);
      totals.set(k, total);
      return total;
    })
    .catch(() => null)
    .finally(() => pending.delete(k));
  pending.set(k, request);
  return request;
}

/** Most stays are a few nights: once arrival is picked, price those ahead of time. */
export const PREFETCH_NIGHTS = 7;

export function prefetchStayTotals(propertyId: string, checkIn: string): void {
  const [y, m, d] = checkIn.split("-").map(Number);
  if (!y || !m || !d) return;
  for (let nights = 1; nights <= PREFETCH_NIGHTS; nights += 1) {
    const checkOut = new Date(Date.UTC(y, m - 1, d + nights)).toISOString().slice(0, 10);
    void fetchStayTotal(propertyId, checkIn, checkOut);
  }
}
