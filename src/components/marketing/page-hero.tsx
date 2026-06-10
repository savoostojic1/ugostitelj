import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  centered?: boolean;
  className?: string;
}

export function PageHero({
  eyebrow,
  title,
  description,
  primaryCta,
  secondaryCta,
  centered = true,
  className,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        "marketing-hero relative overflow-hidden border-b border-border",
        className
      )}
    >
      <div className="marketing-hero-glow pointer-events-none absolute inset-0" />
      <div
        className={cn(
          "relative mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24",
          centered && "text-center"
        )}
      >
        {eyebrow ? (
          <p className="marketing-eyebrow mb-4">{eyebrow}</p>
        ) : null}
        <h1
          className={cn(
            "marketing-heading max-w-4xl text-4xl md:text-5xl lg:text-6xl",
            centered && "mx-auto"
          )}
        >
          {title}
        </h1>
        <p
          className={cn(
            "mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl",
            centered && "mx-auto"
          )}
        >
          {description}
        </p>
        {primaryCta || secondaryCta ? (
          <div
            className={cn(
              "mt-10 flex flex-wrap gap-4",
              centered && "justify-center"
            )}
          >
            {primaryCta ? (
              <Button size="lg" asChild>
                <Link href={primaryCta.href}>
                  {primaryCta.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : null}
            {secondaryCta ? (
              <Button size="lg" variant="outline" asChild>
                <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
