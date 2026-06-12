import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardLoaderProps {
  label?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-9 w-9",
  md: "h-12 w-12",
  lg: "h-14 w-14",
} as const;

export function DashboardLoader({
  label = "Loading…",
  className,
  size = "md",
}: DashboardLoaderProps) {
  return (
    <div
      className={cn("flex flex-col items-center gap-4", className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className={cn("relative", sizeClasses[size])}>
        <div className="absolute inset-0 rounded-full border-2 border-white/8" />
        <div className="hostvia-dashboard-loader-ring absolute inset-0 rounded-full" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-violet-400" aria-hidden />
        </div>
      </div>
      {label ? (
        <p className="text-sm font-medium tracking-tight text-zinc-400">
          {label}
        </p>
      ) : null}
    </div>
  );
}
