/**
 * Vacation rental income model.
 *
 * All inputs describe ONE property. Portfolio figures multiply every
 * per-property figure by `propertyCount`, so they assume each property shares
 * the same averages.
 *
 * For each month:
 *   available nights   = nights in period − unavailable nights   (simple mode)
 *                      = entered available nights               (seasonal mode)
 *   occupied nights    = available nights × occupancy
 *   bookings           = occupied nights ÷ average length of stay
 *   base revenue       = occupied nights × nightly rate
 *   extra revenue      = bookings × additional revenue per booking
 *   cleaning-fee rev.  = bookings × cleaning fee charged to guests
 *   gross revenue      = base + extra + cleaning-fee revenue
 *
 * Expense units, converted to a month:
 *   monthly            → amount (closed months only if fixed costs continue)
 *   annual             → amount ÷ 12, every month (only if annual costs are included)
 *   per booking        → amount × bookings
 *   per occupied night → amount × occupied nights
 *   % of revenue       → amount ÷ 100 × gross revenue
 *
 *   operating income   = gross revenue − operating expenses
 *   cash flow          = operating income − financing (mortgage/rent), when included
 *
 * The annual figure is the sum of 12 months. In simple mode the first
 * `monthsAvailable` months use the typical-month inputs and the rest are closed.
 * Values keep full precision; round only when formatting.
 */
import {
  DAYS_IN_MONTH,
  OPERATING_EXPENSE_IDS,
  type ExpenseKey,
  type ExpenseUnit,
  type FinancingUnit,
  type OperatingExpenseId,
} from "./definitions";

export type RevenueMode = "simple" | "seasonal";
export type PlatformFeeMode = "single" | "per_platform";

export interface ExpenseInput {
  amount: number | null;
  unit: ExpenseUnit;
}

export interface SeasonalMonthInput {
  availableNights: number | null;
  occupancyPercent: number | null;
  nightlyRate: number | null;
}

export interface PlatformInput {
  name: string;
  /** Share of gross revenue booked through this platform. */
  sharePercent: number | null;
  feePercent: number | null;
}

export interface CalculatorInput {
  propertyCount: number | null;
  revenueMode: RevenueMode;
  simple: {
    nightlyRate: number | null;
    occupancyPercent: number | null;
    nightsInPeriod: number | null;
    unavailableNights: number | null;
  };
  seasonal: SeasonalMonthInput[];
  averageStayNights: number | null;
  extraRevenuePerBooking: number | null;
  /** Guest-paid cleaning fee. Revenue, not a cost. */
  cleaningFeePerBooking: number | null;
  expenses: Record<OperatingExpenseId, ExpenseInput>;
  platformFeeMode: PlatformFeeMode;
  platformFee: ExpenseInput;
  platforms: PlatformInput[];
  financing: { amount: number | null; unit: FinancingUnit };
  settings: {
    monthsAvailable: number | null;
    includeFinancing: boolean;
    includeAnnualExpenses: boolean;
    fixedCostsInClosedMonths: boolean;
    targetMonthlyProfit: number | null;
  };
}

export type CalculatorStep = 1 | 2 | 3 | 4;

export interface ValidationError {
  field: string;
  step: CalculatorStep;
  message: string;
}

export interface Totals {
  availableNights: number;
  occupiedNights: number;
  bookings: number;
  baseRevenue: number;
  extraRevenue: number;
  cleaningFeeRevenue: number;
  grossRevenue: number;
  expenses: Record<ExpenseKey, number>;
  operatingExpenses: number;
  operatingIncome: number;
  financing: number;
  cashFlow: number;
}

export interface MonthResult extends Totals {
  monthIndex: number;
  open: boolean;
}

export type BreakEven =
  | { status: "ok"; occupancy: number }
  | { status: "no_fixed_costs" }
  | { status: "above_100"; occupancy: number }
  | { status: "unreachable" }
  | { status: "insufficient" };

export interface TargetResult {
  targetMonthly: number;
  basis: "operating_income" | "cash_flow";
  currentMonthlyAverage: number;
  shortfallMonthly: number;
  requiredOccupancy: BreakEven;
}

export interface FigureSet {
  annual: Totals;
  monthlyAverage: Totals;
  typicalMonth: Totals | null;
}

