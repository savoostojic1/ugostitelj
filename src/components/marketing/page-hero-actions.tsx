"use client";

import Link from "next/link";
import { MarketingPrimaryCta } from "@/components/marketing/marketing-primary-cta";
import { cn } from "@/lib/utils";

type PageHeroActionsProps = {
  primaryCta?: {
    label: string;
    href: string;
    loggedInLabel?: string;
    loggedInHref?: string;
  };
  secondaryCta?: { label: string; href: string };
  centered?: boolean;
};

export function PageHeroActions({
  primaryCta,
  secondaryCta,
  centered = true,
}: PageHeroActionsProps) {
  if (!primaryCta && !secondaryCta) return null;

  return (
    <div
      className={cn(
        "mt-10 flex flex-wrap gap-4",
        centered && "justify-center"
      )}
    >
      {primaryCta ? (
        <MarketingPrimaryCta
          className="h-11 px-6"
          loggedOutLabel={primaryCta.label}
          loggedOutHref={primaryCta.href}
          loggedInLabel={primaryCta.loggedInLabel ?? "Go to dashboard"}
          loggedInHref={primaryCta.loggedInHref ?? "/dashboard"}
        />
      ) : null}
      {secondaryCta ? (
        <Link
          href={secondaryCta.href}
          className="inline-flex h-11 items-center rounded-xl border border-white/10 bg-white/5 px-6 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          {secondaryCta.label}
        </Link>
      ) : null}
    </div>
  );
}
