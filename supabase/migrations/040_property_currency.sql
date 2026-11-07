-- Per-property ISO 4217 currency.
-- Existing price numbers are not rewritten or converted.
-- Existing reservations keep EUR, which is the currency they were created in,
-- and their stored price is copied into total_amount.

alter table public.properties
  alter column starting_price type numeric(16, 3);

alter table public.property_price_rules
  alter column price_per_night type numeric(16, 3);

alter table public.reservations
  alter column price type numeric(16, 3);

alter table public.properties
  add column if not exists currency_code text;

update public.properties
set currency_code = 'EUR'
where currency_code is null;

alter table public.properties
  alter column currency_code set default 'EUR';

alter table public.properties
  alter column currency_code set not null;

alter table public.reservations
  add column if not exists currency_code text,
  add column if not exists nightly_rate numeric(16, 3),
  add column if not exists total_amount numeric(16, 3);

update public.reservations
set currency_code = 'EUR'
where currency_code is null;

alter table public.reservations
  alter column currency_code set default 'EUR';

alter table public.reservations
  alter column currency_code set not null;

-- Copy the existing total. Do not change reservations.price.
update public.reservations
set total_amount = price
where total_amount is null
  and price is not null;

alter table public.booking_requests
  add column if not exists currency_code text,
  add column if not exists nightly_rate numeric(16, 3),
  add column if not exists total_amount numeric(16, 3),
  add column if not exists nights integer;

update public.booking_requests
set currency_code = 'EUR'
where currency_code is null;

alter table public.booking_requests
  alter column currency_code set default 'EUR';

alter table public.booking_requests
  alter column currency_code set not null;

-- Keep this list aligned with src/lib/currency/currencies.ts.
alter table public.properties
  drop constraint if exists properties_currency_code_check;
alter table public.properties
  add constraint properties_currency_code_check
  check (currency_code in (
    'AED', 'ALL', 'AUD', 'BAM', 'BGN', 'BHD', 'BRL', 'CAD', 'CHF', 'CLP',
    'CNY', 'COP', 'CZK', 'DKK', 'EGP', 'EUR', 'GBP', 'GEL', 'HKD', 'HUF',
    'IDR', 'ILS', 'INR', 'ISK', 'JOD', 'JPY', 'KRW', 'KWD', 'MAD', 'MKD',
    'MXN', 'MYR', 'NOK', 'NZD', 'OMR', 'PHP', 'PLN', 'QAR', 'RON', 'RSD',
    'SAR', 'SEK', 'SGD', 'THB', 'TND', 'TRY', 'TWD', 'UAH', 'USD', 'VND',
    'ZAR'
  ));

alter table public.reservations
  drop constraint if exists reservations_currency_code_check;
alter table public.reservations
  add constraint reservations_currency_code_check
  check (currency_code in (
    'AED', 'ALL', 'AUD', 'BAM', 'BGN', 'BHD', 'BRL', 'CAD', 'CHF', 'CLP',
    'CNY', 'COP', 'CZK', 'DKK', 'EGP', 'EUR', 'GBP', 'GEL', 'HKD', 'HUF',
    'IDR', 'ILS', 'INR', 'ISK', 'JOD', 'JPY', 'KRW', 'KWD', 'MAD', 'MKD',
    'MXN', 'MYR', 'NOK', 'NZD', 'OMR', 'PHP', 'PLN', 'QAR', 'RON', 'RSD',
    'SAR', 'SEK', 'SGD', 'THB', 'TND', 'TRY', 'TWD', 'UAH', 'USD', 'VND',
    'ZAR'
  ));

alter table public.booking_requests
  drop constraint if exists booking_requests_currency_code_check;
alter table public.booking_requests
  add constraint booking_requests_currency_code_check
  check (currency_code in (
    'AED', 'ALL', 'AUD', 'BAM', 'BGN', 'BHD', 'BRL', 'CAD', 'CHF', 'CLP',
    'CNY', 'COP', 'CZK', 'DKK', 'EGP', 'EUR', 'GBP', 'GEL', 'HKD', 'HUF',
    'IDR', 'ILS', 'INR', 'ISK', 'JOD', 'JPY', 'KRW', 'KWD', 'MAD', 'MKD',
    'MXN', 'MYR', 'NOK', 'NZD', 'OMR', 'PHP', 'PLN', 'QAR', 'RON', 'RSD',
    'SAR', 'SEK', 'SGD', 'THB', 'TND', 'TRY', 'TWD', 'UAH', 'USD', 'VND',
    'ZAR'
  ));

-- Minor units that are not 2. Must match Intl.NumberFormat for the supported list.
create or replace function public.currency_fraction_digits(p_code text)
returns integer
language sql
immutable
as $$
  select case upper(coalesce(nullif(btrim(p_code), ''), 'EUR'))
    when 'ALL' then 0
    when 'CLP' then 0
    when 'ISK' then 0
    when 'JPY' then 0
    when 'KRW' then 0
    when 'RSD' then 0
    when 'VND' then 0
    when 'BHD' then 3
    when 'JOD' then 3
    when 'KWD' then 3
    when 'OMR' then 3
    when 'TND' then 3
    else 2
  end;
$$;

