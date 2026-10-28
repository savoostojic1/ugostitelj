"use client";

import { Pencil, Printer, RotateCcw } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type {
  BreakEven,
  CalculationResult,
  Totals,
} from "@/lib/tools/rental-income-calculator/calculator";
import {
  EXPENSE_KEY_LABELS,
  MONTH_NAMES,
  type ExpenseKey,
} from "@/lib/tools/rental-income-calculator/definitions";
import {
  formatCount,
  formatMoney,
  formatPercent,
} from "@/lib/tools/rental-income-calculator/format";
import { cn } from "@/lib/utils";

export const RESULTS_DISCLAIMER =
  "These figures are estimates based on the information you entered. Actual results may vary with seasonality, demand, platform fees, local taxes and unexpected expenses.";

interface ResultsProps {
  result: CalculationResult;
  currency: string;
  contextLabel: string;
  onEdit: () => void;
  onReset: () => void;
}

function PrimaryCard({
  title,
  annual,
  monthly,
  note,
  tone = "neutral",
}: {
  title: string;
  annual: string;
  monthly: string;
  note: string;
  tone?: "neutral" | "positive" | "negative";
}) {
  return (
    <div className="hostvia-stat-card flex flex-col">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">{title}</h4>
      <p
        className={cn(
          "mt-3 text-2xl font-bold tracking-tight sm:text-[1.75rem]",
          tone === "positive" && "text-emerald-300",
          tone === "negative" && "text-rose-300",
          tone === "neutral" && "text-white"
        )}
      >
        {annual}
        <span className="ml-1.5 text-sm font-medium text-zinc-500">/ year</span>
      </p>
      <p className="mt-1 text-sm text-zinc-300">
        {monthly} <span className="text-zinc-500">/ month on average</span>
      </p>
      <p className="mt-3 text-xs leading-relaxed text-zinc-500">{note}</p>
    </div>
  );
}

function Metric({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <dt className="text-xs font-medium text-zinc-400">{label}</dt>
      <dd className="mt-1.5 text-lg font-semibold text-white">{value}</dd>
      {note ? <dd className="mt-1 text-xs leading-relaxed text-zinc-500">{note}</dd> : null}
    </div>
  );
}

