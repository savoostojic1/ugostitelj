-- Ručne rezervacije: izvor, cijena, flag

alter table public.reservations
  add column if not exists is_manual boolean not null default false;

alter table public.reservations
  add column if not exists source text;

alter table public.reservations
  add column if not exists price numeric(10, 2);

create index if not exists reservations_is_manual_idx
  on public.reservations (is_manual)
  where is_manual = true;
