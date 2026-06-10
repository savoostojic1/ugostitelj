import { Plus_Jakarta_Sans } from "next/font/google";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";

const marketingSans = Plus_Jakarta_Sans({
  variable: "--font-marketing-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`light marketing-site min-h-screen ${marketingSans.variable}`}
    >
      <MarketingHeader />
      <main>{children}</main>
      <MarketingFooter />
    </div>
  );
}
