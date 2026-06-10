import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { PageHero } from "@/components/marketing/page-hero";
import { Button } from "@/components/ui/button";
import { pricingPlans } from "@/lib/marketing/content";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Cijene — Ugostitelj",
  description:
    "Trenutno besplatan pristup svim funkcijama Ugostitelja — kalendar, javni sajt i booking upiti.",
};

export default function CijenePage() {
  return (
    <>
      <PageHero
        eyebrow="Cijene"
        title="Jednostavno i transparentno"
        description="Trenutno su sve funkcije besplatne dok traje raniji pristup. Bez skrivenih troškova, bez kartice pri registraciji."
        primaryCta={{ label: "Kreni besplatno", href: "/register" }}
      />

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <div className="grid gap-8 lg:grid-cols-2">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative rounded-2xl border p-8",
                plan.highlighted
                  ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                  : "border-border bg-card"
              )}
            >
              {plan.highlighted ? (
                <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  Preporučeno
                </span>
              ) : null}
              <h3 className="text-xl font-semibold">{plan.name}</h3>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-bold tracking-tight">
                  {plan.price}
                </span>
                {plan.period ? (
                  <span className="text-muted-foreground">/ {plan.period}</span>
                ) : null}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {plan.description}
              </p>
              <ul className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                className="mt-8 w-full"
                variant={plan.highlighted ? "default" : "outline"}
                asChild
              >
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-card/30 py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center md:px-6">
          <h2 className="marketing-heading text-2xl">Šta je uključeno?</h2>
          <p className="mt-4 text-muted-foreground">
            Besplatni plan uključuje sve što domaćin treba za svakodnevni rad:
            sinhronizaciju kalendara, javni sajt, booking upite, cijene po
            datumima, galeriju, mapu, ručne rezervacije i iCal export.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Pro plan će biti dostupan kasnije za veće portfolije i timove.
            Javiti ćemo unaprijed prije bilo kakve promjene cijena.
          </p>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
