"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Sparkles, X } from "lucide-react";
import { MarketingAuthActions } from "@/components/marketing/marketing-auth-actions";
import { marketingNav } from "@/lib/marketing/content";
import { cn } from "@/lib/utils";

export function MarketingHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-[#06060a]/80 pt-[env(safe-area-inset-top,0px)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-semibold tracking-tight text-white"
          onClick={() => setOpen(false)}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 shadow-lg shadow-violet-500/25">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="truncate">
            hostvia<span className="text-violet-400">.me</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {marketingNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-zinc-400 transition hover:bg-white/5 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden shrink-0 lg:flex">
          <MarketingAuthActions />
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-white lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div
        className={cn(
          "border-t border-white/5 bg-[#06060a]/95 backdrop-blur-xl lg:hidden",
          open ? "block" : "hidden"
        )}
      >
        <nav className="mx-auto flex max-h-[calc(100dvh-4rem-env(safe-area-inset-top,0px))] max-w-7xl flex-col gap-1 overflow-y-auto px-4 py-4 sm:px-6">
          {marketingNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-300"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-3 border-t border-white/5 pt-4">
            <MarketingAuthActions
              variant="menu"
              onNavigate={() => setOpen(false)}
            />
          </div>
        </nav>
      </div>
    </header>
  );
}
