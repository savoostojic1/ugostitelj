import Link from "next/link";
import {
  ArrowRight,
  CalendarRange,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { PageHero } from "@/components/marketing/page-hero";
import { Button } from "@/components/ui/button";
import {
  coreFeatures,
  dashboardFeatures,
  homepageStats,
  howItWorksSteps,
} from "@/lib/marketing/content";

export default function HomePage() {
  return (
    <>
      <PageHero
        eyebrow="Platforma za domaćine smještaja"
        title="Jedan kalendar. Vaš sajt. Direktni upiti."
        description="Povežite Airbnb i Booking.com, upravljajte svim jedinicama iz jednog mjesta i objavite profesionalnu stranicu za goste — bez provizije na direktne bookinge."
        primaryCta={{ label: "Kreni besplatno", href: "/register" }}
        secondaryCta={{ label: "Pogledaj funkcije", href: "/funkcije" }}
      />

      <section className="border-b border-border bg-card/30 py-10">
        <div className="mx-auto grid max-w-6xl grid-cols-3 gap-6 px-4 md:px-6">
          {homepageStats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold tracking-tight text-primary md:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="marketing-eyebrow mb-4 justify-center">Problem</p>
          <h2 className="marketing-heading text-3xl md:text-4xl">
            Previše kalendara, premalo vremena
          </h2>
          <p className="mt-4 text-muted-foreground">
            Domaćini gube sate prebacujući se između Airbnb-a, Booking.com-a i
            poruka gostiju. Jedan propušten sync može značiti dupli booking.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-muted/40 p-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Prije
            </p>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>• Tri različita kalendara za tri platforme</li>
              <li>• Ručno provjeravanje slobodnih termina</li>
              <li>• Gosti pitaju dostupnost preko Instagrama</li>
              <li>• Nema jedinstvenog mjesta za cijene i fotografije</li>
            </ul>
          </div>
          <div className="marketing-card rounded-2xl border border-primary/20 bg-primary/5 p-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Sa Ugostiteljem
            </p>
            <ul className="mt-4 space-y-3 text-sm">
              {[
                "Sve rezervacije u jednom dashboardu",
                "Automatska iCal sinhronizacija",
                "Javni sajt sa pretragom datuma i cijena",
                "Booking upiti direktno vama",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card/30 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="marketing-eyebrow mb-4 justify-center">Funkcije</p>
            <h2 className="marketing-heading text-3xl md:text-4xl">
              Sve što vam treba za svakodnevni rad
            </h2>
            <p className="mt-4 text-muted-foreground">
              Od sinhronizacije platformi do direktnih upita gostiju — bez
              komplikovanih integracija.
            </p>
          </div>
          <FeatureGrid features={coreFeatures} className="mt-12" />
          <div className="mt-10 text-center">
            <Button variant="outline" asChild>
              <Link href="/funkcije">
                Sve funkcije u detalje
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="marketing-eyebrow mb-4">Javni sajt</p>
            <h2 className="marketing-heading text-3xl md:text-4xl">
              Vaša stranica za direktne bookinge
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Svaki domaćin dobija adresu{" "}
              <span className="font-medium text-foreground">
                ugostitelj.me/host/vas-nalog
              </span>
              . Gosti pretražuju datume, vide cijenu boravka, galeriju i mapu —
              pa vam šalju upit.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Pretraga po datumu i broju gostiju",
                "Kalendar dostupnosti po jedinici",
                "Galerija, mapa i kontakt informacije",
                "Bez provizije na direktne upite",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <Sparkles className="h-4 w-4 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
            <Button className="mt-8" asChild>
              <Link href="/javni-sajt">
                Saznaj više o javnom sajtu
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="marketing-preview relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-[#0d6e6e]/10 via-background to-primary/10 p-6 shadow-lg">
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <CalendarRange className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">Pretraga smještaja</span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {["Dolazak", "Odlazak", "Gosti"].map((label) => (
                  <div
                    key={label}
                    className="rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground"
                  >
                    {label}
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground">
                Pretraži
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {["Apartman More", "Studio Centar"].map((name) => (
                <div
                  key={name}
                  className="rounded-xl border border-border bg-card p-3"
                >
                  <div className="aspect-[4/3] rounded-lg bg-gradient-to-br from-teal-100 to-teal-200" />
                  <p className="mt-2 text-sm font-semibold">{name}</p>
                  <p className="text-xs text-muted-foreground">od 45 € / noć</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card/30 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="marketing-eyebrow mb-4 justify-center">Kako radi</p>
            <h2 className="marketing-heading text-3xl md:text-4xl">
              Počnite za nekoliko minuta
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {howItWorksSteps.map((step) => (
              <div
                key={step.step}
                className="marketing-card rounded-2xl border border-border bg-card p-6"
              >
                <span className="text-3xl font-bold text-primary/30">
                  {step.step}
                </span>
                <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button variant="outline" asChild>
              <Link href="/kako-radi">Detaljan vodič</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="marketing-eyebrow mb-4 justify-center">Dashboard</p>
          <h2 className="marketing-heading text-3xl md:text-4xl">
            Alati za svakodnevnu operativu
          </h2>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {dashboardFeatures.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-border bg-card/60 p-5"
            >
              <h3 className="font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
