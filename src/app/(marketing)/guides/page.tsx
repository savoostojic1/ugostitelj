import type { Metadata } from "next";
import Link from "next/link";
import { MarketingBreadcrumbs } from "@/components/marketing/marketing-breadcrumbs";
import { PageHero } from "@/components/marketing/page-hero";
import { pageMetadata } from "@/lib/seo/site";

export const metadata: Metadata = pageMetadata({
  title: "Guides for small vacation rental owners",
  description:
    "Practical guides on vacation rental calendars and cleaning schedules, written around what Hostvia actually does.",
  path: "/guides",
});

const guides = [
  {
    href: "/guides/vacation-rental-calendar",
    title: "How to manage a vacation rental calendar",
    summary:
      "How to keep Airbnb, Booking.com, and direct stays on one calendar, and where iCal sync still leaves a gap.",
  },
  {
    href: "/guides/vacation-rental-cleaning-schedule",
    title: "How to organize a vacation rental cleaning schedule",
    summary:
      "How to turn departures into a cleaning list, and what a calendar overview does not do for your cleaners.",
  },
];

export default function GuidesPage() {
  return (
    <>
      <MarketingBreadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Guides", path: "/guides" },
        ]}
      />
      <PageHero
        eyebrow="Guides"
        title="Notes for owners who run a few rentals"
        description="These pages explain the operating problems Hostvia is built for. They are not a promise that software removes every overlap or every missed clean."
      />
      <section className="mx-auto grid max-w-3xl gap-4 px-4 pb-20 md:px-6">
        <p className="text-sm leading-relaxed text-zinc-500">
          Product pages for the same topics:{" "}
          <Link href="/airbnb-calendar-sync" className="text-violet-300 hover:underline">
            calendar sync
          </Link>
          {" and "}
          <Link
            href="/vacation-rental-cleaning-management"
            className="text-violet-300 hover:underline"
          >
            cleaning management
          </Link>
          .
        </p>
        {guides.map((guide) => (
          <article key={guide.href} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-xl font-semibold text-white">
              <Link href={guide.href} className="hover:text-violet-200">
                {guide.title}
              </Link>
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">{guide.summary}</p>
          </article>
        ))}
      </section>
    </>
  );
}
