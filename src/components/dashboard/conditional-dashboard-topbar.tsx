"use client";

import { usePathname } from "next/navigation";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";

const TOPBAR_PATHS = new Set(["/dashboard", "/dashboard/cleanings"]);

export function ConditionalDashboardTopbar() {
  const pathname = usePathname();
  if (!TOPBAR_PATHS.has(pathname)) return null;
  return <DashboardTopbar />;
}
