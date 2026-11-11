import type { MetadataRoute } from "next";
import { fetchPublicHost } from "@/lib/public/fetch";
import { loadPublishedWebsite } from "@/lib/website-builder/server/load-public";
import { websiteOrigin, websiteSitemapPaths } from "@/lib/website-builder/seo";

export default async function sitemap({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<MetadataRoute.Sitemap> {
  const { username } = await params;
  const website = await loadPublishedWebsite(username, []);
  const origin = websiteOrigin(username);
  if (website.state === "page") {
    return websiteSitemapPaths(website.model.pages).map((path) => ({
      url: path === "/" ? origin : `${origin}${path}`,
    }));
  }
  const host = await fetchPublicHost(username);
  if (!host || host.public_site_mode === "website") return [];
  return [{ url: origin }];
}
