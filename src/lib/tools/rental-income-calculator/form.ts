import type {
  CalculatorInput,
  ExpenseInput,
  PlatformFeeMode,
  RevenueMode,
} from "./calculator";
import {
  DAYS_IN_MONTH,
  EXPENSE_DEFINITIONS,
  OPERATING_EXPENSE_IDS,
  type ExpenseUnit,
  type FinancingUnit,
  type OperatingExpenseId,
} from "./definitions";

/**
 * Form state keeps raw strings so that half-typed values survive navigation
 * between steps. `toCalculatorInput` converts them for the calculation module.
 */
export interface ExpenseFormValue {
  amount: string;
  unit: ExpenseUnit;
}

export interface CalculatorFormState {
  propertyCount: string;
  propertyType: string;
  country: string;
  currency: string;
  revenueMode: RevenueMode;
  nightlyRate: string;
  occupancyPercent: string;
  nightsInPeriod: string;
  unavailableNights: string;
  seasonal: { availableNights: string; occupancyPercent: string; nightlyRate: string }[];
  averageStayNights: string;
  extraRevenuePerBooking: string;
  cleaningFeePerBooking: string;
  expenses: Record<OperatingExpenseId, ExpenseFormValue>;
  platformFeeMode: PlatformFeeMode;
  platformFee: ExpenseFormValue;
  platforms: { name: string; sharePercent: string; feePercent: string }[];
  financingAmount: string;
  financingUnit: FinancingUnit;
  monthsAvailable: string;
  includeFinancing: boolean;
  includeAnnualExpenses: boolean;
  fixedCostsInClosedMonths: boolean;
  targetMonthlyProfit: string;
}

export function parseNumberInput(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const parsed = Number(trimmed);
  return parsed;
}

export function createDefaultFormState(): CalculatorFormState {
  return {
    propertyCount: "1",
    propertyType: "apartment",
    country: "",
    currency: "EUR",
    revenueMode: "simple",
    nightlyRate: "",
    occupancyPercent: "50",
    nightsInPeriod: "30",
    unavailableNights: "0",
    seasonal: DAYS_IN_MONTH.map((days) => ({
      availableNights: String(days),
      occupancyPercent: "",
      nightlyRate: "",
    })),
    averageStayNights: "",
    extraRevenuePerBooking: "",
    cleaningFeePerBooking: "",
    expenses: Object.fromEntries(
      OPERATING_EXPENSE_IDS.map((id) => [
        id,
        { amount: "", unit: EXPENSE_DEFINITIONS[id].defaultUnit },
      ])
    ) as Record<OperatingExpenseId, ExpenseFormValue>,
    platformFeeMode: "single",
    platformFee: { amount: "", unit: "percent_revenue" },
    platforms: [
      { name: "", sharePercent: "", feePercent: "" },
      { name: "", sharePercent: "", feePercent: "" },
    ],
    financingAmount: "",
    financingUnit: "monthly",
    monthsAvailable: "12",
    includeFinancing: true,
    includeAnnualExpenses: true,
    fixedCostsInClosedMonths: true,
    targetMonthlyProfit: "",
  };
}

function toExpense(value: ExpenseFormValue): ExpenseInput {
  return { amount: parseNumberInput(value.amount), unit: value.unit };
}

/** Fixed length for simple-mode “typical month”. Months vary; seasonal mode is for exact lengths. */
export const TYPICAL_MONTH_NIGHTS = 30;

export function toCalculatorInput(form: CalculatorFormState): CalculatorInput {
  return {
    propertyCount: parseNumberInput(form.propertyCount),
    revenueMode: form.revenueMode,
    simple: {
      nightlyRate: parseNumberInput(form.nightlyRate),
      occupancyPercent: parseNumberInput(form.occupancyPercent),
      // Always 30 in the UI — users should not have to pick 28/30/31 for a rough estimate.
      nightsInPeriod: TYPICAL_MONTH_NIGHTS,
      unavailableNights: parseNumberInput(form.unavailableNights),
    },
    seasonal: form.seasonal.map((m) => ({
      availableNights: parseNumberInput(m.availableNights),
      occupancyPercent: parseNumberInput(m.occupancyPercent),
      nightlyRate: parseNumberInput(m.nightlyRate),
    })),
    averageStayNights: parseNumberInput(form.averageStayNights),
    extraRevenuePerBooking: parseNumberInput(form.extraRevenuePerBooking),
    cleaningFeePerBooking: parseNumberInput(form.cleaningFeePerBooking),
    expenses: Object.fromEntries(
      OPERATING_EXPENSE_IDS.map((id) => [id, toExpense(form.expenses[id])])
    ) as Record<OperatingExpenseId, ExpenseInput>,
    platformFeeMode: form.platformFeeMode,
    platformFee: toExpense(form.platformFee),
    platforms: form.platforms.map((p) => ({
      name: p.name,
      sharePercent: parseNumberInput(p.sharePercent),
      feePercent: parseNumberInput(p.feePercent),
    })),
    financing: {
      amount: parseNumberInput(form.financingAmount),
      unit: form.financingUnit,
    },
    settings: {
      monthsAvailable: parseNumberInput(form.monthsAvailable),
      includeFinancing: form.includeFinancing,
      includeAnnualExpenses: form.includeAnnualExpenses,
      fixedCostsInClosedMonths: form.fixedCostsInClosedMonths,
      targetMonthlyProfit: parseNumberInput(form.targetMonthlyProfit),
    },
  };
}
