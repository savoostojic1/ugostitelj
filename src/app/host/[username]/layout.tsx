import { Plus_Jakarta_Sans } from "next/font/google";

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
    <div className={`light ${publicSans.variable}`}>{children}</div>
  );
}
