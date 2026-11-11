"use client";

import { ArrowRight, Check, ListChecks, Wand2 } from "lucide-react";
import { SectionTitle } from "@/components/website-builder/ui";
import { themeMeta } from "@/lib/website-builder/themes";
import type { WebsiteDocument } from "@/lib/website-builder/types";
import { cn } from "@/lib/utils";

/** After the design is chosen: let AI write the site from a listing, or build it step by step. */
export function BuildChoice({ document, onChoose }: { document: WebsiteDocument; onChoose: (choice: "ai" | "manual") => void }) {
  const meta = themeMeta(document.theme);
  const options = [
    {
      id: "ai" as const,
      icon: <Wand2 className="h-5 w-5" />,
      badge: "Recommended",
      title: "Build it for me with AI",
      text: `Paste your Booking.com or Airbnb listing and add your photo folder. AI writes every page in the ${meta.name} style.`,
      points: ["About 1 minute", "Then straight to launch", "Change any word afterwards"],
      primary: true,
    },
    {
      id: "manual" as const,
      icon: <ListChecks className="h-5 w-5" />,
      badge: null,
      title: "Build it step by step",
      text: "Fill in your place, photographs, stays and pages yourself, one screen at a time.",
      points: ["About 10 minutes", "Six short steps", "Full control from the start"],
      primary: false,
    },
  ];
  return (
    <div>
      <SectionTitle
        eyebrow="How to build"
        title="How would you like to build it?"
        description="Both end with the same website and the same editor. You can switch at any time."
      />
      <div className="grid gap-3">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChoose(option.id)}
            className={cn(
              "group relative overflow-hidden rounded-2xl border p-5 text-left transition duration-300",
              option.primary
                ? "border-violet-400/40 bg-gradient-to-br from-violet-500/[0.14] via-fuchsia-500/[0.06] to-transparent hover:border-violet-300/70 hover:shadow-[0_0_0_4px_rgba(139,92,246,0.12)]"
                : "border-white/[0.09] bg-white/[0.025] hover:border-white/25 hover:bg-white/[0.05]"
            )}
          >
            <div className="flex items-start gap-4">
              <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl", option.primary ? "bg-violet-500/25 text-violet-100" : "bg-white/[0.07] text-zinc-300")}>
                {option.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-[16px] font-semibold text-white">{option.title}</span>
                  {option.badge ? (
                    <span className="rounded-full bg-violet-400/20 px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-violet-100">{option.badge}</span>
                  ) : null}
                </span>
                <span className="mt-1.5 block text-[13px] leading-relaxed text-zinc-400">{option.text}</span>
                <span className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
                  {option.points.map((point) => (
                    <span key={point} className="inline-flex items-center gap-1.5 text-[12px] text-zinc-300">
                      <Check className={cn("h-3.5 w-3.5", option.primary ? "text-violet-300" : "text-zinc-500")} />
                      {point}
                    </span>
                  ))}
                </span>
              </span>
              <ArrowRight className="mt-3 h-4 w-4 shrink-0 text-zinc-500 transition group-hover:translate-x-0.5 group-hover:text-white" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
