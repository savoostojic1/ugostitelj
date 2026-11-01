"use client";

import { Expand } from "lucide-react";
import { GuideView } from "@/components/guest-guide/guide-renderer/guide-view";
import { DEMO_GUIDE } from "@/lib/guest-guide/demo-data";
import { THEME_DEFINITIONS } from "@/lib/guest-guide/themes";
import type { GuestGuideTheme } from "@/lib/guest-guide/types";
import { trackHostviaEvent } from "@/lib/analytics/track";

export function GuestGuideLiveDemo({
  theme,
  onThemeChange,
}: {
  theme: GuestGuideTheme;
  onThemeChange: (theme: GuestGuideTheme) => void;
}) {
  const document = { ...DEMO_GUIDE, theme };
  const previewHref = `/guest-guide/demo?theme=${theme}`;

  return (
    <div className="gg-landing-demo">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="marketing-eyebrow">Interactive live preview</p>
          <h2 className="marketing-heading mt-2 text-2xl text-white md:text-3xl">
            Explore a real guest guide
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-400 md:text-base">
            Villa Oliva — a fictional Mediterranean villa. Same components and
            templates as published guides. No account needed.
          </p>
        </div>
        <a
          href={previewHref}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-4 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/[0.07]"
          onClick={() => {
            trackHostviaEvent("guest_guide_preview_open", {
              mode: "fullscreen_page",
              theme,
            });
          }}
        >
          <Expand className="h-4 w-4" aria-hidden />
          Fullscreen preview
        </a>
      </div>

      <div
        className="mt-6 flex gap-2 overflow-x-auto pb-1"
        role="tablist"
        aria-label="Guide design themes"
      >
        {THEME_DEFINITIONS.map((item) => {
          const selected = item.id === theme;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => {
                onThemeChange(item.id);
                trackHostviaEvent("guest_guide_template_select", {
                  theme: item.id,
                  location: "landing_demo",
                });
              }}
              className={`min-w-[11.5rem] rounded-2xl border px-3.5 py-3 text-left transition ${
                selected
                  ? "border-amber-200/40 bg-amber-100/[0.08]"
                  : "border-white/10 bg-white/[0.03] hover:border-white/20"
              }`}
            >
              <span className="mb-2 flex gap-1.5" aria-hidden>
                {item.swatch.map((color) => (
                  <span
                    key={color}
                    className="h-3.5 w-3.5 rounded-full border border-white/20"
                    style={{ background: color }}
                  />
                ))}
              </span>
              <span className="block text-sm font-semibold text-white">
                {item.name}
              </span>
              <span className="mt-0.5 block text-xs text-zinc-400">
                {item.tagline}
              </span>
            </button>
          );
        })}
      </div>

      <div className="gg-landing-demo-frame mt-5 overflow-hidden rounded-[1.5rem] border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
        <div className="max-h-[min(78vh,820px)] overflow-y-auto">
          <GuideView document={document} compact showBrand />
        </div>
      </div>
    </div>
  );
}
