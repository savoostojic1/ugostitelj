# Ugostitelj

Property calendar dashboard for short-term rental hosts. Connect Airbnb and Booking.com calendars via iCal/ICS URLs and view all reservations in one unified calendar.

## Stack

- Next.js 15 · TypeScript · Tailwind CSS · shadcn/ui
- Supabase (Auth + Postgres)
- TanStack React Query · Zustand

## Setup

1. **Supabase project**

   Create a project at [supabase.com](https://supabase.com).

2. **Database**

   Run migrations in order in the Supabase SQL editor:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_no_auto_data_for_new_users.sql` (if you already ran 001 before this change)
   - `supabase/migrations/004_fix_calendar_feeds_rls.sql` (if adding calendar feeds fails with RLS)
   - `supabase/migrations/005_create_calendar_feeds.sql` (if you see `PGRST205` / table not found)

   New users start with **no** properties, feeds, or reservations — they add everything manually.

3. **Environment**

   Copy `.env.example` to `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

   Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from Project Settings → API.

4. **Auth redirect URLs** (Supabase → Authentication → URL Configuration)

   - Site URL: `http://localhost:3000` (production: your Vercel domain)
   - Redirect URLs: `http://localhost:3000/**`, `https://your-domain.vercel.app/**`

5. **Run**

   ```bash
   npm install
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Deploy on Vercel

1. Push this repo to GitHub (root = folder with `package.json`, not a subfolder).
2. Import the repo in [Vercel](https://vercel.com/new) — framework should auto-detect **Next.js**.
3. **Root Directory**: leave empty (`.`).
4. Add environment variables from `.env.example`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy.

`vercel.json` at the repo root pins the Next.js framework preset.

## Core flow

1. Register / sign in → Dashboard
2. **New Property** → name, address, image URL
3. On the property page → **Connected Calendars** → add Airbnb / Booking / custom ICS URL
4. **Sync Now** → reservations import into `reservations` table
5. View **Reservation Calendar**, dashboard overview, and **Arrivals & Departures**

## Database tables

| Table            | Purpose                                      |
|------------------|----------------------------------------------|
| `users`          | Profile linked to `auth.users`               |
| `properties`     | Rental properties per host                   |
| `calendar_feeds` | iCal URLs per property                       |
| `reservations`   | Imported stays (check-in/out, platform)    |

## API

- `POST /api/sync` — body `{ "feedId": "..." }` or `{ "propertyId": "..." }` to sync ICS feeds

## Notes

- No direct Airbnb/Booking APIs — calendar sync only via public ICS URLs
- Row Level Security ensures users only access their own data
