# Hostvia SEO audit

Date: 20 October 2026  
Scope: repository at the time of this audit, plus live responses from `https://hostvia.me` and `https://www.hostvia.me`.  
This file separates what was verified from later recommendations. Implementation that followed this audit is recorded in `SEO_IMPLEMENTATION_REPORT.md`.

## How the site is built

Verified from the repository:

- Next.js 15.5 App Router (`src/app`), TypeScript, React 19.
- Marketing pages live in `src/app/(marketing)`.
- Auth is Supabase. Billing is Stripe. Guest sites are served at `/host/[username]`, and can be rewritten from a `username.hostvia.me` subdomain when that host is enabled.
- Middleware in `src/lib/supabase/middleware.ts` sends anonymous visitors away from non-public paths to `/login` with a 307.
- Deployment config is Vercel (`vercel.json`). There is no custom domain redirect in the repo.

## Verified problems

### 1. The apex domain redirects to www

On 20 October 2026:

- `https://hostvia.me/` returned **308** to `https://www.hostvia.me/`.
- `https://www.hostvia.me/` returned **200**.

The preferred origin for this project is `https://hostvia.me`. Until Vercel is changed so that `www` redirects to the apex, any canonical or sitemap URL on the apex will itself redirect. That has to be fixed in the Vercel domain settings. It cannot be fixed safely in application code while the platform redirect points the other way, because the two redirects would loop.

### 2. No usable robots.txt or sitemap on production

- `https://www.hostvia.me/sitemap.xml` returned **307** to `/login`.
- `https://www.hostvia.me/robots.txt` returned a redirect body rather than robot rules.

Cause in code, before this project: middleware treats any path that is not on the public allow-list as private. `robots.txt` and `sitemap.xml` were not on that list, and the app did not define either file. Crawlers that follow the redirect land on the sign-in page.

### 3. Public pages had no canonical URL and no social metadata

The live homepage title and description matched the old root metadata exactly:

- Title: `Hostvia — Booking website & reservation dashboard`
- Description: `Get your own booking website and manage all reservations in one place...`

There was no `rel=canonical`, no `og:*` tags, no Twitter card, and no JSON-LD on that HTML response. `metadataBase` was not set, so Next.js had no preferred absolute origin.

### 4. Private areas were only partly protected from indexing

Verified:

- `/dashboard` on production returns **307** to `/login` for an anonymous request. That is the right behavior for visitors.
- Admin layout metadata already set `noindex`.
- Dashboard, login, register, and password pages did not set `noindex`. If middleware fails open (it does when Supabase env vars are missing, and the `catch` path continues the request), those HTML responses could be indexed.
- A 307 to `/login` does not by itself tell Google to drop `/dashboard` from the index if the URL is discovered.

### 5. Marketing URLs were not English

Public copy is English. Several indexable paths were not:

| Old path | Meaning |
| --- | --- |
| `/funkcije` | Features |
| `/kako-radi` | How it works |
| `/javni-sajt` | Public site |
| `/cijene` | Pricing |
| `/kontakt` | Contact |
| `/o-nama` | About |
| `/privatnost` | Already redirected to `/privacy` |
| `/uslovi` | Already redirected to `/terms` |

`/privacy`, `/terms`, `/refund-policy`, and `/faq` were already English. The older slugs are a poor fit for the United States, United Kingdom, Australia, and Canada, which are the markets this project is meant to reach.

### 6. Homepage claims were not supportable

Verified in `src/app/(marketing)/page.tsx` before the content update:

- Named testimonials (Marko P. in Budva, Ana K. in Kotor, Stefan M. in Ulcinj) with five-star ratings. Nothing in the product or the founder brief supports these as real reviews.
- “Trusted by property owners” and “Join property owners” imply a customer base that this project must not claim.
- The about page positioned Hostvia as a tool “for hosts in the region” and “Montenegro and the region”.
- The homepage called availability “Real-time”. Connected calendars refresh about once an hour while the dashboard is open (`SYNC_INTERVAL_MS` is 60 minutes). Airbnb and Booking.com read imported calendars on their own schedule.
- “Receive direct bookings” overstated the product. Guests send inquiries. Hostvia does not charge the guest or confirm the stay.

