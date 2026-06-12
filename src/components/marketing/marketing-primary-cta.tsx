"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useAuthUser } from "@/hooks/use-auth-user";
import { cn } from "@/lib/utils";

type MarketingPrimaryCtaProps = {
  className?: string;
  tone?: "gradient" | "light";
  loggedOutLabel?: string;
  loggedOutHref?: string;
  loggedInLabel?: string;
  loggedInHref?: string;
};

export function MarketingPrimaryCta({
  className,
  tone = "gradient",
  loggedOutLabel = "Start free",
  loggedOutHref = "/register",
  loggedInLabel = "Go to dashboard",
  loggedInHref = "/dashboard",
}: MarketingPrimaryCtaProps) {
  const { user, loading } = useAuthUser();

  const baseClass =
    tone === "light"
      ? "inline-flex h-12 items-center gap-2 rounded-xl bg-white px-8 text-sm font-bold text-violet-700 transition hover:bg-white/90"
      : "hostvia-btn-gradient inline-flex h-12 items-center gap-2 rounded-xl px-7 text-sm font-semibold";

  if (loading) {
    return (
      <div
        className={cn(
          "h-12 w-36 animate-pulse rounded-xl bg-white/10",
          className
        )}
      />
    );
  }

  const href = user ? loggedInHref : loggedOutHref;
  const label = user ? loggedInLabel : loggedOutLabel;

  return (
    <Link href={href} className={cn(baseClass, "justify-center", className)}>
      {label}
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}
