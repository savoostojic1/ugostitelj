import Link from "next/link";
import { JsonLd } from "@/lib/seo/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo/structured-data";

export function MarketingBreadcrumbs({
  items,
}: {
  items: { name: string; path: string }[];
}) {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(items)} />
      <nav
        aria-label="Breadcrumb"
        className="mx-auto max-w-6xl px-4 pt-8 text-sm text-zinc-500 md:px-6"
      >
        <ol className="flex flex-wrap items-center gap-2">
          {items.map((item, index) => {
            const last = index === items.length - 1;
            return (
              <li key={item.path} className="flex items-center gap-2">
                {index > 0 ? <span aria-hidden="true">/</span> : null}
                {last ? (
                  <span className="text-zinc-300" aria-current="page">
                    {item.name}
                  </span>
                ) : (
                  <Link href={item.path} className="hover:text-white">
                    {item.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
