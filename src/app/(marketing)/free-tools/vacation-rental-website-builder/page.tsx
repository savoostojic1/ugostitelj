import type { Metadata } from "next";
import { MarketingBreadcrumbs } from "@/components/marketing/marketing-breadcrumbs";
import { WebsiteBuilderLanding } from "@/components/website-builder/landing-page";
import { websiteFontClassName } from "@/components/website-public/fonts";
import { JsonLd } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/site";
import { faqJsonLd } from "@/lib/seo/structured-data";
import { FREE_TOOLS_PATH } from "@/lib/tools/free-tools";

const PATH = `${FREE_TOOLS_PATH}/vacation-rental-website-builder`;
const TITLE = "Free Vacation Rental Website Builder | Hostvia";
const DESCRIPTION =
  "Create a free vacation rental website with professional designs, property pages, photos and direct booking inquiries. No coding required.";

const FAQ = [
  {
    question: "Do I need an account to start a vacation rental website?",
    answer:
      "No. You can choose a design, add your property, edit pages and preview the website before creating a free Hostvia account. An account is required when you publish, so the site can use your properties, prices and booking inquiries.",
  },
  {
    question: "Does the website builder replace my booking site?",
    answer:
      "You choose what guests see at your Hostvia address: the existing booking website or the full website. Switching does not delete either one, and both use the same booking inquiries.",
  },
  {
    question: "Will the website show my real prices and availability?",
    answer:
      "After you connect a Hostvia property, nightly prices, currency and availability come from that property. A booking button sends an inquiry. The host confirms the dates before a reservation exists.",
  },
  {
    question: "Can search engines read the published website?",
    answer:
      "Published pages are rendered on the server with a unique title, description, canonical URL, Open Graph tags and structured data for the lodging business. Drafts and unpublished sites are not indexed. Hostvia does not guarantee search rankings.",
  },
  {
    question: "Is the website builder free?",
    answer:
      "You can design a multi-page site, use every theme, and publish it on your Hostvia address for free, within the same property limits as the rest of Hostvia. Removing the Hostvia footer credit and hiding individual pages from search are Pro capabilities.",
  },
];

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  absoluteTitle: true,
});

export default function VacationRentalWebsiteBuilderPage() {
  const app = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Hostvia Vacation Rental Website Builder",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    description: DESCRIPTION,
    url: `https://hostvia.me${PATH}`,
  };

  return (
    <>
      <JsonLd data={[faqJsonLd(FAQ), app]} />
      <MarketingBreadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Free tools", path: FREE_TOOLS_PATH },
          { name: "Website builder", path: PATH },
        ]}
      />
      <article className={websiteFontClassName}>
        <WebsiteBuilderLanding faq={FAQ} />
      </article>
    </>
  );
}