function Panel({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-2xl border border-white/10 bg-white/[0.02] p-5", className)}>
      <h4 className="text-sm font-semibold text-white">{title}</h4>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function tone(value: number): "positive" | "negative" | "neutral" {
  if (Math.round(value) > 0) return "positive";
  if (Math.round(value) < 0) return "negative";
  return "neutral";
}

function describeBreakEven(be: BreakEven, what: string): { value: string; note: string } {
  switch (be.status) {
    case "ok":
      return {
        value: formatPercent(be.occupancy),
        note: `Occupancy needed in every open month to cover ${what} at your rates.`,
      };
    case "no_fixed_costs":
      return {
        value: "0%",
        note: `No fixed ${what} entered, so each booking covers its own costs.`,
      };
    case "above_100":
      return {
        value: "Above 100%",
        note: `You would need ${formatPercent(be.occupancy, 0)} occupancy to cover ${what}, which is not possible at these rates.`,
      };
    case "unreachable":
      return {
        value: "Not reachable",
        note: "After fees and per-stay costs, a booked night does not earn more than it costs.",
      };
    case "insufficient":
      return { value: "—", note: "No available nights entered." };
  }
}

const SUMMARY_ROWS: { key: keyof Totals; label: string; kind: "money" | "count" }[] = [
  { key: "grossRevenue", label: "Gross revenue", kind: "money" },
  { key: "operatingExpenses", label: "Operating expenses", kind: "money" },
  { key: "operatingIncome", label: "Operating income", kind: "money" },
  { key: "financing", label: "Mortgage or rent", kind: "money" },
  { key: "cashFlow", label: "Cash flow after financing", kind: "money" },
  { key: "occupiedNights", label: "Occupied nights", kind: "count" },
  { key: "bookings", label: "Estimated bookings", kind: "count" },
];

export function CalculatorResults({ result, currency, contextLabel, onEdit, onReset }: ResultsProps) {
  const money = (v: number) => formatMoney(v, currency);
  const { portfolio, flags } = result;
  const annual = portfolio.annual;
  const monthly = portfolio.monthlyAverage;
  const multi = result.propertyCount > 1;
  const scope = !multi
    ? "this property"
    : result.propertyCount === 2
      ? "both properties"
      : `all ${result.propertyCount} properties`;

  const revenueIncludes = [
    flags.hasExtraRevenue ? "additional revenue" : null,
    flags.hasCleaningFeeRevenue ? "guest-paid cleaning fees" : null,
  ].filter(Boolean);
  const revenueNote = revenueIncludes.length
    ? `Nightly revenue plus ${revenueIncludes.join(" and ")}.`
    : "Nightly revenue only. No extras or guest cleaning fees entered.";

  const costScope = flags.annualExpensesIncluded || !flags.hasAnnualExpenses
    ? "the operating costs you entered"
    : "the operating costs you entered, excluding annual costs";

  const expenseRows = (Object.keys(annual.expenses) as ExpenseKey[])
    .map((key) => ({ key, annual: annual.expenses[key] }))
    .filter((row) => row.annual > 0.004)
    .sort((a, b) => b.annual - a.annual);

  const showTypical = portfolio.typicalMonth !== null && result.openMonths < 12;
  const summaryColumns: { label: string; totals: Totals }[] = [
    ...(showTypical && portfolio.typicalMonth
      ? [{ label: "Typical open month", totals: portfolio.typicalMonth }]
      : []),
    { label: "Monthly average", totals: monthly },
    { label: "Annual", totals: annual },
  ];
  const summaryRows = SUMMARY_ROWS.filter(
    (row) => flags.financingIncluded || (row.key !== "financing" && row.key !== "cashFlow")
  );

  const operatingBreakEven = describeBreakEven(result.breakEven.operating, "operating costs");
  const cashBreakEven = result.breakEven.cashFlow
    ? describeBreakEven(result.breakEven.cashFlow, "operating costs and financing")
    : null;

  return (
    <div className="rental-calc-results space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="marketing-heading text-2xl text-white md:text-3xl">Your estimated results</h3>
          <p className="mt-2 text-sm text-zinc-400">{contextLabel}</p>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          <Button
            type="button"
            variant="outline"
            onClick={onEdit}
            className="border-white/15 bg-white/[0.03] text-zinc-100 hover:bg-white/10"
          >
            <Pencil /> Edit assumptions
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => window.print()}
            className="border-white/15 bg-white/[0.03] text-zinc-100 hover:bg-white/10"
          >
            <Printer /> Print or save as PDF
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onReset}
            className="text-zinc-300 hover:bg-white/10 hover:text-white"
          >
            <RotateCcw /> Reset
          </Button>
        </div>
      </div>

      {multi ? (
        <p className="rounded-xl border border-cyan-400/20 bg-cyan-400/[0.05] p-4 text-sm leading-relaxed text-zinc-300">
          Totals cover {result.propertyCount} properties and assume each one matches the
          averages you entered. Per property, estimated annual operating income is{" "}
          <strong className="text-white">{money(result.perProperty.annual.operatingIncome)}</strong>.
          Calculate properties separately if they differ a lot.
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <PrimaryCard
          title="Estimated gross revenue"
          annual={money(annual.grossRevenue)}
          monthly={money(monthly.grossRevenue)}
          note={revenueNote}
        />
        <PrimaryCard
          title="Total operating expenses"
          annual={money(annual.operatingExpenses)}
          monthly={money(monthly.operatingExpenses)}
          note={`Includes ${costScope}. Mortgage or rent is not included here.`}
        />
        <PrimaryCard
          title="Estimated operating income"
          annual={money(annual.operatingIncome)}
          monthly={money(monthly.operatingIncome)}
          note={`Gross revenue minus ${costScope}. Not net profit: income tax and costs you left out are not deducted.`}
          tone={tone(annual.operatingIncome)}
        />
        {flags.financingIncluded ? (
          <PrimaryCard
            title="Estimated cash flow after financing"
            annual={money(annual.cashFlow)}
            monthly={money(monthly.cashFlow)}
            note={`Operating income minus ${money(annual.financing)} per year of mortgage or rent payments.`}
            tone={tone(annual.cashFlow)}
          />
        ) : (
          <div className="hostvia-stat-card flex flex-col">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Operating profit margin
            </h4>
            <p className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-[1.75rem]">
              {result.operatingMargin !== null ? formatPercent(result.operatingMargin) : "—"}
            </p>
            <p className="mt-3 text-xs leading-relaxed text-zinc-500">
              {result.operatingMargin !== null
                ? "Operating income as a share of gross revenue."
                : "Not meaningful without revenue."}{" "}
              No mortgage or rent included.
            </p>
          </div>
        )}
      </div>

      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(11rem,1fr))]">
        <Metric
          label="Occupied nights per year"
          value={formatCount(annual.occupiedNights)}
          note={`Out of ${formatCount(annual.availableNights)} available nights across ${result.openMonths} open month${result.openMonths === 1 ? "" : "s"}${multi ? ` and ${result.propertyCount} properties` : ""}.`}
        />
        <Metric
          label="Estimated bookings per year"
          value={formatCount(annual.bookings)}
          note="Occupied nights divided by the average length of stay."
        />
        {flags.financingIncluded ? (
          <Metric
            label="Operating profit margin"
            value={result.operatingMargin !== null ? formatPercent(result.operatingMargin) : "—"}
            note={
              result.operatingMargin !== null
                ? "Operating income as a share of gross revenue."
                : "Not meaningful without revenue."
            }
          />
        ) : null}
        <Metric label="Break-even occupancy" value={operatingBreakEven.value} note={operatingBreakEven.note} />
        {cashBreakEven ? (
          <Metric
            label="Break-even incl. financing"
            value={cashBreakEven.value}
            note={cashBreakEven.note}
          />
        ) : null}
      </dl>

      {result.target ? (
        <Panel title="Target monthly profit">
          <p className="text-sm leading-relaxed text-zinc-300">
            Your target is <strong className="text-white">{money(result.target.targetMonthly)}</strong> per month
            for {scope}, measured as{" "}
            {result.target.basis === "cash_flow" ? "cash flow after financing" : "operating income"}. The
            current estimate is{" "}
            <strong className="text-white">{money(result.target.currentMonthlyAverage)}</strong> per month on
            average
            {result.target.shortfallMonthly > 0.5
              ? `, which is ${money(result.target.shortfallMonthly)} short.`
              : ", which meets the target."}
          </p>
          <p className="mt-2 text-sm text-zinc-400">
            {(() => {
              const req = result.target.requiredOccupancy;
              if (req.status === "ok") {
                return `At your current rates, the target needs about ${formatPercent(req.occupancy)} occupancy in every open month.`;
              }              if (req.status === "above_100") {
                return "At your current rates the target is not reachable even at 100% occupancy. Rates, costs or open months would need to change.";
              }
              if (req.status === "unreachable") {
                return "At your current rates and per-stay costs, more bookings would not raise income.";
              }
              return "";
            })()}
          </p>
        </Panel>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Revenue">
          <dl className="space-y-2.5 text-sm">
            <Row label="Booking revenue (nights × rate)" value={money(annual.baseRevenue)} />
            <Row
              label="Additional revenue"
              value={flags.hasExtraRevenue ? money(annual.extraRevenue) : "Not entered"}
              muted={!flags.hasExtraRevenue}
            />
            <Row
              label="Cleaning fees paid by guests"
              value={flags.hasCleaningFeeRevenue ? money(annual.cleaningFeeRevenue) : "Not entered"}
              muted={!flags.hasCleaningFeeRevenue}
            />
            <Row label="Estimated gross revenue" value={money(annual.grossRevenue)} strong />
          </dl>
          <p className="mt-3 text-xs text-zinc-500">Annual figures{multi ? ` for ${scope}` : ""}.</p>
        </Panel>

        <Panel title="Cleaning: revenue and cost">
          <dl className="space-y-2.5 text-sm">
            <Row label="Cleaning fees collected from guests" value={money(annual.cleaningFeeRevenue)} />
            <Row label="Cleaning cost paid by you" value={money(annual.expenses.cleaning)} />
            <Row
              label="Net cleaning result"
              value={money(annual.cleaningFeeRevenue - annual.expenses.cleaning)}
              strong
            />
          </dl>
          <p className="mt-3 text-xs leading-relaxed text-zinc-500">
            Guest cleaning fees count once, in gross revenue. Your cleaning cost counts once, in
            operating expenses.
          </p>
        </Panel>
      </div>

      <Panel title="Expense breakdown">
        {expenseRows.length === 0 ? (
          <p className="text-sm text-zinc-400">No operating expenses entered.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[30rem] text-sm">
              <caption className="sr-only">Operating expenses by category</caption>
              <thead>
                <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-zinc-500">
                  <th scope="col" className="py-2 pr-3 font-medium">Category</th>
                  <th scope="col" className="py-2 pr-3 text-right font-medium">Per month (avg.)</th>
                  <th scope="col" className="py-2 pr-3 text-right font-medium">Per year</th>
                  <th scope="col" className="w-1/4 py-2 font-medium">
                    <span className="sr-only">Share of expenses</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {expenseRows.map((row) => {
                  const share = annual.operatingExpenses > 0 ? row.annual / annual.operatingExpenses : 0;
                  return (
                    <tr key={row.key}>
                      <th scope="row" className="py-2.5 pr-3 text-left font-normal text-zinc-300">
                        {EXPENSE_KEY_LABELS[row.key]}
                      </th>
                      <td className="py-2.5 pr-3 text-right tabular-nums text-zinc-200">{money(row.annual / 12)}</td>
                      <td className="py-2.5 pr-3 text-right tabular-nums text-white">{money(row.annual)}</td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5" aria-hidden="true">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400"
                              style={{ width: `${Math.max(2, share * 100)}%` }}
                            />
                          </div>
                          <span className="w-12 text-right text-xs tabular-nums text-zinc-500">
                            {formatPercent(share, 0)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-white/10">
                  <th scope="row" className="py-2.5 pr-3 text-left font-semibold text-white">Total</th>
                  <td className="py-2.5 pr-3 text-right font-semibold tabular-nums text-white">
                    {money(monthly.operatingExpenses)}
                  </td>
                  <td className="py-2.5 pr-3 text-right font-semibold tabular-nums text-white">
                    {money(annual.operatingExpenses)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
        {flags.hasAnnualExpenses && !flags.annualExpensesIncluded ? (
          <p className="mt-3 text-xs text-amber-200/80">
            Annual expenses are excluded by your setting in step 4.
          </p>
        ) : null}
      </Panel>

      <Panel title="Monthly and annual summary">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[28rem] text-sm">
            <caption className="sr-only">Monthly and annual summary{multi ? ` for ${scope}` : ""}</caption>
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-zinc-500">
                <th scope="col" className="py-2 pr-3 font-medium">
                  <span className="sr-only">Figure</span>
                </th>
                {summaryColumns.map((col) => (
                  <th key={col.label} scope="col" className="py-2 pr-3 text-right font-medium">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {summaryRows.map((row) => (
                <tr key={row.key}>
                  <th scope="row" className="py-2.5 pr-3 text-left font-normal text-zinc-300">
                    {row.label}
                  </th>
                  {summaryColumns.map((col) => {
                    const v = col.totals[row.key] as number;
                    return (
                      <td key={col.label} className="py-2.5 pr-3 text-right tabular-nums text-white">
                        {row.kind === "money" ? money(v) : formatCount(v)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-zinc-500">
          The monthly average is the annual total divided by 12
          {showTypical ? ", including closed months. The typical open month is one month at the rates you entered" : ""}.
        </p>
      </Panel>

      {result.mode === "seasonal" ? (
        <Panel title="Month by month">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] text-sm">
              <caption className="sr-only">Estimated results by month{multi ? ` for ${scope}` : ""}</caption>
              <thead>
                <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-zinc-500">
                  <th scope="col" className="py-2 pr-3 font-medium">Month</th>
                  <th scope="col" className="py-2 pr-3 text-right font-medium">Occupied nights</th>
                  <th scope="col" className="py-2 pr-3 text-right font-medium">Revenue</th>
                  <th scope="col" className="py-2 pr-3 text-right font-medium">Expenses</th>
                  <th scope="col" className="py-2 pr-3 text-right font-medium">
                    {flags.financingIncluded ? "Cash flow" : "Operating income"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {result.months.map((m) => {
                  const f = result.propertyCount;
                  const bottom = (flags.financingIncluded ? m.cashFlow : m.operatingIncome) * f;
                  return (
                    <tr key={m.monthIndex} className={cn(!m.open && "text-zinc-500")}>
                      <th scope="row" className="py-2 pr-3 text-left font-normal">
                        {MONTH_NAMES[m.monthIndex]}
                        {!m.open ? <span className="ml-1.5 text-xs">(closed)</span> : null}
                      </th>
                      <td className="py-2 pr-3 text-right tabular-nums">{formatCount(m.occupiedNights * f)}</td>
                      <td className="py-2 pr-3 text-right tabular-nums">{money(m.grossRevenue * f)}</td>
                      <td className="py-2 pr-3 text-right tabular-nums">{money(m.operatingExpenses * f)}</td>
                      <td
                        className={cn(
                          "py-2 pr-3 text-right tabular-nums",
                          Math.round(bottom) < 0 ? "text-rose-300" : "text-zinc-100"
                        )}
                      >
                        {money(bottom)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      ) : null}

      <div className="space-y-2 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm leading-relaxed text-zinc-400">
        <p className="font-medium text-zinc-200">{RESULTS_DISCLAIMER}</p>
        <p>
          Figures are rounded for display. Operating income is gross revenue minus the costs you
          entered. It is not net profit: income tax, depreciation and anything you left empty are
          not deducted.
          {flags.financingIncluded
            ? " Cash flow after financing also subtracts mortgage or rent payments."
            : ""}
        </p>
      </div>
    </div>
  );
}

function Row({ label, value, strong, muted }: { label: string; value: string; strong?: boolean; muted?: boolean }) {
  return (
    <div className={cn("flex items-baseline justify-between gap-4", strong && "border-t border-white/10 pt-2.5")}>
      <dt className={cn(strong ? "font-semibold text-white" : "text-zinc-400")}>{label}</dt>
      <dd
        className={cn(
          "tabular-nums",
          strong ? "font-semibold text-white" : muted ? "text-zinc-500" : "text-zinc-100"
        )}
      >
        {value}
      </dd>
    </div>
  );
}
