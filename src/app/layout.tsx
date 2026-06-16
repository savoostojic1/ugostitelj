import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { HostviaGoogleAnalytics } from "@/components/analytics/google-analytics";
import { HostviaVercelAnalytics } from "@/components/analytics/vercel-analytics";
import { Providers } from "@/components/providers";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hostvia — Booking website & reservation dashboard",
  description:
    "Get your own booking website and manage all reservations in one place. Direct bookings, calendar sync, and a beautiful dashboard for property owners.",
  applicationName: "Hostvia",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Hostvia",
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#8b5cf6" },
    { media: "(prefers-color-scheme: dark)", color: "#8b5cf6" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}
        suppressHydrationWarning
      >
        <Script id="hostvia-pwa-viewport-fix" strategy="beforeInteractive">
          {`(function(){try{var s=window.matchMedia("(display-mode: standalone)").matches||window.matchMedia("(display-mode: fullscreen)").matches||(window.navigator&&window.navigator.standalone===true);if(!s)return;document.documentElement.dataset.standalone="true";var m=document.querySelector('meta[name="viewport"]');if(m)m.setAttribute("content","width=device-width, initial-scale=1, viewport-fit=cover")}catch(e){}})();`}
        </Script>
        <Providers>{children}</Providers>
        <ServiceWorkerRegister />
        <HostviaVercelAnalytics />
      </body>
      <HostviaGoogleAnalytics />
    </html>
  );
}
