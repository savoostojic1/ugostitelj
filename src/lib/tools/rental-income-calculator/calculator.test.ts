import assert from "node:assert/strict";
import test from "node:test";
import {
  blendedPlatformFeePercent,
  calculate,
  errorsForStep,
  validateInput,
  type CalculationResult,
  type CalculatorInput,
} from "./calculator";
import { OPERATING_EXPENSE_IDS, EXPENSE_DEFINITIONS, type OperatingExpenseId } from "./definitions";
import { createDefaultFormState, toCalculatorInput } from "./form";
import { formatMoney, formatPercent } from "./format";

function baseInput(overrides: Partial<CalculatorInput> = {}): CalculatorInput {
  return {
    propertyCount: 1,
    revenueMode: "simple",
    simple: { nightlyRate: 100, occupancyPercent: 50, nightsInPeriod: 30, unavailableNights: 0 },
    seasonal: [],
    averageStayNights: 3,
    extraRevenuePerBooking: null,
    cleaningFeePerBooking: null,
    expenses: Object.fromEntries(
      OPERATING_EXPENSE_IDS.map((id) => [id, { amount: null, unit: EXPENSE_DEFINITIONS[id].defaultUnit }])
    ) as CalculatorInput["expenses"],
    platformFeeMode: "single",
    platformFee: { amount: null, unit: "percent_revenue" },
    platforms: [],
    financing: { amount: null, unit: "monthly" },
    settings: {
      monthsAvailable: 12,
      includeFinancing: true,
      includeAnnualExpenses: true,
      fixedCostsInClosedMonths: true,
      targetMonthlyProfit: null,
    },
    ...overrides,
  };
}

function withExpense(
  input: CalculatorInput,
  id: OperatingExpenseId,
  amount: number,
  unit: CalculatorInput["expenses"][OperatingExpenseId]["unit"]
): CalculatorInput {
  return { ...input, expenses: { ...input.expenses, [id]: { amount, unit } } };
}

function run(input: CalculatorInput): CalculationResult {
  const outcome = calculate(input);
  if (!outcome.ok) {
    assert.fail(`Expected a result, got errors: ${outcome.errors.map((e) => e.message).join("; ")}`);
  }
  return outcome.result;
}

const close = (actual: number, expected: number, message?: string) =>
  assert.ok(Math.abs(actual - expected) < 1e-6, message ?? `${actual} ≠ ${expected}`);

test("basic revenue for a typical month and a year", () => {
  const r = run(baseInput());
  const m = r.perProperty.typicalMonth!;
  close(m.availableNights, 30);
  close(m.occupiedNights, 15);
  close(m.bookings, 5);
  close(m.baseRevenue, 1500);
  close(m.grossRevenue, 1500);
  close(r.perProperty.annual.grossRevenue, 18000);
  close(r.perProperty.monthlyAverage.grossRevenue, 1500);
});

test("unavailable nights reduce available nights", () => {
  const r = run(baseInput({ simple: { nightlyRate: 100, occupancyPercent: 50, nightsInPeriod: 30, unavailableNights: 10 } }));
  close(r.perProperty.typicalMonth!.availableNights, 20);
  close(r.perProperty.typicalMonth!.occupiedNights, 10);
});

test("zero occupancy gives zero revenue and no NaN", () => {
  const input = withExpense(
    baseInput({ simple: { nightlyRate: 100, occupancyPercent: 0, nightsInPeriod: 30, unavailableNights: 0 } }),
    "utilities",
    100,
    "monthly"
  );
  const r = run(input);
  close(r.perProperty.annual.grossRevenue, 0);
  close(r.perProperty.annual.bookings, 0);
  close(r.perProperty.annual.operatingIncome, -1200);
  assert.equal(r.operatingMargin, null, "margin is not meaningful without revenue");
});

