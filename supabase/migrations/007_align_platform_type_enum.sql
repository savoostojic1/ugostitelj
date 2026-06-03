-- Uskladi platform_type sa aplikacijom (airbnb, booking, custom)

do $$
declare
  lbl text;
begin
  foreach lbl in array array['airbnb', 'booking', 'custom']
  loop
    if not exists (
      select 1
      from pg_enum e
      join pg_type t on e.enumtypid = t.oid
      where t.typname = 'platform_type'
        and e.enumlabel = lbl
    ) then
      execute format('alter type public.platform_type add value %L', lbl);
    end if;
  end loop;
end $$;

notify pgrst, 'reload schema';
