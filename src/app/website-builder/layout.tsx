import type { Metadata } from "next";
import { websiteFontClassName } from "@/components/website-public/fonts";

export const metadata: Metadata = {
  title: "Website builder",
  robots: { index: false, follow: false },
};

export default function WebsiteBuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={`${websiteFontClassName} min-h-screen bg-[#07060a] text-zinc-100`}>{children}</div>;
}
