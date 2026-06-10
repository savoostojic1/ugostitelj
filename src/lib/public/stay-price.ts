import { addDays, differenceInCalendarDays, format } from "date-fns";
import { parseDateOnly } from "@/lib/dates/calendar-date";

export function countStayNights(checkIn: string, checkOut: string): number {
  return Math.max(
    0,
    differenceInCalendarDays(
      parseDateOnly(checkOut),
      parseDateOnly(checkIn)
    )
  );
}

export function parseStartingPrice(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number.parseFloat(String(value));
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function formatEuro(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  const hasDecimals = !Number.isInteger(rounded);
  return new Intl.NumberFormat("sr-RS", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(rounded);
}

export function calculateStayPrice(
  pricePerNight: number,
  nights: number
): { nights: number; pricePerNight: number; total: number } | null {
  if (!Number.isFinite(pricePerNight) || pricePerNight <= 0 || nights <= 0) {
    return null;
  }

  const total = Math.round(pricePerNight * nights * 100) / 100;
  return { nights, pricePerNight, total };
}

export interface StayPriceQuote {
  nights: number;
  total: number;
  pricePerNight: number;
  usesDatePricing: boolean;
}

export function resolveStayPriceQuote(
  checkIn: string,
  checkOut: string,
  startingPrice: number | null,
  stayTotal: number | null | undefined
): StayPriceQuote | null {
  const nights = countStayNights(checkIn, checkOut);
  if (nights <= 0) return null;

  const parsedTotal = parseStartingPrice(stayTotal);
  if (parsedTotal !== null) {
    return {
      nights,
      total: parsedTotal,
      pricePerNight: Math.round((parsedTotal / nights) * 100) / 100,
      usesDatePricing: true,
    };
  }

  if (startingPrice === null) return null;
  const flat = calculateStayPrice(startingPrice, nights);
  if (!flat) return null;

  return {
    nights: flat.nights,
    total: flat.total,
    pricePerNight: flat.pricePerNight,
    usesDatePricing: false,
  };
}

export function nightsLabel(nights: number): string {
  if (nights === 1) return "1 noć";
  if (nights >= 2 && nights <= 4) return `${nights} noći`;
  return `${nights} noći`;
}

export interface PropertyPriceRuleSpan {
  start_date: string;
  end_date: string;
  price_per_night: number;
}

export function priceRulesOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string
): boolean {
  return aStart <= bEnd && aEnd >= bStart;
}

export function eachStayNight(checkIn: string, checkOut: string): string[] {
  const nights: string[] = [];
  let cursor = parseDateOnly(checkIn);
  const end = parseDateOnly(checkOut);

  while (cursor < end) {
    nights.push(format(cursor, "yyyy-MM-dd"));
    cursor = addDays(cursor, 1);
  }

  return nights;
}

export function resolveNightPriceFromRules(
  night: string,
  rules: PropertyPriceRuleSpan[],
  defaultPrice: number | null
): number | null {
  const matching = rules
    .filter((rule) => night >= rule.start_date && night <= rule.end_date)
    .sort((a, b) => {
      const spanA =
        differenceInCalendarDays(
          parseDateOnly(a.end_date),
          parseDateOnly(a.start_date)
        );
      const spanB =
        differenceInCalendarDays(
          parseDateOnly(b.end_date),
          parseDateOnly(b.start_date)
        );
      return spanA - spanB;
    });

  if (matching.length > 0) {
    return matching[0].price_per_night;
  }

  return defaultPrice;
}

export function calculateStayTotalFromRules(
  checkIn: string,
  checkOut: string,
  rules: PropertyPriceRuleSpan[],
  defaultPrice: number | null
): number | null {
  const nights = eachStayNight(checkIn, checkOut);
  if (nights.length === 0) return null;

  let total = 0;
  for (const night of nights) {
    const price = resolveNightPriceFromRules(night, rules, defaultPrice);
    if (price === null || price <= 0) return null;
    total += price;
  }

  return Math.round(total * 100) / 100;
}
