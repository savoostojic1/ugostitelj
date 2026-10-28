"use client";

import { ArrowLeft, ArrowRight, Calculator, Check } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { trackHostviaEvent, trackOncePerSession } from "@/lib/analytics/track";
import {
  calculate,
  errorsForStep,
  validateInput,
  type CalculatorStep,
} from "@/lib/tools/rental-income-calculator/calculator";
import {
  createDefaultFormState,
  toCalculatorInput,
  type CalculatorFormState,
} from "@/lib/tools/rental-income-calculator/form";
import {
  COUNTRIES,
  PROPERTY_TYPES,
} from "@/lib/tools/rental-income-calculator/locale-options";
import { currencySymbol as getCurrencySymbol } from "@/lib/tools/rental-income-calculator/format";
import { cn } from "@/lib/utils";
import { fieldDomId } from "./fields";
import { CalculatorResults } from "./results";
import { ExpensesStep, PropertyStep, RevenueStep, SettingsStep, type StepProps } from "./steps";

const TOOL_ID = "vacation_rental_income_calculator";

const STEPS: { step: CalculatorStep; title: string; short: string; intro: string }[] = [
  {
    step: 1,
    title: "Property details",
    short: "Property",
    intro: "Tell us what you are calculating. Nothing here is stored or sent anywhere.",
  },
  {
    step: 2,
    title: "Booking and revenue",
    short: "Revenue",
    intro: "Your expected nightly rate, occupancy and stay length.",
  },
  {
    step: 3,
    title: "Expenses",
    short: "Expenses",
    intro: "The running costs of one property, in the units you actually pay them.",
  },
  {
    step: 4,
    title: "Final settings and results",
    short: "Results",
    intro: "Choose what to include, then calculate.",
  },
];

