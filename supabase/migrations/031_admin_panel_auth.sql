-- Admin panel login stored in Supabase (no Vercel env vars needed).
-- First visit to /admin lets you choose a password once.

create table if not exists public.admin_panel_auth (
  id int primary key default 1 check (id = 1),
  username text not null default 'admin-savo',
  password_hash text not null,
  session_secret text not null,
  updated_at timestamptz not null default now()
);

alter table public.admin_panel_auth enable row level security;

-- No policies: only service_role (server API) can read/write.
