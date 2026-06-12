"use client";

import Link from "next/link";
import { ArrowRight, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthUser } from "@/hooks/use-auth-user";
import { cn } from "@/lib/utils";

type MarketingAuthActionsProps = {
  className?: string;
  onNavigate?: () => void;
  variant?: "header" | "menu";
};

export function MarketingAuthActions({
  className,
  onNavigate,
  variant = "header",
}: MarketingAuthActionsProps) {
  const { user, loading, displayName, initials } = useAuthUser();

  if (loading) {
    return (
      <div
        className={cn(
          "flex items-center gap-3",
          variant === "menu" && "w-full flex-col",
          className
        )}
      >
        <div className="h-9 w-28 animate-pulse rounded-lg bg-white/5" />
        {variant === "header" ? (
          <div className="h-9 w-24 animate-pulse rounded-lg bg-white/5" />
        ) : null}
      </div>
    );
  }

  if (user) {
    if (variant === "menu") {
      return (
        <div className={cn("flex flex-col gap-3", className)}>
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 text-sm font-semibold text-white">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white">Signed in</p>
              <p className="truncate text-sm text-zinc-400">{displayName}</p>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="hostvia-btn-gradient flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-semibold"
            onClick={onNavigate}
          >
            <LayoutDashboard className="h-4 w-4" />
            Go to dashboard
          </Link>
        </div>
      );
    }

    return (
      <div className={cn("flex items-center gap-3", className)}>
        <div className="hidden items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 sm:flex">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 text-xs font-semibold text-white">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
              Signed in
            </p>
            <p className="max-w-[10rem] truncate text-sm font-medium text-white">
              {displayName}
            </p>
          </div>
        </div>
        <Link
          href="/dashboard"
          className="hostvia-btn-gradient inline-flex h-9 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold sm:px-5"
          onClick={onNavigate}
        >
          Dashboard
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  if (variant === "menu") {
    return (
      <div className={cn("flex flex-col gap-2", className)}>
        <Button variant="outline" className="border-white/10" asChild>
          <Link href="/login" onClick={onNavigate}>
            Sign in
          </Link>
        </Button>
        <Link
          href="/register"
          className="hostvia-btn-gradient flex h-10 items-center justify-center rounded-lg text-sm font-semibold"
          onClick={onNavigate}
        >
          Start free
        </Link>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Button
        variant="ghost"
        className="text-zinc-400 hover:bg-white/5 hover:text-white"
        asChild
      >
        <Link href="/login" onClick={onNavigate}>
          Sign in
        </Link>
      </Button>
      <Link
        href="/register"
        className="hostvia-btn-gradient inline-flex h-9 items-center justify-center rounded-lg px-5 text-sm font-semibold"
        onClick={onNavigate}
      >
        Start free
      </Link>
    </div>
  );
}
