import type { MetadataRoute } from "next";
import { SITEMAP_PATHS } from "@/lib/seo/routes";
import { absoluteUrl } from "@/lib/seo/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-10-20");

  return SITEMAP_PATHS.map((path) => ({
    url: absoluteUrl(path),
    lastModified,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path.startsWith("/guides") ? 0.7 : path.startsWith("/terms") || path.startsWith("/privacy") || path.startsWith("/refund") ? 0.3 : 0.8,
  }));
}
