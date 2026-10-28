/** Old public paths kept only as permanent redirects. Do not add these to the sitemap. */
export const LEGACY_MARKETING_REDIRECTS: Record<string, string> = {
  "/funkcije": "/features",
  "/kako-radi": "/how-it-works",
  "/javni-sajt": "/booking-site",
  "/cijene": "/pricing",
  "/kontakt": "/contact",
  "/o-nama": "/about",
  "/privatnost": "/privacy",
  "/uslovi": "/terms",
};

/** Files that must stay reachable without a session. Middleware otherwise sends unknown paths to /login. */
export const PUBLIC_ASSET_PATHS = new Set([
  "/robots.txt",
  "/sitemap.xml",
  "/icon",
  "/apple-icon",
  "/opengraph-image",
  "/twitter-image",
  "/google49bf01ee11453dbf.html",
]);

/**
 * Static indexable marketing paths (excluding free tools).
 * Free tools are appended from `@/lib/tools/free-tools` in `getSitemapPaths()`.
 * Keep this list aligned with marketing page.tsx routes under src/app/(marketing).
 */
export const SITEMAP_STATIC_PATHS = [
  "/",
  "/features",
  "/how-it-works",
  "/booking-site",
  "/pricing",
  "/faq",
  "/about",
  "/contact",
  "/guides",
  "/guides/vacation-rental-calendar",
  "/guides/vacation-rental-cleaning-schedule",
  "/vacation-rental-management-software",
  "/property-management-software-for-small-hosts",
  "/airbnb-calendar-sync",
  "/vacation-rental-cleaning-management",
  "/terms",
  "/privacy",
  "/refund-policy",
] as const;
