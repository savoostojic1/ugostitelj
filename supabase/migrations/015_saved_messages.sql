-- Sačuvane poruke za brzo kopiranje (dashboard sync bar)

create table if not exists public.saved_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists saved_messages_user_id_idx
  on public.saved_messages (user_id);

create trigger saved_messages_updated_at
  before update on public.saved_messages
  for each row execute function public.set_updated_at();

alter table public.saved_messages enable row level security;

create policy "Users manage own saved messages"
  on public.saved_messages for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
