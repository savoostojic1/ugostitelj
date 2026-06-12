import type { Metadata } from "next";
import { getBookingSiteUrl } from "@/lib/public/booking-site-url";

export function buildHostMetadata(
  businessName: string,
  description: string | null,
  coverImage: string | null,
  baseUrl: string,
  username: string
): Metadata {
  const title = businessName;
  const desc =
    description?.slice(0, 160) ??
    `Browse accommodation at ${businessName} and send a booking inquiry.`;
  const url = getBookingSiteUrl(username, { baseUrl }) ?? `${baseUrl}/host/${username}`;

  return {
    title,
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
  };
}
