-- Javni iCal export po nekretnini (za Airbnb/Booking import link)
alter table public.properties
  add column if not exists export_token uuid not null default gen_random_uuid();

create unique index if not exists properties_export_token_idx
  on public.properties (export_token);

create or replace function public.get_property_export_by_token(token uuid)
returns table (property_id uuid, property_name text)
language sql
security definer
set search_path = public
stable
as $$
  select p.id, p.name
  from public.properties p
  where p.export_token = token
  limit 1;
$$;

grant execute on function public.get_property_export_by_token(uuid) to anon, authenticated;
