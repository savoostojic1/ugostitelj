import type { MarketingFeature } from "@/lib/marketing/content";
import { cn } from "@/lib/utils";

interface FeatureGridProps {
  features: MarketingFeature[];
  columns?: 2 | 3;
  className?: string;
}

export function FeatureGrid({
  features,
  columns = 3,
  className,
}: FeatureGridProps) {
  return (
    <div
      className={cn(
        "grid gap-6",
        columns === 2 && "md:grid-cols-2",
        columns === 3 && "md:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {features.map((feature) => (
        <div
          key={feature.title}
          className="hostvia-glow-card p-6"
        >
          <div className="mb-4 inline-flex rounded-xl bg-violet-500/15 p-3">
            <feature.icon className="h-6 w-6 text-violet-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            {feature.description}
          </p>
        </div>
      ))}
    </div>
  );
}
