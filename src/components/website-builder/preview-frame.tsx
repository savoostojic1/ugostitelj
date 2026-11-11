"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { WebsiteView } from "@/components/website-public/website-view";
import type { WebsiteEditApi } from "@/components/website-public/primitives";
import type { PublicWebsiteModel } from "@/lib/website-builder/types";
import { cn } from "@/lib/utils";

export type Device = "desktop" | "tablet" | "mobile";

const WIDTHS: Record<Device, number> = { desktop: 1440, tablet: 834, mobile: 390 };

/**
 * Renders the real website at a true device width and scales it to fit with CSS
 * zoom, so layout, type and container queries match what guests will see.
 */
export function PreviewFrame({
  model,
  device,
  edit,
  className,
  chrome = true,
}: {
  model: PublicWebsiteModel;
  device: Device;
  edit?: WebsiteEditApi;
  className?: string;
  chrome?: boolean;
}) {
  const outer = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const node = outer.current;
    if (!node) return;
    const measure = () => setBox({ width: node.clientWidth, height: node.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const width = WIDTHS[device];
  const gutter = device === "desktop" ? 0 : 32;
  const zoom = box.width ? Math.min(1, (box.width - gutter) / width) : 0;
  const frameWidth = Math.round(width * zoom);
  const ready = zoom > 0;

  // Scroll back to the top when the page changes.
  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
  }, [model.page.id, device]);

  return (
    <div ref={outer} className={cn("relative flex h-full w-full justify-center overflow-hidden", className)}>
      {ready ? (
        <div
          className={cn(
            // translateZ makes this frame the containing block for fixed overlays (the booking panel).
            "relative flex h-full flex-col overflow-hidden bg-white transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] [transform:translateZ(0)]",
            chrome && device === "desktop" && "rounded-t-xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] ring-1 ring-white/10",
            chrome && device === "tablet" && "my-4 h-[calc(100%-2rem)] rounded-[28px] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] ring-[10px] ring-[#1b1a21]",
            chrome && device === "mobile" && "my-4 h-[calc(100%-2rem)] rounded-[44px] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] ring-[10px] ring-[#1b1a21]"
          )}
          style={{ width: frameWidth }}
        >
          {chrome && device === "desktop" ? (
            <div className="flex h-8 shrink-0 items-center gap-1.5 border-b border-black/5 bg-[#f4f4f5] px-3">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              <span className="mx-auto max-w-[60%] truncate rounded-md bg-white px-3 py-0.5 text-[11px] text-zinc-500">
                {(model.profile.name || "your-stay").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "your-stay"}.hostvia.me
                {model.page.isHome ? "" : `/${model.page.slug}`}
              </span>
            </div>
          ) : null}
          <div ref={scroller} data-wbx-canvas className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain [scrollbar-width:thin]">
            <div style={{ width, zoom, ["--wbx-zoom" as string]: zoom }}>
              <WebsiteView model={model} edit={edit} refreshKey={`${device}:${zoom.toFixed(3)}`} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