test("100% occupancy fills every available night", () => {
  const r = run(baseInput({ simple: { nightlyRate: 80, occupancyPercent: 100, nightsInPeriod: 31, unavailableNights: 1 } }));
  close(r.perProperty.typicalMonth!.occupiedNights, 30);
  close(r.perProperty.typicalMonth!.grossRevenue, 2400);
});

test("zero expenses: operating income equals revenue, margin 100%", () => {
  const r = run(baseInput());
  close(r.perProperty.annual.operatingExpenses, 0);
  close(r.perProperty.annual.operatingIncome, 18000);
  close(r.operatingMargin!, 1);
  assert.deepEqual(r.breakEven.operating, { status: "no_fixed_costs" });
});

test("fixed monthly expenses", () => {
  const r = run(withExpense(baseInput(), "utilities", 200, "monthly"));
  close(r.perProperty.typicalMonth!.expenses.utilities, 200);
  close(r.perProperty.annual.expenses.utilities, 2400);
  close(r.perProperty.annual.operatingIncome, 18000 - 2400);
});

test("fixed monthly costs in closed months follow the setting", () => {
  const input = withExpense(baseInput(), "utilities", 100, "monthly");
  input.settings = { ...input.settings, monthsAvailable: 6 };
  close(run(input).perProperty.annual.expenses.utilities, 1200);
  input.settings = { ...input.settings, fixedCostsInClosedMonths: false };
  close(run(input).perProperty.annual.expenses.utilities, 600);
  close(run(input).perProperty.annual.grossRevenue, 9000);
});

test("per-booking cleaning costs", () => {
  const r = run(withExpense(baseInput(), "cleaning", 30, "per_booking"));
  close(r.perProperty.typicalMonth!.expenses.cleaning, 150);
  close(r.perProperty.annual.expenses.cleaning, 1800);
});

test("guest-paid cleaning fees are revenue and host cleaning costs are expenses", () => {
  const input = withExpense(baseInput({ cleaningFeePerBooking: 40 }), "cleaning", 30, "per_booking");
  const m = run(input).perProperty.typicalMonth!;
  close(m.cleaningFeeRevenue, 200);
  close(m.grossRevenue, 1700);
  close(m.expenses.cleaning, 150);
  close(m.operatingIncome, 1550);
});

test("additional revenue per booking is part of gross revenue", () => {
  const m = run(baseInput({ extraRevenuePerBooking: 20 })).perProperty.typicalMonth!;
  close(m.extraRevenue, 100);
  close(m.grossRevenue, 1600);
});

test("percentage platform fees apply to gross revenue", () => {
  const input = baseInput({ cleaningFeePerBooking: 40, platformFee: { amount: 15, unit: "percent_revenue" } });
  const m = run(input).perProperty.typicalMonth!;
  close(m.expenses.platform, 0.15 * 1700);
});

test("blended platform fees from several platforms", () => {
  const platforms = [
    { name: "A", sharePercent: 60, feePercent: 15 },
    { name: "B", sharePercent: 30, feePercent: 10 },
  ];
  close(blendedPlatformFeePercent(platforms), 12);
  const r = run(baseInput({ platformFeeMode: "per_platform", platforms }));
  close(r.perProperty.typicalMonth!.expenses.platform, 180);
});

test("platform shares above 100% are rejected", () => {
  const errors = validateInput(
    baseInput({
      platformFeeMode: "per_platform",
      platforms: [
        { name: "A", sharePercent: 70, feePercent: 15 },
        { name: "B", sharePercent: 40, feePercent: 10 },
      ],
    })
  );
  assert.ok(errors.some((e) => e.field === "platforms"));
});

test("annual expenses are spread over 12 months and can be excluded", () => {
  const input = withExpense(baseInput(), "insurance", 1200, "annual");
  const r = run(input);
  close(r.perProperty.typicalMonth!.expenses.insurance, 100);
  close(r.perProperty.annual.expenses.insurance, 1200);
  assert.equal(r.flags.hasAnnualExpenses, true);

  input.settings = { ...input.settings, includeAnnualExpenses: false };
  const excluded = run(input);
  close(excluded.perProperty.annual.expenses.insurance, 0);
  assert.equal(excluded.flags.annualExpensesIncluded, false);
});

