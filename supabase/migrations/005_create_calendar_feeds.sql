-- Kreira calendar_feeds (i reservations ako nedostaju)
-- Pokreni u Supabase → SQL Editor ako dobijaš PGRST205

-- Enum za platformu
do $$ begin
  create type public.calendar_platform as enum ('airbnb', 'booking', 'custom');
exception
  when duplicate_object then null;
end $$;

-- Tabela calendar_feeds
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

create index if not exists calendar_feeds_property_id_idx
  on public.calendar_feeds (property_id);

-- Reservations (za sync) — preskoči ako već imaš drugačiju šemu
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

create index if not exists reservations_property_id_idx
  on public.reservations (property_id);
create index if not exists reservations_check_in_idx
  on public.reservations (check_in);
create index if not exists reservations_check_out_idx
  on public.reservations (check_out);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists calendar_feeds_updated_at on public.calendar_feeds;
create trigger calendar_feeds_updated_at
  before update on public.calendar_feeds
  for each row execute function public.set_updated_at();

-- RLS
alter table public.calendar_feeds enable row level security;
alter table public.reservations enable row level security;

drop policy if exists "Users manage feeds on own properties" on public.calendar_feeds;
drop policy if exists "Users select feeds on own properties" on public.calendar_feeds;
drop policy if exists "Users insert feeds on own properties" on public.calendar_feeds;
drop policy if exists "Users update feeds on own properties" on public.calendar_feeds;
drop policy if exists "Users delete feeds on own properties" on public.calendar_feeds;

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

drop policy if exists "Users manage reservations on own properties" on public.reservations;

create policy "Users select reservations on own properties"
  on public.reservations for select
  using (
    exists (
      select 1 from public.properties p
      where p.id = property_id and p.user_id = auth.uid()
    )
  );

create policy "Users insert reservations on own properties"
  on public.reservations for insert
  with check (
    exists (
      select 1 from public.properties p
      where p.id = property_id and p.user_id = auth.uid()
    )
  );

create policy "Users update reservations on own properties"
  on public.reservations for update
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

create policy "Users delete reservations on own properties"
  on public.reservations for delete
  using (
    exists (
      select 1 from public.properties p
      where p.id = property_id and p.user_id = auth.uid()
    )
  );

-- Dozvole za API (authenticated korisnici)
grant usage on schema public to authenticated, anon;
grant select, insert, update, delete on public.calendar_feeds to authenticated;
grant select, insert, update, delete on public.reservations to authenticated;

-- Osveži PostgREST schema cache
notify pgrst, 'reload schema';
