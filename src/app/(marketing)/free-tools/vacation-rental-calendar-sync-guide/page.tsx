import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { MarketingBreadcrumbs } from "@/components/marketing/marketing-breadcrumbs";
import { CalendarSyncGuide } from "@/components/tools/calendar-sync-guide/calendar-sync-guide";
import { HostviaToolCta } from "@/components/tools/hostvia-tool-cta";
import { JsonLd } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/site";
import { faqJsonLd } from "@/lib/seo/structured-data";
import { FREE_TOOLS_PATH } from "@/lib/tools/free-tools";
import {
  GUIDE_DESCRIPTION,
  GUIDE_FAQ,
  GUIDE_INTRO,
  GUIDE_PATH,
  GUIDE_SEO_TITLE,
  GUIDE_TITLE,
  OFFICIAL_SOURCES,
  SEO_SECTIONS,
} from "@/lib/tools/calendar-sync-guide/content";

export const metadata: Metadata = pageMetadata({
  title: GUIDE_SEO_TITLE,
  description: GUIDE_DESCRIPTION,
  path: GUIDE_PATH,
  absoluteTitle: true,
});

function ContentSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="scroll-mt-24">
      <h2 id={id} className="text-2xl font-semibold tracking-tight text-white">
        {title}
      </h2>
      <div className="mt-4 space-y-3 text-base leading-relaxed text-zinc-300">{children}</div>
    </section>
  );
}

export default function VacationRentalCalendarSyncGuidePage() {
  return (
    <>
      <JsonLd data={faqJsonLd(GUIDE_FAQ)} />
      <MarketingBreadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Free tools", path: FREE_TOOLS_PATH },
          { name: "Calendar sync guide", path: GUIDE_PATH },
        ]}
      />
      <article className="rental-calc-page mx-auto w-full max-w-3xl px-4 pb-20 md:px-6">
        <header className="max-w-2xl">
          <p className="marketing-eyebrow">Free tool</p>
          <h1 className="marketing-heading mt-3 text-3xl text-white md:text-4xl">
            {GUIDE_TITLE}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-zinc-400">{GUIDE_INTRO}</p>
        </header>

        <div className="mt-8">
          <CalendarSyncGuide />
        </div>

        <div className="mt-14">
          <HostviaToolCta
            tool="vacation_rental_calendar_sync_guide"
            title="Managing multiple rental calendars?"
            description="Hostvia helps you keep your supported rental calendars, guest arrivals and cleaning schedules organized in one place."
          />
        </div>

        <div className="mt-16 space-y-12">
          {SEO_SECTIONS.map((section) => (
            <ContentSection key={section.id} id={section.id} title={section.title}>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </ContentSection>
          ))}

          <section aria-labelledby="faq" className="scroll-mt-24">
            <h2 id="faq" className="text-2xl font-semibold tracking-tight text-white">
              Frequently Asked Questions
            </h2>
            <div className="mt-6">
              <FaqAccordion items={GUIDE_FAQ} headingLevel={3} />
            </div>
          </section>

          <section aria-labelledby="official-sources" className="scroll-mt-24">
            <h2 id="official-sources" className="text-2xl font-semibold tracking-tight text-white">
              Official platform documentation
            </h2>
            <p className="mt-3 text-base leading-relaxed text-zinc-300">
              Prefer these official sources if a screen looks different from this guide.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-zinc-300">
              {OFFICIAL_SOURCES.map((source) => (
                <li key={source.url}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-violet-300 hover:underline"
                  >
                    {source.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <p className="text-sm text-zinc-400">
            Related:{" "}
            <Link href={FREE_TOOLS_PATH} className="text-violet-300 hover:underline">
              All free tools
            </Link>
            {" · "}
            <Link
              href="/free-tools/vacation-rental-income-calculator"
              className="text-violet-300 hover:underline"
            >
              Vacation rental income calculator
            </Link>
            {" · "}
            <Link href="/airbnb-calendar-sync" className="text-violet-300 hover:underline">
              Airbnb calendar sync with Hostvia
            </Link>
            {" · "}
            <Link
              href="/guides/vacation-rental-calendar"
              className="text-violet-300 hover:underline"
            >
              Managing a vacation rental calendar
            </Link>
            {" · "}
            <Link href="/pricing" className="text-violet-300 hover:underline">
              Hostvia pricing
            </Link>
          </p>
        </div>
      </article>
    </>
  );
}
