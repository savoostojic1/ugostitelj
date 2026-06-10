-- Javna stranica: svi detalji smještaja na jednoj host stranici

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
    ) t
  );
end;
$$;
