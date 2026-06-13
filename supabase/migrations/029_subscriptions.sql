-- Stripe subscription billing for Hostvia Pro
-- Uses host_profiles (1:1 with auth.users) — public.users may not exist in all environments.

alter table public.host_profiles
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists subscription_status text not null default 'free'
    check (subscription_status in ('free', 'active', 'canceled', 'past_due')),
  add column if not exists subscription_current_period_end timestamptz;

create index if not exists host_profiles_stripe_customer_id_idx
  on public.host_profiles (stripe_customer_id)
  where stripe_customer_id is not null;

create index if not exists host_profiles_stripe_subscription_id_idx
  on public.host_profiles (stripe_subscription_id)
  where stripe_subscription_id is not null;
