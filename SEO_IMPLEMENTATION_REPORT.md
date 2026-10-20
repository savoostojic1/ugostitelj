# SEO implementation report

Date: 20 October 2026  
Production was not deployed. The live site is unchanged until you deploy.

## What changed

### Crawl and index rules

- `src/app/robots.ts` allows public pages and `/host/`, and disallows `/dashboard`, `/admin`, `/api/`, and `/auth/`. Login and register stay crawlable so their `noindex` tag can be seen.
- `src/app/sitemap.ts` lists 14 canonical marketing and legal URLs on `https://hostvia.me`. It does not list dashboards, auth, APIs, admin, legacy slugs, or guest sites.
- `src/lib/supabase/middleware.ts` now:
  - Returns `robots.txt`, `sitemap.xml`, icons, and social images without sending them to `/login`.
  - 308-redirects `/funkcije`, `/kako-radi`, `/javni-sajt`, `/cijene`, `/kontakt`, `/o-nama`, `/privatnost`, and `/uslovi` to the English paths.
- `src/lib/seo/routes.ts` is the single list for those redirects, the public files, and the sitemap paths.

### Metadata

- `src/lib/seo/site.ts` sets the canonical origin to `https://hostvia.me` and builds title, description, canonical, robots, Open Graph, and Twitter cards.
- Root layout sets `metadataBase`, a title template (`%s · Hostvia`), and the default description. Google Analytics renders inside `<body>`.
- Marketing pages use unique titles and descriptions. The homepage title is absolute so it is not doubled by the template.
- Login, register, forgot-password, reset-password, dashboard, admin, billing, and the not-found page send `noindex`.
- Guest sites keep an indexable canonical on the host’s public URL. The title is the business name only, not “· Hostvia”. Unknown hosts are `noindex`.
- `src/app/opengraph-image.tsx` and `src/app/twitter-image.tsx` generate the share image. No screenshot of a customer property is used.

### Structured data

- Organization and WebSite on marketing pages (`src/lib/seo/structured-data.ts`).
- SoftwareApplication on the homepage, with Free at 0 USD and Pro at 20 USD, read from `src/lib/subscriptions/plans.ts`. No ratings.
- BreadcrumbList on inner marketing pages.
- FAQPage on `/faq`, using the same questions as the visible accordion.

### Public copy

- Homepage explains who it is for, the Free plan (2 properties), how to start, and the five-bungalow origin. Named star ratings and the “trusted by property owners” block were removed.
- About page no longer targets Montenegro or “the region” as the market.
- Pricing states Free versus Pro at `$20` per month and says Pro does not add a separate portfolio tool or support channel.
- Features, how-it-works, booking site, and FAQ describe iCal delay, the Booking.com “booked dates only” requirement, inquiries rather than checkout, and the cleaning view’s limits.
- English URLs replace the old slugs. Internal nav, footer, and legal links point at the new paths.

### Guides

- `/guides`
- `/guides/vacation-rental-calendar`
- `/guides/vacation-rental-cleaning-schedule`

### Analytics events

Implemented in the existing GA4 tag. Details and the GA4 admin steps are in `SEO_ANALYTICS_SETUP.md`.

- `src/lib/analytics/track.ts`
- `src/components/analytics/internal-traffic-marker.tsx` (`?hv_internal=1` / `0`)
- `src/components/analytics/track-pricing-view.tsx`
- Sign-up: `src/components/auth/auth-form.tsx`
- Property created: `src/components/properties/add-property-form.tsx`
- Calendar connect: `src/components/properties/feed-dialog.tsx`
- Upgrade started: `src/hooks/use-billing.ts`
- Subscription started: `src/app/dashboard/billing/success/billing-success-client.tsx`

### Performance changes that were safe

- Geist Mono no longer preloads on every page. It is still available for code and URLs.
- The homepage video does not autoplay when the browser reports Save-Data or a 2G connection. The poster still shows.
- The 8.5 MB MP4 was not re-encoded.

Auth, Stripe webhook, calendar sync, and Supabase policies were not modified except for the middleware allow-list and redirects above.

## Files

New:

