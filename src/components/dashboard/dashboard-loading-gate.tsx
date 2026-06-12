"use client";

import { useIsFetching } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { DashboardLoader } from "@/components/dashboard/dashboard-loader";
import { cn } from "@/lib/utils";

export function DashboardLoadingGate({ children }: { children: ReactNode }) {
  const pendingQueries = useIsFetching({
    predicate: (query) => query.state.status === "pending",
  });

  const isLoading = pendingQueries > 0;

  return (
    <div className="relative min-h-[50vh]">
      <div
        className={cn(
          "transition-opacity duration-200",
          isLoading && "pointer-events-none opacity-30"
        )}
      >
        {children}
      </div>

      {isLoading ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="rounded-2xl border border-white/8 bg-[#0a0a10]/80 px-8 py-7 shadow-2xl backdrop-blur-md">
            <DashboardLoader />
          </div>
        </div>
      ) : null}
    </div>
  );
}
