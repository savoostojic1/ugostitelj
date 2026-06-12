import { PageHeroActions } from "@/components/marketing/page-hero-actions";
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
    <section className={cn("relative overflow-hidden px-4 py-20 md:px-8 md:py-28", className)}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[100px]" />
      </div>
      <div
        className={cn(
          "relative mx-auto max-w-4xl",
          centered && "text-center"
        )}
      >
        {eyebrow ? <p className="marketing-eyebrow mb-4">{eyebrow}</p> : null}
        <h1
          className={cn(
            "marketing-heading text-4xl text-white md:text-5xl",
            centered && "mx-auto"
          )}
        >
          {title}
        </h1>
        <p
          className={cn(
            "mt-6 text-lg leading-relaxed text-zinc-400",
            centered && "mx-auto max-w-2xl"
          )}
        >
          {description}
        </p>
        <PageHeroActions
          primaryCta={primaryCta}
          secondaryCta={secondaryCta}
          centered={centered}
        />
      </div>
    </section>
  );
}
