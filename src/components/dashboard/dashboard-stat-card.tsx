import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardStatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  accent?: "violet" | "cyan" | "emerald" | "rose" | "amber";
  className?: string;
  featured?: boolean;
}

const accentBar = {
  violet: "from-violet-500 to-indigo-500",
  cyan: "from-cyan-500 to-blue-500",
  emerald: "from-emerald-500 to-teal-500",
  rose: "from-rose-500 to-pink-500",
  amber: "from-amber-500 to-orange-500",
};

const accentIcon = {
  violet: "text-violet-400 bg-violet-500/15 ring-violet-500/20",
  cyan: "text-cyan-400 bg-cyan-500/15 ring-cyan-500/20",
  emerald: "text-emerald-400 bg-emerald-500/15 ring-emerald-500/20",
  rose: "text-rose-400 bg-rose-500/15 ring-rose-500/20",
  amber: "text-amber-400 bg-amber-500/15 ring-amber-500/20",
};

export function DashboardStatCard({
  label,
  value,
  icon: Icon,
  trend,
  accent = "violet",
  className,
  featured,
}: DashboardStatCardProps) {
  return (
    <div
      className={cn(
        "hostvia-stat-card group relative overflow-hidden",
        featured && "hostvia-stat-card-featured",
        className
      )}
    >
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-px bg-gradient-to-r opacity-80",
          accentBar[accent]
        )}
      />
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-inset",
            accentIcon[accent]
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        {trend ? (
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-zinc-500">
            {trend}
          </span>
        ) : null}
      </div>
      <p className="mt-5 text-3xl font-bold tracking-tight text-white tabular-nums">
        {value}
      </p>
      <p className="mt-1 text-sm text-zinc-500">{label}</p>
    </div>
  );
}
