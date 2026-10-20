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
]);

export const SITEMAP_PATHS = [
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
  "/terms",
  "/privacy",
  "/refund-policy",
] as const;
