-- Public booking website: host profiles, property public fields, booking requests

create table if not exists public.host_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  business_name text,
  cover_image_url text,
  logo_url text,
  description text,
  contact_email text,
  contact_phone text,
  location text,
  social_links jsonb not null default '{}'::jsonb,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint host_profiles_username_format check (
    username ~ '^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$'
    or username ~ '^[a-z0-9]{1,2}$'
  )
);

create unique index if not exists host_profiles_username_idx
  on public.host_profiles (lower(username));

alter table public.properties
  add column if not exists slug text,
  add column if not exists short_description text,
  add column if not exists description text,
  add column if not exists capacity integer,
  add column if not exists amenities jsonb not null default '[]'::jsonb,
  add column if not exists house_rules text,
  add column if not exists starting_price numeric(12, 2),
  add column if not exists gallery_urls jsonb not null default '[]'::jsonb,
  add column if not exists is_public boolean not null default false,
  add column if not exists seo_title text,
  add column if not exists seo_description text;

create unique index if not exists properties_slug_unique_idx
  on public.properties (lower(slug))
  where slug is not null;

create type public.booking_request_status as enum (
  'pending',
  'accepted',
  'rejected',
  'contacted'
);

create table if not exists public.booking_requests (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  host_id uuid not null references auth.users (id) on delete cascade,
  guest_name text not null,
  email text not null,
  phone text not null,
  check_in date not null,
  check_out date not null,
  guest_count integer not null default 1 check (guest_count > 0),
  message text,
  status public.booking_request_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint booking_requests_dates check (check_out > check_in)
);

create index if not exists booking_requests_host_id_idx
  on public.booking_requests (host_id);
create index if not exists booking_requests_property_id_idx
  on public.booking_requests (property_id);
create index if not exists booking_requests_status_idx
  on public.booking_requests (status);

create trigger host_profiles_updated_at
  before update on public.host_profiles
  for each row execute function public.set_updated_at();

create trigger booking_requests_updated_at
  before update on public.booking_requests
  for each row execute function public.set_updated_at();

-- RLS
alter table public.host_profiles enable row level security;
alter table public.booking_requests enable row level security;

create policy "Hosts manage own profile"
  on public.host_profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Hosts manage own booking requests"
  on public.booking_requests for all
  using (auth.uid() = host_id)
  with check (auth.uid() = host_id);

-- Public read via RPC (security definer)

create or replace function public.get_public_host_profile(p_username text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  result json;
begin
  select json_build_object(
    'username', hp.username,
    'business_name', coalesce(hp.business_name, hp.username),
    'cover_image_url', hp.cover_image_url,
    'logo_url', hp.logo_url,
    'description', hp.description,
    'contact_email', hp.contact_email,
    'contact_phone', hp.contact_phone,
    'location', hp.location,
    'social_links', hp.social_links
  )
  into result
  from public.host_profiles hp
  where lower(hp.username) = lower(p_username)
    and hp.is_published = true;

  return result;
end;
$$;

create or replace function public.get_public_host_properties(p_username text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  host_user_id uuid;
begin
  select hp.id into host_user_id
  from public.host_profiles hp
  where lower(hp.username) = lower(p_username)
    and hp.is_published = true;

  if host_user_id is null then
    return '[]'::json;
  end if;

  return (
    select coalesce(json_agg(row_to_json(t) order by t.name), '[]'::json)
    from (
      select
        p.id,
        p.slug,
        p.name,
        p.short_description,
        p.address,
        p.image_url,
        p.capacity,
        p.amenities,
        p.starting_price
      from public.properties p
      where p.user_id = host_user_id
        and p.is_public = true
        and p.slug is not null
    ) t
  );
end;
$$;

create or replace function public.get_public_property(p_slug text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  result json;
begin
  select json_build_object(
    'id', p.id,
    'slug', p.slug,
    'name', p.name,
    'short_description', p.short_description,
    'description', p.description,
    'address', p.address,
    'image_url', p.image_url,
    'gallery_urls', p.gallery_urls,
    'capacity', p.capacity,
    'amenities', p.amenities,
    'house_rules', p.house_rules,
    'starting_price', p.starting_price,
    'seo_title', coalesce(p.seo_title, p.name),
    'seo_description', coalesce(
      p.seo_description,
      nullif(p.short_description, ''),
      p.name
    ),
    'host', json_build_object(
      'username', hp.username,
      'business_name', coalesce(hp.business_name, hp.username),
      'logo_url', hp.logo_url,
      'contact_email', hp.contact_email,
      'contact_phone', hp.contact_phone,
      'location', hp.location
    )
  )
  into result
  from public.properties p
  join public.host_profiles hp on hp.id = p.user_id
  where lower(p.slug) = lower(p_slug)
    and p.is_public = true
    and hp.is_published = true;

  return result;
end;
$$;

create or replace function public.get_public_property_reservations(p_property_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.properties p
    join public.host_profiles hp on hp.id = p.user_id
    where p.id = p_property_id
      and p.is_public = true
      and hp.is_published = true
  ) then
    return '[]'::json;
  end if;

  return (
    select coalesce(json_agg(row_to_json(t)), '[]'::json)
    from (
      select r.check_in, r.check_out
      from public.reservations r
      where r.property_id = p_property_id
      order by r.check_in
    ) t
  );
end;
$$;

create or replace function public.submit_booking_request(
  p_property_slug text,
  p_guest_name text,
  p_email text,
  p_phone text,
  p_check_in date,
  p_check_out date,
  p_guest_count integer,
  p_message text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_property_id uuid;
  v_host_id uuid;
  v_request_id uuid;
begin
  if p_check_out <= p_check_in then
    raise exception 'Invalid date range';
  end if;

  if p_guest_count is null or p_guest_count < 1 then
    raise exception 'Invalid guest count';
  end if;

  select p.id, p.user_id
  into v_property_id, v_host_id
  from public.properties p
  join public.host_profiles hp on hp.id = p.user_id
  where lower(p.slug) = lower(p_property_slug)
    and p.is_public = true
    and hp.is_published = true;

  if v_property_id is null then
    raise exception 'Property not found';
  end if;

  if exists (
    select 1
    from public.reservations r
    where r.property_id = v_property_id
      and r.check_in < p_check_out
      and r.check_out > p_check_in
  ) then
    raise exception 'Selected dates are not available';
  end if;

  insert into public.booking_requests (
    property_id,
    host_id,
    guest_name,
    email,
    phone,
    check_in,
    check_out,
    guest_count,
    message,
    status
  )
  values (
    v_property_id,
    v_host_id,
    trim(p_guest_name),
    trim(p_email),
    trim(p_phone),
    p_check_in,
    p_check_out,
    p_guest_count,
    nullif(trim(coalesce(p_message, '')), ''),
    'pending'
  )
  returning id into v_request_id;

  return v_request_id;
end;
$$;

grant execute on function public.get_public_host_profile(text) to anon, authenticated;
grant execute on function public.get_public_host_properties(text) to anon, authenticated;
grant execute on function public.get_public_property(text) to anon, authenticated;
grant execute on function public.get_public_property_reservations(uuid) to anon, authenticated;
grant execute on function public.submit_booking_request(
  text, text, text, text, date, date, integer, text
) to anon, authenticated;