function propertyCountBand(value: string): string {
  const count = Number(value);
  if (!Number.isFinite(count) || count <= 1) return "1";
  if (count <= 2) return "2";
  if (count <= 5) return "3-5";
  return "6+";
}

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function RentalIncomeCalculator() {
  const [form, setForm] = useState<CalculatorFormState>(createDefaultFormState);
  const [step, setStep] = useState<CalculatorStep>(1);
  const [maxStep, setMaxStep] = useState<CalculatorStep>(1);
  const [attempted, setAttempted] = useState<Partial<Record<CalculatorStep, boolean>>>({});
  const [showResults, setShowResults] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);
  const pendingFocusRef = useRef<{ kind: "heading" } | { kind: "field"; field: string } | { kind: "results" } | null>(null);

  useEffect(() => {
    trackOncePerSession("calculator_view", { tool: TOOL_ID });
  }, []);

  const input = useMemo(() => toCalculatorInput(form), [form]);
  const errors = useMemo(() => validateInput(input), [input]);
  const outcome = useMemo(() => (showResults ? calculate(input) : null), [showResults, input]);

  useEffect(() => {
    const pending = pendingFocusRef.current;
    if (!pending) return;
    pendingFocusRef.current = null;
    const behavior: ScrollBehavior = prefersReducedMotion() ? "auto" : "smooth";
    if (pending.kind === "heading") {
      rootRef.current?.scrollIntoView({ block: "start", behavior });
      headingRef.current?.focus({ preventScroll: true });
    } else if (pending.kind === "results") {
      resultsRef.current?.scrollIntoView({ block: "start", behavior });
      resultsRef.current?.focus({ preventScroll: true });
    } else {
      const el = document.getElementById(fieldDomId(pending.field));
      el?.scrollIntoView({ block: "center", behavior });
      el?.focus({ preventScroll: true });
    }
  });

  const update = useCallback<StepProps["update"]>((updater) => {
    setForm((prev) => updater(prev));
    if (!startedRef.current) {
      startedRef.current = true;
      trackHostviaEvent("calculator_started", { tool: TOOL_ID });
    }
  }, []);

  const errorFor = useCallback(
    (field: string) => {
      const error = errors.find((e) => e.field === field);
      return error && attempted[error.step] ? error.message : undefined;
    },
    [errors, attempted]
  );

  const goTo = (target: CalculatorStep) => {
    setStep(target);
    setMaxStep((m) => (target > m ? target : m));
    pendingFocusRef.current = { kind: "heading" };
  };

  const firstBlockingStep = (from: CalculatorStep, to: CalculatorStep): CalculatorStep | null => {
    for (let s = from; s <= to; s++) {
      if (errorsForStep(errors, s as CalculatorStep).length > 0) return s as CalculatorStep;
    }
    return null;
  };

  const flagErrorsAt = (target: CalculatorStep) => {
    setAttempted((a) => ({ ...a, [target]: true }));
    const first = errorsForStep(errors, target)[0];
    if (target !== step) {
      setStep(target);
    }
    pendingFocusRef.current = first ? { kind: "field", field: first.field } : { kind: "heading" };
  };

  const jumpTo = (target: CalculatorStep) => {
    if (target <= step) return goTo(target);
    const blocking = firstBlockingStep(step, (target - 1) as CalculatorStep);
    if (blocking) return flagErrorsAt(blocking);
    goTo(target);
  };

  const next = () => {
    if (step >= 4) return;
    if (errorsForStep(errors, step).length > 0) return flagErrorsAt(step);
    goTo((step + 1) as CalculatorStep);
  };

  const showCalculation = () => {
    const blocking = firstBlockingStep(1, 4);
    if (blocking) {
      setAttempted({ 1: true, 2: true, 3: true, 4: true });
      return flagErrorsAt(blocking);
    }
    setAttempted((a) => ({ ...a, 4: true }));
    setShowResults(true);
    pendingFocusRef.current = { kind: "results" };
    trackHostviaEvent("calculator_completed", {
      tool: TOOL_ID,
      revenue_mode: form.revenueMode,
      platform_fee_mode: form.platformFeeMode,
      property_count_band: propertyCountBand(form.propertyCount),
    });
  };

  const reset = () => {
    setForm(createDefaultFormState());
    setAttempted({});
    setShowResults(false);
    setMaxStep(1);
    goTo(1);
    trackHostviaEvent("calculator_reset", { tool: TOOL_ID });
  };

  const currencySymbol = getCurrencySymbol(form.currency);
  const stepProps: StepProps = { form, update, errorFor, currencySymbol };
  const current = STEPS[step - 1];
  const stepErrorCount = attempted[step] ? errorsForStep(errors, step).length : 0;

  const propertyTypeLabel = PROPERTY_TYPES.find((t) => t.value === form.propertyType)?.label ?? "Property";
  const countryLabel = COUNTRIES.find((c) => c.code === form.country)?.name;
  const count = Number(form.propertyCount);
  const contextLabel = [
    Number.isFinite(count) && count > 1 ? `${count} × ${propertyTypeLabel.toLowerCase()}` : propertyTypeLabel,
    countryLabel,
    form.currency,
    form.revenueMode === "seasonal" ? "Seasonal estimate" : "Simple estimate",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div
      ref={rootRef}
      id="calculator"
      className="hostvia-glow-card scroll-mt-24 p-5 sm:p-8 print:border-0 print:p-0 print:shadow-none"
    >
      <nav aria-label="Calculator progress" className="print:hidden">
        <p className="mb-3 text-xs font-medium text-zinc-400">
          Step {step} of {STEPS.length}
        </p>
        <div aria-hidden="true" className="mb-4 h-1.5 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-300"
            style={{ width: `${(step / STEPS.length) * 100}%` }}
          />
        </div>
        <ol className="grid grid-cols-4 gap-2">
          {STEPS.map((s) => {
            const isCurrent = s.step === step;
            const done = s.step < step || (s.step === 4 && showResults);
            const reachable = s.step <= maxStep || s.step === step + 1;
            return (
              <li key={s.step}>
                <button
                  type="button"
                  onClick={() => jumpTo(s.step)}
                  disabled={!reachable}
                  aria-current={isCurrent ? "step" : undefined}
                  aria-label={`Step ${s.step}: ${s.title}${done && !isCurrent ? " (completed)" : ""}`}
                  className={cn(
                    "flex w-full flex-col items-center gap-1.5 rounded-xl px-1 py-2 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 sm:flex-row sm:gap-2.5 sm:px-3 sm:text-left",
                    isCurrent ? "bg-violet-500/10" : reachable ? "hover:bg-white/5" : "cursor-not-allowed opacity-50"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                      isCurrent
                        ? "border-violet-400 bg-violet-500 text-white"
                        : done
                          ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-300"
                          : "border-white/15 text-zinc-400"
                    )}
                  >
                    {done && !isCurrent ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : s.step}
                  </span>
                  <span
                    className={cn(
                      "text-[0.6875rem] font-medium leading-tight sm:text-sm",
                      isCurrent ? "text-white" : "text-zinc-400"
                    )}
                  >
                    <span className="sm:hidden">{s.short}</span>
                    <span className="hidden sm:inline">{s.title}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <form
        noValidate
        className="mt-8 print:hidden"
        onSubmit={(event) => {
          event.preventDefault();
          if (step < 4) next();
          else showCalculation();
        }}
      >
        <div className="mb-6">
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="marketing-heading text-2xl text-white outline-none md:text-[1.75rem]"
          >
            {current.title}
          </h2>
          <p className="mt-2 text-sm text-zinc-400">{current.intro}</p>
        </div>

        {stepErrorCount > 0 ? (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-rose-400/30 bg-rose-500/[0.07] p-4 text-sm text-rose-200"
          >
            {stepErrorCount === 1
              ? "One field needs attention before you continue."
              : `${stepErrorCount} fields need attention before you continue.`}
          </div>
        ) : null}

        {step === 1 ? <PropertyStep {...stepProps} /> : null}
        {step === 2 ? <RevenueStep {...stepProps} /> : null}
        {step === 3 ? <ExpensesStep {...stepProps} /> : null}
        {step === 4 ? <SettingsStep {...stepProps} /> : null}

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => goTo((step - 1) as CalculatorStep)}
              className="h-11 rounded-xl border-white/15 bg-white/[0.03] px-5 text-zinc-100 hover:bg-white/10"
            >
              <ArrowLeft /> Back
            </Button>
          ) : (
            <span className="hidden text-xs text-zinc-500 sm:block">No sign-up or email needed.</span>
          )}
          {step < 4 ? (
            <button
              type="submit"
              className="hostvia-btn-gradient inline-flex h-11 items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#06060a]"
            >
              Next: {STEPS[step].title} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="submit"
              className="hostvia-btn-gradient inline-flex h-11 items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#06060a]"
            >
              <Calculator className="h-4 w-4" aria-hidden="true" />
              {showResults ? "Recalculate" : "Calculate results"}
            </button>
          )}
        </div>
      </form>

      {step === 4 && showResults ? (
        <div
          ref={resultsRef}
          tabIndex={-1}
          aria-label="Estimated results"
          role="region"
          className="mt-10 scroll-mt-24 border-t border-white/10 pt-10 outline-none print:mt-0 print:border-0 print:pt-0"
        >
          {outcome?.ok ? (
            <CalculatorResults
              result={outcome.result}
              currency={form.currency}
              contextLabel={contextLabel}
              onEdit={() => goTo(1)}
              onReset={reset}
            />
          ) : (
            <div role="alert" className="rounded-xl border border-rose-400/30 bg-rose-500/[0.07] p-4 text-sm text-rose-200">
              Some inputs are missing or invalid, so the results are hidden. Fix the highlighted
              fields and press Recalculate.
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
