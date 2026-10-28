export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

/** Non-leap year. The seasonal editor caps each month at these values. */
export const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

export type ExpenseUnit =
  | "monthly"
  | "annual"
  | "per_booking"
  | "per_night"
  | "percent_revenue";

export const EXPENSE_UNIT_LABELS: Record<ExpenseUnit, string> = {
  monthly: "per month",
  annual: "per year",
  per_booking: "per booking",
  per_night: "per occupied night",
  percent_revenue: "% of gross revenue",
};

export const OPERATING_EXPENSE_IDS = [
  "cleaning",
  "laundry",
  "utilities",
  "internet",
  "maintenance",
  "insurance",
  "management",
  "taxes",
  "other",
] as const;

export type OperatingExpenseId = (typeof OPERATING_EXPENSE_IDS)[number];

/** Every operating cost bucket shown in the breakdown. Financing is kept separate. */
export type ExpenseKey = OperatingExpenseId | "platform";

export interface ExpenseDefinition {
  label: string;
  help: string;
  units: readonly ExpenseUnit[];
  defaultUnit: ExpenseUnit;
}

export const EXPENSE_DEFINITIONS: Record<OperatingExpenseId, ExpenseDefinition> = {
  cleaning: {
    label: "Cleaning cost paid by you",
    help: "What you pay a cleaner or service for each turnover.",
    units: ["per_booking", "monthly"],
    defaultUnit: "per_booking",
  },
  laundry: {
    label: "Laundry and consumables",
    help: "Linen service, toiletries, coffee, cleaning supplies.",
    units: ["per_booking", "per_night", "monthly"],
    defaultUnit: "per_booking",
  },
  utilities: {
    label: "Utilities",
    help: "Electricity, water, gas and heating.",
    units: ["monthly", "per_night", "annual"],
    defaultUnit: "monthly",
  },
  internet: {
    label: "Internet and subscriptions",
    help: "Wi-Fi, TV, software and other recurring services.",
    units: ["monthly", "annual"],
    defaultUnit: "monthly",
  },
  maintenance: {
    label: "Maintenance and repairs",
    help: "Routine upkeep and an allowance for repairs.",
    units: ["monthly", "annual", "percent_revenue"],
    defaultUnit: "monthly",
  },
  insurance: {
    label: "Insurance",
    help: "Building, contents or short-term rental cover.",
    units: ["annual", "monthly"],
    defaultUnit: "annual",
  },
  management: {
    label: "Property management fees",
    help: "Leave empty if you manage the property yourself.",
    units: ["percent_revenue", "monthly", "per_booking"],
    defaultUnit: "percent_revenue",
  },
  taxes: {
    label: "Property taxes and other taxes",
    help: "Optional. Enter amounts you know apply to you. Tax rules depend on where you operate.",
    units: ["annual", "monthly", "percent_revenue"],
    defaultUnit: "annual",
  },
  other: {
    label: "Other operating expenses",
    help: "Licences, accounting, furnishing replacements, anything else.",
    units: ["monthly", "annual", "per_booking", "per_night", "percent_revenue"],
    defaultUnit: "monthly",
  },
};

export const PLATFORM_FEE_UNITS: readonly ExpenseUnit[] = [
  "percent_revenue",
  "per_booking",
  "monthly",
];

export const FINANCING_UNITS = ["monthly", "annual"] as const;
export type FinancingUnit = (typeof FINANCING_UNITS)[number];

export const EXPENSE_KEY_LABELS: Record<ExpenseKey, string> = {
  cleaning: "Cleaning (paid by you)",
  laundry: "Laundry and consumables",
  utilities: "Utilities",
  internet: "Internet and subscriptions",
  maintenance: "Maintenance and repairs",
  insurance: "Insurance",
  management: "Property management",
  taxes: "Taxes",
  other: "Other",
  platform: "Booking platform fees",
};
