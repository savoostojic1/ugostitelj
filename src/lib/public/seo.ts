import type { Metadata } from "next";
import {
  getBookingSiteUrl,
  type BookingSiteUrlOptions,
} from "@/lib/public/booking-site-url";
import { SITE_URL } from "@/lib/seo/site";

export function buildHostMetadata(
  businessName: string,
  description: string | null,
  coverImage: string | null,
  username: string,
  options?: BookingSiteUrlOptions
): Metadata {
  const clean = username.trim().toLowerCase();
  const title = businessName;
  const desc =
    description?.slice(0, 160) ??
    `Browse accommodation at ${businessName} and send a booking inquiry.`;
  // Always build from a site origin — never from a URL that already includes /host/…
  const url =
    getBookingSiteUrl(clean, options) ?? `${SITE_URL}/host/${clean}`;

  return {
    title: { absolute: title },
    description: desc,
    openGraph: {
      title,
      description: desc,
      url,
      type: "website",
      images: coverImage ? [{ url: coverImage, alt: businessName }] : undefined,
    },
    twitter: {
      card: coverImage ? "summary_large_image" : "summary",
      title,
      description: desc,
      images: coverImage ? [coverImage] : undefined,
    },
    alternates: { canonical: url },
    robots: { index: true, follow: true },
  };
}
