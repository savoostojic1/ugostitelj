import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { marketingFooter } from "@/lib/marketing/content";

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-card/40">
      <div className="mx-auto max-w-6xl px-4 py-14 md:px-6">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <CalendarDays className="h-5 w-5 text-primary" />
              Ugostitelj
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Kalendar, javni sajt i direktni booking upiti za domaćine
              kratkoročnog smještaja u regionu.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Proizvod
            </p>
            <ul className="mt-4 space-y-2">
              {marketingFooter.product.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-foreground/80 transition hover:text-primary"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Kompanija
            </p>
            <ul className="mt-4 space-y-2">
              {marketingFooter.company.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-foreground/80 transition hover:text-primary"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Pravno
            </p>
            <ul className="mt-4 space-y-2">
              {marketingFooter.legal.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-foreground/80 transition hover:text-primary"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Kontakt
            </p>
            <a
              href={`mailto:${marketingFooter.contact.email}`}
              className="mt-2 block text-sm text-foreground/80 transition hover:text-primary"
            >
              {marketingFooter.contact.email}
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-sm text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} Ugostitelj. Sva prava zadržana.</p>
          <p>Napravljeno za domaćine u Crnoj Gori i regionu.</p>
        </div>
      </div>
    </footer>
  );
}
