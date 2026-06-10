import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Image,
  MapPin,
  Search,
  Send,
} from "lucide-react";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { PageHero } from "@/components/marketing/page-hero";
import { Button } from "@/components/ui/button";
import { publicSiteFeatures } from "@/lib/marketing/content";

export const metadata: Metadata = {
  title: "Javni sajt — Ugostitelj",
  description:
    "Profesionalna stranica za goste sa pretragom datuma, galerijom, mapom i direktnim booking upitima — bez provizije.",
};

const guestFlow = [
  {
    icon: Search,
    title: "Pretraga",
    description: "Gost bira dolazak, odlazak i broj osoba.",
  },
  {
    icon: CalendarDays,
    title: "Dostupnost",
    description: "Vidi samo slobodne jedinice sa cijenom za cijeli boravak.",
  },
  {
    icon: Image,
    title: "Pregled",
    description: "Galerija, kapacitet, sadržaji i opis jedinice.",
  },
  {
    icon: Send,
    title: "Upit",
    description: "Popuni kontakt formu — vi dobijate upit u dashboardu.",
  },
];

export default function JavniSajtPage() {
  return (
    <>
      <PageHero
        eyebrow="Javni sajt"
        title="Vaša stranica za direktne bookinge"
        description="Svaki domaćin dobija vlastitu stranicu za goste. Pretraga datuma, tačne cijene, galerija i mapa — sve na jednom mjestu, bez posrednika."
        primaryCta={{ label: "Napravi nalog", href: "/register" }}
        secondaryCta={{ label: "Pogledaj cijene", href: "/cijene" }}
      />

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="marketing-heading text-2xl md:text-3xl">
              Vaš link, vaš brend
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Nakon objave dobijate adresu poput{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                ugostitelj.me/host/vas-nalog
              </code>
              . Podijelite je na Instagramu, u email potpisu ili na Google
              profilu — gosti dolaze direktno vama.
            </p>
            <ul className="mt-6 space-y-4">
              {[
                "Cover fotografija i profil domaćina",
                "Kontakt telefon, email i društvene mreže",
                "Google Maps lokacija",
                "Sve vaše jedinice na jednom mjestu",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-gradient-to-br from-teal-50 to-indigo-50 p-8 dark:from-teal-950/30 dark:to-indigo-950/30">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Primjer URL-a
            </p>
            <p className="mt-3 text-2xl font-bold tracking-tight">
              ugostitelj.me/host/apartmani-more
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Gosti vide vaš brend, pretražuju smještaj i šalju upit — bez
              odlaska na OTA platformu.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card/30 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="marketing-heading text-2xl md:text-3xl">
            Šta gosti vide
          </h2>
          <FeatureGrid features={publicSiteFeatures} columns={2} className="mt-10" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <h2 className="marketing-heading text-2xl md:text-3xl">
          Put gosta do upita
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {guestFlow.map((step, index) => (
            <div
              key={step.title}
              className="relative rounded-2xl border border-border bg-card p-6"
            >
              <span className="text-xs font-bold text-primary">
                Korak {index + 1}
              </span>
              <step.icon className="mt-4 h-8 w-8 text-primary" />
              <h3 className="mt-4 font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-card/30 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="marketing-card rounded-2xl border border-border bg-card p-8 md:p-10">
            <h2 className="marketing-heading text-2xl">
              Direktni upiti = 0% provizije
            </h2>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Booking upiti nisu instant plaćanje — to je prednost. Vi
              razgovarate sa gostom, dogovorite detalje i plaćanje direktno.
              Nema posrednika koji uzima proviziju od direktnog booka.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Button asChild>
                <Link href="/register">
                  Objavi svoj sajt
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/faq">Česta pitanja</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
