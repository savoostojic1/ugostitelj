"use client";

import { Info, Plus, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  DAYS_IN_MONTH,
  EXPENSE_DEFINITIONS,
  EXPENSE_UNIT_LABELS,
  FINANCING_UNITS,
  MONTH_NAMES,
  PLATFORM_FEE_UNITS,
  type ExpenseUnit,
  type FinancingUnit,
  type OperatingExpenseId,
} from "@/lib/tools/rental-income-calculator/definitions";
import type {
  CalculatorFormState,
  ExpenseFormValue,
} from "@/lib/tools/rental-income-calculator/form";
import {
  COUNTRIES,
  CURRENCIES,
  OTHER_COUNTRY,
  PROPERTY_TYPES,
  suggestedCurrency,
} from "@/lib/tools/rental-income-calculator/locale-options";
import { blendedPlatformFeePercent } from "@/lib/tools/rental-income-calculator/calculator";
import { parseNumberInput } from "@/lib/tools/rental-income-calculator/form";
import { cn } from "@/lib/utils";
import {
  fieldDomId,
  NumberField,
  SegmentedControl,
  SelectField,
  ToggleField,
} from "./fields";

export interface StepProps {
  form: CalculatorFormState;
  update: (updater: (prev: CalculatorFormState) => CalculatorFormState) => void;
  errorFor: (field: string) => string | undefined;
  currencySymbol: string;
}

const MAX_PLATFORMS = 6;

function Note({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "warning" }) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl border p-4 text-sm leading-relaxed",
        tone === "warning"
          ? "border-amber-400/25 bg-amber-400/[0.06] text-amber-100/90"
          : "border-cyan-400/20 bg-cyan-400/[0.05] text-zinc-300"
      )}
    >
      <Info aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
      <div>{children}</div>
    </div>
  );
}

