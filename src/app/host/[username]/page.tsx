import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PublicShell } from "@/components/public/public-shell";
import { HostBookingExperience } from "@/components/public/host-booking-experience";
import { fetchPublicHost } from "@/lib/public/fetch";
import { buildHostMetadata } from "@/lib/public/seo";
import { getPublicHostCoverUrl } from "@/lib/public/host-cover-url";

interface HostPageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({
  params,
}: HostPageProps): Promise<Metadata> {
  const { username } = await params;
  const host = await fetchPublicHost(username);
  if (!host) {
    return {
      title: "Host not found",
      robots: { index: false, follow: false },
    };
  }

  return buildHostMetadata(
    host.business_name,
    host.description,
    host.cover_image_url,
    host.username
  );
}

export default async function HostPublicPage({ params }: HostPageProps) {
  const { username } = await params;
  const host = await fetchPublicHost(username);

  if (!host) notFound();

  return (
    <>
      {host.cover_image_url ? (
        <link rel="preload" as="image" href={getPublicHostCoverUrl(username)} />
      ) : null}
      <PublicShell host={host}>
        <HostBookingExperience host={host} username={username} />
      </PublicShell>
    </>
  );
}
