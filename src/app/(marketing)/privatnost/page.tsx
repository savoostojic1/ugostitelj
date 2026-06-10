import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politika privatnosti — Ugostitelj",
  description: "Kako Ugostitelj prikuplja, koristi i štiti vaše podatke.",
};

export default function PrivatnostPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-20">
      <p className="marketing-eyebrow mb-4">Pravno</p>
      <h1 className="marketing-heading text-3xl md:text-4xl">
        Politika privatnosti
      </h1>
      <p className="mt-4 text-sm text-muted-foreground">
        Posljednje ažuriranje: {new Date().getFullYear()}
      </p>

      <div className="prose-marketing mt-10 space-y-8 text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground">Uvod</h2>
          <p className="mt-3 leading-relaxed">
            Ugostitelj („mi“, „platforma“) poštuje vašu privatnost. Ova
            politika objašnjava koje podatke prikupljamo, kako ih koristimo i
            koja su vaša prava kada koristite našu uslugu kao domaćin ili gost
            koji šalje booking upit.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            Podaci koje prikupljamo
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed">
            <li>
              <strong className="text-foreground">Nalog domaćina:</strong> email,
              lozinka (hashirana), naziv biznisa, kontakt podaci, podešavanja
              profila i jedinica.
            </li>
            <li>
              <strong className="text-foreground">Podaci o smještaju:</strong>{" "}
              nazivi jedinica, cijene, kalendarski podaci, fotografije, opisi i
              lokacija.
            </li>
            <li>
              <strong className="text-foreground">Booking upiti:</strong> ime,
              email, telefon i poruka gosta koje gost dobrovoljno unese na
              javnom sajtu domaćina.
            </li>
            <li>
              <strong className="text-foreground">Tehnički podaci:</strong> IP
              adresa, tip uređaja i osnovni logovi potrebni za rad i sigurnost
              usluge.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            Kako koristimo podatke
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed">
            <li>Pružanje i održavanje usluge (kalendar, javni sajt, upiti)</li>
            <li>Sinhronizacija iCal kalendara sa platformama trećih strana</li>
            <li>Komunikacija sa domaćinima o nalogu i podršci</li>
            <li>Poboljšanje sigurnosti i funkcionalnosti platforme</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            Dijeljenje podataka
          </h2>
          <p className="mt-3 leading-relaxed">
            Ne prodajemo vaše podatke. Booking upiti koje gost pošalje idu
            direktno domaćinu čiji javni sajt posjećuju. Koristimo pouzdane
            pružaoce usluga (npr. hosting, baza podataka) isključivo za rad
            platforme, uz odgovarajuće ugovore o obradi podataka.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            Čuvanje podataka
          </h2>
          <p className="mt-3 leading-relaxed">
            Podatke čuvamo dok imate aktivan nalog ili dok je potrebno za
            pružanje usluge. Možete zatražiti brisanje naloga kontaktiranjem
            nas putem emaila navedenog na stranici{" "}
            <Link href="/kontakt" className="text-primary hover:underline">
              Kontakt
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Vaša prava</h2>
          <p className="mt-3 leading-relaxed">
            Imate pravo na pristup, ispravku i brisanje svojih podataka, kao i
            pravo na prigovor obradi u skladu sa važećim propisima o zaštiti
            podataka. Za ostvarivanje prava kontaktirajte nas na{" "}
            <a
              href="mailto:hello@ugostitelj.me"
              className="text-primary hover:underline"
            >
              hello@ugostitelj.me
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Kontakt</h2>
          <p className="mt-3 leading-relaxed">
            Za pitanja o privatnosti pišite na{" "}
            <a
              href="mailto:hello@ugostitelj.me"
              className="text-primary hover:underline"
            >
              hello@ugostitelj.me
            </a>
            .
          </p>
        </section>
      </div>
    </article>
  );
}
