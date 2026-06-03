-- Ugostitelj initial schema
-- Run in Supabase SQL editor or via CLI

-- Profiles extend auth.users
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  address text,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create type public.calendar_platform as enum ('airbnb', 'booking', 'custom');

create table if not exists public.calendar_feeds (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  platform public.calendar_platform not null default 'custom',
  name text not null,
  ics_url text not null,
  last_synced_at timestamptz,
  last_sync_status text,
  last_sync_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  calendar_feed_id uuid references public.calendar_feeds (id) on delete set null,
  external_uid text not null,
  title text not null,
  check_in date not null,
  check_out date not null,
  platform public.calendar_platform not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (property_id, external_uid)
);

create index if not exists properties_user_id_idx on public.properties (user_id);
create index if not exists calendar_feeds_property_id_idx on public.calendar_feeds (property_id);
create index if not exists reservations_property_id_idx on public.reservations (property_id);
create index if not exists reservations_check_in_idx on public.reservations (check_in);
create index if not exists reservations_check_out_idx on public.reservations (check_out);

-- Profil u public.users je opcionalan; nema automatskog unosa pri registraciji.

-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_updated_at before update on public.users
  for each row execute function public.set_updated_at();
create trigger properties_updated_at before update on public.properties
  for each row execute function public.set_updated_at();
create trigger calendar_feeds_updated_at before update on public.calendar_feeds
  for each row execute function public.set_updated_at();
create trigger reservations_updated_at before update on public.reservations
  for each row execute function public.set_updated_at();

-- RLS
alter table public.users enable row level security;
alter table public.properties enable row level security;
alter table public.calendar_feeds enable row level security;
alter table public.reservations enable row level security;

create policy "Users can view own profile"
  on public.users for select using (auth.uid() = id);
create policy "Users can insert own profile"
  on public.users for insert with check (auth.uid() = id);
create policy "Users can update own profile"
  on public.users for update using (auth.uid() = id);

create policy "Users manage own properties"
  on public.properties for all using (auth.uid() = user_id);

create policy "Users select feeds on own properties"
  on public.calendar_feeds for select
  using (
    exists (
      select 1 from public.properties p
      where p.id = property_id and p.user_id = auth.uid()
    )
  );

create policy "Users insert feeds on own properties"
  on public.calendar_feeds for insert
  with check (
    exists (
      select 1 from public.properties p
      where p.id = property_id and p.user_id = auth.uid()
    )
  );

create policy "Users update feeds on own properties"
  on public.calendar_feeds for update
  using (
    exists (
      select 1 from public.properties p
      where p.id = property_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.properties p
      where p.id = property_id and p.user_id = auth.uid()
    )
  );

create policy "Users delete feeds on own properties"
  on public.calendar_feeds for delete
  using (
    exists (
      select 1 from public.properties p
      where p.id = property_id and p.user_id = auth.uid()
    )
  );

create policy "Users manage reservations on own properties"
  on public.reservations for all
  using (
    exists (
      select 1 from public.properties p
      where p.id = property_id and p.user_id = auth.uid()
    )
  );