export interface CalculationResult {
  mode: RevenueMode;
  propertyCount: number;
  openMonths: number;
  months: MonthResult[];
  perProperty: FigureSet;
  portfolio: FigureSet;
  operatingMargin: number | null;
  breakEven: { operating: BreakEven; cashFlow: BreakEven | null };
  target: TargetResult | null;
  flags: {
    financingIncluded: boolean;
    annualExpensesIncluded: boolean;
    hasAnnualExpenses: boolean;
    hasExtraRevenue: boolean;
    hasCleaningFeeRevenue: boolean;
  };
}

export type CalculationOutcome =
  | { ok: true; result: CalculationResult }
  | { ok: false; errors: ValidationError[] };

const EXPENSE_KEYS: ExpenseKey[] = [...OPERATING_EXPENSE_IDS, "platform"];

const MAX_PROPERTIES = 500;
const MAX_PLATFORMS = 6;

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

interface NumberRule {
  field: string;
  step: CalculatorStep;
  label: string;
  required?: boolean;
  min?: number;
  max?: number;
  integer?: boolean;
  maxMessage?: string;
}

function checkNumber(
  value: number | null,
  rule: NumberRule,
  errors: ValidationError[]
): boolean {
  const push = (message: string) => {
    errors.push({ field: rule.field, step: rule.step, message });
    return false;
  };

  if (value === null) {
    return rule.required ? push(`Enter ${rule.label}.`) : true;
  }
  if (!Number.isFinite(value)) return push(`Enter a valid number for ${rule.label}.`);
  if (rule.min !== undefined && value < rule.min) {
    return push(
      rule.min === 0
        ? `${capitalize(rule.label)} can't be negative.`
        : `${capitalize(rule.label)} must be at least ${rule.min}.`
    );
  }
  if (rule.max !== undefined && value > rule.max) {
    return push(rule.maxMessage ?? `${capitalize(rule.label)} can't be more than ${rule.max}.`);
  }
  if (rule.integer && !Number.isInteger(value)) {
    return push(`${capitalize(rule.label)} must be a whole number.`);
  }
  return true;
}

function capitalize(text: string): string {
  const stripped = text.replace(/^(the|your|a|an) /, "");
  return stripped.charAt(0).toUpperCase() + stripped.slice(1);
}

function checkExpense(
  input: ExpenseInput,
  field: string,
  label: string,
  errors: ValidationError[]
) {
  checkNumber(
    input.amount,
    input.unit === "percent_revenue"
      ? {
          field,
          step: 3,
          label,
          min: 0,
          max: 100,
          maxMessage: `${capitalize(label)} can't be more than 100% of revenue.`,
        }
      : { field, step: 3, label, min: 0 },
    errors
  );
}

