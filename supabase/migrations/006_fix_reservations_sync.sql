-- Osiguraj reservations šemu za iCal sync
-- Podržava i calendar_platform i platform_type (starija šema)

do $$ begin
  create type public.calendar_platform as enum ('airbnb', 'booking', 'custom');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.platform_type as enum ('airbnb', 'booking', 'custom');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  title text not null default 'Reserved',
  check_in date not null default current_date,
  check_out date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.reservations add column if not exists calendar_feed_id uuid
  references public.calendar_feeds (id) on delete set null;

alter table public.reservations add column if not exists external_uid text;

alter table public.reservations add column if not exists title text;

alter table public.reservations add column if not exists check_in date;

alter table public.reservations add column if not exists check_out date;

alter table public.reservations add column if not exists created_at timestamptz default now();

alter table public.reservations add column if not exists updated_at timestamptz default now();

-- platform kolona: koristi postojeći tip ili dodaj novu
do $$
declare
  platform_udt text;
begin
  select c.udt_name
  into platform_udt
  from information_schema.columns c
  where c.table_schema = 'public'
    and c.table_name = 'reservations'
    and c.column_name = 'platform';

  if platform_udt is null then
    if exists (select 1 from pg_type where typname = 'platform_type') then
      alter table public.reservations
        add column platform public.platform_type not null default 'custom';
    else
      alter table public.reservations
        add column platform public.calendar_platform not null default 'custom';
    end if;
  end if;
end $$;

update public.reservations
set external_uid = coalesce(external_uid, id::text)
where external_uid is null;

-- Popuni platform prema stvarnom tipu kolone (nakon 007_align_platform_type_enum.sql)
do $$
declare
  platform_udt text;
  default_platform_type text;
  default_calendar_platform text;
begin
  select c.udt_name
  into platform_udt
  from information_schema.columns c
  where c.table_schema = 'public'
    and c.table_name = 'reservations'
    and c.column_name = 'platform';

  if platform_udt = 'platform_type' then
    select e.enumlabel
    into default_platform_type
    from pg_enum e
    join pg_type t on e.enumtypid = t.oid
    where t.typname = 'platform_type'
      and e.enumlabel in ('custom', 'airbnb', 'booking')
    order by case e.enumlabel
      when 'custom' then 1
      when 'airbnb' then 2
      when 'booking' then 3
      else 4
    end
    limit 1;

    if default_platform_type is not null then
      execute format(
        'update public.reservations set platform = coalesce(platform, %L::public.platform_type) where platform is null',
        default_platform_type
      );
    end if;
  elsif platform_udt = 'calendar_platform' then
    select e.enumlabel
    into default_calendar_platform
    from pg_enum e
    join pg_type t on e.enumtypid = t.oid
    where t.typname = 'calendar_platform'
      and e.enumlabel in ('custom', 'airbnb', 'booking')
    order by case e.enumlabel
      when 'custom' then 1
      when 'airbnb' then 2
      when 'booking' then 3
      else 4
    end
    limit 1;

    if default_calendar_platform is not null then
      execute format(
        'update public.reservations set platform = coalesce(platform, %L::public.calendar_platform) where platform is null',
        default_calendar_platform
      );
    end if;
  end if;
end $$;

update public.reservations
set title = coalesce(nullif(trim(title), ''), 'Reserved')
where title is null or trim(title) = '';

update public.reservations
set check_in = coalesce(check_in, current_date)
where check_in is null;

update public.reservations
set check_out = coalesce(check_out, check_in + 1, current_date)
where check_out is null;

alter table public.reservations alter column external_uid set not null;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'reservations'
      and column_name = 'platform'
  ) then
    alter table public.reservations alter column platform set not null;
  end if;
end $$;

alter table public.reservations alter column title set not null;

alter table public.reservations alter column check_in set not null;

alter table public.reservations alter column check_out set not null;

do $$ begin
  alter table public.reservations
    add constraint reservations_property_id_external_uid_key
    unique (property_id, external_uid);
exception
  when duplicate_object then null;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists reservations_updated_at on public.reservations;
create trigger reservations_updated_at
  before update on public.reservations
  for each row execute function public.set_updated_at();

alter table public.reservations enable row level security;

drop policy if exists "Users manage reservations on own properties" on public.reservations;
drop policy if exists "Users select reservations on own properties" on public.reservations;
drop policy if exists "Users insert reservations on own properties" on public.reservations;
drop policy if exists "Users update reservations on own properties" on public.reservations;
drop policy if exists "Users delete reservations on own properties" on public.reservations;

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

grant select, insert, update, delete on public.reservations to authenticated;

notify pgrst, 'reload schema';
