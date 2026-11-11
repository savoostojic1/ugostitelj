import { JsonLd } from "@/lib/seo/json-ld";
import { websiteFontClassName } from "@/components/website-public/fonts";
import { WebsiteView } from "@/components/website-public/website-view";
import {
  breadcrumbJsonLd,
  faqJsonLdForPage,
  lodgingJsonLd,
} from "@/lib/website-builder/seo";
import type { PublicWebsiteModel } from "@/lib/website-builder/types";

/**
 * Marks the document before first paint so below-the-fold content can start in its
 * pre-reveal state without a flash. Skipped for reduced motion; if the motion
 * engine never starts, a CSS failsafe reveals everything after a moment.
 */
const MOTION_BOOT = `try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('wb-js')}catch(e){}`;

export function PublishedWebsitePage({ model }: { model: PublicWebsiteModel }) {
  const faq = faqJsonLdForPage(model);
  const data = [lodgingJsonLd(model), breadcrumbJsonLd(model)];
  if (faq) data.push(faq);
  return (
    <div className={websiteFontClassName}>
      <script dangerouslySetInnerHTML={{ __html: MOTION_BOOT }} />
      <JsonLd data={data} />
      <WebsiteView model={model} />
    </div>
  );
}
