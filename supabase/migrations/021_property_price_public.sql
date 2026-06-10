-- Cijena u javnoj pretrazi smještaja

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
        p.starting_price
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
