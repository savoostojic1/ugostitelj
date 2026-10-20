import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { HostviaGoogleAnalytics } from "@/components/analytics/google-analytics";
import { HostviaVercelAnalytics } from "@/components/analytics/vercel-analytics";
import { InternalTrafficMarker } from "@/components/analytics/internal-traffic-marker";
import { Providers } from "@/components/providers";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Vacation rental management for small hosts`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
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
        <Providers>
          <InternalTrafficMarker />
          {children}
        </Providers>
        <ServiceWorkerRegister />
        <HostviaVercelAnalytics />
        <HostviaGoogleAnalytics />
      </body>
    </html>
  );
}
