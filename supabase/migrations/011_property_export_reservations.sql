-- Rezervacije za javni iCal export (security definer, po export_token)

create or replace function public.get_property_export_reservations(token uuid)
returns table (
  id uuid,
  external_uid text,
  title text,
  check_in date,
  check_out date,
  platform text,
  is_manual boolean,
  source text
)
language sql
security definer
set search_path = public
stable
as $$
  select
    r.id,
    r.external_uid,
    r.title,
    r.check_in,
    r.check_out,
    r.platform::text,
    coalesce(r.is_manual, false) as is_manual,
    r.source
  from public.reservations r
  inner join public.properties p on p.id = r.property_id
  where p.export_token = token
    and r.check_out >= current_date
  order by r.check_in asc;
$$;

grant execute on function public.get_property_export_reservations(uuid) to anon, authenticated;