test("annual expenses still apply when the property is open only part of the year", () => {
  const input = withExpense(baseInput(), "insurance", 1200, "annual");
  input.settings = { ...input.settings, monthsAvailable: 4 };
  close(run(input).perProperty.annual.expenses.insurance, 1200);
});

test("per-night and percent expenses", () => {
  let input = withExpense(baseInput(), "utilities", 5, "per_night");
  input = withExpense(input, "management", 20, "percent_revenue");
  const m = run(input).perProperty.typicalMonth!;
  close(m.expenses.utilities, 75);
  close(m.expenses.management, 300);
});

test("financing is separate from operating expenses and can be excluded", () => {
  const input = baseInput({ financing: { amount: 500, unit: "monthly" } });
  const r = run(input);
  close(r.perProperty.annual.operatingExpenses, 0);
  close(r.perProperty.annual.financing, 6000);
  close(r.perProperty.annual.cashFlow, 12000);
  assert.equal(r.flags.financingIncluded, true);

  input.settings = { ...input.settings, includeFinancing: false };
  const excluded = run(input);
  close(excluded.perProperty.annual.financing, 0);
  close(excluded.perProperty.annual.cashFlow, excluded.perProperty.annual.operatingIncome);
  assert.equal(excluded.breakEven.cashFlow, null);
});

test("annual financing converts to a monthly figure", () => {
  const r = run(baseInput({ financing: { amount: 6000, unit: "annual" } }));
  close(r.perProperty.typicalMonth!.financing, 500);
});

test("multiple properties multiply every per-property figure", () => {
  const input = withExpense(baseInput({ propertyCount: 3 }), "utilities", 100, "monthly");
  const r = run(input);
  close(r.portfolio.annual.grossRevenue, 3 * 18000);
  close(r.portfolio.annual.expenses.utilities, 3 * 1200);
  close(r.portfolio.typicalMonth!.occupiedNights, 45);
  close(r.operatingMargin!, r.perProperty.annual.operatingIncome / r.perProperty.annual.grossRevenue);
});

test("monthly and annual figures are consistent", () => {
  let input = withExpense(baseInput({ cleaningFeePerBooking: 25 }), "cleaning", 30, "per_booking");
  input = withExpense(input, "insurance", 900, "annual");
  input = withExpense(input, "utilities", 150, "monthly");
  const r = run(input);
  close(r.perProperty.annual.grossRevenue, 12 * r.perProperty.typicalMonth!.grossRevenue);
  close(r.perProperty.annual.operatingIncome, 12 * r.perProperty.typicalMonth!.operatingIncome);
  close(r.perProperty.monthlyAverage.operatingIncome * 12, r.perProperty.annual.operatingIncome);
  const summed = r.months.reduce((s, m) => s + m.operatingIncome, 0);
  close(summed, r.perProperty.annual.operatingIncome);
});

test("seasonal month-by-month calculation sums each month", () => {
  const seasonal = Array.from({ length: 12 }, (_, i) => ({
    availableNights: i < 6 ? 28 : 0,
    occupancyPercent: i < 6 ? (i % 2 === 0 ? 80 : 40) : null,
    nightlyRate: i < 6 ? 100 + i * 10 : null,
  }));
  const input = withExpense(baseInput({ revenueMode: "seasonal", seasonal }), "internet", 50, "monthly");
  const r = run(input);

  let expectedRevenue = 0;
  for (let i = 0; i < 6; i++) expectedRevenue += 28 * (i % 2 === 0 ? 0.8 : 0.4) * (100 + i * 10);
  close(r.perProperty.annual.grossRevenue, expectedRevenue);
  close(r.months[0].grossRevenue, 28 * 0.8 * 100);
  close(r.months[7].grossRevenue, 0);
  assert.equal(r.openMonths, 6);
  assert.equal(r.perProperty.typicalMonth, null);
  close(r.perProperty.annual.expenses.internet, 600);
});

