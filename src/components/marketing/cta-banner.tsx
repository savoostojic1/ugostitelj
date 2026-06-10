import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaBanner() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
      <div className="marketing-cta relative overflow-hidden rounded-2xl border border-primary/20 bg-primary px-6 py-14 text-center text-primary-foreground md:px-12">
        <div className="marketing-cta-glow pointer-events-none absolute inset-0" />
        <div className="relative">
          <h2 className="marketing-heading text-2xl md:text-3xl">
            Spremni da pojednostavite posao?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/85">
            Napravite nalog, povežite kalendare i objavite javni sajt — sve za
            nekoliko minuta. Trenutno besplatno.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-primary hover:bg-white/90"
              asChild
            >
              <Link href="/register">
                Kreni besplatno
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 bg-transparent text-white hover:bg-white/10"
              asChild
            >
              <Link href="/kako-radi">Pogledaj kako radi</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