-- EUR properties still round to 2 decimal places, matching the previous function.
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
  digits integer;
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

  select public.currency_fraction_digits(p.currency_code)
  into digits
  from public.properties p
  where p.id = p_property_id;

  return round(total, coalesce(digits, 2));
end;
$$;

create or replace function public.get_public_property_currency(p_property_id uuid)
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_currency text;
begin
  select p.currency_code
  into v_currency
  from public.properties p
  where p.id = p_property_id
    and p.is_public = true
    and p.slug is not null
    and public.property_is_within_plan_limit(p.id);

  return v_currency;
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
        p.description,
        p.address,
        p.image_url,
        p.gallery_urls,
        p.capacity,
        p.amenities,
        p.house_rules,
        p.starting_price,
        p.currency_code
      from public.properties p
      where p.user_id = host_user_id
        and p.is_public = true
        and p.slug is not null
        and public.property_is_within_plan_limit(p.id)
    ) t
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
        p.currency_code,
        public.calculate_property_stay_total(p.id, p_check_in, p_check_out) as stay_total
      from public.properties p
      where p.user_id = host_user_id
        and p.is_public = true
        and p.slug is not null
        and public.property_is_within_plan_limit(p.id)
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
    'currency_code', p.currency_code,
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

-- Availability checks are unchanged. The quote is stored on the request.
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
  v_currency text;
  v_total numeric;
  v_nights integer;
  v_nightly numeric;
begin
  if p_check_out <= p_check_in then
    raise exception 'Invalid date range';
  end if;

  if p_guest_count is null or p_guest_count < 1 then
    raise exception 'Invalid guest count';
  end if;

  select p.id, p.user_id, p.currency_code
  into v_property_id, v_host_id, v_currency
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

  v_currency := coalesce(nullif(btrim(v_currency), ''), 'EUR');
  v_nights := p_check_out - p_check_in;
  v_total := public.calculate_property_stay_total(
    v_property_id,
    p_check_in,
    p_check_out
  );
  if v_total is null or v_nights <= 0 then
    v_nightly := null;
  else
    v_nightly := round(v_total / v_nights, public.currency_fraction_digits(v_currency));
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
    status,
    currency_code,
    nightly_rate,
    total_amount,
    nights
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
    'pending',
    v_currency,
    v_nightly,
    v_total,
    v_nights
  )
  returning id into v_request_id;

  return v_request_id;
end;
$$;

-- Confirmation still creates one manual reservation and keeps the inquiry.
-- The reservation copies the request snapshot instead of reading the live currency.
create or replace function public.accept_booking_request(p_request_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.booking_requests%rowtype;
  v_price numeric;
  v_nightly numeric;
  v_currency text;
  v_source text;
  v_reservation_id uuid;
  v_nights integer;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select *
  into v_request
  from public.booking_requests br
  where br.id = p_request_id
    and br.host_id = auth.uid()
    and br.status = 'pending'
  for update;

  if not found then
    raise exception 'Request not found or already processed';
  end if;

  if exists (
    select 1
    from public.reservations r
    where r.property_id = v_request.property_id
      and r.check_in < v_request.check_out
      and r.check_out > v_request.check_in
  ) then
    raise exception 'Selected dates are no longer available';
  end if;

  v_currency := coalesce(
    nullif(btrim(v_request.currency_code), ''),
    (
      select p.currency_code
      from public.properties p
      where p.id = v_request.property_id
    ),
    'EUR'
  );
  v_nights := v_request.check_out - v_request.check_in;
  v_price := v_request.total_amount;
  v_nightly := v_request.nightly_rate;

  if v_price is null then
    v_price := coalesce(
      public.calculate_property_stay_total(
        v_request.property_id,
        v_request.check_in,
        v_request.check_out
      ),
      0
    );
    if v_nights > 0 and v_price > 0 then
      v_nightly := round(v_price / v_nights, public.currency_fraction_digits(v_currency));
    end if;
  end if;

  v_source := 'Booking site · ' || v_request.email
    || ' · ' || v_request.guest_count::text || ' guest(s)';

  if v_request.message is not null and btrim(v_request.message) <> '' then
    v_source := v_source || ' · ' || left(btrim(v_request.message), 240);
  end if;

  insert into public.reservations (
    property_id,
    user_id,
    calendar_feed_id,
    external_uid,
    title,
    check_in,
    check_out,
    platform,
    is_manual,
    source,
    guest_phone,
    price,
    currency_code,
    nightly_rate,
    total_amount
  )
  values (
    v_request.property_id,
    v_request.host_id,
    null,
    'manual-' || gen_random_uuid()::text,
    btrim(v_request.guest_name),
    v_request.check_in,
    v_request.check_out,
    'custom',
    true,
    v_source,
    nullif(btrim(v_request.phone), ''),
    v_price,
    v_currency,
    v_nightly,
    v_price
  )
  returning id into v_reservation_id;

  update public.booking_requests
  set status = 'accepted',
      reservation_id = v_reservation_id
  where id = p_request_id;

  insert into public.notification_jobs (booking_request_id, event_key)
  values (p_request_id, 'confirmed')
  on conflict (booking_request_id, event_key) do nothing;

  return v_reservation_id;
end;
$$;

grant execute on function public.get_public_property_currency(uuid) to anon, authenticated;
