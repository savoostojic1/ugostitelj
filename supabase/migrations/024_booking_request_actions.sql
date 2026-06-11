-- Accept / reject booking inquiries from the dashboard

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

  delete from public.booking_requests
  where id = p_request_id;

  return v_reservation_id;
end;
$$;

create or replace function public.reject_booking_request(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deleted_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  delete from public.booking_requests br
  where br.id = p_request_id
    and br.host_id = auth.uid()
    and br.status = 'pending'
  returning br.id into v_deleted_id;

  if v_deleted_id is null then
    raise exception 'Request not found or already processed';
  end if;
end;
$$;

grant execute on function public.accept_booking_request(uuid) to authenticated;
grant execute on function public.reject_booking_request(uuid) to authenticated;

notify pgrst, 'reload schema';