export function validateInput(input: CalculatorInput): ValidationError[] {
  const errors: ValidationError[] = [];

  checkNumber(
    input.propertyCount,
    {
      field: "propertyCount",
      step: 1,
      label: "the number of properties",
      required: true,
      min: 1,
      max: MAX_PROPERTIES,
      integer: true,
    },
    errors
  );

  if (input.revenueMode === "simple") {
    const s = input.simple;
    checkNumber(
      s.nightlyRate,
      { field: "simple.nightlyRate", step: 2, label: "the average nightly rate", required: true, min: 0 },
      errors
    );
    checkNumber(
      s.occupancyPercent,
      {
        field: "simple.occupancyPercent",
        step: 2,
        label: "the expected occupancy rate",
        required: true,
        min: 0,
        max: 100,
        maxMessage: "Occupancy must be between 0% and 100%.",
      },
      errors
    );
    const nightsOk = checkNumber(
      s.nightsInPeriod,
      {
        field: "simple.nightsInPeriod",
        step: 2,
        label: "the number of nights in the month",
        required: true,
        min: 1,
        max: 31,
        integer: true,
      },
      errors
    );
    const unavailableOk = checkNumber(
      s.unavailableNights,
      { field: "simple.unavailableNights", step: 2, label: "unavailable nights", min: 0, integer: true },
      errors
    );
    if (
      nightsOk &&
      unavailableOk &&
      s.nightsInPeriod !== null &&
      s.unavailableNights !== null &&
      s.unavailableNights > s.nightsInPeriod
    ) {
      errors.push({
        field: "simple.unavailableNights",
        step: 2,
        message: "Unavailable nights can't be more than the 30 nights in a typical month.",
      });
    }
  } else {
    if (input.seasonal.length !== 12) {
      errors.push({ field: "seasonal", step: 2, message: "Enter figures for all 12 months." });
    }
    let anyOpen = false;
    input.seasonal.forEach((month, i) => {
      const days = DAYS_IN_MONTH[i] ?? 31;
      const availOk = checkNumber(
        month.availableNights,
        {
          field: `seasonal.${i}.availableNights`,
          step: 2,
          label: "available nights (0 if closed)",
          required: true,
          min: 0,
          max: days,
          integer: true,
          maxMessage: `This month has ${days} nights at most.`,
        },
        errors
      );
      const open = availOk && (month.availableNights ?? 0) > 0;
      if (open) anyOpen = true;
      checkNumber(
        month.occupancyPercent,
        {
          field: `seasonal.${i}.occupancyPercent`,
          step: 2,
          label: "occupancy",
          required: open,
          min: 0,
          max: 100,
          maxMessage: "Occupancy must be between 0% and 100%.",
        },
        errors
      );
      checkNumber(
        month.nightlyRate,
        { field: `seasonal.${i}.nightlyRate`, step: 2, label: "the nightly rate", required: open, min: 0 },
        errors
      );
    });
    if (input.seasonal.length === 12 && !anyOpen && !errors.some((e) => e.field.startsWith("seasonal."))) {
      errors.push({
        field: "seasonal",
        step: 2,
        message: "Enter available nights for at least one month.",
      });
    }
  }

  checkNumber(
    input.averageStayNights,
    {
      field: "averageStayNights",
      step: 2,
      label: "the average length of stay",
      required: true,
      min: 1,
      max: 365,
    },
    errors
  );
  checkNumber(
    input.extraRevenuePerBooking,
    { field: "extraRevenuePerBooking", step: 2, label: "additional revenue per booking", min: 0 },
    errors
  );
  checkNumber(
    input.cleaningFeePerBooking,
    { field: "cleaningFeePerBooking", step: 3, label: "the cleaning fee charged to guests", min: 0 },
    errors
  );

  for (const id of OPERATING_EXPENSE_IDS) {
    checkExpense(input.expenses[id], `expenses.${id}`, "this expense", errors);
  }

  if (input.platformFeeMode === "single") {
    checkExpense(input.platformFee, "platformFee", "the platform fee", errors);
  } else {
    if (input.platforms.length === 0 || input.platforms.length > MAX_PLATFORMS) {
      errors.push({
        field: "platforms",
        step: 3,
        message: `Add between 1 and ${MAX_PLATFORMS} platforms.`,
      });
    }
    let shareTotal = 0;
    let sharesValid = true;
    input.platforms.forEach((p, i) => {
      const shareOk = checkNumber(
        p.sharePercent,
        {
          field: `platforms.${i}.sharePercent`,
          step: 3,
          label: "the share of revenue",
          min: 0,
          max: 100,
          maxMessage: "Share must be between 0% and 100%.",
        },
        errors
      );
      checkNumber(
        p.feePercent,
        {
          field: `platforms.${i}.feePercent`,
          step: 3,
          label: "the fee",
          min: 0,
          max: 100,
          maxMessage: "Fee must be between 0% and 100%.",
        },
        errors
      );
      if (!shareOk) sharesValid = false;
      shareTotal += p.sharePercent ?? 0;
    });
    if (sharesValid && shareTotal > 100 + 1e-9) {
      errors.push({
        field: "platforms",
        step: 3,
        message: "Platform shares add up to more than 100% of revenue.",
      });
    }
  }

  checkNumber(
    input.financing.amount,
    { field: "financing", step: 3, label: "the mortgage or rent payment", min: 0 },
    errors
  );

  if (input.revenueMode === "simple") {
    checkNumber(
      input.settings.monthsAvailable,
      {
        field: "settings.monthsAvailable",
        step: 4,
        label: "the number of months available",
        required: true,
        min: 1,
        max: 12,
        integer: true,
      },
      errors
    );
  }
  checkNumber(
    input.settings.targetMonthlyProfit,
    { field: "settings.targetMonthlyProfit", step: 4, label: "the target monthly profit", min: 0 },
    errors
  );

  return errors;
}