test("seasonal mode rejects nights above the days in a month and an all-closed year", () => {
  const seasonal: CalculatorInput["seasonal"] = Array.from({ length: 12 }, () => ({
    availableNights: 0,
    occupancyPercent: null,
    nightlyRate: null,
  }));
  assert.ok(validateInput(baseInput({ revenueMode: "seasonal", seasonal })).some((e) => e.field === "seasonal"));

  seasonal[1] = { availableNights: 29, occupancyPercent: 50, nightlyRate: 100 };
  assert.ok(
    validateInput(baseInput({ revenueMode: "seasonal", seasonal })).some(
      (e) => e.field === "seasonal.1.availableNights"
    )
  );
});

test("invalid and missing values return errors instead of results", () => {
  const cases: [Partial<CalculatorInput>, string][] = [
    [{ propertyCount: 0 }, "propertyCount"],
    [{ propertyCount: 1.5 }, "propertyCount"],
    [{ propertyCount: null }, "propertyCount"],
    [{ simple: { nightlyRate: -1, occupancyPercent: 50, nightsInPeriod: 30, unavailableNights: 0 } }, "simple.nightlyRate"],
    [{ simple: { nightlyRate: null, occupancyPercent: 50, nightsInPeriod: 30, unavailableNights: 0 } }, "simple.nightlyRate"],
    [{ simple: { nightlyRate: 100, occupancyPercent: 101, nightsInPeriod: 30, unavailableNights: 0 } }, "simple.occupancyPercent"],
    [{ simple: { nightlyRate: 100, occupancyPercent: -5, nightsInPeriod: 30, unavailableNights: 0 } }, "simple.occupancyPercent"],
    [{ simple: { nightlyRate: 100, occupancyPercent: 50, nightsInPeriod: 30, unavailableNights: 31 } }, "simple.unavailableNights"],
    [{ simple: { nightlyRate: Number.NaN, occupancyPercent: 50, nightsInPeriod: 30, unavailableNights: 0 } }, "simple.nightlyRate"],
    [{ simple: { nightlyRate: Infinity, occupancyPercent: 50, nightsInPeriod: 30, unavailableNights: 0 } }, "simple.nightlyRate"],
    [{ averageStayNights: 0 }, "averageStayNights"],
    [{ averageStayNights: null }, "averageStayNights"],
    [{ cleaningFeePerBooking: -10 }, "cleaningFeePerBooking"],
    [{ platformFee: { amount: 120, unit: "percent_revenue" } }, "platformFee"],
    [{ financing: { amount: -1, unit: "monthly" } }, "financing"],
  ];
  for (const [overrides, field] of cases) {
    const outcome = calculate(baseInput(overrides));
    assert.equal(outcome.ok, false, `expected an error for ${field}`);
    if (!outcome.ok) assert.ok(outcome.errors.some((e) => e.field === field), `missing error on ${field}`);
  }

  const negativeExpense = calculate(withExpense(baseInput(), "maintenance", -50, "monthly"));
  assert.equal(negativeExpense.ok, false);
});

test("empty optional fields are treated as zero", () => {
  const input = toCalculatorInput({
    ...createDefaultFormState(),
    nightlyRate: "120",
    averageStayNights: "4",
  });
  const r = run(input);
  close(r.perProperty.typicalMonth!.grossRevenue, 15 * 120);
  close(r.perProperty.annual.operatingExpenses, 0);
});

test("form strings that are not numbers fail validation", () => {
  const input = toCalculatorInput({ ...createDefaultFormState(), nightlyRate: "abc", averageStayNights: "3" });
  const errors = validateInput(input);
  assert.ok(errors.some((e) => e.field === "simple.nightlyRate"));
  assert.equal(errorsForStep(errors, 2).length > 0, true);
  assert.equal(errorsForStep(errors, 1).length, 0);
});

