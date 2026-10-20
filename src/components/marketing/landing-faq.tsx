import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { JsonLd } from "@/lib/seo/json-ld";
import { faqJsonLd } from "@/lib/seo/structured-data";

export function LandingFaq({
  items,
}: {
  items: { question: string; answer: string }[];
}) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-20">
      <p className="marketing-eyebrow mb-6">Questions</p>
      <FaqAccordion items={items} />
      <JsonLd data={faqJsonLd(items)} />
    </section>
  );
}
