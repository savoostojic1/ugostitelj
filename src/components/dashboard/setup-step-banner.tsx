"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useSetupProgress } from "@/hooks/use-setup-progress";
import { useDashboardContext } from "@/hooks/use-team-access";
import type { SetupStepId } from "@/lib/onboarding/setup-steps";
import { cn } from "@/lib/utils";

export function SetupStepBanner({ stepId }: { stepId: SetupStepId }) {
  const { data: context } = useDashboardContext();
  const { progress, isLoading } = useSetupProgress();

  const isOwner = context?.isOwner ?? false;
  if (!isOwner || isLoading || progress.isComplete) return null;

  const index = progress.steps.findIndex((step) => step.id === stepId);
  const step = progress.steps[index];
  if (!step) return null;

  const nextStep = progress.steps.find((item) => !item.done);

  if (step.done) {
    if (!nextStep) return null;

    return (
      <div className="hostvia-dashboard-page-inset">
        <div className="flex flex-col gap-3 rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/12 to-emerald-500/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
              <Check className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-100">
                Step {index + 1} is done
              </p>
              <p className="mt-0.5 text-sm text-zinc-400">
                Next: {nextStep.title}
              </p>
            </div>
          </div>
          <Link
            href={nextStep.href}
            className="hostvia-btn-gradient inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="hostvia-dashboard-page-inset">
      <div className="hostvia-onboard-focus !p-4 sm:!p-5">
        <div className="mb-4 flex gap-1.5" aria-hidden>
          {progress.steps.map((item) => (
            <span
              key={item.id}
              className={cn(
                "h-1 flex-1 rounded-full",
                item.done
                  ? "bg-emerald-400/80"
                  : item.id === stepId
                    ? "hostvia-onboard-segment-active"
                    : "bg-white/10"
              )}
            />
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-300">
            Step {index + 1} of {progress.totalCount}
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 transition hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All steps
          </Link>
        </div>
        <h2 className="mt-2 text-base font-semibold text-white">{step.title}</h2>
        <p className="mt-1 text-sm text-zinc-400">{step.description}</p>
        <ol className="mt-3 space-y-2">
          {step.tasks.map((task, taskIndex) => (
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
      </div>
    </div>
  );
}
