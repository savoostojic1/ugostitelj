# Google Search Console setup for hostvia.me

Do this before you submit a sitemap. The application code now treats `https://hostvia.me` as the canonical origin, but production was still redirecting that origin to `www` on 20 October 2026.

## 1. Make the apex the live origin

In the Vercel project that serves this site:

1. Open **Settings → Domains**.
2. Set `hostvia.me` as the primary domain.
3. Set `www.hostvia.me` to redirect to `hostvia.me` (308).
4. Remove any redirect that sends the apex to `www`.

Check from a terminal:

```bash
curl -sI https://hostvia.me/ | head -n 15
curl -sI https://www.hostvia.me/ | head -n 15
```

Expected after the change:

- `https://hostvia.me/` returns **200**.
- `https://www.hostvia.me/` returns **308** to `https://hostvia.me/`.

If the apex still returns 308 to www, stop. Canonical tags and the sitemap will point at a redirecting URL, and Search Console will report those sitemap URLs as redirects.

Deploy the SEO changes in this repository only after that domain check passes. This repository was not deployed as part of the SEO work.

## 2. Confirm robots and the sitemap on the live origin

```bash
curl -sI https://hostvia.me/robots.txt
curl -s https://hostvia.me/robots.txt
curl -sI https://hostvia.me/sitemap.xml
curl -s https://hostvia.me/sitemap.xml
```

Expected:

- Both URLs return **200**, not **307** to `/login`.
- `robots.txt` allows `/` and disallows `/dashboard`, `/admin`, `/api/`, and `/auth/`.
- The sitemap lists only `https://hostvia.me` marketing URLs. It must not list `/dashboard`, `/admin`, `/login`, `/register`, `/api/`, or `/host/`.

Also confirm an old path redirects once:

```bash
curl -sI https://hostvia.me/cijene
```

Expected: **308** to `https://hostvia.me/pricing`, and that pricing URL returns **200**.

## 3. Add the property

1. Open [Google Search Console](https://search.google.com/search-console).
2. Add a **Domain** property for `hostvia.me` (covers www and the apex). A URL-prefix property for `https://hostvia.me/` is a useful second check, but the domain property is the one to keep.
3. Verify with the DNS TXT record at the DNS host that serves `hostvia.me`. Vercel’s domain screen can show where DNS is managed. Do not use a meta tag that only exists on one host if the other host is still the one Google fetches.
4. Wait until verification succeeds. DNS can take from a few minutes to 48 hours.

If a URL-prefix property for `https://www.hostvia.me/` already exists, keep it until the www redirect has been live for a few weeks, then rely on the domain property.

## 4. Submit the sitemap

1. Search Console → **Sitemaps**.
2. Submit `https://hostvia.me/sitemap.xml`.
3. Status should become **Success**. “Couldn’t fetch” usually means the file still redirects to login, or the apex still redirects to www.

## 5. What to watch for the first month

**Pages**

- Indexed URLs should be the English marketing pages, legal pages, and any real public host sites.
- `/login`, `/register`, `/dashboard`, and `/admin` should not be indexed. If they are, open the URL inspection tool. Login and register send `noindex`. Dashboard and admin are disallowed in `robots.txt` and also send `noindex` when their HTML is rendered. A URL that only 307s to `/login` can still appear until Google recrawls it.

**Redirects**

- Old paths (`/funkcije`, `/kako-radi`, `/javni-sajt`, `/cijene`, `/kontakt`, `/o-nama`, `/privatnost`, `/uslovi`) should show as redirects, not as duplicate pages.

**Performance**

- After impressions exist, compare queries with `SEO_KEYWORD_MAP.md`. Edit the matching page. Do not add a new URL for a synonym.
- Do not mark Core Web Vitals as passing or failing from this repository. Use the Search Console Core Web Vitals report, which is field data, once it has traffic.

**Host sites**

- A published guest site at `/host/their-name` may be indexed because it is public and allowed. That is separate from the SaaS marketing sitemap. Inspect a real example before changing that rule. Unknown usernames should 404 and stay out of the sitemap.

## 6. Inspection spot checks

Use URL inspection on:

- `https://hostvia.me/`
- `https://hostvia.me/pricing`
- `https://hostvia.me/guides/vacation-rental-calendar`
- `https://hostvia.me/dashboard` (should not be indexed)
- `https://hostvia.me/cijene` (should refer to `/pricing`)

Request indexing only for the marketing URLs, and only after each one returns 200 on the apex.
