import "server-only";

import type { CreemConfig } from "@/lib/creem/config";
import {
  readCreemTransactionPage,
  sumCreemPaidTotals,
  type CreemCurrencyTotal,
} from "@/lib/creem/transactions";

const PAGE_SIZE = 50;
const MAX_PAGES = 40;

export async function loadCreemPaidTotals(
  config: CreemConfig
): Promise<
  | { ok: true; totals: Map<string, CreemCurrencyTotal[]> }
  | { ok: false }
> {
  if (!config.apiKey || !config.productId) return { ok: false };

  const transactions = [];
  let pageNumber = 1;
  const seenPages = new Set<number>();

  for (let attempt = 0; attempt < MAX_PAGES; attempt += 1) {
    if (seenPages.has(pageNumber)) break;
    seenPages.add(pageNumber);

    const params = new URLSearchParams({
      product_id: config.productId,
      page_number: String(pageNumber),
      page_size: String(PAGE_SIZE),
    });
    const response = await fetch(
      `${config.apiBaseUrl}/v1/transactions/search?${params.toString()}`,
      {
        method: "GET",
        headers: { "x-api-key": config.apiKey },
        cache: "no-store",
      }
    );
    const payload: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      console.error("[creem transactions] Creem returned", response.status);
      return { ok: false };
    }

    const page = readCreemTransactionPage(payload);
    if (!page) {
      console.error("[creem transactions] unexpected response shape");
      return { ok: false };
    }
    transactions.push(...page.transactions);
    if (!page.nextPage || page.nextPage === pageNumber) break;
    pageNumber = page.nextPage;
  }

  return { ok: true, totals: sumCreemPaidTotals(transactions) };
}
