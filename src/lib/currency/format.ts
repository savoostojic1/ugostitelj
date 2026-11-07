import {
  currencyFractionDigits,
  currencyCodeFromUnknown,
  DEFAULT_PROPERTY_CURRENCY,
  normalizeCurrencyCode,
} from "@/lib/currency/currencies";

const formatters = new Map<string, Intl.NumberFormat>();

function formatter(currency: string, minimumFractionDigits: number, maximumFractionDigits: number) {
  const key = `${currency}:${minimumFractionDigits}:${maximumFractionDigits}`;
  let cached = formatters.get(key);
  if (!cached) {
    cached = new Intl.NumberFormat("en", {
      style: "currency",
      currency,
      minimumFractionDigits,
      maximumFractionDigits,
    });
    formatters.set(key, cached);
  }
  return cached;
}

/** Round a money amount to the ISO minor units of the currency. EUR stays at 2 decimals. */
export function roundMoney(amount: number, currencyCode?: string | null): number {
  const code = currencyCodeFromUnknown(currencyCode);
  const digits = currencyFractionDigits(code);
  const factor = 10 ** digits;
  return Math.round(amount * factor) / factor;
}

/** Shared price display. Symbols come from Intl, never from hardcoded currency signs. */
export function formatPropertyPrice(
  amount: number,
  currencyCode?: string | null
): string {
  const code = currencyCodeFromUnknown(currencyCode);
  const digits = currencyFractionDigits(code);
  const rounded = roundMoney(amount, code);
  const hasFraction =
    digits > 0 && Math.abs(rounded - Math.trunc(rounded)) > 1e-9;
  return formatter(code, hasFraction ? digits : 0, digits).format(rounded);
}

export function parseMoneyAmount(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const amount = typeof value === "number" ? value : Number(value);
  return Number.isFinite(amount) ? amount : null;
}

export type PriceSnapshot = {
  currency_code: string;
  nightly_rate: number | null;
  total_amount: number | null;
  nights: number;
};

/** Quote captured when a stay is requested or entered. Later property edits do not rewrite it. */
export function priceSnapshotFromStay(input: {
  currencyCode?: string | null;
  totalAmount: number | null;
  nights: number;
}): PriceSnapshot {
  const currency_code = currencyCodeFromUnknown(input.currencyCode);
  const nights = Number.isFinite(input.nights) ? Math.max(0, Math.trunc(input.nights)) : 0;
  if (input.totalAmount === null || !Number.isFinite(input.totalAmount)) {
    return {
      currency_code,
      nightly_rate: null,
      total_amount: null,
      nights,
    };
  }

  const total_amount = roundMoney(input.totalAmount, currency_code);
  const nightly_rate =
    nights > 0 ? roundMoney(total_amount / nights, currency_code) : null;
  return { currency_code, nightly_rate, total_amount, nights };
}

/**
 * Reservations display the currency stored on the reservation.
 * The property's current currency is only a fallback for rows that predate the snapshot.
 */
export function currencyForReservationDisplay(input: {
  reservationCurrency?: string | null;
  propertyCurrency?: string | null;
}): string {
  return (
    normalizeCurrencyCode(input.reservationCurrency) ??
    normalizeCurrencyCode(input.propertyCurrency) ??
    DEFAULT_PROPERTY_CURRENCY
  );
}

export function reservationMoneyLabels(input: {
  currencyCode?: string | null;
  totalAmount?: number | null;
  nightlyRate?: number | null;
}): { totalLabel: string | null; nightlyLabel: string | null } {
  const total = parseMoneyAmount(input.totalAmount);
  if (total === null) {
    return { totalLabel: null, nightlyLabel: null };
  }
  const currency = currencyCodeFromUnknown(input.currencyCode);
  const nightly = parseMoneyAmount(input.nightlyRate);
  return {
    totalLabel: formatPropertyPrice(total, currency),
    nightlyLabel:
      nightly === null ? null : formatPropertyPrice(nightly, currency),
  };
}

/** Copy used by public booking cards and the request form. */
export function publicBookingPriceLines(input: {
  total: number;
  nightlyRate: number;
  nights: number;
  currencyCode?: string | null;
  average?: boolean;
}): { total: string; perNight: string; stayLine: string } {
  const currency = currencyCodeFromUnknown(input.currencyCode);
  const total = formatPropertyPrice(input.total, currency);
  const perNightAmount = formatPropertyPrice(input.nightlyRate, currency);
  const perNight = `${input.average ? "avg " : ""}${perNightAmount} per night`;
  return {
    total,
    perNight,
    stayLine: `${input.nights} ${input.nights === 1 ? "night" : "nights"} · ${total} total`,
  };
}
