"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ExternalLink,
  RotateCcw,
} from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { trackHostviaEvent, trackOncePerSession } from "@/lib/analytics/track";
import {
  PLATFORM_OPTIONS,
  platformLabel,
  type PlatformId,
} from "@/lib/tools/calendar-sync-guide/platforms";
import {
  pairValidationMessage,
  resolveGuide,
  validatePair,
  type ResolvedGuide,
} from "@/lib/tools/calendar-sync-guide/resolve-guide";
import { cn } from "@/lib/utils";

const TOOL_ID = "vacation_rental_calendar_sync_guide";
const STORAGE_KEY = "hv_calendar_sync_guide_progress";

type Phase = "select" | "guide" | "complete";

interface StoredProgress {
  from: PlatformId;
  to: PlatformId;
  phase: Phase;
  stepIndex: number;
  checked: boolean[];
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function readProgress(): StoredProgress | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as StoredProgress;
    if (!data.from || !data.to) return null;
    if (validatePair(data.from, data.to)) return null;
    return data;
  } catch {
    return null;
  }
}

function writeProgress(progress: StoredProgress | null) {
  try {
    if (!progress) {
      window.sessionStorage.removeItem(STORAGE_KEY);
      return;
    }
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Storage can be blocked; the guide still works without persistence.
  }
}

function PlatformChip({
  selected,
  disabled,
  name,
  hint,
  onSelect,
}: {
  selected: boolean;
  disabled: boolean;
  name: string;
  hint: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400",
        selected
          ? "border-violet-400/60 bg-violet-500/15"
          : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]",
        disabled && "cursor-not-allowed opacity-40 hover:border-white/10 hover:bg-white/[0.03]"
      )}
    >
      <span
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
          selected ? "border-violet-300 bg-violet-500 text-white" : "border-white/25"
        )}
        aria-hidden="true"
      >
        {selected ? <Check className="h-3 w-3" /> : null}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-white">{name}</span>
        <span className="block text-xs text-zinc-500">{hint}</span>
      </span>
    </button>
  );
}

function Expandable({ title, children }: { title: string; children: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02]">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left text-sm text-zinc-300 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span>{title}</span>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-zinc-500 transition", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>
      {open ? (
        <p className="border-t border-white/10 px-3.5 py-3 text-sm leading-relaxed text-zinc-400">
          {children}
        </p>
      ) : null}
    </div>
  );
}

function trackOutbound(url: string, location: string) {
  trackHostviaEvent("official_help_link_clicked", {
    tool: TOOL_ID,
    location,
    link_host: (() => {
      try {
        return new URL(url).hostname;
      } catch {
        return "unknown";
      }
    })(),
  });
}

