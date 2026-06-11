import type { Metadata } from "next";
import Link from "next/link";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { PageHero } from "@/components/marketing/page-hero";
import { Button } from "@/components/ui/button";
import { faqItems } from "@/lib/marketing/content";

export const metadata: Metadata = {
  title: "FAQ — Hostvia",
  description:
    "Answers to common questions about iCal sync, booking site, inquiries and using Hostvia.",
};

export default function FaqPage() {
  return (
    <>
      <PageHero
        eyebrow="FAQ"
        title="Frequently asked questions"
        description="What hosts ask most before getting started — from iCal links to booking inquiries."
        primaryCta={{ label: "Start free", href: "/register" }}
        secondaryCta={{ label: "Contact", href: "/kontakt" }}
      />

      <section className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-20">
        <FaqAccordion items={faqItems} />
        <div className="mt-10 rounded-2xl border border-border bg-card p-6 text-center">
          <p className="font-medium">Didn&apos;t find your answer?</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Email us — we&apos;re happy to help with calendar setup or your
            booking site.
          </p>
          <Button className="mt-4" variant="outline" asChild>
            <Link href="/kontakt">Contact us</Link>
          </Button>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