export function errorsForStep(
  errors: ValidationError[],
  step: CalculatorStep
): ValidationError[] {
  return errors.filter((e) => e.step === step);
}

/* ------------------------------------------------------------------ */
/* Calculation                                                         */
/* ------------------------------------------------------------------ */

interface NormalizedExpense {
  key: ExpenseKey;
  amount: number;
  unit: ExpenseUnit;
}

interface MonthInputs {
  open: boolean;
  availableNights: number;
  occupancy: number;
  nightlyRate: number;
}

interface Context {
  averageStay: number;
  extraPerBooking: number;
  cleaningFee: number;
  expenses: NormalizedExpense[];
  financingMonthly: number;
  includeFinancing: boolean;
  includeAnnual: boolean;
  fixedInClosed: boolean;
}

const n = (value: number | null | undefined): number =>
  value !== null && value !== undefined && Number.isFinite(value) ? value : 0;

function emptyExpenses(): Record<ExpenseKey, number> {
  return Object.fromEntries(EXPENSE_KEYS.map((k) => [k, 0])) as Record<ExpenseKey, number>;
}

function emptyTotals(): Totals {
  return {
    availableNights: 0,
    occupiedNights: 0,
    bookings: 0,
    baseRevenue: 0,
    extraRevenue: 0,
    cleaningFeeRevenue: 0,
    grossRevenue: 0,
    expenses: emptyExpenses(),
    operatingExpenses: 0,
    operatingIncome: 0,
    financing: 0,
    cashFlow: 0,
  };
}

/** Blended platform fee as a % of gross revenue. Unassigned share is fee-free (for example direct bookings). */
export function blendedPlatformFeePercent(platforms: PlatformInput[]): number {
  return platforms.reduce((sum, p) => sum + (n(p.sharePercent) * n(p.feePercent)) / 100, 0);
}

function normalizeExpenses(input: CalculatorInput): NormalizedExpense[] {
  const list: NormalizedExpense[] = OPERATING_EXPENSE_IDS.map((id) => ({
    key: id,
    amount: n(input.expenses[id].amount),
    unit: input.expenses[id].unit,
  }));
  if (input.platformFeeMode === "single") {
    list.push({ key: "platform", amount: n(input.platformFee.amount), unit: input.platformFee.unit });
  } else {
    list.push({
      key: "platform",
      amount: blendedPlatformFeePercent(input.platforms),
      unit: "percent_revenue",
    });
  }
  return list.filter((e) => e.amount > 0);
}

function expenseForMonth(
  e: NormalizedExpense,
  month: MonthInputs,
  occupied: number,
  bookings: number,
  gross: number,
  ctx: Context
): number {
  switch (e.unit) {
    case "monthly":
      return month.open || ctx.fixedInClosed ? e.amount : 0;
    case "annual":
      return ctx.includeAnnual ? e.amount / 12 : 0;
    case "per_booking":
      return e.amount * bookings;
    case "per_night":
      return e.amount * occupied;
    case "percent_revenue":
      return (e.amount / 100) * gross;
  }
}

function computeMonth(month: MonthInputs, ctx: Context): Totals {
  const t = emptyTotals();
  const available = month.open ? month.availableNights : 0;
  const occupied = available * month.occupancy;
  const bookings = ctx.averageStay > 0 ? occupied / ctx.averageStay : 0;

  t.availableNights = available;
  t.occupiedNights = occupied;
  t.bookings = bookings;
  t.baseRevenue = occupied * month.nightlyRate;
  t.extraRevenue = bookings * ctx.extraPerBooking;
  t.cleaningFeeRevenue = bookings * ctx.cleaningFee;
  t.grossRevenue = t.baseRevenue + t.extraRevenue + t.cleaningFeeRevenue;

  for (const e of ctx.expenses) {
    t.expenses[e.key] += expenseForMonth(e, month, occupied, bookings, t.grossRevenue, ctx);
  }
  t.operatingExpenses = EXPENSE_KEYS.reduce((sum, k) => sum + t.expenses[k], 0);
  t.operatingIncome = t.grossRevenue - t.operatingExpenses;
  t.financing = ctx.includeFinancing ? ctx.financingMonthly : 0;
  t.cashFlow = t.operatingIncome - t.financing;
  return t;
}

