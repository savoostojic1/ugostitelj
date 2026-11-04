-- Guest management links, owner notification preferences, and a notification outbox.
-- Booking requests stay in place after accept, decline, and cancel so the guest
-- link remains valid. Confirmed stays still create a reservation row. Cancelling
-- a confirmed stay deletes that row so existing availability and iCal export
-- logic stop blocking the dates.

alter table public.booking_requests
  add column if not exists reference_code text,
  add column if not exists manage_token_hash text,
  add column if not exists manage_token_ciphertext text,
  add column if not exists manage_token_expires_at timestamptz,
  add column if not exists reservation_id uuid,
  add column if not exists cancelled_at timestamptz,
  add column if not exists cancelled_by text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'booking_requests_reservation_id_fkey'
  ) then
    alter table public.booking_requests
      add constraint booking_requests_reservation_id_fkey
      foreign key (reservation_id)
      references public.reservations (id)
      on delete set null;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'booking_requests_cancelled_by_check'
  ) then
    alter table public.booking_requests
      add constraint booking_requests_cancelled_by_check
      check (cancelled_by is null or cancelled_by in ('guest', 'owner'));
  end if;
end $$;

create unique index if not exists booking_requests_reference_code_idx
  on public.booking_requests (reference_code)
  where reference_code is not null;

create unique index if not exists booking_requests_manage_token_hash_idx
  on public.booking_requests (manage_token_hash)
  where manage_token_hash is not null;

create index if not exists booking_requests_reservation_id_idx
  on public.booking_requests (reservation_id)
  where reservation_id is not null;

create table if not exists public.host_notification_preferences (
  host_id uuid primary key references auth.users (id) on delete cascade,
  email_new_request boolean not null default true,
  email_confirmation boolean not null default true,
  email_cancellation boolean not null default true,
  push_new_request boolean not null default true,
  push_confirmation boolean not null default true,
  push_cancellation boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notification_jobs (
  id uuid primary key default gen_random_uuid(),
  booking_request_id uuid not null references public.booking_requests (id) on delete cascade,
  event_key text not null,
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'completed', 'failed')),
  attempt_count integer not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (booking_request_id, event_key)
);

create index if not exists notification_jobs_due_idx
  on public.notification_jobs (status, updated_at);

create table if not exists public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  booking_request_id uuid not null references public.booking_requests (id) on delete cascade,
  event_key text not null,
  channel text not null,
  status text not null default 'pending'
    check (status in ('pending', 'sent', 'failed', 'skipped')),
  attempt_count integer not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (booking_request_id, event_key, channel)
);

