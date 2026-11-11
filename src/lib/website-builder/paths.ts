import { isReservedBookingSubdomain } from "@/lib/public/booking-site-url";
import { isValidSlug, slugify } from "@/lib/public/slug";
import type { WebsitePage } from "@/lib/website-builder/types";

const EXTRA_RESERVED = new Set([
  "website",
  "websites",
  "preview",
  "free-tools",
  "login",
  "register",
  "host",
  "guide",
  "guest-guide",
  "sitemap",
  "robots",
  "blog",
  "support",
  "help",
  "static",
  "assets",
  "auth",
  "dashboard",
  "pricing",
  "features",
]);

export function isReservedWebsiteSlug(slug: string): boolean {
  const clean = slug.trim().toLowerCase();
  return EXTRA_RESERVED.has(clean) || isReservedBookingSubdomain(clean);
}

export function normalizePageSlug(value: string, fallback: string): string {
  const slug = slugify(value || fallback).slice(0, 48);
  if (!isValidSlug(slug) || isReservedWebsiteSlug(slug)) {
    const safe = slugify(fallback).slice(0, 48);
    return isValidSlug(safe) ? safe : "page";
  }
  return slug;
}

export function pagePath(page: Pick<WebsitePage, "slug" | "isHome" | "type">): string {
  if (page.isHome || page.type === "home") return "/";
  return `/${page.slug}`;
}

export function publicPageUrl(origin: string, page: Pick<WebsitePage, "slug" | "isHome" | "type">): string {
  const base = origin.replace(/\/$/, "");
  const path = pagePath(page);
  return path === "/" ? base : `${base}${path}`;
}

export function findPageByPath(pages: WebsitePage[], slugParts: string[]): WebsitePage | null {
  const enabled = pages.filter((page) => page.enabled);
  if (slugParts.length === 0) {
    return enabled.find((page) => page.isHome) ?? enabled[0] ?? null;
  }
  const slug = slugParts.join("/");
  return (
    enabled.find((page) => !page.isHome && page.slug === slug) ??
    null
  );
}

export function breadcrumbsFor(
  pages: WebsitePage[],
  page: WebsitePage,
  siteName: string
): { name: string; path: string }[] {
  const home = pages.find((item) => item.isHome);
  const crumbs = [{ name: siteName || home?.title || "Home", path: "/" }];
  if (!page.isHome) {
    if (page.type === "accommodation_unit") {
      const parent = pages.find((item) => item.type === "accommodation" && item.enabled);
      if (parent) crumbs.push({ name: parent.title, path: pagePath(parent) });
    }
    crumbs.push({ name: page.title, path: pagePath(page) });
  }
  return crumbs;
}

export function allocateSlug(base: string, taken: Set<string>): string {
  const root = normalizePageSlug(base, "stay");
  if (!taken.has(root)) return root;
  for (let n = 2; n < 80; n += 1) {
    const candidate = `${root.slice(0, 40)}-${n}`;
    if (!taken.has(candidate) && !isReservedWebsiteSlug(candidate)) return candidate;
  }
  return `${root.slice(0, 32)}-${taken.size + 2}`;
}
