"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { WebsiteView } from "@/components/website-public/website-view";
import { WEBSITE_BUILDER_PATH } from "@/lib/website-builder/limits";
import { sampleWebsiteModel } from "@/lib/website-builder/sample-site";
import { WEBSITE_THEME_META, themeMeta } from "@/lib/website-builder/themes";
import type { WebsiteThemeId } from "@/lib/website-builder/types";

/** A full-page, scrollable sample site with a slim switcher bar. */
export function WebsiteDemo({ theme, pageType }: { theme: WebsiteThemeId; pageType: string }) {
  const model = useMemo(() => sampleWebsiteModel(theme, pageType), [theme, pageType]);
  const meta = themeMeta(theme);
  return (
    <div className="min-h-screen">
      <WebsiteView model={model} />
      <div className="fixed inset-x-0 bottom-4 z-[100] flex justify-center px-4">
        <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-white/10 bg-[#0d0c12]/90 p-1.5 text-sm text-zinc-200 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] backdrop-blur-xl">
          <Link href="/free-tools/vacation-rental-website-builder" className="flex h-9 items-center gap-1.5 rounded-full px-3 text-zinc-400 hover:text-white" aria-label="Back to the website builder">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          {WEBSITE_THEME_META.map((item) => (
            <Link
              key={item.id}
              href={`${WEBSITE_BUILDER_PATH}/demo/${item.id}`}
              className={`flex h-9 items-center rounded-full px-3.5 text-[13px] transition ${item.id === theme ? "bg-white text-black" : "text-zinc-400 hover:text-white"}`}
              aria-current={item.id === theme ? "page" : undefined}
            >
              {item.name}
            </Link>
          ))}
          <Link
            href={`${WEBSITE_BUILDER_PATH}?theme=${theme}`}
            className="ml-1 flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 text-[13px] font-semibold text-white"
          >
            Start with {meta.name}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
