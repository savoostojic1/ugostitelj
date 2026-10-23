import assert from "node:assert/strict";
import test from "node:test";
import { summarizeAdminPlan } from "@/lib/admin/plan-summary";
import {
  formatCreemPaidTotals,
  netCollectedCents,
  readCreemTransactionPage,
  sumCreemPaidTotals,
} from "@/lib/creem/transactions";

const host = {
  id: "host",
  email: "owner@example.com",
  username: "owner",
  property_count: 1,
  subscription_status: "active" as const,
  subscription_current_period_end: "2026-11-23T00:00:00.000Z",
  subscription_cancel_at_period_end: false,
  stripe_customer_id: null,
  stripe_subscription_id: null,
  creem_customer_id: "cust_hostvia",
  creem_subscription_id: "sub_hostvia",
  pro_access_granted: false,
  pro_access_granted_at: null,
  pro_access_granted_note: null,
  is_pro: true,
  has_host_profile: true,
};

test("paid Creem hosts are labeled Pro and complimentary access stays separate", () => {
  assert.equal(summarizeAdminPlan(host).planSource, "creem");
  assert.equal(summarizeAdminPlan(host).planLabel, "Pro");
  assert.equal(
    summarizeAdminPlan({
      ...host,
      subscription_cancel_at_period_end: true,
    }).planLabel,
    "Pro · canceling"
  );
  assert.equal(
    summarizeAdminPlan({ ...host, pro_access_granted: true }).planSource,
    "complimentary"
  );
  assert.equal(
    summarizeAdminPlan({
      ...host,
      creem_customer_id: null,
      creem_subscription_id: null,
      subscription_status: "free",
      is_pro: false,
    }).planSource,
    "free"
  );
});

test("transaction totals use documented paid amounts and ignore unpaid statuses", () => {
  const page = readCreemTransactionPage({
    items: [
      {
        id: "tran_paid",
        amount: 2000,
        amount_paid: 2000,
        currency: "USD",
        status: "paid",
        customer: "cust_hostvia",
      },
      {
        id: "tran_partial",
        amount: 2000,
        amount_paid: 2000,
        refunded_amount: 500,
        currency: "USD",
        status: "partialRefund",
        customer: "cust_hostvia",
      },
      {
        id: "tran_pending",
        amount: 2000,
        currency: "USD",
        status: "pending",
        customer: "cust_hostvia",
      },
      {
        id: "tran_other",
        amount: 1000,
        amount_paid: 1000,
        currency: "EUR",
        status: "paid",
        customer: "cust_other",
      },
    ],
    pagination: {
      total_records: 4,
      total_pages: 1,
      current_page: 1,
      next_page: null,
      prev_page: null,
    },
  });

  assert.ok(page);
  assert.equal(page.nextPage, null);
  const totals = sumCreemPaidTotals(page.transactions);
  assert.deepEqual(totals.get("cust_hostvia"), [{ currency: "USD", netCents: 3500 }]);
  assert.equal(formatCreemPaidTotals(totals.get("cust_hostvia")), "$35.00");
  assert.equal(formatCreemPaidTotals(totals.get("cust_other")), "€10.00");
  assert.equal(
    netCollectedCents({
      status: "refunded",
      amount: 2000,
      amountPaid: 2000,
      refundedAmount: null,
    }),
    0
  );
  assert.equal(readCreemTransactionPage({}), null);
});