### 7. Calendar limitations were easy to miss on marketing pages

The product UI (`CalendarSyncGuide`) already says that Booking.com closed dates can import as guest stays unless the export is “booked dates only”, and that export only reduces double-booking risk. The public FAQ previously said calendars “refresh automatically in the background” without the hourly limit or the Booking.com export caveat.

### 8. Pricing presentation was incomplete

Code constants, confirmed in `src/lib/subscriptions/plans.ts` and the billing UI:

- Free: up to 2 active properties.
- Pro: 20 USD per month for the whole account, via Stripe. It removes the two-property limit.
- Free and Pro use the same tools. The billing screen lists “Portfolio management” and “Priority support” on Pro, but those are not separate product features. Marketing pages must not repeat them as benefits.

The public price card showed `0€` while Pro is priced in USD.

### 9. Guest accommodation pages are a different indexable surface

`/host/[username]` is a public booking site for one host. It already had a title, description, and Open Graph tags from the host profile. It had no canonical URL. Unpublished or unknown usernames 404. These URLs should stay indexable when a host has published a site. They should not be listed in the marketing sitemap, because the set of usernames is private data and changes per account.

### 10. Performance risks that were visible without a lab score

Not measured with Lighthouse or CrUX in this audit. Observed from the code and assets:

- `public/videos/hostvia-promo.mp4` is about 8.5 MB. The player uses `preload="none"` and a 148 KB poster, then autoplays when the video enters the viewport. On a phone the video is in the first screen, so that download still happens.
- Marketing pages load Geist, Geist Mono, and Plus Jakarta Sans.
- Google Analytics (`G-MFQ4P5DKXX` via `@next/third-parties`) and Vercel Analytics both load on every page.
- No Core Web Vitals result is claimed.

### 11. Analytics did not record product events

GA4 and Vercel Analytics were installed. No custom events existed for sign-up, property creation, calendar connection, pricing views, upgrade start, or a completed subscription. The sign-up form does not know whether the person later confirms their email. The billing success page can confirm Pro after Stripe returns.

## What was already in good shape

- `lang="en"` on the document.
- One `h1` on the homepage and on inner marketing pages that use `PageHero`.
- Legal pages exist in English at `/terms`, `/privacy`, and `/refund-policy`, with permanent redirects from `/uslovi` and `/privatnost`.
- Anonymous dashboard requests redirect to login.
- Admin is `noindex`.
- The promo video reserves space with `aspect-video`, which limits layout shift, and it does not preload the file.
- Guest gallery code uses the property name as alt text on the main image. Decorative thumbnails correctly use empty alt text.
- No hreflang was present. English-only is the right current strategy. See the international section below.

## Recommendations that were not all turned into pages

- Keep one English site. Do not create US, UK, AU, or CA doorway pages.
- Do not add hreflang until a second language has real content.
- Do not publish a large article set. Two guides were justified. More should be written only after Search Console shows which queries arrive.
- Measure Core Web Vitals in Search Console and PageSpeed Insights after the domain redirect is corrected. A lab run against localhost would not describe production.
- Compress or re-encode the 8.5 MB tour video before the next performance pass. That was not done here, because a blind re-encode can damage the only product tour.
- Guest sites (`/host/...` and booking subdomains) need a separate indexing review once a few real public sites exist. They should not be mixed into the SaaS sitemap.

## Security and privacy notes for public SEO

- Marketing structured data uses the public name, `https://hostvia.me`, `hello@hostvia.me`, and the generated icon. It does not include host or guest records.
- Calendar analytics events must not include the iCal URL. Those URLs can act as secrets.
- Sign-up and billing events must not include email, name, reservation details, or Stripe session ids.
