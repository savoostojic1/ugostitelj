import { readCreemId } from "@/lib/creem/parse-event";

const COLLECTED_STATUSES = new Set([
  "paid",
  "partialRefund",
  "refunded",
  "chargedBack",
]);

export type CreemCurrencyTotal = {
  currency: string;
  netCents: number;
};

type ParsedTransaction = {
  customerId: string;
  currency: string;
  status: string;
  amount: number;
  amountPaid: number | null;
  refundedAmount: number | null;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function readCents(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return value;
}

export function netCollectedCents(transaction: {
  status: string;
  amount: number;
  amountPaid: number | null;
  refundedAmount: number | null;
}): number {
  if (!COLLECTED_STATUSES.has(transaction.status)) return 0;
  const paid = transaction.amountPaid ?? transaction.amount;
  if (
    (transaction.status === "refunded" || transaction.status === "chargedBack") &&
    transaction.refundedAmount === null
  ) {
    return 0;
  }
  const refunded = transaction.refundedAmount ?? 0;
  return Math.max(0, Math.round(paid - refunded));
}

export function readCreemTransactionPage(payload: unknown): {
  transactions: ParsedTransaction[];
  nextPage: number | null;
} | null {
  const page = asRecord(payload);
  const items = page?.items;
  const pagination = asRecord(page?.pagination);
  if (!page || !Array.isArray(items) || !pagination) return null;

  const transactions: ParsedTransaction[] = [];
  for (const item of items) {
    const record = asRecord(item);
    if (!record) continue;
    const customerId = readCreemId(record.customer);
    const currency = typeof record.currency === "string" ? record.currency.trim() : "";
    const status = typeof record.status === "string" ? record.status.trim() : "";
    const amount = readCents(record.amount);
    if (!customerId || !/^[A-Z]{3}$/.test(currency) || !status || amount === null) {
      continue;
    }
    transactions.push({
      customerId,
      currency,
      status,
      amount,
      amountPaid: readCents(record.amount_paid),
      refundedAmount: readCents(record.refunded_amount),
    });
  }

  const nextPage = pagination.next_page;
  return {
    transactions,
    nextPage: typeof nextPage === "number" && Number.isFinite(nextPage) ? nextPage : null,
  };
}

export function sumCreemPaidTotals(
  transactions: ParsedTransaction[]
): Map<string, CreemCurrencyTotal[]> {
  const byCustomer = new Map<string, Map<string, number>>();

  for (const transaction of transactions) {
    const net = netCollectedCents(transaction);
    if (net === 0 && !COLLECTED_STATUSES.has(transaction.status)) continue;
    const currencies = byCustomer.get(transaction.customerId) ?? new Map<string, number>();
    currencies.set(transaction.currency, (currencies.get(transaction.currency) ?? 0) + net);
    byCustomer.set(transaction.customerId, currencies);
  }

  const totals = new Map<string, CreemCurrencyTotal[]>();
  for (const [customerId, currencies] of byCustomer) {
    totals.set(
      customerId,
      [...currencies.entries()]
        .map(([currency, netCents]) => ({ currency, netCents }))
        .sort((a, b) => a.currency.localeCompare(b.currency))
    );
  }
  return totals;
}

export function formatCreemPaidTotals(totals: CreemCurrencyTotal[] | undefined): string {
  if (!totals?.length) return formatMoney(0, "USD");
  return totals
    .map((total) => formatMoney(total.netCents, total.currency))
    .join(" + ");
}

export function formatMoney(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}
