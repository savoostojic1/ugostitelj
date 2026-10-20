import type { Metadata } from "next";

/** Preferred production origin. Apex currently 308s to www in Vercel; see SEO_GSC_SETUP.md. */
export const SITE_URL = "https://hostvia.me";
export const SITE_NAME = "Hostvia";
export const SITE_EMAIL = "hello@hostvia.me";

export const SITE_DESCRIPTION =
  "Manage up to two vacation rentals free. Sync Airbnb and Booking.com calendars, plan arrivals and cleaning, and publish a site for direct guest inquiries.";

const PRIVATE_ROBOTS: Metadata["robots"] = {
  index: false,
  follow: false,
  nocache: true,
  googleBot: {
    index: false,
    follow: false,
    noimageindex: true,
  },
};

export function absoluteUrl(path: string): string {
  if (path === "/") return SITE_URL;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function pageMetadata({
  title,
  description,
  path,
  index = true,
  absoluteTitle = false,
}: {
  title: string;
  description: string;
  path: string;
  index?: boolean;
  absoluteTitle?: boolean;
}): Metadata {
  const url = absoluteUrl(path);

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    robots: index
      ? { index: true, follow: true }
      : PRIVATE_ROBOTS,
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      locale: "en_US",
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: "Hostvia — vacation rental tools for small hosts",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/twitter-image"],
    },
  };
}

export function privatePageMetadata(title: string, description: string): Metadata {
  return {
    title,
    description,
    robots: PRIVATE_ROBOTS,
  };
}
