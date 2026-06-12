"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthUser } from "@/hooks/use-auth-user";
import { cn } from "@/lib/utils";

type MarketingAuthButtonProps = {
  loggedOutHref?: string;
  loggedOutLabel: string;
  loggedInHref?: string;
  loggedInLabel?: string;
  variant?: "default" | "outline";
  className?: string;
  showArrow?: boolean;
};

export function MarketingAuthButton({
  loggedOutHref = "/register",
  loggedOutLabel,
  loggedInHref = "/dashboard",
  loggedInLabel = "Go to dashboard",
  variant = "default",
  className,
  showArrow = false,
}: MarketingAuthButtonProps) {
  const { user, loading } = useAuthUser();

  if (loading) {
    return (
      <Button
        variant={variant}
        disabled
        className={cn("animate-pulse", className)}
      >
        …
      </Button>
    );
  }

  const href = user ? loggedInHref : loggedOutHref;
  const label = user ? loggedInLabel : loggedOutLabel;

  return (
    <Button variant={variant} className={className} asChild>
      <Link href={href}>
        {label}
        {showArrow ? <ArrowRight className="h-4 w-4" /> : null}
      </Link>
    </Button>
  );
}
