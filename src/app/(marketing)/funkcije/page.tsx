import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { PageHero } from "@/components/marketing/page-hero";
import { Button } from "@/components/ui/button";
import {
  coreFeatures,
  dashboardFeatures,
} from "@/lib/marketing/content";

export const metadata: Metadata = {
  title: "Funkcije — Ugostitelj",
  description:
    "iCal sinhronizacija, više jedinica, javni sajt, cijene po datumima, booking upiti i operativni dashboard za domaćine.",
};

export default function FunkcijePage() {
  return (
    <>
      <PageHero
        eyebrow="Funkcije"
        title="Kompletan alat za moderne domaćine"
        description="Ugostitelj spaja sinhronizaciju platformi, operativni kalendar i javni sajt za direktne upite — bez API integracija i bez komplikacija."
        primaryCta={{ label: "Kreni besplatno", href: "/register" }}
      />

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <div className="max-w-2xl">
          <h2 className="marketing-heading text-2xl md:text-3xl">
            Osnovne funkcije
          </h2>
          <p className="mt-3 text-muted-foreground">
            Sve što vam treba da vodite smještaj profesionalno, bilo da imate
            jedan apartman ili cijelo naselje.
          </p>
        </div>
        <FeatureGrid features={coreFeatures} className="mt-10" />
      </section>

      <section className="border-y border-border bg-card/30 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="max-w-2xl">
            <h2 className="marketing-heading text-2xl md:text-3xl">
              Dashboard i operativa
            </h2>
            <p className="mt-3 text-muted-foreground">
              Pored sinhronizacije, Ugostitelj pomaže u svakodnevnom radu —
              dolasci, poruke, ručne rezervacije i export.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {dashboardFeatures.map((feature) => (
              <div
                key={feature.title}
                className="marketing-card rounded-2xl border border-border bg-card p-6"
              >
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="marketing-card rounded-2xl border border-border bg-card p-8">
            <h3 className="text-xl font-semibold">iCal sinhronizacija</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Airbnb i Booking.com nude iCal link za svaku listing jedinicu.
              Zalijepite ga u Ugostitelj i rezervacije se automatski uvezu. Nema
              potrebe za API ključevima ili tehničkim znanjem.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Kalendari se osvježavaju u pozadini. Ručno pokrenite sync kad
              god želite brzu provjeru.
            </p>
          </div>
          <div className="marketing-card rounded-2xl border border-border bg-card p-8">
            <h3 className="text-xl font-semibold">Export natrag na platforme</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Ručne rezervacije i blokade koje unesete u Ugostitelj možete
              izvesti kao iCal link. Dodajte ga u Airbnb ili Booking.com da
              platforme vide iste datume — smanjujete rizik duplog booka.
            </p>
          </div>
          <div className="marketing-card rounded-2xl border border-border bg-card p-8">
            <h3 className="text-xl font-semibold">Cijene po datumima</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Postavite osnovnu cijenu po noći, zatim dodajte pravila za
              određene periode — sezona, praznici, vikendi. Gosti na javnom
              sajtu vide tačan ukupan iznos za odabrani boravak.
            </p>
          </div>
          <div className="marketing-card rounded-2xl border border-border bg-card p-8">
            <h3 className="text-xl font-semibold">Booking upiti</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Gosti popunjavaju formu sa imenom, emailom i telefonom. Vi
              dobijate upit u dashboardu, pregledate detalje i kontaktirate
              gosta direktno. Vi odlučujete da li prihvatate rezervaciju.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          <Button asChild>
            <Link href="/javni-sajt">
              Javni sajt u detalje
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/kako-radi">Kako početi</Link>
          </Button>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
