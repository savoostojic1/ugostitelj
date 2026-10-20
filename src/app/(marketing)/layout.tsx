import { Plus_Jakarta_Sans } from "next/font/google";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { JsonLd } from "@/lib/seo/json-ld";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/structured-data";

const marketingSans = Plus_Jakarta_Sans({
  variable: "--font-marketing-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
});

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`dark marketing-site hostvia-mesh-bg min-h-screen overflow-x-clip text-zinc-100 ${marketingSans.variable}`}
    >
      <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
      <MarketingHeader />
      <main className="pt-[calc(4rem+env(safe-area-inset-top,0px))]">{children}</main>
      <MarketingFooter />
    </div>
  );
}