function addTotals(a: Totals, b: Totals): Totals {
  const expenses = emptyExpenses();
  for (const k of EXPENSE_KEYS) expenses[k] = a.expenses[k] + b.expenses[k];
  return {
    availableNights: a.availableNights + b.availableNights,
    occupiedNights: a.occupiedNights + b.occupiedNights,
    bookings: a.bookings + b.bookings,
    baseRevenue: a.baseRevenue + b.baseRevenue,
    extraRevenue: a.extraRevenue + b.extraRevenue,
    cleaningFeeRevenue: a.cleaningFeeRevenue + b.cleaningFeeRevenue,
    grossRevenue: a.grossRevenue + b.grossRevenue,
    expenses,
    operatingExpenses: a.operatingExpenses + b.operatingExpenses,
    operatingIncome: a.operatingIncome + b.operatingIncome,
    financing: a.financing + b.financing,
    cashFlow: a.cashFlow + b.cashFlow,
  };
}

function scaleTotals(t: Totals, factor: number): Totals {
  const expenses = emptyExpenses();
  for (const k of EXPENSE_KEYS) expenses[k] = t.expenses[k] * factor;
  return {
    availableNights: t.availableNights * factor,
    occupiedNights: t.occupiedNights * factor,
    bookings: t.bookings * factor,
    baseRevenue: t.baseRevenue * factor,
    extraRevenue: t.extraRevenue * factor,
    cleaningFeeRevenue: t.cleaningFeeRevenue * factor,
    grossRevenue: t.grossRevenue * factor,
    expenses,
    operatingExpenses: t.operatingExpenses * factor,
    operatingIncome: t.operatingIncome * factor,
    financing: t.financing * factor,
    cashFlow: t.cashFlow * factor,
  };
}

function buildMonths(input: CalculatorInput): MonthInputs[] {
  if (input.revenueMode === "seasonal") {
    return input.seasonal.map((m) => {
      const available = n(m.availableNights);
      return {
        open: available > 0,
        availableNights: available,
        occupancy: n(m.occupancyPercent) / 100,
        nightlyRate: n(m.nightlyRate),
      };
    });
  }
  const s = input.simple;
  const typical: MonthInputs = {
    open: true,
    availableNights: Math.max(0, n(s.nightsInPeriod) - n(s.unavailableNights)),
    occupancy: n(s.occupancyPercent) / 100,
    nightlyRate: n(s.nightlyRate),
  };
  const openMonths = n(input.settings.monthsAvailable);
  return Array.from({ length: 12 }, (_, i) =>
    i < openMonths ? typical : { ...typical, open: false }
  );
}

/**
 * Solves for one occupancy rate, applied to every open month, at which
 * income after the chosen costs equals `requiredSurplus` for the year.
 *
 * Income is linear in occupancy o:  income(o) = o × Σ(available × contribution per night) − fixed costs.
 */
function solveOccupancy(
  months: MonthInputs[],
  ctx: Context,
  includeFinancing: boolean,
  requiredSurplus: number
): BreakEven {
  const totalAvailable = months.reduce((s, m) => s + (m.open ? m.availableNights : 0), 0);
  if (totalAvailable <= 0) return { status: "insufficient" };

  const percentShare = ctx.expenses
    .filter((e) => e.unit === "percent_revenue")
    .reduce((s, e) => s + e.amount / 100, 0);
  const perNight = ctx.expenses
    .filter((e) => e.unit === "per_night")
    .reduce((s, e) => s + e.amount, 0);
  const perBooking = ctx.expenses
    .filter((e) => e.unit === "per_booking")
    .reduce((s, e) => s + e.amount, 0);
  const perBookingRevenue = ctx.extraPerBooking + ctx.cleaningFee;

  let contribution = 0;
  let fixed = 0;
  for (const m of months) {
    for (const e of ctx.expenses) {
      if (e.unit === "monthly" && (m.open || ctx.fixedInClosed)) fixed += e.amount;
      if (e.unit === "annual" && ctx.includeAnnual) fixed += e.amount / 12;
    }
    if (includeFinancing) fixed += ctx.financingMonthly;
    if (!m.open) continue;
    const revenuePerNight = m.nightlyRate + perBookingRevenue / ctx.averageStay;
    const perNightContribution =
      revenuePerNight * (1 - percentShare) - perNight - perBooking / ctx.averageStay;
    contribution += m.availableNights * perNightContribution;
  }

  const needed = fixed + requiredSurplus;
  if (contribution < 0) return { status: "unreachable" };
  if (needed <= 0) return { status: "no_fixed_costs" };
  if (contribution === 0) return { status: "unreachable" };
  const occupancy = needed / contribution;
  if (occupancy > 1) return { status: "above_100", occupancy };
  return { status: "ok", occupancy };
}

