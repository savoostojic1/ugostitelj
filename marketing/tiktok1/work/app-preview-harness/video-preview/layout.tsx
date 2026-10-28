import { Plus_Jakarta_Sans } from "next/font/google";

const dashboardSans = Plus_Jakarta_Sans({
  variable: "--font-marketing-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

export default function VideoPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={dashboardSans.variable}>{children}</div>;
}
