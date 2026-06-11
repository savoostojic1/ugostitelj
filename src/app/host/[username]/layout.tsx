import { Plus_Jakarta_Sans } from "next/font/google";
import { ForcePublicLightTheme } from "@/components/public/force-public-light-theme";

const publicSans = Plus_Jakarta_Sans({
  variable: "--font-public-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

export default function HostPublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={publicSans.variable}>
      <ForcePublicLightTheme />
      {children}
    </div>
  );
}