function isFiniteDeep(value: unknown): boolean {
  if (typeof value === "number") return Number.isFinite(value);
  if (Array.isArray(value)) return value.every(isFiniteDeep);
  if (value && typeof value === "object") return Object.values(value).every(isFiniteDeep);
  return true;
}

export function calculate(input: CalculatorInput): CalculationOutcome {
  const errors = validateInput(input);
  if (errors.length > 0) return { ok: false, errors };

  const propertyCount = n(input.propertyCount);
  const expenses = normalizeExpenses(input);
  const financingAmount = n(input.financing.amount);
  const ctx: Context = {
    averageStay: n(input.averageStayNights),
    extraPerBooking: n(input.extraRevenuePerBooking),
    cleaningFee: n(input.cleaningFeePerBooking),
    expenses,
    financingMonthly:
      input.financing.unit === "annual" ? financingAmount / 12 : financingAmount,
    includeFinancing: input.settings.includeFinancing && financingAmount > 0,
    includeAnnual: input.settings.includeAnnualExpenses,
    fixedInClosed: input.settings.fixedCostsInClosedMonths,
  };

  const monthInputs = buildMonths(input);
  const months: MonthResult[] = monthInputs.map((m, monthIndex) => ({
    ...computeMonth(m, ctx),
    monthIndex,
    open: m.open,
  }));

  const annual = months.reduce<Totals>((acc, m) => addTotals(acc, m), emptyTotals());
  const typicalMonth =
    input.revenueMode === "simple"
      ? computeMonth({ ...monthInputs[0], open: true }, ctx)
      : null;

  const perProperty: FigureSet = {
    annual,
    monthlyAverage: scaleTotals(annual, 1 / 12),
    typicalMonth,
  };
  const portfolio: FigureSet = {
    annual: scaleTotals(annual, propertyCount),
    monthlyAverage: scaleTotals(annual, propertyCount / 12),
    typicalMonth: typicalMonth ? scaleTotals(typicalMonth, propertyCount) : null,
  };

  const target = input.settings.targetMonthlyProfit;
  let targetResult: TargetResult | null = null;
  if (target !== null && target > 0) {
    const basis = ctx.includeFinancing ? "cash_flow" : "operating_income";
    const current =
      basis === "cash_flow" ? portfolio.monthlyAverage.cashFlow : portfolio.monthlyAverage.operatingIncome;
    targetResult = {
      targetMonthly: target,
      basis,
      currentMonthlyAverage: current,
      shortfallMonthly: Math.max(0, target - current),
      requiredOccupancy: solveOccupancy(
        monthInputs,
        ctx,
        ctx.includeFinancing,
        (target * 12) / propertyCount
      ),
    };
  }

  const result: CalculationResult = {
    mode: input.revenueMode,
    propertyCount,
    openMonths: monthInputs.filter((m) => m.open).length,
    months,
    perProperty,
    portfolio,
    operatingMargin: annual.grossRevenue > 0 ? annual.operatingIncome / annual.grossRevenue : null,
    breakEven: {
      operating: solveOccupancy(monthInputs, ctx, false, 0),
      cashFlow: ctx.includeFinancing ? solveOccupancy(monthInputs, ctx, true, 0) : null,
    },
    target: targetResult,
    flags: {
      financingIncluded: ctx.includeFinancing,
      annualExpensesIncluded: ctx.includeAnnual,
      hasAnnualExpenses: expenses.some((e) => e.unit === "annual"),
      hasExtraRevenue: ctx.extraPerBooking > 0,
      hasCleaningFeeRevenue: ctx.cleaningFee > 0,
    },
  };

  if (!isFiniteDeep(result)) {
    return {
      ok: false,
      errors: [
        {
          field: "general",
          step: 2,
          message: "Some values are too large to calculate. Check the figures you entered.",
        },
      ],
    };
  }

  return { ok: true, result };
}
