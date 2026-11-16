import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  cachedStayTotal,
  fetchStayTotal,
  PREFETCH_NIGHTS,
  prefetchStayTotals,
  setStayTotalFetcher,
} from "@/lib/public/stay-totals";

function stub(answer: (url: string) => { status?: number; body: unknown }) {
  const calls: string[] = [];
  setStayTotalFetcher(async (url) => {
    calls.push(url);
    const { status = 200, body } = answer(url);
    return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
  });
  return calls;
}

afterEach(() => setStayTotalFetcher(null));

describe("stay totals", () => {
  it("asks once per stay and dates, then answers from memory", async () => {
    const calls = stub(() => ({ body: { stay_total: 480 } }));
    const [a, b] = await Promise.all([fetchStayTotal("p1", "2026-12-10", "2026-12-14"), fetchStayTotal("p1", "2026-12-10", "2026-12-14")]);
    assert.equal(a, 480);
    assert.equal(b, 480);
    assert.equal(calls.length, 1, "shares the request in flight");
    assert.equal(cachedStayTotal("p1", "2026-12-10", "2026-12-14"), 480);
    await fetchStayTotal("p1", "2026-12-10", "2026-12-14");
    assert.equal(calls.length, 1, "reuses the answer");
    assert.equal(cachedStayTotal("p1", "2026-12-10", "2026-12-15"), undefined);
  });

  it("does not remember failures, so the next ask retries", async () => {
    let fail = true;
    const calls = stub(() => (fail ? { status: 500, body: { error: "x" } } : { body: { stay_total: 300 } }));
    assert.equal(await fetchStayTotal("p2", "2026-12-01", "2026-12-03"), null);
    assert.equal(cachedStayTotal("p2", "2026-12-01", "2026-12-03"), undefined);
    fail = false;
    assert.equal(await fetchStayTotal("p2", "2026-12-01", "2026-12-03"), 300);
    assert.equal(calls.length, 2);
  });

  it("prices the next week of departures once arrival is picked", async () => {
    const calls = stub(() => ({ body: { stay_total: 100 } }));
    prefetchStayTotals("p3", "2026-12-30");
    assert.equal(calls.length, PREFETCH_NIGHTS);
    assert.ok(calls[0].includes("checkOut=2026-12-31"));
    assert.ok(calls[2].includes("checkOut=2027-01-02"), "crosses the year");
    await new Promise((resolve) => setTimeout(resolve, 10));
    assert.equal(cachedStayTotal("p3", "2026-12-30", "2027-01-06"), 100);
  });
});
