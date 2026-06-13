-- Stripe keys stored in Supabase (no Vercel env vars needed).
-- Configure from /admin after running this migration.

create table if not exists public.stripe_config (
  id int primary key default 1 check (id = 1),
  secret_key text,
  webhook_secret text,
  price_id text,
  updated_at timestamptz not null default now()
);

alter table public.stripe_config enable row level security;

-- No policies: only service_role (server API) can read/write.
