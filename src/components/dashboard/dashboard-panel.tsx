import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DashboardPanelProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  noPadding?: boolean;
}

export function DashboardPanel({
  title,
  description,
  icon,
  action,
  children,
  className,
  contentClassName,
  noPadding,
}: DashboardPanelProps) {
  const hasHeader = title || action;

  return (
    <section className={cn("hostvia-panel", className)}>
      {hasHeader ? (
        <div className="hostvia-panel-header">
          <div className="flex min-w-0 items-start gap-3">
            {icon ? (
              <div className="hostvia-panel-icon">{icon}</div>
            ) : null}
            <div className="min-w-0">
              {title ? (
                <h2 className="text-sm font-semibold text-white">{title}</h2>
              ) : null}
              {description ? (
                <p className="mt-0.5 text-xs text-zinc-500">{description}</p>
              ) : null}
            </div>
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
      <div
        className={cn(
          !noPadding && (hasHeader ? "hostvia-panel-body" : "p-5"),
          contentClassName
        )}
      >
        {children}
      </div>
    </section>
  );
}
