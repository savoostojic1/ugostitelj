-- Ukloni description ako je ostala iz starije verzije šeme
alter table public.properties drop column if exists description;