- `src/lib/seo/site.ts`, `routes.ts`, `structured-data.ts`, `json-ld.tsx`
- `src/app/robots.ts`, `sitemap.ts`, `opengraph-image.tsx`, `twitter-image.tsx`
- `src/app/(marketing)/features/page.tsx`
- `src/app/(marketing)/how-it-works/page.tsx`
- `src/app/(marketing)/booking-site/page.tsx`
- `src/app/(marketing)/pricing/page.tsx`
- `src/app/(marketing)/about/page.tsx`
- `src/app/(marketing)/contact/page.tsx`
- `src/app/(marketing)/guides/page.tsx`
- `src/app/(marketing)/guides/vacation-rental-calendar/page.tsx`
- `src/app/(marketing)/guides/vacation-rental-cleaning-schedule/page.tsx`
- `src/components/marketing/marketing-breadcrumbs.tsx`
- `src/components/marketing/sync-limitation-note.tsx`
- `src/components/analytics/internal-traffic-marker.tsx`
- `src/components/analytics/track-pricing-view.tsx`
- `src/lib/analytics/track.ts`
- `SEO_AUDIT.md`, `SEO_KEYWORD_MAP.md`, `SEO_90_DAY_PLAN.md`, `SEO_GSC_SETUP.md`, `SEO_ANALYTICS_SETUP.md`

Removed as routes (redirects remain in middleware):

- `src/app/(marketing)/funkcije`
- `src/app/(marketing)/kako-radi`
- `src/app/(marketing)/javni-sajt`
- `src/app/(marketing)/cijene`
- `src/app/(marketing)/kontakt`
- `src/app/(marketing)/o-nama`
- `src/app/(marketing)/privatnost`
- `src/app/(marketing)/uslovi`

Updated in place: root and marketing layouts, homepage, FAQ, legal metadata, auth and dashboard metadata, host metadata, footer, pricing section, CTA, feed dialog, billing hooks, promo video.

## Verification

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | Passed after stale `.next/types` for the deleted routes were removed. |
| `npm run lint` | Passed. One existing warning in `public/swe-worker-5c72df51bb1f6ee0.js`. No new lint errors. |
| `npm run build` | Passed. Final build exit code 0. Routes include `/robots.txt`, `/sitemap.xml`, the English pages, and both guides. |
| Automated test script | None exists in `package.json`. |
| Sitemap XML | Parsed. 14 URLs, all on `https://hostvia.me`. No dashboard, admin, login, register, API, or `/host/` URL. |
| `robots.txt` body | Allows `/` and `/host/`. Disallows `/dashboard`, `/admin`, `/api/`, `/auth/`. Sitemap URL is `https://hostvia.me/sitemap.xml`. |
| Canonical and social tags | Confirmed in the built HTML for the homepage, features, pricing, FAQ, about, contact, booking site, both guides, and legal pages. |
| JSON-LD | Parsed as JSON on the homepage and FAQ. Types present: Organization, WebSite, SoftwareApplication, FAQPage, BreadcrumbList. No review or aggregate rating fields. The word “rating” only appears inside `operatingSystem`. |
| Homepage links | Built homepage links to features, pricing, about, booking site, how it works, and the calendar guide. |
| Private HTML | Built dashboard and admin HTML include `noindex, nofollow`. They are not in the sitemap. |
| Fake testimonials | The strings “Marko”, “Budva”, and “Trusted by property owners” are gone from the built homepage. |
| hreflang | Not present. English only. |
| HTTP check of middleware redirects | Not run. `next start` failed in this environment with `uv_interface_addresses` before it could listen. Redirects are implemented in middleware and were not observed over HTTP. |
| Core Web Vitals | Not measured. No pass or fail is claimed. |
| GA4 DebugView | Not run. Events exist in code only until a browser session hits the deployed site. |
| Authentication and Stripe behavior | Not exercised in a browser. The billing and auth code paths that fire events run only after the existing success checks. Webhook and checkout request bodies were not changed. |

## Still incomplete

1. Vercel still redirected `https://hostvia.me` to `https://www.hostvia.me` on 20 October 2026. Change that before submitting the sitemap. Steps are in `SEO_GSC_SETUP.md`.
2. Deploy this repository when you are ready. Nothing here was deployed.
3. Search Console verification, sitemap submission, and indexing requests.
4. GA4 key events, the `traffic_scope` custom dimension, and an internal-IP filter.
5. A live browser pass of sign-up, property create, calendar connect, and Stripe test checkout to confirm the events and that billing still completes.
6. Re-encoding the 8.5 MB tour video, if field data shows a slow mobile LCP.
7. An HTTP confirmation that `/cijene` returns 308 to `/pricing` on a running server.
