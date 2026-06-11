import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface PublicSectionHeaderProps {
  index: string;
  kicker: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  align?: "left" | "center";
  className?: string;
}

export function PublicSectionHeader({
  index,
  kicker,
  title,
  description,
  icon,
  align = "center",
  className,
}: PublicSectionHeaderProps) {
  const centered = align === "center";

  return (
    <header
      className={cn(
        "public-animate-in",
        centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl",
        className
      )}
    >
      <p
        className={cn(
          "public-section-kicker mb-3",
          centered && "justify-center"
        )}
      >
        <span className="public-section-kicker-index">{index}</span>
        {icon}
        {kicker}
      </p>
      <h2 className="public-heading text-3xl md:text-4xl">{title}</h2>
      {description ? (
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--public-muted)]">
          {description}
        </p>
      ) : null}
    </header>
  );
}
