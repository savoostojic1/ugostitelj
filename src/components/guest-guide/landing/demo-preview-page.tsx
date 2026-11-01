"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, X } from "lucide-react";
import { GuideView } from "@/components/guest-guide/guide-renderer/guide-view";
import { GUEST_GUIDE_PATH } from "@/lib/guest-guide/content";
import { DEMO_GUIDE } from "@/lib/guest-guide/demo-data";
import { guestGuideFontClassNames } from "@/lib/guest-guide/fonts";
import { THEME_DEFINITIONS } from "@/lib/guest-guide/themes";
import {
  isGuestGuideTheme,
  type GuestGuideTheme,
} from "@/lib/guest-guide/types";
import { trackHostviaEvent } from "@/lib/analytics/track";

function resolveTheme(value: string | null | undefined): GuestGuideTheme {
  return value && isGuestGuideTheme(value) ? value : DEMO_GUIDE.theme;
}

export function GuestGuideDemoPreviewPage({
  initialTheme,
}: {
  initialTheme?: string | null;
}) {
  const router = useRouter();
  const theme = resolveTheme(initialTheme);
  const document = { ...DEMO_GUIDE, theme };
  const themeName =
    THEME_DEFINITIONS.find((item) => item.id === theme)?.name ?? "Preview";
  const backHref = `${GUEST_GUIDE_PATH}#live-preview`;

  function selectTheme(next: GuestGuideTheme) {
    if (next === theme) return;
    trackHostviaEvent("guest_guide_template_select", {
      theme: next,
      location: "demo_preview_page",
    });
    router.replace(`/guest-guide/demo?theme=${next}`, { scroll: false });
  }

  function closePreview() {
    window.location.assign(backHref);
  }

  return (
    <div className={`min-h-dvh bg-zinc-950 ${guestGuideFontClassNames()}`}>
      <header className="sticky top-0 z-20 border-b border-white/10 bg-zinc-950/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <Link
            href={backHref}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/15 px-3 text-sm font-medium text-zinc-200 transition hover:border-white/30 hover:bg-white/[0.06]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to Guest Guide
          </Link>
          <p className="min-w-0 flex-1 text-sm text-zinc-400">
            Live preview · <span className="text-zinc-200">{themeName}</span>
          </p>
          <div
            className="flex flex-wrap gap-1.5"
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
                  onClick={() => selectTheme(item.id)}
                  className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
                    selected
                      ? "border-amber-200/40 bg-amber-100/[0.1] text-white"
                      : "border-white/10 text-zinc-400 hover:border-white/25 hover:text-zinc-200"
                  }`}
                >
                  {item.name}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-white transition hover:bg-white/10"
            onClick={closePreview}
            aria-label="Close preview"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>
      <main>
        <GuideView document={document} showBrand />
      </main>
    </div>
  );
}
