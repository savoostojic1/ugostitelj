-- Novi korisnici ne dobijaju automatske podatke.
-- Properties su vezane direktno za auth.users; profil u public.users je opcionalan.

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Properties → auth.users (bez obaveznog reda u public.users)
alter table public.properties drop constraint if exists properties_user_id_fkey;
alter table public.properties
  add constraint properties_user_id_fkey
  foreign key (user_id) references auth.users (id) on delete cascade;

-- Opcioni profil: korisnik ga kreira sam ako zatreba
drop policy if exists "Users can insert own profile" on public.users;
create policy "Users can insert own profile"
  on public.users for insert with check (auth.uid() = id);
