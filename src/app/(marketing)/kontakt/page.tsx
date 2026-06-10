import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";
import { PageHero } from "@/components/marketing/page-hero";
import { Button } from "@/components/ui/button";
import { marketingFooter } from "@/lib/marketing/content";

export const metadata: Metadata = {
  title: "Kontakt — Ugostitelj",
  description:
    "Kontaktirajte Ugostitelj tim za pitanja o registraciji, iCal sinhronizaciji ili javnom sajtu.",
};

const contactTopics = [
  "Pomoć pri povezivanju Airbnb ili Booking.com kalendara",
  "Podešavanje javnog sajta i booking upita",
  "Pitanja o cijenama i planovima",
  "Predlozi za nove funkcije",
  "Partnerstva i saradnja",
];

export default function KontaktPage() {
  const email = marketingFooter.contact.email;

  return (
    <>
      <PageHero
        eyebrow="Kontakt"
        title="Tu smo da pomognemo"
        description="Imate pitanje o podešavanju, funkcijama ili saradnji? Javite se — odgovaramo u najkraćem mogućem roku."
      />

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="marketing-card rounded-2xl border border-border bg-card p-8">
            <Mail className="h-8 w-8 text-primary" />
            <h2 className="mt-4 text-xl font-semibold">Email</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Najbrži način da nas kontaktirate. Opišite pitanje i pošaljite
              screenshot ako je potrebno.
            </p>
            <a
              href={`mailto:${email}`}
              className="mt-4 block text-lg font-semibold text-primary hover:underline"
            >
              {email}
            </a>
            <Button className="mt-6" asChild>
              <a href={`mailto:${email}?subject=Pitanje%20o%20Ugostitelju`}>
                Pošalji email
              </a>
            </Button>
          </div>

          <div className="rounded-2xl border border-border bg-card/60 p-8">
            <MessageCircle className="h-8 w-8 text-primary" />
            <h2 className="mt-4 text-xl font-semibold">Kako možemo pomoći</h2>
            <ul className="mt-4 space-y-3">
              {contactTopics.map((topic) => (
                <li
                  key={topic}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {topic}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center">
          <p className="font-semibold">Već imate nalog?</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Za tehnička pitanja uključite email naloga i naziv jedinice u
            poruci — brže ćemo pomoći.
          </p>
          <Button className="mt-4" variant="outline" asChild>
            <Link href="/login">Prijava u dashboard</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
