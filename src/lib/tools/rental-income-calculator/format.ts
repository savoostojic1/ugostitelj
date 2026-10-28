const EMPTY = "—";

const moneyFormatters = new Map<string, Intl.NumberFormat>();

function moneyFormatter(currency: string): Intl.NumberFormat {
  let formatter = moneyFormatters.get(currency);
  if (!formatter) {
    try {
      formatter = new Intl.NumberFormat("en", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      });
    } catch {
      formatter = new Intl.NumberFormat("en", { maximumFractionDigits: 0 });
    }
    moneyFormatters.set(currency, formatter);
  }
  return formatter;
}

/** Results are rounded to whole currency units for display only. */
export function formatMoney(value: number, currency: string): string {
  if (!Number.isFinite(value)) return EMPTY;
  const rounded = Math.round(value);
  return moneyFormatter(currency).format(rounded === 0 ? 0 : rounded);
}

export function formatPercent(ratio: number, fractionDigits = 1): string {
  if (!Number.isFinite(ratio)) return EMPTY;
  return `${(ratio * 100).toFixed(fractionDigits).replace(/\.0+$/, "")}%`;
}

const countFormatter = new Intl.NumberFormat("en", { maximumFractionDigits: 1 });

export function formatCount(value: number): string {
  if (!Number.isFinite(value)) return EMPTY;
  return countFormatter.format(Math.abs(value) < 0.05 ? 0 : value);
}

export function currencySymbol(currency: string): string {
  try {
    const part = new Intl.NumberFormat("en", { style: "currency", currency })
      .formatToParts(0)
      .find((p) => p.type === "currency");
    return part?.value ?? currency;
  } catch {
    return currency;
  }
}
