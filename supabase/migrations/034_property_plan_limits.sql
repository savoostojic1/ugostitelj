-- Enforce Free plan property limit (2 oldest listings stay active).

create or replace function public.host_has_pro_plan(p_host_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select hp.pro_access_granted
        or hp.subscription_status in ('active', 'past_due')
      from public.host_profiles hp
      where hp.id = p_host_id
    ),
    false
  );
$$;

create or replace function public.property_is_within_plan_limit(p_property_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case
    when p.id is null then false
    when public.host_has_pro_plan(p.user_id) then true
    else (
      select count(*) <= 2
      from public.properties p2
      where p2.user_id = p.user_id
        and (p2.created_at, p2.id) <= (p.created_at, p.id)
    )
  end
  from public.properties p
  where p.id = p_property_id;
$$;

grant execute on function public.host_has_pro_plan(uuid) to authenticated;
grant execute on function public.property_is_within_plan_limit(uuid) to authenticated;

-- Properties: allow read/delete always; limit create/update to plan allowance.
drop policy if exists "Users manage own properties" on public.properties;

create policy "Users select own properties"
  on public.properties for select
  using (auth.uid() = user_id);

create policy "Users insert own properties within plan"
  on public.properties for insert
  with check (
    auth.uid() = user_id
    and (
      public.host_has_pro_plan(auth.uid())
      or (
        select count(*)::int
        from public.properties p
        where p.user_id = auth.uid()
      ) < 2
    )
  );

create policy "Users update own properties within plan"
  on public.properties for update
  using (
    auth.uid() = user_id
    and public.property_is_within_plan_limit(id)
  )
  with check (
    auth.uid() = user_id
    and public.property_is_within_plan_limit(id)
  );

create policy "Users delete own properties"
  on public.properties for delete
  using (auth.uid() = user_id);

-- Calendar feeds
drop policy if exists "Users insert feeds on own properties" on public.calendar_feeds;
drop policy if exists "Users update feeds on own properties" on public.calendar_feeds;
drop policy if exists "Users delete feeds on own properties" on public.calendar_feeds;

create policy "Users insert feeds on own properties"
  on public.calendar_feeds for insert
  with check (
    exists (
      select 1
      from public.properties p
      where p.id = property_id
        and p.user_id = auth.uid()
        and public.property_is_within_plan_limit(p.id)
    )
  );

create policy "Users update feeds on own properties"
  on public.calendar_feeds for update
  using (
    exists (
      select 1
      from public.properties p
      where p.id = property_id
        and p.user_id = auth.uid()
        and public.property_is_within_plan_limit(p.id)
    )
  )
  with check (
    exists (
      select 1
      from public.properties p
      where p.id = property_id
        and p.user_id = auth.uid()
        and public.property_is_within_plan_limit(p.id)
    )
  );

create policy "Users delete feeds on own properties"
  on public.calendar_feeds for delete
  using (
    exists (
      select 1
      from public.properties p
      where p.id = property_id
        and p.user_id = auth.uid()
        and public.property_is_within_plan_limit(p.id)
    )
  );

-- Reservations
drop policy if exists "Users insert reservations on own properties" on public.reservations;
drop policy if exists "Users update reservations on own properties" on public.reservations;
drop policy if exists "Users delete reservations on own properties" on public.reservations;

create policy "Users insert reservations on own properties"
  on public.reservations for insert
  with check (
    exists (
      select 1
      from public.properties p
      where p.id = property_id
        and p.user_id = auth.uid()
        and public.property_is_within_plan_limit(p.id)
    )
  );

create policy "Users update reservations on own properties"
  on public.reservations for update
  using (
    exists (
      select 1
      from public.properties p
      where p.id = property_id
        and p.user_id = auth.uid()
        and public.property_is_within_plan_limit(p.id)
    )
  )
  with check (
    exists (
      select 1
      from public.properties p
      where p.id = property_id
        and p.user_id = auth.uid()
        and public.property_is_within_plan_limit(p.id)
    )
  );

create policy "Users delete reservations on own properties"
  on public.reservations for delete
  using (
    exists (
      select 1
      from public.properties p
      where p.id = property_id
        and p.user_id = auth.uid()
        and public.property_is_within_plan_limit(p.id)
    )
  );

-- Price rules
drop policy if exists "Users insert price rules on own properties" on public.property_price_rules;
drop policy if exists "Users update price rules on own properties" on public.property_price_rules;
drop policy if exists "Users delete price rules on own properties" on public.property_price_rules;

create policy "Users insert price rules on own properties"
  on public.property_price_rules for insert
  with check (
    exists (
      select 1
      from public.properties p
      where p.id = property_id
        and p.user_id = auth.uid()
        and public.property_is_within_plan_limit(p.id)
    )
  );

create policy "Users update price rules on own properties"
  on public.property_price_rules for update
  using (
    exists (
      select 1
      from public.properties p
      where p.id = property_id
        and p.user_id = auth.uid()
        and public.property_is_within_plan_limit(p.id)
    )
  )
  with check (
    exists (
      select 1
      from public.properties p
      where p.id = property_id
        and p.user_id = auth.uid()
        and public.property_is_within_plan_limit(p.id)
    )
  );

create policy "Users delete price rules on own properties"
  on public.property_price_rules for delete
  using (
    exists (
      select 1
      from public.properties p
      where p.id = property_id
        and p.user_id = auth.uid()
        and public.property_is_within_plan_limit(p.id)
    )
  );

-- Public site: only plan-allowed listings are bookable/visible.
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
        p.starting_price
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
  if not public.property_is_within_plan_limit(p_property_id) then
    return null;
  end if;

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
