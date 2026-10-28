import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { MarketingBreadcrumbs } from "@/components/marketing/marketing-breadcrumbs";
import { HostviaToolCta } from "@/components/tools/hostvia-tool-cta";
import { RentalIncomeCalculator } from "@/components/tools/rental-income-calculator/rental-income-calculator";
import { JsonLd } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/site";
import { faqJsonLd } from "@/lib/seo/structured-data";
import { FREE_TOOLS_PATH } from "@/lib/tools/free-tools";
import {
  CALCULATOR_DESCRIPTION,
  CALCULATOR_FAQ,
  CALCULATOR_INTRO,
  CALCULATOR_PATH,
  CALCULATOR_SEO_TITLE,
  CALCULATOR_TITLE,
} from "@/lib/tools/rental-income-calculator/content";

export const metadata: Metadata = pageMetadata({
  title: CALCULATOR_SEO_TITLE,
  description: CALCULATOR_DESCRIPTION,
  path: CALCULATOR_PATH,
  absoluteTitle: true,
});

function ContentSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="scroll-mt-24">
      <h2 id={id} className="text-2xl font-semibold tracking-tight text-white">
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-base leading-relaxed text-zinc-300">{children}</div>
    </section>
  );
}

function Formula({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-violet-400/20 bg-violet-500/[0.06] px-4 py-3 font-mono text-sm text-violet-100">
      {children}
    </p>
  );
}

