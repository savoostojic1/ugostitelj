import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Uslovi korištenja — Ugostitelj",
  description: "Uslovi korištenja platforme Ugostitelj za domaćine i goste.",
};

export default function UsloviPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-20">
      <p className="marketing-eyebrow mb-4">Pravno</p>
      <h1 className="marketing-heading text-3xl md:text-4xl">
        Uslovi korištenja
      </h1>
      <p className="mt-4 text-sm text-muted-foreground">
        Posljednje ažuriranje: {new Date().getFullYear()}
      </p>

      <div className="prose-marketing mt-10 space-y-8 text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground">
            1. Prihvatanje uslova
          </h2>
          <p className="mt-3 leading-relaxed">
            Korištenjem platforme Ugostitelj („Usluga“) prihvatate ove uslove.
            Ako se ne slažete, nemojte koristiti Uslugu. Uslugu pružamo domaćinima
            kratkoročnog smještaja za upravljanje kalendarima i javnim stranicama
            za booking upite.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            2. Nalog i odgovornost
          </h2>
          <p className="mt-3 leading-relaxed">
            Odgovorni ste za tačnost informacija koje unesete, sigurnost naloga
            i sve aktivnosti na vašem nalogu. Obavezni ste unositi tačne podatke
            o smještaju, cijenama i dostupnosti.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            3. Priroda usluge
          </h2>
          <p className="mt-3 leading-relaxed">
            Ugostitelj nije travel agencija niti payment procesor. Pružamo
            alate za sinhronizaciju kalendara i prijem booking upita. Ugovor o
            smještaju nastaje između domaćina i gosta — mi nismo strana u tom
            ugovoru.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            4. Booking upiti
          </h2>
          <p className="mt-3 leading-relaxed">
            Upiti koje gosti šalju preko javnog sajta nisu garantovana
            rezervacija. Domaćin samostalno odlučuje da li prihvata upit i
            dogovara detalje plaćanja direktno sa gostom.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            5. iCal sinhronizacija
          </h2>
          <p className="mt-3 leading-relaxed">
            iCal integracija zavisi od platformi trećih strana (Airbnb,
            Booking.com). Ne garantujemo trenutnu sinhronizaciju u svim
            situacijama. Preporučujemo redovnu provjeru kalendara.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            6. Zabranjena upotreba
          </h2>
          <p className="mt-3 leading-relaxed">
            Zabranjeno je koristiti Uslugu za nezakonite aktivnosti, unošenje
            lažnih podataka, zloupotrebu podataka gostiju ili pokušaj ometanja
            rada platforme.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            7. Intelektualna svojina
          </h2>
          <p className="mt-3 leading-relaxed">
            Platforma, dizajn i softver su vlasništvo Ugostitelja. Sadržaj koji
            domaćin uploaduje (fotografije, opisi) ostaje vlasništvo domaćina,
            uz licencu za prikaz na javnom sajtu.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            8. Ograničenje odgovornosti
          </h2>
          <p className="mt-3 leading-relaxed">
            Usluga se pruža „kakva jeste“. Ne odgovaramo za gubitke nastale
            zbog grešaka sinhronizacije, propuštenih rezervacija ili sporova
            između domaćina i gostiju, osim u mjeri propisane primjenjivim
            zakonima.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            9. Promjene uslova
          </h2>
          <p className="mt-3 leading-relaxed">
            Možemo ažurirati ove uslove. O značajnim promjenama obavijestićemo
            registrovane korisnike. Nastavak korištenja nakon promjena znači
            prihvatanje novih uslova.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">10. Kontakt</h2>
          <p className="mt-3 leading-relaxed">
            Pitanja o uslovima:{" "}
            <a
              href="mailto:hello@ugostitelj.me"
              className="text-primary hover:underline"
            >
              hello@ugostitelj.me
            </a>
            . Više o podacima u{" "}
            <Link href="/privatnost" className="text-primary hover:underline">
              Politici privatnosti
            </Link>
            .
          </p>
        </section>
      </div>
    </article>
  );
}
