"use client";

import Link from "next/link";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { useSetupProgress } from "@/hooks/use-setup-progress";
import { useDashboardContext } from "@/hooks/use-team-access";
import { cn } from "@/lib/utils";

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
  const progressPercent = Math.round(
    (progress.completedCount / progress.totalCount) * 100
  );

  if (variant === "compact") {
    if (!nextStep) return null;

    return (
      <Link
        href="/dashboard"
        className="hostvia-panel flex items-center gap-4 p-4 transition hover:border-violet-500/25"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-white">Continue setup</p>
          <p className="truncate text-xs text-zinc-500">
            {progress.completedCount} of {progress.totalCount} done ·{" "}
            {nextStep.title}
          </p>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-zinc-500" />
      </Link>
    );
  }

  return (
    <div className="space-y-4">
      <div className="hostvia-dashboard-page-inset">
        <div className="mb-2 flex items-center justify-between gap-3 text-xs text-zinc-500">
          <span>
            {progress.completedCount} of {progress.totalCount} steps done
          </span>
          <span className="tabular-nums">{progressPercent}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <ol className="hostvia-dashboard-page-inset space-y-3">
        {progress.steps.map((step, index) => {
          const isNext = !step.done && step.id === nextStep?.id;
          const needsPlaceFirst = step.requiresProperty && !progress.hasProperty;
          const href = needsPlaceFirst ? "/dashboard/properties/new" : step.href;
          const actionLabel = needsPlaceFirst
            ? "Add a place first"
            : step.done
              ? "Open again"
              : step.actionLabel;

          return (
            <li key={step.id}>
              <article
                className={cn(
                  "rounded-2xl border p-4 sm:p-5",
                  step.done
                    ? "border-emerald-500/20 bg-emerald-500/5"
                    : isNext
                      ? "border-violet-500/35 bg-violet-500/10"
                      : "border-white/8 bg-white/[0.02]"
                )}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-semibold",
                      step.done
                        ? "bg-emerald-500/15 text-emerald-300"
                        : isNext
                          ? "bg-violet-500/20 text-violet-200"
                          : "bg-white/5 text-zinc-400"
                    )}
                  >
                    {step.done ? <Check className="h-4 w-4" /> : index + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2
                        className={cn(
                          "text-base font-semibold",
                          step.done ? "text-emerald-100" : "text-white"
                        )}
                      >
                        {step.title}
                      </h2>
                      {step.done ? (
                        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-200">
                          Done
                        </span>
                      ) : isNext ? (
                        <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-200">
                          Do this now
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-zinc-400">
                      {step.description}
                    </p>

                    {!step.done ? (
                      <ul className="mt-3 space-y-1.5">
                        {step.tasks.map((task) => (
                          <li
                            key={task}
                            className="flex items-start gap-2 text-sm leading-relaxed text-zinc-300"
                          >
                            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-zinc-500" />
                            <span>{task}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}

                    {needsPlaceFirst ? (
                      <p className="mt-3 text-xs text-zinc-500">
                        This step opens after you add a place.
                      </p>
                    ) : null}

                    <Link
                      href={href}
                      className={cn(
                        "mt-4 inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold",
                        step.done
                          ? "border border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                          : isNext
                            ? "hostvia-btn-gradient"
                            : "border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
                      )}
                    >
                      {actionLabel}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
