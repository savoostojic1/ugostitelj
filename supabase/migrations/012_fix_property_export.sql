-- Fix iCal export: jedan RPC, kompatibilan sa platform_type i calendar_platform

alter table public.reservations
  add column if not exists is_manual boolean not null default false;

alter table public.reservations
  add column if not exists source text;

create or replace function public.get_property_export_calendar(token uuid)
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select jsonb_build_object(
    'property_id', p.id,
    'property_name', p.name,
    'reservations', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', r.id,
            'external_uid', r.external_uid,
            'title', r.title,
            'check_in', r.check_in,
            'check_out', r.check_out,
            'platform', r.platform::text,
            'is_manual', coalesce(r.is_manual, false),
            'source', r.source
          )
          order by r.check_in asc
        )
        from public.reservations r
        where r.property_id = p.id
          and r.check_out >= current_date
      ),
      '[]'::jsonb
    )
  )
  from public.properties p
  where p.export_token = token
  limit 1;
$$;

grant execute on function public.get_property_export_calendar(uuid) to anon, authenticated;

-- Popravi stari RPC ako postoji (platform kao text, kolone iz 010)
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

notify pgrst, 'reload schema';