function Group({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-white">{title}</h3>
        {description ? <p className="mt-1 text-sm text-zinc-400">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Step 1                                                              */
/* ------------------------------------------------------------------ */

export function PropertyStep({ form, update, errorFor }: StepProps) {
  const count = parseNumberInput(form.propertyCount);
  const countryOptions = [
    ...COUNTRIES.map((c) => ({ value: c.code, label: c.name })),
    { value: OTHER_COUNTRY, label: "Other / not listed" },
  ];
  const suggestion = suggestedCurrency(form.country);

  return (
    <div className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <NumberField
          field="propertyCount"
          label="Number of similar properties"
          value={form.propertyCount}
          onChange={(v) => update((p) => ({ ...p, propertyCount: v }))}
          error={errorFor("propertyCount")}
          min={1}
          max={500}
          step={1}
          help="Enter 1 to calculate a single rental."
        />
        <SelectField
          field="propertyType"
          label="Property type"
          value={form.propertyType}
          onChange={(v) => update((p) => ({ ...p, propertyType: v }))}
          options={PROPERTY_TYPES}
        />
        <SelectField
          field="country"
          label="Country"
          value={form.country}
          placeholder="Select a country"
          onChange={(v) =>
            update((p) => {
              const currency = suggestedCurrency(v);
              return { ...p, country: v, currency: currency ?? p.currency };
            })
          }
          options={countryOptions}
          help="Used only to suggest a currency."
        />
        <SelectField
          field="currency"
          label="Currency"
          value={form.currency}
          onChange={(v) => update((p) => ({ ...p, currency: v }))}
          options={CURRENCIES.map((c) => ({ value: c.code, label: c.label }))}
          help={
            suggestion && suggestion !== form.currency
              ? `The usual currency for this country is ${suggestion}. You can keep your choice.`
              : "All amounts are entered and shown in this currency. Nothing is converted."
          }
        />
      </div>

      {count !== null && Number.isFinite(count) && count > 1 ? (
        <Note>
          The estimate for {Math.floor(count)} properties assumes every property has the
          same nightly rate, occupancy and costs you enter in the next steps. If your
          properties differ a lot in size, price or location, calculate them separately
          for a more accurate result.
        </Note>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 2                                                              */
/* ------------------------------------------------------------------ */

export function RevenueStep({ form, update, errorFor, currencySymbol }: StepProps) {
  const occupancy = parseNumberInput(form.occupancyPercent);
  const sliderValue =
    occupancy !== null && Number.isFinite(occupancy) ? Math.min(100, Math.max(0, occupancy)) : 0;

  const fillSeasonalFromAverages = () =>
    update((p) => ({
      ...p,
      seasonal: DAYS_IN_MONTH.map((days, i) => ({
        availableNights: p.seasonal[i]?.availableNights || String(days),
        occupancyPercent: p.occupancyPercent,
        nightlyRate: p.nightlyRate,
      })),
    }));

  return (
    <div className="space-y-8">
      <SegmentedControl
        name="revenueMode"
        legend="How do you want to model the year?"
        value={form.revenueMode}
        onChange={(v) => update((p) => ({ ...p, revenueMode: v }))}
        options={[
          {
            value: "simple",
            label: "Simple: one typical month",
            description: "One average rate and occupancy. The year uses the months you are open.",
          },
          {
            value: "seasonal",
            label: "Seasonal: month by month",
            description: "Enter nights, occupancy and rate for each month of the year.",
          },
        ]}
      />

      {form.revenueMode === "simple" ? (
        <Group
          title="A typical month"
          description="Rough estimate for an average open month. We treat a month as 30 nights so you don't have to pick 28, 30 or 31. For real month lengths, use the seasonal table."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <NumberField
              field="simple.nightlyRate"
              label="Average nightly rate"
              prefix={currencySymbol}
              value={form.nightlyRate}
              onChange={(v) => update((p) => ({ ...p, nightlyRate: v }))}
              error={errorFor("simple.nightlyRate")}
              placeholder="0"
              help="The price per night guests pay, before platform fees."
            />
            <div className="flex flex-col gap-3">
              <NumberField
                field="simple.occupancyPercent"
                label="Expected occupancy rate"
                suffix="%"
                value={form.occupancyPercent}
                onChange={(v) => update((p) => ({ ...p, occupancyPercent: v }))}
                error={errorFor("simple.occupancyPercent")}
                max={100}
                help="Share of available nights you expect to be booked. 50% is only a starting point, not a benchmark."
              />
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={sliderValue}
                onChange={(e) => update((p) => ({ ...p, occupancyPercent: e.target.value }))}
                aria-label="Expected occupancy rate slider"
                aria-valuetext={`${sliderValue}%`}
                className="h-2 w-full cursor-pointer accent-violet-500"
              />
            </div>
            <NumberField
              field="simple.unavailableNights"
              label="Nights unavailable"
              value={form.unavailableNights}
              onChange={(v) => update((p) => ({ ...p, unavailableNights: v }))}
              error={errorFor("simple.unavailableNights")}
              step={1}
              optional
              help="Owner use, maintenance or closure in a typical 30-night month."
            />
          </div>
          <Note>
            Available nights = 30 − nights unavailable. Occupancy applies to that figure.
          </Note>
        </Group>
      ) : (
        <Group
          title="Month-by-month seasonality"
          description="Each month is calculated from its own figures and the year is the sum of all 12. Set available nights to 0 for months you are closed."
        >
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={fillSeasonalFromAverages}
              className="h-auto min-h-8 whitespace-normal border-white/15 bg-white/[0.03] py-1.5 text-left text-zinc-100 hover:bg-white/10"
            >
              Copy simple-mode rate and occupancy to every month
            </Button>
          </div>
          {errorFor("seasonal") ? (
            <p id={fieldDomId("seasonal")} tabIndex={-1} className="text-sm font-medium text-rose-300">
              {errorFor("seasonal")}
            </p>
          ) : null}
          <div className="overflow-hidden rounded-xl border border-white/10">
            <div
              aria-hidden="true"
              className="grid grid-cols-3 gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-3 text-[0.6875rem] font-semibold uppercase tracking-wide text-zinc-400 sm:grid-cols-[7rem_repeat(3,minmax(0,1fr))] sm:gap-3 sm:text-xs"
            >
              <span className="hidden sm:block">Month</span>
              <span>Available nights</span>
              <span>Occupancy %</span>
              <span>Nightly rate ({currencySymbol})</span>
            </div>
            <ul className="divide-y divide-white/5">
              {form.seasonal.map((month, i) => {
                const name = MONTH_NAMES[i];
                const setMonth = (key: keyof typeof month, value: string) =>
                  update((p) => ({
                    ...p,
                    seasonal: p.seasonal.map((m, j) => (j === i ? { ...m, [key]: value } : m)),
                  }));
                return (
                  <li
                    key={name}
                    className="grid gap-2 px-4 py-3 sm:grid-cols-[7rem_repeat(3,minmax(0,1fr))] sm:items-start sm:gap-3"
                  >
                    <span className="pt-0 text-sm font-medium text-zinc-200 sm:pt-3">{name}</span>
                    <div className="grid grid-cols-3 gap-2 sm:contents">
                      <NumberField
                        field={`seasonal.${i}.availableNights`}
                        label={`${name} available nights (max ${DAYS_IN_MONTH[i]})`}
                        srOnlyLabel
                        value={month.availableNights}
                        onChange={(v) => setMonth("availableNights", v)}
                        error={errorFor(`seasonal.${i}.availableNights`)}
                        max={DAYS_IN_MONTH[i]}
                        step={1}
                        placeholder="Nights"
                      />
                      <NumberField
                        field={`seasonal.${i}.occupancyPercent`}
                        label={`${name} occupancy percentage`}
                        srOnlyLabel
                        value={month.occupancyPercent}
                        onChange={(v) => setMonth("occupancyPercent", v)}
                        error={errorFor(`seasonal.${i}.occupancyPercent`)}
                        max={100}
                        placeholder="%"
                      />
                      <NumberField
                        field={`seasonal.${i}.nightlyRate`}
                        label={`${name} average nightly rate`}
                        srOnlyLabel
                        value={month.nightlyRate}
                        onChange={(v) => setMonth("nightlyRate", v)}
                        error={errorFor(`seasonal.${i}.nightlyRate`)}
                        placeholder={currencySymbol}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </Group>
      )}

      <Group title="Stays and extras">
        <div className="grid gap-5 sm:grid-cols-2">
          <NumberField
            field="averageStayNights"
            label="Average length of stay"
            suffix="nights"
            value={form.averageStayNights}
            onChange={(v) => update((p) => ({ ...p, averageStayNights: v }))}
            error={errorFor("averageStayNights")}
            min={1}
            placeholder="e.g. 3"
            help="Used to estimate the number of bookings, which drives per-booking costs and fees."
          />
          <NumberField
            field="extraRevenuePerBooking"
            label="Additional revenue per booking"
            prefix={currencySymbol}
            value={form.extraRevenuePerBooking}
            onChange={(v) => update((p) => ({ ...p, extraRevenuePerBooking: v }))}
            error={errorFor("extraRevenuePerBooking")}
            optional
            placeholder="0"
            help="Extras such as late checkout, transfers or pet fees. Enter the guest cleaning fee in the next step."
          />
        </div>
      </Group>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 3                                                              */
/* ------------------------------------------------------------------ */

function unitOptions(units: readonly ExpenseUnit[]) {
  return units.map((u) => ({ value: u, label: EXPENSE_UNIT_LABELS[u] }));
}

function ExpenseRow({
  field,
  label,
  help,
  value,
  units,
  onChange,
  error,
  currencySymbol,
}: {
  field: string;
  label: string;
  help?: string;
  value: ExpenseFormValue;
  units: readonly ExpenseUnit[];
  onChange: (value: ExpenseFormValue) => void;
  error?: string;
  currencySymbol: string;
}) {
  const percent = value.unit === "percent_revenue";
  const amountId = fieldDomId(field);
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="mb-3">
        <p aria-hidden="true" className="text-sm font-medium text-zinc-100">
          {label}
        </p>
        {help ? (
          <p id={`${amountId}-help`} className="mt-1 text-xs leading-relaxed text-zinc-500">
            {help}
          </p>
        ) : null}
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-2">
        <NumberField
          field={field}
          label={`${label} amount`}
          srOnlyLabel
          help={help}
          prefix={percent ? undefined : currencySymbol}
          suffix={percent ? "%" : undefined}
          max={percent ? 100 : undefined}
          value={value.amount}
          onChange={(amount) => onChange({ ...value, amount })}
          error={error}
          placeholder="0"
        />
        {units.length > 1 ? (
          <SelectField
            field={`${field}.unit`}
            label={`${label} unit`}
            srOnlyLabel
            value={value.unit}
            onChange={(unit) => onChange({ ...value, unit: unit as ExpenseUnit })}
            options={unitOptions(units)}
          />
        ) : (
          <span className="flex h-11 items-center text-sm text-zinc-400">
            {EXPENSE_UNIT_LABELS[value.unit]}
          </span>
        )}
      </div>
    </div>
  );
}

export function ExpensesStep({ form, update, errorFor, currencySymbol }: StepProps) {
  const setExpense = (id: OperatingExpenseId) => (value: ExpenseFormValue) =>
    update((p) => ({ ...p, expenses: { ...p.expenses, [id]: value } }));

  const expenseRow = (id: OperatingExpenseId) => (
    <ExpenseRow
      key={id}
      field={`expenses.${id}`}
      label={EXPENSE_DEFINITIONS[id].label}
      help={EXPENSE_DEFINITIONS[id].help}
      value={form.expenses[id]}
      units={EXPENSE_DEFINITIONS[id].units}
      onChange={setExpense(id)}
      error={errorFor(`expenses.${id}`)}
      currencySymbol={currencySymbol}
    />
  );

  const platforms = form.platforms.map((p) => ({
    name: p.name,
    sharePercent: parseNumberInput(p.sharePercent),
    feePercent: parseNumberInput(p.feePercent),
  }));
  const blended = blendedPlatformFeePercent(platforms);
  const shareTotal = platforms.reduce(
    (s, p) => s + (p.sharePercent !== null && Number.isFinite(p.sharePercent) ? p.sharePercent : 0),
    0
  );

  return (
    <div className="space-y-8">
      <p className="text-sm leading-relaxed text-zinc-400">
        Leave a field empty if it does not apply. Pick the unit that matches how you pay
        each cost. Annual amounts are spread evenly over 12 months.
      </p>

      <Group
        title="Cleaning"
        description="Fees guests pay you for cleaning are revenue. What you pay for cleaning is a cost. Both are shown separately in the results."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.04] p-4">
            <NumberField
              field="cleaningFeePerBooking"
              label={
                <>
                  Cleaning fee charged to guests{" "}
                  <span className="ml-1 rounded-full bg-emerald-400/15 px-2 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-wide text-emerald-300">
                    Revenue
                  </span>
                </>
              }
              prefix={currencySymbol}
              suffix="/ stay"
              value={form.cleaningFeePerBooking}
              onChange={(v) => update((p) => ({ ...p, cleaningFeePerBooking: v }))}
              error={errorFor("cleaningFeePerBooking")}
              optional
              placeholder="0"
              help="Only if you add a separate cleaning fee to each booking."
            />
          </div>
          {expenseRow("cleaning")}
          {expenseRow("laundry")}
        </div>
      </Group>

      <Group title="Running costs">
        <div className="grid gap-4 lg:grid-cols-2">
          {expenseRow("utilities")}
          {expenseRow("internet")}
          {expenseRow("maintenance")}
          {expenseRow("insurance")}
          {expenseRow("other")}
        </div>
      </Group>

      <Group
        title="Management and booking platform fees"
        description="Enter the fees you actually pay. Platform fees differ by platform, country and fee setting, so this calculator does not assume one."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {expenseRow("management")}
        </div>
        <SegmentedControl
          name="platformFeeMode"
          legend="Booking platform fees"
          value={form.platformFeeMode}
          onChange={(v) => update((p) => ({ ...p, platformFeeMode: v }))}
          options={[
            { value: "single", label: "One fee or blended %", description: "One figure for all platforms." },
            {
              value: "per_platform",
              label: "Separate fee per platform",
              description: "Split revenue between platforms, each with its own fee %.",
            },
          ]}
        />
        {form.platformFeeMode === "single" ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <ExpenseRow
              field="platformFee"
              label="Booking platform fee"
              help="Your host-side commission or service fee. Use % for a commission, or an amount per booking or per month."
              value={form.platformFee}
              units={PLATFORM_FEE_UNITS}
              onChange={(v) => update((p) => ({ ...p, platformFee: v }))}
              error={errorFor("platformFee")}
              currencySymbol={currencySymbol}
            />
          </div>
        ) : (
          <div className="space-y-3">
            {errorFor("platforms") ? (
              <p id={fieldDomId("platforms")} tabIndex={-1} className="text-sm font-medium text-rose-300">
                {errorFor("platforms")}
              </p>
            ) : null}
            {form.platforms.map((platform, i) => {
              const setPlatform = (key: keyof typeof platform, value: string) =>
                update((p) => ({
                  ...p,
                  platforms: p.platforms.map((x, j) => (j === i ? { ...x, [key]: value } : x)),
                }));
              const nameId = fieldDomId(`platforms.${i}.name`);
              return (
                <div
                  key={i}
                  className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end"
                >
                  <div className="flex flex-col gap-2">
                    <label htmlFor={nameId} className="text-[0.8125rem] font-medium text-zinc-200">
                      Platform {i + 1} name
                    </label>
                    <input
                      id={nameId}
                      type="text"
                      value={platform.name}
                      maxLength={40}
                      placeholder="e.g. Airbnb"
                      onChange={(e) => setPlatform("name", e.target.value)}
                      className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 text-base text-zinc-100 placeholder:text-zinc-500 focus-visible:border-violet-400/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/40 sm:text-sm"
                    />
                  </div>
                  <NumberField
                    field={`platforms.${i}.sharePercent`}
                    label="Share of revenue"
                    suffix="%"
                    max={100}
                    value={platform.sharePercent}
                    onChange={(v) => setPlatform("sharePercent", v)}
                    error={errorFor(`platforms.${i}.sharePercent`)}
                    placeholder="0"
                  />
                  <NumberField
                    field={`platforms.${i}.feePercent`}
                    label="Fee"
                    suffix="%"
                    max={100}
                    value={platform.feePercent}
                    onChange={(v) => setPlatform("feePercent", v)}
                    error={errorFor(`platforms.${i}.feePercent`)}
                    placeholder="0"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={form.platforms.length <= 1}
                    onClick={() =>
                      update((p) => ({ ...p, platforms: p.platforms.filter((_, j) => j !== i) }))
                    }
                    aria-label={`Remove platform ${i + 1}`}
                    className="h-11 w-11 text-zinc-400 hover:bg-white/10 hover:text-white"
                  >
                    <Trash2 />
                  </Button>
                </div>
              );
            })}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={form.platforms.length >= MAX_PLATFORMS}
                onClick={() =>
                  update((p) => ({
                    ...p,
                    platforms: [...p.platforms, { name: "", sharePercent: "", feePercent: "" }],
                  }))
                }
                className="border-white/15 bg-white/[0.03] text-zinc-100 hover:bg-white/10"
              >
                <Plus /> Add platform
              </Button>
              <p className="text-sm text-zinc-400" aria-live="polite">
                Shares entered: {Math.round(shareTotal * 10) / 10}% · Blended fee:{" "}
                <span className="font-semibold text-zinc-200">{Math.round(blended * 100) / 100}%</span> of gross revenue
              </p>
            </div>
            <p className="text-xs text-zinc-500">
              Revenue not assigned to a platform (for example direct bookings) is treated as fee-free.
            </p>
          </div>
        )}
      </Group>

      <Group
        title="Financing and taxes"
        description="Mortgage or rent is a financing cost, not an operating expense. It is shown separately as cash flow after financing."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <ExpenseRow
            field="financing"
            label="Mortgage or rent payment"
            help="Optional. Include it in the results in step 4."
            value={{ amount: form.financingAmount, unit: form.financingUnit }}
            units={FINANCING_UNITS}
            onChange={(v) =>
              update((p) => ({ ...p, financingAmount: v.amount, financingUnit: v.unit as FinancingUnit }))
            }
            error={errorFor("financing")}
            currencySymbol={currencySymbol}
          />
          {expenseRow("taxes")}
        </div>
        <Note tone="warning">
          This calculator does not work out income tax, VAT, tourist tax or any other tax for
          you. Actual tax treatment depends on local rules and your situation. Enter tax
          amounts only if you know them.
        </Note>
      </Group>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 4                                                              */
/* ------------------------------------------------------------------ */

export function SettingsStep({ form, update, errorFor, currencySymbol }: StepProps) {
  const financing = parseNumberInput(form.financingAmount);
  const hasFinancing = financing !== null && Number.isFinite(financing) && financing > 0;
  const seasonalOpenMonths = form.seasonal.filter((m) => {
    const v = parseNumberInput(m.availableNights);
    return v !== null && Number.isFinite(v) && v > 0;
  }).length;
  const months = parseNumberInput(form.monthsAvailable);
  const openMonths = form.revenueMode === "seasonal" ? seasonalOpenMonths : months ?? 12;
  const hasClosedMonths = openMonths < 12;

  return (
    <div className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        {form.revenueMode === "simple" ? (
          <NumberField
            field="settings.monthsAvailable"
            label="Months the property is available per year"
            value={form.monthsAvailable}
            onChange={(v) => update((p) => ({ ...p, monthsAvailable: v }))}
            error={errorFor("settings.monthsAvailable")}
            min={1}
            max={12}
            step={1}
            help="The annual estimate multiplies your typical month by this number. Use seasonal mode if months differ."
          />
        ) : (
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm text-zinc-300">
            <p className="font-medium text-white">Months available: {seasonalOpenMonths}</p>
            <p className="mt-1 text-xs leading-relaxed text-zinc-500">
              Taken from the seasonal table: every month with at least one available night.
            </p>
          </div>
        )}
        <NumberField
          field="settings.targetMonthlyProfit"
          label="Target monthly profit"
          prefix={currencySymbol}
          value={form.targetMonthlyProfit}
          onChange={(v) => update((p) => ({ ...p, targetMonthlyProfit: v }))}
          error={errorFor("settings.targetMonthlyProfit")}
          optional
          placeholder="0"
          help="For all properties together, as a monthly average over the year."
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <ToggleField
          field="settings.includeFinancing"
          label="Include mortgage or rent in cash flow"
          description={
            hasFinancing
              ? "Shows cash flow after financing as well as operating income."
              : "No mortgage or rent entered in step 3."
          }
          checked={form.includeFinancing && hasFinancing}
          disabled={!hasFinancing}
          onChange={(v) => update((p) => ({ ...p, includeFinancing: v }))}
        />
        <ToggleField
          field="settings.includeAnnualExpenses"
          label="Include annual expenses"
          description="Costs entered per year (for example insurance), spread over 12 months."
          checked={form.includeAnnualExpenses}
          onChange={(v) => update((p) => ({ ...p, includeAnnualExpenses: v }))}
        />
        <ToggleField
          field="settings.fixedCostsInClosedMonths"
          label="Monthly costs continue while closed"
          description={
            hasClosedMonths
              ? "Charge fixed monthly costs (such as utilities or internet) in months with no availability too."
              : "Only matters when the property is closed for part of the year."
          }
          checked={form.fixedCostsInClosedMonths}
          onChange={(v) => update((p) => ({ ...p, fixedCostsInClosedMonths: v }))}
        />
      </div>
    </div>
  );
}
