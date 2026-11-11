import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { PublishedWebsitePage } from "@/components/website-public/published-page";
import { parseBookingSubdomain } from "@/lib/public/booking-site-url";
import { fetchPublicHost } from "@/lib/public/fetch";
import { loadPublishedWebsite } from "@/lib/website-builder/server/load-public";
import { buildWebsiteMetadata } from "@/lib/website-builder/seo";

interface PageProps {
  params: Promise<{ username: string; slug: string[] }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username, slug } = await params;
  const website = await loadPublishedWebsite(username, slug);
  if (website.state !== "page") {
    return { title: "Page not found", robots: { index: false, follow: false } };
  }
  return buildWebsiteMetadata(website.model);
}

export default async function HostWebsiteSection({ params }: PageProps) {
  const { username, slug } = await params;
  const website = await loadPublishedWebsite(username, slug);
  if (website.state === "page") {
    return <PublishedWebsitePage model={website.model} />;
  }

  const host = await fetchPublicHost(username);
  if (host?.public_site_mode === "website" || website.state === "missing-page") {
    notFound();
  }

  const headerStore = await headers();
  const hostHeader = headerStore.get("host") ?? "";
  if (parseBookingSubdomain(hostHeader)) redirect("/");
  redirect(`/host/${username}`);
}