test("break-even occupancy with fixed and variable costs", () => {
  // Revenue per occupied night = 100 + 30/3 = 110. After 10% fee: 99.
  // Minus cleaning 30/3 = 10 → 89 per night. Fixed = 890 per month, 30 nights.
  // Break-even o = 890 / (30 × 89) = 1/3.
  let input = baseInput({ cleaningFeePerBooking: 30, platformFee: { amount: 10, unit: "percent_revenue" } });
  input = withExpense(input, "cleaning", 30, "per_booking");
  input = withExpense(input, "utilities", 890, "monthly");
  const be = run(input).breakEven.operating;
  assert.equal(be.status, "ok");
  if (be.status === "ok") close(be.occupancy, 1 / 3);
});

test("break-even accounts for financing separately", () => {
  const input = withExpense(baseInput({ financing: { amount: 600, unit: "monthly" } }), "utilities", 300, "monthly");
  const r = run(input);
  assert.equal(r.breakEven.operating.status, "ok");
  if (r.breakEven.operating.status === "ok") close(r.breakEven.operating.occupancy, 300 / 3000);
  assert.equal(r.breakEven.cashFlow?.status, "ok");
  if (r.breakEven.cashFlow?.status === "ok") close(r.breakEven.cashFlow.occupancy, 900 / 3000);
});

test("break-even edge cases", () => {
  const above = run(withExpense(baseInput(), "utilities", 5000, "monthly")).breakEven.operating;
  assert.equal(above.status, "above_100");

  const fees = run(
    withExpense(baseInput({ platformFee: { amount: 100, unit: "percent_revenue" } }), "utilities", 100, "monthly")
  ).breakEven.operating;
  assert.equal(fees.status, "unreachable");

  const freeNights = run(
    withExpense(
      baseInput({ simple: { nightlyRate: 0, occupancyPercent: 50, nightsInPeriod: 30, unavailableNights: 0 } }),
      "utilities",
      100,
      "monthly"
    )
  ).breakEven.operating;
  assert.equal(freeNights.status, "unreachable");

  const noNights = run(
    withExpense(
      baseInput({ simple: { nightlyRate: 100, occupancyPercent: 50, nightsInPeriod: 30, unavailableNights: 30 } }),
      "utilities",
      100,
      "monthly"
    )
  ).breakEven.operating;
  assert.equal(noNights.status, "insufficient");
});

test("target monthly profit reports the required occupancy", () => {
  const input = withExpense(baseInput({ propertyCount: 2 }), "utilities", 300, "monthly");
  input.settings = { ...input.settings, targetMonthlyProfit: 2400 };
  const target = run(input).target!;
  assert.equal(target.basis, "operating_income");
  // Per property: need 300 + 1200 = 1500 per month from 30 nights × 100.
  assert.equal(target.requiredOccupancy.status, "ok");
  if (target.requiredOccupancy.status === "ok") close(target.requiredOccupancy.occupancy, 0.5);
  close(target.currentMonthlyAverage, 2 * (1500 - 300));
  close(target.shortfallMonthly, 0);
});

test("no result contains NaN or Infinity, and formatting guards bad values", () => {
  const r = run(withExpense(baseInput({ averageStayNights: 1 }), "other", 0, "per_booking"));
  const scan = (value: unknown): void => {
    if (typeof value === "number") assert.ok(Number.isFinite(value));
    else if (value && typeof value === "object") Object.values(value).forEach(scan);
  };
  scan(r);
  assert.equal(formatMoney(Number.NaN, "EUR"), "—");
  assert.equal(formatPercent(Infinity), "—");
  assert.equal(formatMoney(-0.4, "USD"), "$0");
  assert.equal(formatMoney(1234.56, "GBP"), "£1,235");
});
