import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { PageHero } from "@/components/marketing/page-hero";
import { Button } from "@/components/ui/button";
import { howItWorksSteps } from "@/lib/marketing/content";

export const metadata: Metadata = {
  title: "Kako radi — Ugostitelj",
  description:
    "Registracija, povezivanje iCal kalendara, objava javnog sajta i primanje booking upita — korak po korak.",
};

const setupDetails = [
  {
    title: "Registracija i prva jedinica",
    items: [
      "Napravite nalog sa emailom i lozinkom",
      "Dodajte prvu jedinicu — naziv, kapacitet, osnovne informacije",
      "Postavite osnovnu cijenu po noći",
    ],
  },
  {
    title: "Povezivanje kalendara",
    items: [
      "U Airbnb ili Booking.com pronađite iCal export link",
      "Zalijepite link u podešavanjima jedinice u Ugostitelju",
      "Sačekajte prvi sync — rezervacije se pojavljuju u kalendaru",
    ],
  },
  {
    title: "Javni profil i sajt",
    items: [
      "U dashboardu otvorite Javni sajt",
      "Dodajte naziv biznisa, lokaciju, cover fotografiju i kontakt",
      "Objavite sajt — dobijate link za dijeljenje",
    ],
  },
  {
    title: "Primanje upita",
    items: [
      "Gost pretražuje datume na vašem javnom sajtu",
      "Vidi cijenu, dostupnost i šalje upit",
      "Vi pregledate upit u dashboardu i kontaktirate gosta",
    ],
  },
];

export default function KakoRadiPage() {
  return (
    <>
      <PageHero
        eyebrow="Kako radi"
        title="Od registracije do prvog upita"
        description="Ugostitelj je dizajniran da bude jednostavan. Evo tačnog redoslijeda koraka koje domaćini prate pri pokretanju."
        primaryCta={{ label: "Napravi nalog", href: "/register" }}
        secondaryCta={{ label: "Pogledaj cijene", href: "/cijene" }}
      />

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <div className="grid gap-8 lg:grid-cols-2">
          {howItWorksSteps.map((step, index) => (
            <div
              key={step.step}
              className="relative flex gap-6 rounded-2xl border border-border bg-card p-6"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                {index + 1}
              </div>
              <div>
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-card/30 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="marketing-heading text-2xl md:text-3xl">
            Detaljan vodič
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Svaki korak u praksi — šta tačno radite u dashboardu.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {setupDetails.map((section) => (
              <div
                key={section.title}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <h3 className="font-semibold">{section.title}</h3>
                <ul className="mt-4 space-y-3">
                  {section.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <div className="marketing-card rounded-2xl border border-primary/20 bg-primary/5 p-8 md:p-10">
          <h2 className="marketing-heading text-2xl">Savjet za brži start</h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Prvo povežite kalendare da vidite postojeće rezervacije. Zatim
            dodajte fotografije i objavite javni sajt. Na taj način odmah
            imate i operativni pregled i kanal za direktne upite.
          </p>
          <Button className="mt-6" asChild>
            <Link href="/register">
              Kreni sada
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
