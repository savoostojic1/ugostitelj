# Hostvia 90-day SEO plan

Start date: 20 October 2026  
This plan assumes the code in this repository is deployed only when you choose to deploy it, and that the Vercel domain change in `SEO_GSC_SETUP.md` happens first.

No traffic or ranking targets are set. There is no baseline in Search Console yet.

## Month 1 — Make the site crawlable

**Outcome:** Google can fetch the English marketing URLs on `https://hostvia.me` without being sent to `/login` or to `www`.

1. In Vercel, set `hostvia.me` as the primary domain and redirect `www.hostvia.me` to it. Confirm both with `curl -I`.
2. Deploy the SEO changes in this repository.
3. Verify `https://hostvia.me/robots.txt` returns rules, not a redirect to `/login`.
4. Verify `https://hostvia.me/sitemap.xml` returns the 14 marketing URLs and no dashboard, admin, login, or `/host/` URL.
5. Add the domain property in Google Search Console and submit the sitemap. Steps are in `SEO_GSC_SETUP.md`.
6. In GA4, mark the seven events in `SEO_ANALYTICS_SETUP.md` and exclude internal traffic.
7. Request indexing for `/`, `/features`, `/pricing`, `/booking-site`, and `/guides/vacation-rental-calendar` only after the apex URL returns 200.

Do not publish more articles in this month.

## Month 2 — Read the first query data

**Outcome:** Know which existing URL Google is showing, and fix titles only where the query is relevant.

1. In Search Console, export queries for the property. Ignore anything with a handful of impressions.
2. For each query with meaningful impressions, map it to one existing URL using `SEO_KEYWORD_MAP.md`. If it maps to a page that already exists, edit that page’s title or first paragraph. Do not add a new URL.
3. Check Coverage and Page indexing for:
   - Redirects from `/funkcije`, `/kako-radi`, `/javni-sajt`, `/cijene`, `/kontakt`, `/o-nama`.
   - Unexpected indexing of `/login`, `/register`, `/dashboard`, or `/admin`.
   - Guest sites under `/host/` that should be indexed, versus hosts that 404.
4. Look at the two guides. If they receive impressions for cleaner-dispatch queries, tighten the introduction so the limitation is in the first screen. Do not add a third guide to chase those queries.
5. Optional performance pass, only if field data in Search Console or CrUX shows a poor LCP on mobile: re-encode `public/videos/hostvia-promo.mp4` (currently about 8.5 MB) and retest. Do not claim a Core Web Vitals pass without that field or lab measurement.

## Month 3 — One new page, only if the data supports it

**Outcome:** At most one additional guide, chosen from queries you have actually seen.

Candidates, in order, and only if the queries appear:

1. **How to handle arrivals and departures for a few rentals.** The product has a real arrivals view. Write it only if people are searching around that task and the existing homepage section is not the page Google shows.
2. **How to take a direct inquiry without taking payment on your site.** Write it only if queries assume a checkout and the booking-site page is not satisfying them. The article must say Hostvia does not charge the guest.

Do not write:

- A comparison page that invents scores or “best of” rankings.
- Country versions for the US, UK, Australia, or Canada.
- Pages about cleaner dispatch, channel-manager APIs, or guaranteed availability.

If Search Console is still too thin to choose, spend the month on internal links from the homepage and FAQ to the two existing guides, and on fixing any indexed URL that should be `noindex`.

## Weekly check (about 30 minutes)

- Search Console: pages indexed, sitemap status, and any new excluded reason.
- GA4: `sign_up`, `property_created`, `view_pricing`, `upgrade_initiated`, `subscription_started`. Confirm `traffic_scope` is `external` for real visitors.
- One manual pass on a phone-width browser: homepage, pricing, one guide, and the sign-up form. Confirm the Free plan still says two properties and Pro still says 20 USD.

## What “good” looks like after 90 days

- The apex URL is the one Google indexes.
- The sitemap has no errors and no private URLs.
- Sign-up can be counted without storing email in analytics.
- You can name the queries Google actually shows, and each one points at a page that describes a real feature.
- You have not added a pile of near-duplicate articles.
