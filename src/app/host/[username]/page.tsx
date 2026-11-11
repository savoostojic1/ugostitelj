import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PublicShell } from "@/components/public/public-shell";
import { HostBookingExperience } from "@/components/public/host-booking-experience";
import { PublishedWebsitePage } from "@/components/website-public/published-page";
import { fetchPublicHost } from "@/lib/public/fetch";
import { buildHostMetadata } from "@/lib/public/seo";
import { getPublicHostCoverUrl } from "@/lib/public/host-cover-url";
import { loadPublishedWebsite } from "@/lib/website-builder/server/load-public";
import { buildWebsiteMetadata } from "@/lib/website-builder/seo";

interface HostPageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({
  params,
}: HostPageProps): Promise<Metadata> {
  const { username } = await params;
  const website = await loadPublishedWebsite(username, []);
  if (website.state === "page") return buildWebsiteMetadata(website.model);

  const host = await fetchPublicHost(username);
  if (!host || host.public_site_mode === "website") {
    return { title: "Host not found", robots: { index: false, follow: false } };
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
  const website = await loadPublishedWebsite(username, []);
  if (website.state === "page") {
    return <PublishedWebsitePage model={website.model} />;
  }

  const host = await fetchPublicHost(username);
  if (!host || host.public_site_mode === "website") notFound();

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
