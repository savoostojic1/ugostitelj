import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PublicShell } from "@/components/public/public-shell";
import { HostBookingExperience } from "@/components/public/host-booking-experience";
import { fetchPublicHost } from "@/lib/public/fetch";
import {
  BOOKING_DOMAIN,
  getBookingSiteUrl,
  parseBookingSubdomain,
} from "@/lib/public/booking-site-url";
import { buildHostMetadata } from "@/lib/public/seo";
import { getSiteBaseUrl } from "@/lib/public/site-url";

interface HostPageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({
  params,
}: HostPageProps): Promise<Metadata> {
  const { username } = await params;
  const host = await fetchPublicHost(username);
  if (!host) return { title: "Host not found" };

  const requestHost = (await headers()).get("host") ?? "";
  const subdomain = parseBookingSubdomain(requestHost);
  const baseUrl = subdomain
    ? (getBookingSiteUrl(subdomain, { bookingDomain: BOOKING_DOMAIN }) ??
      getSiteBaseUrl())
    : getSiteBaseUrl();

  return buildHostMetadata(
    host.business_name,
    host.description,
    host.cover_image_url,
    baseUrl,
    host.username
  );
}

export default async function HostPublicPage({ params }: HostPageProps) {
  const { username } = await params;
  const host = await fetchPublicHost(username);

  if (!host) notFound();

  return (
    <PublicShell host={host}>
      <HostBookingExperience host={host} username={username} />
    </PublicShell>
  );
}
