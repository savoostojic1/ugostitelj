import type { Metadata } from "next";
import Link from "next/link";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { PageHero } from "@/components/marketing/page-hero";
import { Button } from "@/components/ui/button";
import { faqItems } from "@/lib/marketing/content";

export const metadata: Metadata = {
  title: "FAQ — Ugostitelj",
  description:
    "Odgovori na česta pitanja o iCal sinhronizaciji, javnom sajtu, booking upitima i korištenju Ugostitelja.",
};

export default function FaqPage() {
  return (
    <>
      <PageHero
        eyebrow="FAQ"
        title="Česta pitanja"
        description="Sve što domaćini najčešće pitaju prije nego što krenu — od iCal linkova do booking upita."
        primaryCta={{ label: "Kreni besplatno", href: "/register" }}
        secondaryCta={{ label: "Kontakt", href: "/kontakt" }}
      />

      <section className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-20">
        <FaqAccordion items={faqItems} />
        <div className="mt-10 rounded-2xl border border-border bg-card p-6 text-center">
          <p className="font-medium">Niste našli odgovor?</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Pišite nam — rado ćemo pomoći oko podešavanja kalendara ili javnog
            sajta.
          </p>
          <Button className="mt-4" variant="outline" asChild>
            <Link href="/kontakt">Kontaktiraj nas</Link>
          </Button>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
