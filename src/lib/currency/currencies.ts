export const DEFAULT_PROPERTY_CURRENCY = "EUR";

export type Currency = {
  code: string;
  name: string;
};

/** ISO 4217 codes Hostvia accepts on a property. Stored values are codes, never symbols. */
export const SUPPORTED_CURRENCIES: readonly Currency[] = [
  { code: "AED", name: "UAE dirham" },
  { code: "ALL", name: "Albanian lek" },
  { code: "AUD", name: "Australian dollar" },
  { code: "BAM", name: "Bosnia and Herzegovina convertible mark" },
  { code: "BGN", name: "Bulgarian lev" },
  { code: "BHD", name: "Bahraini dinar" },
  { code: "BRL", name: "Brazilian real" },
  { code: "CAD", name: "Canadian dollar" },
  { code: "CHF", name: "Swiss franc" },
  { code: "CLP", name: "Chilean peso" },
  { code: "CNY", name: "Chinese yuan" },
  { code: "COP", name: "Colombian peso" },
  { code: "CZK", name: "Czech koruna" },
  { code: "DKK", name: "Danish krone" },
  { code: "EGP", name: "Egyptian pound" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British pound" },
  { code: "GEL", name: "Georgian lari" },
  { code: "HKD", name: "Hong Kong dollar" },
  { code: "HUF", name: "Hungarian forint" },
  { code: "IDR", name: "Indonesian rupiah" },
  { code: "ILS", name: "Israeli new shekel" },
  { code: "INR", name: "Indian rupee" },
  { code: "ISK", name: "Icelandic króna" },
  { code: "JOD", name: "Jordanian dinar" },
  { code: "JPY", name: "Japanese yen" },
  { code: "KRW", name: "South Korean won" },
  { code: "KWD", name: "Kuwaiti dinar" },
  { code: "MAD", name: "Moroccan dirham" },
  { code: "MKD", name: "Macedonian denar" },
  { code: "MXN", name: "Mexican peso" },
  { code: "MYR", name: "Malaysian ringgit" },
  { code: "NOK", name: "Norwegian krone" },
  { code: "NZD", name: "New Zealand dollar" },
  { code: "OMR", name: "Omani rial" },
  { code: "PHP", name: "Philippine peso" },
  { code: "PLN", name: "Polish złoty" },
  { code: "QAR", name: "Qatari riyal" },
  { code: "RON", name: "Romanian leu" },
  { code: "RSD", name: "Serbian dinar" },
  { code: "SAR", name: "Saudi riyal" },
  { code: "SEK", name: "Swedish krona" },
  { code: "SGD", name: "Singapore dollar" },
  { code: "THB", name: "Thai baht" },
  { code: "TND", name: "Tunisian dinar" },
  { code: "TRY", name: "Turkish lira" },
  { code: "TWD", name: "New Taiwan dollar" },
  { code: "UAH", name: "Ukrainian hryvnia" },
  { code: "USD", name: "US dollar" },
  { code: "VND", name: "Vietnamese đồng" },
  { code: "ZAR", name: "South African rand" },
];

const CURRENCY_BY_CODE = new Map(
  SUPPORTED_CURRENCIES.map((currency) => [currency.code, currency])
);

/**
 * Unambiguous ISO 3166-1 country → currency. Used only when a caller already
 * has a country code. Free-text addresses are not parsed.
 */
const COUNTRY_CURRENCY: Record<string, string> = {
  AE: "AED",
  AL: "ALL",
  AT: "EUR",
  AU: "AUD",
  BA: "BAM",
  BE: "EUR",
  BG: "BGN",
  BH: "BHD",
  BR: "BRL",
  CA: "CAD",
  CH: "CHF",
  CL: "CLP",
  CN: "CNY",
  CO: "COP",
  CY: "EUR",
  CZ: "CZK",
  DE: "EUR",
  DK: "DKK",
  EE: "EUR",
  EG: "EGP",
  ES: "EUR",
  FI: "EUR",
  FR: "EUR",
  GB: "GBP",
  GE: "GEL",
  GR: "EUR",
  HK: "HKD",
  HR: "EUR",
  HU: "HUF",
  ID: "IDR",
  IE: "EUR",
  IL: "ILS",
  IN: "INR",
  IS: "ISK",
  IT: "EUR",
  JO: "JOD",
  JP: "JPY",
  KR: "KRW",
  KW: "KWD",
  LT: "EUR",
  LU: "EUR",
  LV: "EUR",
  MA: "MAD",
  ME: "EUR",
  MK: "MKD",
  MT: "EUR",
  MX: "MXN",
  MY: "MYR",
  NL: "EUR",
  NO: "NOK",
  NZ: "NZD",
  OM: "OMR",
  PH: "PHP",
  PL: "PLN",
  PT: "EUR",
  QA: "QAR",
  RO: "RON",
  RS: "RSD",
  SA: "SAR",
  SE: "SEK",
  SG: "SGD",
  SI: "EUR",
  SK: "EUR",
  TH: "THB",
  TN: "TND",
  TR: "TRY",
  TW: "TWD",
  UA: "UAH",
  US: "USD",
  VN: "VND",
  ZA: "ZAR",
};

export function normalizeCurrencyCode(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const code = value.trim().toUpperCase();
  if (!CURRENCY_BY_CODE.has(code)) return null;
  return code;
}

export function isSupportedCurrency(value: unknown): boolean {
  return normalizeCurrencyCode(value) !== null;
}

export function assertSupportedCurrency(value: unknown): string {
  const code = normalizeCurrencyCode(value);
  if (!code) {
    throw new Error("Choose a supported currency");
  }
  return code;
}

export function currencyCodeFromUnknown(value: unknown): string {
  return normalizeCurrencyCode(value) ?? DEFAULT_PROPERTY_CURRENCY;
}

/** New properties use EUR unless the caller already has an ISO country code. */
export function defaultPropertyCurrency(countryCode?: string | null): string {
  const country = countryCode?.trim().toUpperCase() ?? "";
  if (/^[A-Z]{2}$/.test(country)) {
    const currency = COUNTRY_CURRENCY[country];
    if (currency && isSupportedCurrency(currency)) return currency;
  }
  return DEFAULT_PROPERTY_CURRENCY;
}

export function getCurrency(code: string | null | undefined): Currency | null {
  const normalized = normalizeCurrencyCode(code);
  if (!normalized) return null;
  return CURRENCY_BY_CODE.get(normalized) ?? null;
}

export function currencyFractionDigits(code: string | null | undefined): number {
  const normalized = normalizeCurrencyCode(code) ?? DEFAULT_PROPERTY_CURRENCY;
  try {
    return (
      new Intl.NumberFormat("en", {
        style: "currency",
        currency: normalized,
      }).resolvedOptions().maximumFractionDigits ?? 2
    );
  } catch {
    return 2;
  }
}

export function currencySymbol(code: string | null | undefined): string {
  const normalized = normalizeCurrencyCode(code) ?? DEFAULT_PROPERTY_CURRENCY;
  try {
    const part = new Intl.NumberFormat("en", {
      style: "currency",
      currency: normalized,
    })
      .formatToParts(0)
      .find((part) => part.type === "currency");
    return part?.value ?? normalized;
  } catch {
    return normalized;
  }
}

export function currencyInputStep(code: string | null | undefined): string {
  const digits = currencyFractionDigits(code);
  if (digits <= 0) return "1";
  return (1 / 10 ** digits).toFixed(digits);
}

function sharesWordPrefix(word: string, query: string): boolean {
  if (query.length < 4 || word.length < 4) return false;
  const limit = Math.min(word.length, query.length);
  let index = 0;
  while (index < limit && word[index] === query[index]) index += 1;
  return index >= 4 && index >= Math.min(word.length, query.length) - 3;
}

export function filterCurrencies(query: string): Currency[] {
  const needle = query.trim().toLowerCase();
  const options = [...SUPPORTED_CURRENCIES].sort((a, b) =>
    a.name.localeCompare(b.name, "en")
  );
  if (!needle) return options;
  return options.filter((currency) => {
    const symbol = currencySymbol(currency.code).toLowerCase();
    const name = currency.name.toLowerCase();
    return (
      currency.code.toLowerCase().includes(needle) ||
      name.includes(needle) ||
      symbol.includes(needle) ||
      name.split(" ").some((word) => sharesWordPrefix(word, needle))
    );
  });
}