create table if not exists public.public_endpoint_hits (
  id bigint generated always as identity primary key,
  action text not null,
  ip_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists public_endpoint_hits_lookup_idx
  on public.public_endpoint_hits (action, ip_hash, created_at desc);

drop trigger if exists host_notification_preferences_updated_at
  on public.host_notification_preferences;
create trigger host_notification_preferences_updated_at
  before update on public.host_notification_preferences
  for each row execute function public.set_updated_at();

alter table public.host_notification_preferences enable row level security;
alter table public.notification_jobs enable row level security;
alter table public.notification_deliveries enable row level security;
alter table public.public_endpoint_hits enable row level security;

drop policy if exists "Owners manage notification preferences"
  on public.host_notification_preferences;
create policy "Owners manage notification preferences"
  on public.host_notification_preferences for all
  using (auth.uid() = host_id)
  with check (auth.uid() = host_id);

revoke all on public.host_notification_preferences from anon;
grant select, insert, update on public.host_notification_preferences to authenticated;

revoke all on public.notification_jobs from anon, authenticated;
revoke all on public.notification_deliveries from anon, authenticated;
revoke all on public.public_endpoint_hits from anon, authenticated;

grant all on public.notification_jobs to service_role;
grant all on public.notification_deliveries to service_role;
grant all on public.public_endpoint_hits to service_role;
grant all on public.host_notification_preferences to service_role;

-- Keep the inquiry after it is accepted and remember the reservation it created.
create or replace function public.accept_booking_request(p_request_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.booking_requests%rowtype;
  v_price numeric;
  v_source text;
  v_reservation_id uuid;
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

  v_price := coalesce(
    public.calculate_property_stay_total(
      v_request.property_id,
      v_request.check_in,
      v_request.check_out
    ),
    0
  );

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
    price
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

-- Decline keeps the row so the guest management link can explain the outcome.
create or replace function public.reject_booking_request(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_updated_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  update public.booking_requests br
  set status = 'rejected'
  where br.id = p_request_id
    and br.host_id = auth.uid()
    and br.status = 'pending'
  returning br.id into v_updated_id;

  if v_updated_id is null then
    raise exception 'Request not found or already processed';
  end if;
end;
$$;

create or replace function public.guest_cancel_booking_request(p_token_hash text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v public.booking_requests%rowtype;
  v_today date := (timezone('utc', now()))::date;
begin
  if p_token_hash is null or p_token_hash !~ '^[0-9a-f]{64}$' then
    return jsonb_build_object('outcome', 'invalid');
  end if;

  select *
  into v
  from public.booking_requests
  where manage_token_hash = p_token_hash
  for update;

  if not found then
    return jsonb_build_object('outcome', 'invalid');
  end if;

  if v.manage_token_expires_at is null or v.manage_token_expires_at <= now() then
    return jsonb_build_object('outcome', 'expired');
  end if;

  if v.status = 'cancelled' then
    return jsonb_build_object(
      'outcome', 'already_cancelled',
      'cancelled_at', v.cancelled_at,
      'cancelled_by', v.cancelled_by
    );
  end if;

  if v.status = 'rejected' then
    return jsonb_build_object('outcome', 'declined');
  end if;

  if v.status not in ('pending', 'accepted', 'contacted') then
    return jsonb_build_object('outcome', 'not_cancellable');
  end if;

  if v.check_out <= v_today then
    return jsonb_build_object('outcome', 'not_cancellable');
  end if;

  if v.status = 'accepted' and v.reservation_id is not null then
    delete from public.reservations r
    where r.id = v.reservation_id
      and r.property_id = v.property_id;
  end if;

  update public.booking_requests
  set status = 'cancelled',
      cancelled_at = now(),
      cancelled_by = 'guest',
      reservation_id = null
  where id = v.id;

  insert into public.notification_jobs (booking_request_id, event_key)
  values (v.id, 'cancelled_by_guest')
  on conflict (booking_request_id, event_key) do nothing;

  return jsonb_build_object(
    'outcome', 'cancelled',
    'booking_request_id', v.id,
    'cancelled_at', now(),
    'cancelled_by', 'guest'
  );
end;
$$;

create or replace function public.owner_cancel_reservation(p_reservation_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_res public.reservations%rowtype;
  v_owner uuid;
  v_request public.booking_requests%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select *
  into v_res
  from public.reservations
  where id = p_reservation_id
  for update;

  if not found then
    return jsonb_build_object('outcome', 'not_found');
  end if;

  select p.user_id
  into v_owner
  from public.properties p
  where p.id = v_res.property_id;

  if v_owner is distinct from auth.uid() then
    raise exception 'Not authorized';
  end if;

  select *
  into v_request
  from public.booking_requests
  where reservation_id = p_reservation_id
  for update;

  if v_request.id is not null then
    if v_request.status = 'cancelled' then
      delete from public.reservations
      where id = p_reservation_id
        and property_id = v_request.property_id;

      return jsonb_build_object(
        'outcome', 'already_cancelled',
        'booking_request_id', v_request.id,
        'cancelled_at', v_request.cancelled_at
      );
    end if;

    update public.booking_requests
    set status = 'cancelled',
        cancelled_at = now(),
        cancelled_by = 'owner',
        reservation_id = null
    where id = v_request.id;

    delete from public.reservations
    where id = p_reservation_id
      and property_id = v_request.property_id;

    insert into public.notification_jobs (booking_request_id, event_key)
    values (v_request.id, 'cancelled_by_owner')
    on conflict (booking_request_id, event_key) do nothing;

    return jsonb_build_object(
      'outcome', 'cancelled',
      'booking_request_id', v_request.id,
      'cancelled_at', now(),
      'cancelled_by', 'owner'
    );
  end if;

  if v_res.is_manual is not true then
    raise exception 'Only manual reservations can be cancelled here';
  end if;

  delete from public.reservations
  where id = p_reservation_id;

  return jsonb_build_object('outcome', 'deleted');
end;
$$;

create or replace function public.consume_public_rate_limit(
  p_action text,
  p_ip_hash text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  if p_action is null or p_ip_hash is null or p_limit is null or p_limit < 1 then
    return false;
  end if;

  if p_window_seconds is null or p_window_seconds < 1 then
    return false;
  end if;

  select count(*)
  into v_count
  from public.public_endpoint_hits
  where action = p_action
    and ip_hash = p_ip_hash
    and created_at > now() - make_interval(secs => p_window_seconds);

  if v_count >= p_limit then
    return false;
  end if;

  insert into public.public_endpoint_hits (action, ip_hash)
  values (p_action, p_ip_hash);

  return true;
end;
$$;

revoke all on function public.guest_cancel_booking_request(text) from public;
revoke all on function public.guest_cancel_booking_request(text) from anon;
revoke all on function public.guest_cancel_booking_request(text) from authenticated;
grant execute on function public.guest_cancel_booking_request(text) to service_role;

revoke all on function public.owner_cancel_reservation(uuid) from public;
revoke all on function public.owner_cancel_reservation(uuid) from anon;
grant execute on function public.owner_cancel_reservation(uuid) to authenticated;

revoke all on function public.consume_public_rate_limit(text, text, integer, integer) from public;
revoke all on function public.consume_public_rate_limit(text, text, integer, integer) from anon;
revoke all on function public.consume_public_rate_limit(text, text, integer, integer) from authenticated;
grant execute on function public.consume_public_rate_limit(text, text, integer, integer) to service_role;

notify pgrst, 'reload schema';
