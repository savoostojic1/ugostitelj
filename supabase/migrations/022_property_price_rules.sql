-- Cijene po noći za određene periode datuma

create table if not exists public.property_price_rules (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  start_date date not null,
  end_date date not null,
  price_per_night numeric(12, 2) not null check (price_per_night > 0),
  created_at timestamptz not null default now(),
  constraint property_price_rules_date_range check (end_date >= start_date)
);

create index if not exists property_price_rules_property_dates_idx
  on public.property_price_rules (property_id, start_date, end_date);

alter table public.property_price_rules enable row level security;

create policy "Users select price rules on own properties"
  on public.property_price_rules for select
  using (
    exists (
      select 1 from public.properties p
      where p.id = property_price_rules.property_id
        and p.user_id = auth.uid()
    )
  );

create policy "Users insert price rules on own properties"
  on public.property_price_rules for insert
  with check (
    exists (
      select 1 from public.properties p
      where p.id = property_price_rules.property_id
        and p.user_id = auth.uid()
    )
  );

create policy "Users update price rules on own properties"
  on public.property_price_rules for update
  using (
    exists (
      select 1 from public.properties p
      where p.id = property_price_rules.property_id
        and p.user_id = auth.uid()
    )
  );

create policy "Users delete price rules on own properties"
  on public.property_price_rules for delete
  using (
    exists (
      select 1 from public.properties p
      where p.id = property_price_rules.property_id
        and p.user_id = auth.uid()
    )
  );

-- Cijena jedne noći: najužji period ima prednost, zatim osnovna cijena
create or replace function public.resolve_property_night_price(
  p_property_id uuid,
  p_night date
)
returns numeric
language sql
stable
set search_path = public
as $$
  select coalesce(
    (
      select pr.price_per_night
      from public.property_price_rules pr
      where pr.property_id = p_property_id
        and p_night >= pr.start_date
        and p_night <= pr.end_date
      order by (pr.end_date - pr.start_date) asc, pr.created_at desc
      limit 1
    ),
    (select p.starting_price from public.properties p where p.id = p_property_id)
  );
$$;

create or replace function public.calculate_property_stay_total(
  p_property_id uuid,
  p_check_in date,
  p_check_out date
)
returns numeric
language plpgsql
stable
set search_path = public
as $$
declare
  night date;
  night_price numeric;
  total numeric := 0;
begin
  if p_check_out <= p_check_in then
    return null;
  end if;

  for night in
    select gs::date
    from generate_series(p_check_in, p_check_out - 1, interval '1 day') gs
  loop
    night_price := public.resolve_property_night_price(p_property_id, night);
    if night_price is null then
      return null;
    end if;
    total := total + night_price;
  end loop;

  return round(total, 2);
end;
$$;

create or replace function public.calculate_public_property_stay_total(
  p_property_id uuid,
  p_check_in date,
  p_check_out date
)
returns numeric
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.properties p
    where p.id = p_property_id
      and p.is_public = true
      and p.slug is not null
  ) then
    return null;
  end if;

  return public.calculate_property_stay_total(
    p_property_id,
    p_check_in,
    p_check_out
  );
end;
$$;

create or replace function public.get_public_available_properties(
  p_username text,
  p_check_in date,
  p_check_out date,
  p_guest_count integer default 1
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  host_user_id uuid;
begin
  if p_check_out <= p_check_in then
    return '[]'::json;
  end if;

  if p_guest_count is null or p_guest_count < 1 then
    return '[]'::json;
  end if;

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
        coalesce(p.gallery_urls, '[]'::jsonb) as gallery_urls,
        p.starting_price,
        public.calculate_property_stay_total(p.id, p_check_in, p_check_out) as stay_total
      from public.properties p
      where p.user_id = host_user_id
        and p.is_public = true
        and p.slug is not null
        and (p.capacity is null or p.capacity >= p_guest_count)
        and not exists (
          select 1
          from public.reservations r
          where r.property_id = p.id
            and r.check_in < p_check_out
            and r.check_out > p_check_in
        )
    ) t
  );
end;
$$;
