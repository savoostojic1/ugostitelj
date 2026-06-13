import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./admin.css";

const adminSans = Plus_Jakarta_Sans({
  variable: "--font-marketing-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Admin — Hostvia",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`hostvia-admin ${adminSans.variable}`}>{children}</div>
  );
}