export default function VacationRentalIncomeCalculatorPage() {
  return (
    <>
      <JsonLd data={faqJsonLd(CALCULATOR_FAQ)} />
      <MarketingBreadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Free tools", path: FREE_TOOLS_PATH },
          { name: "Vacation Rental Income Calculator", path: CALCULATOR_PATH },
        ]}
      />
      <article className="rental-calc-page mx-auto w-full max-w-6xl px-4 pb-20 md:px-6">
        <header className="max-w-3xl">
          <p className="marketing-eyebrow print:hidden">Free tool</p>
          <h1 className="marketing-heading mt-4 text-4xl text-white md:text-5xl print:mt-0 print:text-2xl">
            {CALCULATOR_TITLE}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-zinc-400 print:hidden">{CALCULATOR_INTRO}</p>
          <p className="mt-4 text-sm text-zinc-500 print:hidden">
            No sign-up or email needed. Your figures stay in your browser.
          </p>
        </header>

        <div className="mt-8 md:mt-10">
          <RentalIncomeCalculator />
        </div>

        <div className="mt-16">
          <HostviaToolCta tool="vacation_rental_income_calculator" />
        </div>

        <div className="mx-auto mt-20 max-w-3xl space-y-14 print:hidden">
          <ContentSection id="how-to-calculate-income" title="How to calculate vacation rental income">
            <p>
              Rental income starts with nights, not with the nightly price. For a rough estimate
              this calculator treats a typical open month as 30 nights. Some of those may be
              blocked for your own use, repairs or a seasonal closure. What is left are the nights
              a guest could book. If you want the real length of each month, switch to the
              seasonal table.
            </p>
            <Formula>Available nights = 30 − unavailable nights</Formula>
            <Formula>Occupied nights = available nights × occupancy rate</Formula>
            <Formula>Booking revenue = occupied nights × average nightly rate</Formula>
            <p>
              Many hosts also earn money per stay: a cleaning fee added to each booking, or
              extras such as late checkout, transfers or pet fees. To include these you need
              the number of bookings, which comes from your average length of stay.
            </p>
            <Formula>Estimated bookings = occupied nights ÷ average length of stay</Formula>
            <Formula>
              Gross revenue = booking revenue + (bookings × extras per booking) + (bookings ×
              guest cleaning fee)
            </Formula>
            <p>
              For example, a property open for 30 nights at 60% occupancy has 18 occupied nights.
              At 90 a night that is 1,620 in booking revenue. With an average stay of three
              nights, that is six bookings, so a 40 cleaning fee adds another 240.
            </p>
          </ContentSection>

          <ContentSection id="how-to-calculate-profit" title="How to calculate vacation rental profit">
            <p>
              Profit is what remains after costs, and the order you subtract them in matters.
              Operating expenses are the costs of running the rental. Mortgage or rent
              payments are financing costs: they depend on how you pay for the property, not
              on how well it is let.
            </p>
            <Formula>Operating income = gross revenue − operating expenses</Formula>
            <Formula>Cash flow after financing = operating income − mortgage or rent</Formula>
            <Formula>Operating margin = operating income ÷ gross revenue</Formula>
            <p>
              Neither figure is your taxable profit. Income tax, depreciation and allowances
              depend on where you operate and how the rental is owned, so check the rules
              that apply to you or ask a local accountant.
            </p>
            <p>
              A useful check is break-even occupancy: the occupancy rate at which revenue just
              covers your costs at your current prices. If it is close to the occupancy you
              expect, small changes in demand will decide whether the year makes or loses money.
            </p>
          </ContentSection>

          <ContentSection
            id="expenses-to-include"
            title="What expenses should vacation rental owners include?"
          >
            <p>Costs are easier to estimate when you enter them in the unit you actually pay:</p>
            <ul className="list-disc space-y-2 pl-5 text-zinc-300">
              <li>
                <strong className="text-white">Per booking:</strong> cleaning, laundry, welcome
                packs, and some management or platform charges.
              </li>
              <li>
                <strong className="text-white">Per occupied night:</strong> consumables, or
                utilities if they rise mainly when guests are in.
              </li>
              <li>
                <strong className="text-white">Per month:</strong> internet, subscriptions,
                standing utility charges and a maintenance allowance.
              </li>
              <li>
                <strong className="text-white">Per year:</strong> insurance, licences,
                property taxes and larger planned repairs.
              </li>
              <li>
                <strong className="text-white">Percentage of revenue:</strong> management fees
                and booking platform commissions.
              </li>
            </ul>
            <p>
              Platform fees vary by platform, fee model and country, so use the rate shown in
              your own host account rather than a figure from elsewhere. If you charge guests a
              cleaning fee, count it as revenue and count what you pay your cleaner as an
              expense. Netting the two together hides how much cleaning really costs.
            </p>
          </ContentSection>

          <ContentSection id="occupancy" title="How occupancy rate affects rental income">
            <Formula>Occupancy rate = booked nights ÷ available nights × 100</Formula>
            <p>
              Occupancy changes revenue directly, but it does not change every cost.
              Per-booking and per-night costs rise with occupancy. Monthly and annual costs stay
              the same whether the property is full or empty. That is why a quiet month can
              lose money even when the year as a whole is profitable.
            </p>
            <p>
              Higher occupancy is not always better. A lower nightly rate may fill more nights
              but add cleaning, laundry and wear. Compare a few combinations of rate and
              occupancy in the calculator to see which earns more after costs.
            </p>
          </ContentSection>

          <ContentSection id="monthly-vs-annual" title="Monthly vs. annual vacation rental income">
            <p>
              A typical month is useful for a quick estimate, but few rentals earn the same
              every month. Rates and demand change with seasons, holidays and local events,
              and some properties close for part of the year.
            </p>
            <p>
              For an annual estimate, calculate each month from its own available nights,
              occupancy and rate, then add the twelve months together. Annual costs such as
              insurance should be spread across all twelve months, and fixed monthly costs
              usually continue while the property is closed. The calculator&apos;s seasonal mode
              works this way.
            </p>
            <p>
              The monthly average (annual result ÷ 12) is the figure to compare with a monthly
              mortgage, rent or personal income target.
            </p>
          </ContentSection>

          <section aria-labelledby="faq" className="scroll-mt-24">
            <h2 id="faq" className="text-2xl font-semibold tracking-tight text-white">
              Frequently asked questions
            </h2>
            <div className="mt-6">
              <FaqAccordion items={CALCULATOR_FAQ} headingLevel={3} />
            </div>
          </section>

          <p className="text-sm text-zinc-400">
            Related:{" "}
            <Link href={FREE_TOOLS_PATH} className="text-violet-300 hover:underline">
              All free tools
            </Link>
            {" · "}
            <Link
              href="/free-tools/vacation-rental-calendar-sync-guide"
              className="text-violet-300 hover:underline"
            >
              Calendar sync guide
            </Link>
            {" · "}
            <Link href="/guides/vacation-rental-calendar" className="text-violet-300 hover:underline">
              Managing a vacation rental calendar
            </Link>
            {" · "}
            <Link href="/guides/vacation-rental-cleaning-schedule" className="text-violet-300 hover:underline">
              Organizing a cleaning schedule
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
