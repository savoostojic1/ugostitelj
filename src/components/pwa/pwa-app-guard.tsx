"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DashboardLoader } from "@/components/dashboard/dashboard-loader";
import { useAuthUser } from "@/hooks/use-auth-user";
import {
  isPwaAllowedPath,
  isStandaloneDisplayMode,
  setStandaloneCookie,
} from "@/lib/pwa/standalone";

export function PwaAppGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuthUser();

  useEffect(() => {
    if (!isStandaloneDisplayMode()) return;
    document.documentElement.dataset.standalone = "true";
    setStandaloneCookie();

    const viewportMeta = document.querySelector('meta[name="viewport"]');
    viewportMeta?.setAttribute(
      "content",
      "width=device-width, initial-scale=1, viewport-fit=cover"
    );
  }, []);

  useEffect(() => {
    if (!isStandaloneDisplayMode() || loading) return;
    if (isPwaAllowedPath(pathname)) return;

    router.replace(user ? "/dashboard" : "/login");
  }, [pathname, user, loading, router]);

  if (
    isStandaloneDisplayMode() &&
    !loading &&
    !isPwaAllowedPath(pathname)
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#06060a]">
        <DashboardLoader label="Opening app…" />
      </div>
    );
  }

  return children;
}