export function CalendarSyncGuide() {
  const [from, setFrom] = useState<PlatformId | null>(null);
  const [to, setTo] = useState<PlatformId | null>(null);
  const [phase, setPhase] = useState<Phase>("select");
  const [stepIndex, setStepIndex] = useState(0);
  const [guide, setGuide] = useState<ResolvedGuide | null>(null);
  const [checked, setChecked] = useState<boolean[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [limitationsOpen, setLimitationsOpen] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const fromGroupId = useId();
  const toGroupId = useId();

  useEffect(() => {
    trackOncePerSession("calendar_sync_guide_view", { tool: TOOL_ID });
    const saved = readProgress();
    if (saved) {
      const resolved = resolveGuide({ from: saved.from, to: saved.to });
      setFrom(saved.from);
      setTo(saved.to);
      setGuide(resolved);
      setPhase(saved.phase === "complete" ? "complete" : saved.phase === "guide" ? "guide" : "select");
      setStepIndex(
        Math.min(Math.max(saved.stepIndex, 0), Math.max(resolved.steps.length - 1, 0))
      );
      setChecked(
        saved.checked.length
          ? saved.checked
          : resolved.steps[resolved.steps.length - 1]?.checklist?.map(() => false) ?? []
      );
      setStarted(true);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (phase === "select" || !from || !to) {
      writeProgress(null);
      return;
    }
    writeProgress({ from, to, phase, stepIndex, checked });
  }, [hydrated, from, to, phase, stepIndex, checked]);

  useEffect(() => {
    if (!hydrated || phase === "select") return;
    const behavior: ScrollBehavior = prefersReducedMotion() ? "auto" : "smooth";
    rootRef.current?.scrollIntoView({ block: "start", behavior });
    headingRef.current?.focus({ preventScroll: true });
  }, [hydrated, phase, stepIndex]);

  const showGuide = () => {
    const error = validatePair(from, to);
    if (error) {
      setFormError(pairValidationMessage(error));
      return;
    }
    if (!from || !to) return;

    const resolved = resolveGuide({ from, to });
    const verifyChecklist = resolved.steps[resolved.steps.length - 1]?.checklist ?? [];
    setGuide(resolved);
    setStepIndex(0);
    setChecked(verifyChecklist.map(() => false));
    setFormError(null);
    setPhase("guide");

    trackHostviaEvent("calendar_pair_selected", {
      tool: TOOL_ID,
      from_platform: from,
      to_platform: to,
    });

    if (!started) {
      setStarted(true);
      trackHostviaEvent("calendar_guide_started", {
        tool: TOOL_ID,
        from_platform: from,
        to_platform: to,
      });
    }
  };

  const resetToSelect = () => {
    setPhase("select");
    setGuide(null);
    setStepIndex(0);
    setChecked([]);
    setFormError(null);
    writeProgress(null);
  };

  const goToStep = (index: number) => {
    if (!guide) return;
    setStepIndex(Math.max(0, Math.min(guide.steps.length - 1, index)));
  };

  const confirmStep = () => {
    if (!guide) return;
    if (stepIndex >= guide.steps.length - 1) {
      setPhase("complete");
      trackHostviaEvent("calendar_guide_completed", {
        tool: TOOL_ID,
        from_platform: guide.from,
        to_platform: guide.to,
      });
      return;
    }
    goToStep(stepIndex + 1);
  };

  const currentStep = guide?.steps[stepIndex];
  const totalSteps = guide?.steps.length ?? 0;

  return (
    <div
      ref={rootRef}
      id="calendar-sync-guide"
      className="hostvia-glow-card scroll-mt-24 p-5 sm:p-8"
    >
      {phase === "select" ? (
        <div>
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="marketing-heading text-2xl text-white outline-none md:text-[1.75rem]"
          >
            Sync Your Rental Calendars
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-400">
            Choose two booking platforms and we’ll show you how to connect their calendars, step by
            step.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <fieldset>
              <legend id={fromGroupId} className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                From
              </legend>
              <p className="mb-3 text-sm text-zinc-500">
                Choose the platform whose calendar you want to export.
              </p>
              <div role="radiogroup" aria-labelledby={fromGroupId} className="grid gap-2">
                {PLATFORM_OPTIONS.map((platform) => (
                  <PlatformChip
                    key={`from-${platform.id}`}
                    selected={from === platform.id}
                    disabled={to === platform.id}
                    name={platform.label}
                    hint={platform.selectorHint}
                    onSelect={() => {
                      setFrom(platform.id);
                      setFormError(null);
                    }}
                  />
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend id={toGroupId} className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                To
              </legend>
              <p className="mb-3 text-sm text-zinc-500">
                Choose the platform where you want to import that calendar.
              </p>
              <div role="radiogroup" aria-labelledby={toGroupId} className="grid gap-2">
                {PLATFORM_OPTIONS.map((platform) => (
                  <PlatformChip
                    key={`to-${platform.id}`}
                    selected={to === platform.id}
                    disabled={from === platform.id}
                    name={platform.label}
                    hint={platform.selectorHint}
                    onSelect={() => {
                      setTo(platform.id);
                      setFormError(null);
                    }}
                  />
                ))}
              </div>
            </fieldset>
          </div>

          {formError ? (
            <div
              role="alert"
              className="mt-5 rounded-xl border border-rose-400/30 bg-rose-500/[0.07] px-4 py-3 text-sm text-rose-200"
            >
              {formError}
            </div>
          ) : null}

          <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-zinc-500">
              {from && to
                ? `${platformLabel(from)} → ${platformLabel(to)}`
                : "No account needed. We never ask for private calendar links."}
            </p>
            <button
              type="button"
              onClick={showGuide}
              className="hostvia-btn-gradient inline-flex h-11 items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#06060a]"
            >
              Show Me How
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <p className="mt-5 text-xs leading-relaxed text-zinc-500">
            Calendar updates may take time. iCal synchronization is not always instant, and
            connecting one direction does not automatically connect the reverse direction.{" "}
            <button
              type="button"
              className="text-violet-300 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
              aria-expanded={limitationsOpen}
              onClick={() => setLimitationsOpen((value) => !value)}
            >
              Learn about sync limitations
            </button>
          </p>
          {limitationsOpen ? (
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-xs leading-relaxed text-zinc-500">
              <li>iCal usually shares booked or blocked dates, not every reservation detail.</li>
              <li>Each platform refreshes on its own schedule — none promise real-time sync.</li>
              <li>Sync reduces double-booking risk but cannot guarantee prevention.</li>
              <li>Never paste private iCal URLs into Hostvia or share them publicly.</li>
            </ul>
          ) : null}
        </div>
      ) : null}

      {phase === "guide" && guide && currentStep ? (
        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-violet-300">
                {guide.title}
              </p>
              <h2
                ref={headingRef}
                tabIndex={-1}
                className="mt-1 text-sm font-medium text-zinc-400 outline-none"
              >
                Step {stepIndex + 1} of {totalSteps}
              </h2>
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={resetToSelect}
              className="h-9 shrink-0 rounded-lg px-2 text-zinc-400 hover:bg-white/5 hover:text-white"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only sm:not-sr-only sm:ml-1">Change</span>
            </Button>
          </div>

          <div
            aria-hidden="true"
            className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/5"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-300"
              style={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }}
            />
          </div>

          {guide.needsConfirmation && stepIndex === 0 ? (
            <p
              role="status"
              className="mt-4 rounded-xl border border-amber-400/25 bg-amber-500/[0.07] px-3.5 py-2.5 text-xs leading-relaxed text-amber-100"
            >
              Some menus may differ. Confirm details in the official help links if needed.
            </p>
          ) : null}

          <div className="mt-6">
            <h3 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
              {currentStep.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-zinc-300 sm:text-base">
              {currentStep.body}
            </p>
            {currentStep.note ? (
              <p className="mt-3 text-sm text-zinc-500">{currentStep.note}</p>
            ) : null}

            {currentStep.links && currentStep.links.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {currentStep.links.map((link) => (
                  <a
                    key={`${link.kind}-${link.url}`}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackOutbound(link.url, `step_${currentStep.id}`)}
                    className={cn(
                      "inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300",
                      link.kind === "open_platform"
                        ? "hostvia-btn-gradient focus-visible:ring-offset-2 focus-visible:ring-offset-[#06060a]"
                        : "border border-white/15 bg-white/[0.03] text-zinc-100 hover:bg-white/10"
                    )}
                  >
                    {link.label}
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                ))}
              </div>
            ) : null}

            {currentStep.checklist ? (
              <ul className="mt-5 space-y-2">
                {currentStep.checklist.map((item, index) => (
                  <li key={item}>
                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-3 text-sm text-zinc-300">
                      <input
                        type="checkbox"
                        className="mt-0.5 h-4 w-4 rounded border-white/20 bg-transparent text-violet-500 focus-visible:ring-violet-400"
                        checked={Boolean(checked[index])}
                        onChange={(event) => {
                          setChecked((prev) => {
                            const next = [...prev];
                            next[index] = event.target.checked;
                            return next;
                          });
                        }}
                      />
                      <span>{item}</span>
                    </label>
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="mt-4 space-y-2">
              {currentStep.why ? <Expandable title="Why?">{currentStep.why}</Expandable> : null}
              {currentStep.needHelp ? (
                <Expandable title="Need help?">{currentStep.needHelp}</Expandable>
              ) : null}
            </div>
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="outline"
              disabled={stepIndex === 0}
              onClick={() => goToStep(stepIndex - 1)}
              className="h-11 rounded-xl border-white/15 bg-white/[0.03] px-5 text-zinc-100 hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Previous
            </Button>
            <button
              type="button"
              onClick={confirmStep}
              className="hostvia-btn-gradient inline-flex h-11 items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#06060a]"
            >
              {currentStep.confirmLabel}
              {stepIndex < totalSteps - 1 ? (
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              ) : null}
            </button>
          </div>

          <p className="mt-5 text-xs leading-relaxed text-zinc-500">
            Calendar updates may take time. Connecting one direction does not automatically connect
            the reverse direction.{" "}
            <button
              type="button"
              className="text-violet-300 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
              aria-expanded={limitationsOpen}
              onClick={() => setLimitationsOpen((value) => !value)}
            >
              Learn about sync limitations
            </button>
          </p>
          {limitationsOpen ? (
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-xs leading-relaxed text-zinc-500">
              {guide.limitationNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
              {guide.reverseNote ? <li>{guide.reverseNote}</li> : null}
            </ul>
          ) : null}
        </div>
      ) : null}

      {phase === "complete" && guide ? (
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-violet-300">
            {guide.title}
          </p>
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="marketing-heading mt-2 text-2xl text-white outline-none md:text-[1.75rem]"
          >
            Calendar connection checklist complete
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-400">
            Your calendar connection has been configured according to the steps above. Check the
            destination calendar again later to confirm that dates have updated.
          </p>
          <p className="mt-3 text-sm text-zinc-500">
            Hostvia cannot verify external platform setups automatically.
          </p>

          <ul className="mt-6 space-y-2">
            {guide.completionChecklist.map((item) => (
              <li
                key={item}
                className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-300"
              >
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>

          {guide.reverseNote ? (
            <p className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-relaxed text-zinc-400">
              {guide.reverseNote}
            </p>
          ) : null}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                setFrom(null);
                setTo(null);
                resetToSelect();
              }}
              className="hostvia-btn-gradient inline-flex h-11 items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#06060a]"
            >
              Start Another Calendar Connection
            </button>
            {guide.officialLinks[0] ? (
              <a
                href={guide.officialLinks[0].url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackOutbound(guide.officialLinks[0].url, "complete")}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.03] px-5 text-sm font-semibold text-zinc-100 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
              >
                View official instructions
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
