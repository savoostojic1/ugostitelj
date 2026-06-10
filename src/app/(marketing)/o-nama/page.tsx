import type { Metadata } from "next";
import Link from "next/link";
import { Heart, MapPin, Target, Users } from "lucide-react";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { PageHero } from "@/components/marketing/page-hero";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "O nama — Ugostitelj",
  description:
    "Ugostitelj je platforma za domaćine kratkoročnog smještaja u Crnoj Gori i regionu — kalendar, javni sajt i direktni upiti.",
};

const values = [
  {
    icon: Target,
    title: "Jednostavnost",
    description:
      "Tehnologija treba da olakša posao, ne da ga komplikuje. iCal umjesto API-ja, upiti umjesto kompleksnog payment flow-a.",
  },
  {
    icon: Users,
    title: "Domaćin na prvom mjestu",
    description:
      "Gradimo alate koje sami domaćini koriste svaki dan — kalendar, dolasci, poruke, direktni kontakt sa gostima.",
  },
  {
    icon: MapPin,
    title: "Lokalni fokus",
    description:
      "Razumijemo specifičnosti rada u regionu — sezonalnost, više kanala prodaje, direktni booking preko društvenih mreža.",
  },
  {
    icon: Heart,
    title: "Direktni odnos",
    description:
      "Vjerujemo da domaćin i gost treba da komuniciraju direktno. Manje posrednika, više kontrole nad poslom.",
  },
];

export default function ONamaPage() {
  return (
    <>
      <PageHero
        eyebrow="O nama"
        title="Alat napravljen za domaćine u regionu"
        description="Ugostitelj je nastao iz potrebe da se Airbnb, Booking.com i direktni upiti gostiju vode sa jednog mjesta — bez komplikovanih integracija."
        primaryCta={{ label: "Kreni besplatno", href: "/register" }}
      />

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="marketing-heading text-2xl md:text-3xl">
              Naša priča
            </h2>
            <div className="mt-6 space-y-4 text-muted-foreground">
              <p>
                Domaćini kratkoročnog smještaja provode previše vremena
                prebacujući se između platformi, provjeravajući kalendare i
                odgovarajući na ista pitanja gostiju. Ugostitelj to rješava
                spajajući operativni kalendar sa javnim sajtom za direktne
                upite.
              </p>
              <p>
                Počeli smo sa iCal sinhronizacijom — jednostavnim načinom da
                sve rezervacije budu na jednom mjestu. Zatim smo dodali javni
                sajt, cijene po datumima, galeriju i booking upite kako bi
                domaćini mogli privući goste direktno, bez provizije.
              </p>
              <p>
                Danas Ugostitelj koriste domaćini koji žele profesionalniji
                rad sa smještajem — bilo da imaju jedan apartman ili više
                jedinica.
              </p>
            </div>
          </div>
          <div className="marketing-card rounded-2xl border border-border bg-card p-8">
            <h3 className="text-lg font-semibold">Za koga gradimo</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>• Vlasnici apartmana i studija</li>
              <li>• Mala apartmanska naselja i bungalovi</li>
              <li>• Domaćini na Airbnb-u i Booking.com-u</li>
              <li>• Ugostitelji koji žele direktne bookinge</li>
              <li>• Operateri sa više jedinica u Crnoj Gori i regionu</li>
            </ul>
            <Button className="mt-6" variant="outline" asChild>
              <Link href="/funkcije">Pogledaj funkcije</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card/30 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="marketing-heading text-center text-2xl md:text-3xl">
            Naše vrijednosti
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {values.map((value) => (
              <div
                key={value.title}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <value.icon className="h-8 w-8 text-primary" />
                <h3 className="mt-4 text-lg font-semibold">{value.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
