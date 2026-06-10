-- Google Maps embed na javnom sajtu

alter table public.host_profiles
  add column if not exists map_embed_url text;

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
    'map_embed_url', hp.map_embed_url,
    'social_links', hp.social_links
  )
  into result
  from public.host_profiles hp
  where lower(hp.username) = lower(p_username)
    and hp.is_published = true;

  return result;
end;
$$;
