-- reservations.user_id (denormalizovano) — popuni iz properties

alter table public.reservations add column if not exists user_id uuid
  references auth.users (id) on delete cascade;

update public.reservations r
set user_id = p.user_id
from public.properties p
where r.property_id = p.id
  and r.user_id is null;

-- Trigger: automatski user_id pri insertu ako nije poslat
create or replace function public.set_reservation_user_id()
returns trigger
language plpgsql
as $$
begin
  if new.user_id is null and new.property_id is not null then
    select p.user_id into new.user_id
    from public.properties p
    where p.id = new.property_id;
  end if;
  return new;
end;
$$;

drop trigger if exists reservations_set_user_id on public.reservations;
create trigger reservations_set_user_id
  before insert on public.reservations
  for each row execute function public.set_reservation_user_id();

notify pgrst, 'reload schema';
