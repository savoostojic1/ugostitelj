-- Track scheduled cancel-at-period-end separately from immediate Stripe cancellation.

alter table public.host_profiles
  add column if not exists subscription_cancel_at_period_end boolean not null default false;
