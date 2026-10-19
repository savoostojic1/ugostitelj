# Hostvia.me promo video

Remotion project for the Hostvia.me promotional video. It is fully isolated from the
Next.js app: it has its own `package.json`/`node_modules`, and it is excluded from the
root `tsconfig.json`, ESLint, and Vercel uploads (`.vercelignore`).

## Deliverables

| File | What it is |
| --- | --- |
| `out/hostvia-promo.mp4` | Final video: 1920×1080, 30 fps, H.264 (High, yuv420p, CRF 18), AAC 192 kbps, 40.0 s |
| `out/hostvia-promo-poster.jpg` | Last frame (logo + tagline), usable as the `<video poster>` |
| `out/hostvia-promo-contact-sheet.jpg` | 16 frames extracted from the rendered MP4 |
| `src/` | Editable animation source |
| `public/photos/` | Original property photos generated for this video (AI-generated, fictional places) |
| `public/audio/hostvia-voiceover.mp3` | Copy of the supplied voiceover (`../public/videos/hostvia-voiceover.mp3`), unchanged |

## Rendering

Requires Node 20+. Remotion downloads its own headless Chrome on the first render and ships its own ffmpeg, so nothing else needs to be installed.

```bash
cd video
npm install
npm run studio          # live preview / editing at http://localhost:3000
npm run render          # → out/hostvia-promo.mp4
npm run render:no-tag   # same video without the "Illustrative interface · sample data" label
npm run poster          # → out/hostvia-promo-poster.jpg (last frame)
npm run contact-sheet   # → out/hostvia-promo-contact-sheet.jpg (from the rendered MP4)
```

If you replace the voiceover, re-measure its pauses (for example
`npx remotion ffmpeg -i public/audio/hostvia-voiceover.mp3 -af silencedetect=noise=-38dB:d=0.25 -f null -`)
and update the cut points in `src/timing.ts`.

## Timing

The voiceover is 37.88 s long, and the speech ends at 37.68 s. Every scene cut sits inside a measured pause in the
narration, and the 0.4 s crossfade falls entirely within that pause. The audio starts after a 0.4 s silent
lead-in on the logo. After the last word, the final logo frame holds for about 1.9 s.

Motion: captions animate word by word (`KineticText` in `src/ui/kit.tsx`). Each word rises in, comes into focus
and settles with a slight overshoot, then lifts away and blurs out just before the cut, so consecutive captions
overlap. Floating elements (logo, captions, phones, cards, toasts) use `float()`, a slow hover with a small, quick
nudge about every 1.5 s. After the incoming scene is fully visible, the outgoing scene fades out over 10 more frames,
so nothing pops off screen.

| Scene | Video time | Voiceover |
| --- | --- | --- |
| 1 Intro | 0.0 – 2.7 s | "What do you get with Hostvia.me?" |
| 2 Calendars | 2.7 – 8.5 s | "Manage all your properties and reservations…" |
| 3 Manual bookings | 8.5 – 14.4 s | "Add manual bookings, track prices…" |
| 4 Cleanings | 14.4 – 21.3 s | "Organize your cleaning schedules…" |
| 5 Public website | 21.3 – 28.5 s | "Get your own accommodation website…" |
| 6 Saved messages | 28.5 – 33.0 s | "Save your most frequently used guest messages…" |
| 7 Brand | 33.0 – 40.0 s | "Hostvia.me. Everything you need…" |

## Source of each scene: real footage vs. illustrative UI

**No scene uses real application footage.** The dashboard requires logging into the production
Supabase project, which holds real guest data. No demo account was available. Recording it would have
risked exposing guest information, so every interface shot is an illustration built for this video.

The illustrations are rebuilt from the real components, not invented. They reuse the actual page titles,
labels, colors, and layouts from `src/`:

| Scene | Type | Based on |
| --- | --- | --- |
| 1 Dashboard | Illustrative UI | `dashboard-overview.tsx` (Occupancy, Arrivals/Departures today, Upcoming arrivals) |
| 2 Calendars | Illustrative UI | `calendars/page.tsx` + `compact-property-calendar.tsx` (one month grid per property) |
| 3 Manual bookings | Illustrative UI | `manual-reservation-form.tsx` (Property, Guest name, Phone number, Stay dates, Booking source, Price (€)), "Manual reservation added" toast, calendar export link |
| 4 Cleanings | Illustrative UI | `date-events-list.tsx` (Checkout / Check in + A/B/D source / Stayover / Empty, "N cleanings", free days) and team access ("Cleaning team", "Can view") |
| 5 Public website | Illustrative UI + generated photos | `host-reserve-panel.tsx` (Your stay, Price, Send request, "Request sent" text). Subdomain URL format from `booking-site-url.ts` |
| 6 Saved messages | Illustrative UI | `porouka/page.tsx` + `saved-messages-dropdown.tsx` ("… copied" toast) |
| 7 Brand | Montage of the illustrations above + logo | Logo recreated from `hostvia-app-icon.tsx` / sidebar wordmark |

The sample data is fictional: property names, guest names, phone numbers (from 555 and UK 07700 900 drama
ranges), prices, and the "Adriatic Stays" site. Dashboard numbers such as occupancy are computed from that
sample data. They are not product statistics. While product UI is on screen, a small
"Illustrative interface · sample data" label sits in the bottom-right corner. Use `render:no-tag` to remove it.

Claims are kept to what `HOSTVIA_FEATURES.md` confirms:
- Guests send an inquiry. No payment through Hostvia is shown.
- The export note says that Airbnb and Booking.com pick up the calendar on their own sync schedule. It does not imply instant updates.
- Cleanings are counted from departures. There is no task-assignment or "cleaning done" feature, so none is shown.

## Assets and licensing

- **Property photos** (`public/photos/*.jpg`): generated for this project with an image model. They do not show a real property or real stock footage.
- **Font**: Geist (SIL Open Font License), from the `geist` npm package. It is the same font the app uses.
- **Icons**: lucide-react (ISC license). It is the same icon set the app uses.
- **Music**: none. No licensed track was available. The only audio is the supplied voiceover, at full level.
