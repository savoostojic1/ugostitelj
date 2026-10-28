import { FREE_TOOLS, FREE_TOOLS_PATH } from "@/lib/tools/free-tools";
import { absoluteUrl } from "@/lib/seo/site";
import {
  LEGACY_MARKETING_REDIRECTS,
  SITEMAP_STATIC_PATHS,
} from "@/lib/seo/routes";

/**
 * Canonical public marketing paths for the XML sitemap.
 * Free-tool URLs come from the published tools registry so new tools stay in sync.
 */
export function getSitemapPaths(): string[] {
  const paths = [
    ...SITEMAP_STATIC_PATHS,
    FREE_TOOLS_PATH,
    ...FREE_TOOLS.map((tool) => tool.href),
  ];

  const unique: string[] = [];
  const seen = new Set<string>();
  for (const path of paths) {
    if (seen.has(path)) continue;
    seen.add(path);
    unique.push(path);
  }
  return unique;
}

export function isExcludedFromSitemap(path: string): boolean {
  if (Object.prototype.hasOwnProperty.call(LEGACY_MARKETING_REDIRECTS, path)) {
    return true;
  }
  return (
    path.startsWith("/login") ||
    path.startsWith("/register") ||
    path.startsWith("/forgot-password") ||
    path.startsWith("/reset-password") ||
    path.startsWith("/dashboard") ||
    path.startsWith("/admin") ||
    path.startsWith("/api/") ||
    path.startsWith("/auth/") ||
    path.startsWith("/host/")
  );
}

export interface SitemapEntry {
  url: string;
}

/**
 * Build sitemap entries with absolute canonical URLs only.
 * Omits lastmod, changefreq, and priority — none are reliable ranking signals here.
 */
export function buildSitemapEntries(): SitemapEntry[] {
  return getSitemapPaths().map((path) => ({
    url: absoluteUrl(path),
  }));
}
