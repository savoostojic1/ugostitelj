"use client";

import Link from "next/link";
import { ArrowRight, Check, Lock, Sparkles } from "lucide-react";
import { useSetupProgress } from "@/hooks/use-setup-progress";
import { useDashboardContext } from "@/hooks/use-team-access";
import { cn } from "@/lib/utils";

function ProgressRing({
  percent,
  size = 64,
  stroke = 6,
}: {
  percent: number;
  size?: number;
  stroke?: number;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${percent}% complete`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="hostvia-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#hostvia-ring)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold tabular-nums text-white">
        {percent}%
      </span>
    </div>
  );
}

export function GettingStartedChecklist({
  variant = "default",
}: {
  variant?: "default" | "compact";
}) {
  const { data: context } = useDashboardContext();
  const { progress, isLoading } = useSetupProgress();

  const isOwner = context?.isOwner ?? false;

  if (!isOwner || isLoading || progress.isComplete) {
    return null;
  }

  const nextStep = progress.steps.find((step) => !step.done);
  const nextIndex = progress.steps.findIndex((step) => !step.done);
  const progressPercent = Math.round(
    (progress.completedCount / progress.totalCount) * 100
  );
  const remaining = progress.totalCount - progress.completedCount;

  if (variant === "compact") {
    if (!nextStep) return null;

    return (
      <Link
        href="/dashboard"
        className="hostvia-panel group flex items-center gap-4 p-4 transition hover:border-violet-500/30"
      >
        <ProgressRing percent={progressPercent} size={44} stroke={4} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">Continue setup</p>
          <p className="truncate text-xs text-zinc-500">
            {progress.completedCount} of {progress.totalCount} done · Next:{" "}
            {nextStep.title}
          </p>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-zinc-500 transition group-hover:translate-x-0.5 group-hover:text-violet-300" />
      </Link>
    );
  }

  const resolveStep = (step: (typeof progress.steps)[number]) => {
    const needsPlaceFirst = step.requiresProperty && !progress.hasProperty;
    return {
      needsPlaceFirst,
      href: needsPlaceFirst ? "/dashboard/properties/new" : step.href,
      actionLabel: needsPlaceFirst
        ? "Add a place first"
        : step.done
          ? "Open again"
          : step.actionLabel,
    };
  };

  const next = nextStep ? resolveStep(nextStep) : null;
  const otherSteps = progress.steps
    .map((step, index) => ({ step, index }))
    .filter(({ step }) => step.id !== nextStep?.id);

  return (
    <div className="hostvia-dashboard-page-inset space-y-4">
      {/* Progress overview + stepper */}
      <section className="hostvia-onboard-hero">
        <div className="hostvia-onboard-hero-glow" aria-hidden />
        <div className="relative flex items-center gap-4 sm:gap-5">
          <ProgressRing percent={progressPercent} />
          <div className="min-w-0">
            <p className="text-base font-semibold text-white sm:text-lg">
              {remaining === 1
                ? "One step left until guests can book you"
                : `${remaining} steps left until guests can book you`}
            </p>
            <p className="mt-0.5 text-sm text-zinc-400">
              {progress.completedCount} of {progress.totalCount} done · each
              step takes a couple of minutes
            </p>
          </div>
        </div>

        <ol className="relative mt-5 grid grid-cols-4 gap-2" aria-label="Setup steps">
          {progress.steps.map((step, index) => {
            const isNext = step.id === nextStep?.id;
            const { href } = resolveStep(step);
            return (
              <li key={step.id} className="min-w-0">
                <Link
                  href={href}
                  className="group block"
                  aria-current={isNext ? "step" : undefined}
                >
                  <span
                    className={cn(
                      "block h-1.5 rounded-full transition-colors",
                      step.done
                        ? "bg-emerald-400/80"
                        : isNext
                          ? "hostvia-onboard-segment-active"
                          : "bg-white/10 group-hover:bg-white/20"
                    )}
                  />
                  <span
                    className={cn(
                      "mt-2 hidden truncate text-xs sm:block",
                      step.done
                        ? "text-emerald-300/90"
                        : isNext
                          ? "font-medium text-white"
                          : "text-zinc-500 group-hover:text-zinc-300"
                    )}
                  >
                    {index + 1}. {step.title}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Focused next step */}
      {nextStep && next ? (
        <article className="hostvia-onboard-focus">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 text-base font-bold text-white shadow-lg shadow-violet-500/30">
                {nextIndex + 1}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-200">
                    <Sparkles className="h-3 w-3" />
                    Do this now
                  </span>
                  <span className="text-xs text-zinc-500">
                    Step {nextIndex + 1} of {progress.totalCount}
                  </span>
                </div>
                <h2 className="mt-2 text-lg font-semibold tracking-tight text-white sm:text-xl">
                  {nextStep.title}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-zinc-400">
                  {nextStep.description}
                </p>

                <ol className="mt-4 space-y-2">
                  {nextStep.tasks.map((task, taskIndex) => (
                    <li
                      key={task}
                      className="flex items-start gap-3 text-sm leading-relaxed text-zinc-200"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/15 text-[11px] font-semibold text-zinc-400">
                        {taskIndex + 1}
                      </span>
                      <span>{task}</span>
                    </li>
                  ))}
                </ol>

                {next.needsPlaceFirst ? (
                  <p className="mt-3 flex items-center gap-1.5 text-xs text-zinc-500">
                    <Lock className="h-3.5 w-3.5" />
                    This step opens after you add a place.
                  </p>
                ) : null}
              </div>
            </div>

            <Link
              href={next.href}
              className="hostvia-btn-gradient inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold md:w-auto"
            >
              {next.actionLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </article>
      ) : null}

      {/* Remaining & completed steps */}
      {otherSteps.length > 0 ? (
        <ul className="hostvia-panel divide-y divide-white/[0.06]">
          {otherSteps.map(({ step, index }) => {
            const { href, actionLabel, needsPlaceFirst } = resolveStep(step);
            return (
              <li key={step.id}>
                <Link
                  href={href}
                  className="group flex items-center gap-3 px-4 py-3.5 transition hover:bg-white/[0.03] sm:px-5"
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-semibold",
                      step.done
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "bg-white/5 text-zinc-400"
                    )}
                  >
                    {step.done ? <Check className="h-4 w-4" /> : index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block truncate text-sm font-medium",
                        step.done ? "text-zinc-400 line-through decoration-zinc-600" : "text-white"
                      )}
                    >
                      {step.title}
                    </span>
                    <span className="block truncate text-xs text-zinc-500">
                      {step.done
                        ? "Done"
                        : needsPlaceFirst
                          ? "Opens after you add a place"
                          : step.description}
                    </span>
                  </span>
                  <span className="hidden shrink-0 text-xs font-medium text-zinc-500 transition group-hover:text-violet-300 sm:inline">
                    {actionLabel}
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-zinc-600 transition group-hover:translate-x-0.5 group-hover:text-violet-300" />
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
