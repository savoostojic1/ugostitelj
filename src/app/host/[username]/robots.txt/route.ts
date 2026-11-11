import { fetchPublicHost } from "@/lib/public/fetch";
import { loadPublishedWebsite } from "@/lib/website-builder/server/load-public";
import { websiteOrigin } from "@/lib/website-builder/seo";

export async function GET(
  _request: Request,
  context: { params: Promise<{ username: string }> }
) {
  const { username } = await context.params;
  const website = await loadPublishedWebsite(username, []);
  const origin = websiteOrigin(username);
  const host = website.state === "page" ? null : await fetchPublicHost(username);
  const indexable = website.state === "page" || (host && host.public_site_mode !== "website");
  const body = indexable
    ? `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`
    : "User-agent: *\nDisallow: /\n";
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
