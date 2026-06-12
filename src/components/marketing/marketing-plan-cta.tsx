"use client";

import Link from "next/link";
import { useAuthUser } from "@/hooks/use-auth-user";
import { cn } from "@/lib/utils";

type MarketingPlanCtaProps = {
  loggedOutHref: string;
  loggedOutLabel: string;
  loggedInHref?: string;
  loggedInLabel?: string;
  highlighted?: boolean;
  className?: string;
};

export function MarketingPlanCta({
  loggedOutHref,
  loggedOutLabel,
  loggedInHref = "/dashboard",
  loggedInLabel = "Go to dashboard",
  highlighted = false,
  className,
}: MarketingPlanCtaProps) {
  const { user, loading } = useAuthUser();

  if (loading) {
    return (
      <div
        className={cn(
          "mt-8 flex h-11 animate-pulse items-center justify-center rounded-xl bg-white/10",
          className
        )}
      />
    );
  }

  const href = user ? loggedInHref : loggedOutHref;
  const label = user ? loggedInLabel : loggedOutLabel;

  return (
    <Link
      href={href}
      className={cn(
        "mt-8 flex h-11 items-center justify-center rounded-xl text-sm font-semibold transition",
        highlighted
          ? "hostvia-btn-gradient"
          : "border border-white/10 bg-white/5 text-white hover:bg-white/10",
        className
      )}
    >
      {label}
    </Link>
  );
}
