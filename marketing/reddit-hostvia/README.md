# Hostvia Reddit ad

A 15-second square promo for a Reddit feed ad. It is silent, loops, and uses only the product’s real screens and wording.

| File | What it is |
| --- | --- |
| `hostvia-reddit.gif` | 1200×1200, 12 fps, looping, about 5 MB |
| `hostvia-reddit.mp4` | 1200×1200, 30 fps, H.264, about 1.2 MB |
| `src/` | Remotion source |
| `render.mjs` | Renders the MP4, then builds the GIF |

## What the pictures are

The dashboard requires a login, and the production account contains real guest data, so these frames are not a screen recording. They are laid out from the current UI:

| Scene | Based on |
| --- | --- |
| Opening notes | The daily check the product is meant to replace. Not a Hostvia screen. |
| Dashboard | `dashboard-overview.tsx` — Arrivals today, Departures today, Upcoming arrivals, Properties |
| Calendars | `calendars/page.tsx` and `compact-property-calendar.tsx`. Reservation bars use the same color sequence as `compact-calendar-colors.ts` and cover nights only, as `calendar-week-segments.ts` does. |
| Cleanings | `cleanings/page.tsx` and `date-events-list.tsx` — Checkout, Check in, the direct-booking letter D, and “1 cleaning” |
| Public site | `host-reserve-panel.tsx` — Your stay, Price, Send request, then Request sent. The host confirms availability. Hostvia does not charge the guest. |
| Close | Logo from `hostvia-app-icon.tsx`, wordmark from the sidebar, free plan of 2 properties |

Type inside the product frames is larger than the app so it can still be read in a feed. The square calendars are stacked; in the app they sit in a wrapping grid.

The opening does not show an occupancy percentage. The dashboard has one, but a sample percentage would read as a performance claim, so that block is left out.

Calendar sync is not shown. The product imports and exports iCal, and the other platform reads that link on its own schedule.

## Sample data

February 2027, with Thursday 11 February as “today.” Two fictional properties, Olive Bungalow and Pine Bungalow. Guest names, the inquiry from Laura Bennett, the phone number, and the €90 nightly price are made up for the layout. They are not customers or results.

The date range on the dashboard, “Feb 11 – Feb 14 · 2 properties,” is the real header format: this week through Sunday, and the number of properties.

## Timing

| Time | On screen |
| --- | --- |
| 0.0–3.0s | “Managing a few vacation rentals?” |
| 3.0–6.0s | “I built Hostvia to make it simpler.” |
| 6.0–9.8s | Calendars, then cleanings. “Bookings. Arrivals. Cleaning.” |
| 9.8–12.0s | “Your own website for direct inquiries.” |
| 12.0–14.3s | “Built for small vacation rental owners.” / “Start free — up to 2 properties.” / hostvia.me |
| 14.3–15.0s | Returns to the opening so the loop is seamless |

## Regenerate

From the repo root, the Remotion package in `video/` must already be installed (`cd video && npm install`). That install includes Chrome for rendering and ffmpeg. Geist is loaded from `video/public/fonts`. The render script symlinks `video/node_modules` into this folder so Remotion can resolve its packages. The symlink is gitignored.

```bash
cd marketing/reddit-hostvia
npm run render
```

The script writes `hostvia-reddit.mp4` and `hostvia-reddit.gif` in this folder. It does not change the Next.js app. The GIF is encoded with the ffmpeg build that ships inside Remotion. That build has no `fps` filter, so the script sets the GIF rate with `-r 12`. The file loops forever.
