-- Complimentary Pro: unlimited properties and full access without Stripe subscription.
-- Set via Supabase SQL or POST /api/admin/pro-access (admin only).

alter table public.host_profiles
  add column if not exists pro_access_granted boolean not null default false,
  add column if not exists pro_access_granted_at timestamptz,
  add column if not exists pro_access_granted_note text;

create index if not exists host_profiles_pro_access_granted_idx
  on public.host_profiles (pro_access_granted)
  where pro_access_granted = true;
