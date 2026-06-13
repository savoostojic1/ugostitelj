"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  canAccessDashboardPath,
  defaultTeamLandingPath,
} from "@/lib/team-access/permissions";
import { useDashboardContext } from "@/hooks/use-team-access";

export function TeamAccessGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: context, isLoading } = useDashboardContext();

  useEffect(() => {
    if (isLoading || !context || context.isOwner) return;

    if (pathname === "/dashboard/team-access") {
      router.replace(defaultTeamLandingPath(context.permissions));
      return;
    }

    if (pathname.startsWith("/dashboard/billing")) {
      router.replace(defaultTeamLandingPath(context.permissions));
      return;
    }

    if (!canAccessDashboardPath(pathname, context.permissions)) {
      router.replace(defaultTeamLandingPath(context.permissions));
      return;
    }

    if (
      pathname === "/dashboard" &&
      !context.permissions.includes("dashboard")
    ) {
      router.replace(defaultTeamLandingPath(context.permissions));
    }
  }, [context, isLoading, pathname, router]);

  if (isLoading) return null;

  if (context && !context.isOwner) {
    if (pathname === "/dashboard/team-access") return null;
    if (pathname.startsWith("/dashboard/billing")) return null;
    if (!canAccessDashboardPath(pathname, context.permissions)) return null;
    if (
      pathname === "/dashboard" &&
      !context.permissions.includes("dashboard")
    ) {
      return null;
    }
  }

  return <>{children}</>;
}
