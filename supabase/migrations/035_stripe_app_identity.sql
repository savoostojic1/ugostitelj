-- Stripe app identity: isolate Hostvia webhooks from other apps on the same Stripe account.

alter table public.stripe_config
  add column if not exists application_id text not null default 'hostvia',
  add column if not exists test_host_ids text[] not null default '{}';
