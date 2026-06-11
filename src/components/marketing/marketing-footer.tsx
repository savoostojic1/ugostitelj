import Link from "next/link";
import { Sparkles } from "lucide-react";
import { marketingFooter } from "@/lib/marketing/content";

export function MarketingFooter() {
  return (
    <footer className="border-t border-white/5 bg-[#040408]">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2.5 font-semibold text-white">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              hostvia.me
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-500">
              Your booking site and reservation dashboard in one place.
              Direct reservations with no commission.
            </p>
          </div>

          {[
            { title: "Product", links: marketingFooter.product },
            { title: "Company", links: marketingFooter.company },
            { title: "Legal", links: marketingFooter.legal },
          ].map((col) => (
            <div key={col.title}>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                {col.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-zinc-400 transition hover:text-violet-400"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 text-sm text-zinc-600 md:flex-row">
          <p>© {new Date().getFullYear()} Hostvia. All rights reserved.</p>
          <a
            href={`mailto:${marketingFooter.contact.email}`}
            className="text-zinc-500 transition hover:text-violet-400"
          >
            {marketingFooter.contact.email}
          </a>
        </div>
      </div>
    </footer>
  );
}
