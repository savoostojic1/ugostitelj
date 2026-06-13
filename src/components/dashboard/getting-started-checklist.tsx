"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Circle,
  Globe,
  Home,
  Link2,
  Sparkles,
  X,
} from "lucide-react";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { Button } from "@/components/ui/button";
import { useSetupProgress } from "@/hooks/use-setup-progress";
import { useDashboardContext } from "@/hooks/use-team-access";
import {
  SETUP_DISMISS_STORAGE_KEY,
  type SetupStepId,
} from "@/lib/onboarding/setup-steps";
import { cn } from "@/lib/utils";

const STEP_ICONS: Record<SetupStepId, typeof Home> = {
  property: Home,
  calendar: Link2,
  "booking-site": Globe,
  "publish-listing": Sparkles,
};

export function GettingStartedChecklist({
  variant = "default",
}: {
  variant?: "default" | "compact";
}) {
  const { data: context } = useDashboardContext();
  const { progress, isLoading } = useSetupProgress();
  const [dismissed, setDismissed] = useState(false);

  const isOwner = context?.isOwner ?? false;

  useEffect(() => {
    try {
      setDismissed(
        window.localStorage.getItem(SETUP_DISMISS_STORAGE_KEY) === "1"
      );
    } catch {
      setDismissed(false);
    }
  }, []);

  function handleDismiss() {
    try {
      window.localStorage.setItem(SETUP_DISMISS_STORAGE_KEY, "1");
    } catch {
      // ignore
    }
    setDismissed(true);
  }

  if (!isOwner || isLoading || progress.isComplete) {
    return null;
  }

  if (dismissed && progress.hasProperty) {
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
        href={nextStep.href}
        className="hostvia-panel flex items-center gap-4 p-4 transition hover:border-violet-500/25"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-white">Continue setup</p>
          <p className="truncate text-xs text-zinc-500">{nextStep.title}</p>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-zinc-500" />
      </Link>
    );
  }

  return (
    <DashboardPanel
      title="Getting started"
      description={`${progress.completedCount} of ${progress.totalCount} steps complete`}
      icon={<Sparkles className="h-4 w-4" />}
      action={
        progress.hasProperty ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-zinc-500 hover:text-zinc-300"
            onClick={handleDismiss}
          >
            <X className="h-3.5 w-3.5" />
            Hide
          </Button>
        ) : null
      }
    >
      <div className="mb-5">
        <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {!progress.hasProperty ? (
        <div className="mb-5 rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
          <p className="text-sm leading-relaxed text-zinc-300">
            Welcome to Hostvia. Start by adding your first accommodation — then
            connect calendars and publish your direct booking site.
          </p>
          <Link
            href="/dashboard/properties/new"
            className="hostvia-btn-gradient mt-4 inline-flex h-10 items-center gap-2 rounded-lg px-5 text-sm font-semibold"
          >
            <Home className="h-4 w-4" />
            Add accommodation
          </Link>
        </div>
      ) : null}

      <ol className="space-y-3">
        {progress.steps.map((step, index) => {
          const Icon = STEP_ICONS[step.id];
          const isNext = !step.done && step.id === nextStep?.id;

          return (
            <li key={step.id}>
              <Link
                href={step.href}
                className={cn(
                  "flex items-start gap-3 rounded-xl border px-4 py-3 transition",
                  step.done
                    ? "border-emerald-500/20 bg-emerald-500/5"
                    : isNext
                      ? "border-violet-500/30 bg-violet-500/8 hover:border-violet-500/40"
                      : "border-white/8 bg-white/[0.02] hover:border-white/12 hover:bg-white/[0.04]"
                )}
              >
                <div
                  className={cn(
                    "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                    step.done
                      ? "bg-emerald-500/15 text-emerald-300"
                      : isNext
                        ? "bg-violet-500/15 text-violet-300"
                        : "bg-white/5 text-zinc-500"
                  )}
                >
                  {step.done ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-600">
                      Step {index + 1}
                    </span>
                    {isNext ? (
                      <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-200">
                        Next
                      </span>
                    ) : null}
                  </div>
                  <p
                    className={cn(
                      "mt-0.5 text-sm font-medium",
                      step.done ? "text-emerald-100" : "text-white"
                    )}
                  >
                    {step.title}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                    {step.description}
                  </p>
                </div>
                {!step.done ? (
                  <ArrowRight
                    className={cn(
                      "mt-2 h-4 w-4 shrink-0",
                      isNext ? "text-violet-400" : "text-zinc-600"
                    )}
                  />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ol>
    </DashboardPanel>
  );
}
