-- Creem subscription billing for Hostvia Pro.
-- Stripe columns and stripe_config stay in place.
-- Plan columns and property-limit policies are unchanged.

alter table public.host_profiles
  add column if not exists creem_customer_id text,
  add column if not exists creem_subscription_id text,
  add column if not exists creem_subscription_updated_at timestamptz;

create unique index if not exists host_profiles_creem_customer_id_idx
  on public.host_profiles (creem_customer_id)
  where creem_customer_id is not null;

create unique index if not exists host_profiles_creem_subscription_id_idx
  on public.host_profiles (creem_subscription_id)
  where creem_subscription_id is not null;

create table if not exists public.creem_webhook_events (
  id text primary key,
  event_type text not null,
  host_id uuid,
  subscription_id text,
  action text not null,
  received_at timestamptz not null default now()
);

alter table public.creem_webhook_events enable row level security;

-- No policies: only service_role can read or write processed event ids.

create or replace function public.apply_creem_billing_event(
  p_event_id text,
  p_event_type text,
  p_host_id uuid,
  p_customer_id text,
  p_subscription_id text,
  p_subscription_updated_at timestamptz,
  p_subscription_status text,
  p_period_end timestamptz,
  p_cancel_at_period_end boolean,
  p_apply boolean
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_count integer := 0;
  host public.host_profiles%rowtype;
  apply_update boolean := coalesce(p_apply, false);
  action_name text := 'skipped';
begin
  if p_event_id is null or length(trim(p_event_id)) = 0 then
    raise exception 'event id is required';
  end if;

  if p_subscription_status is not null
     and p_subscription_status not in ('free', 'active', 'canceled', 'past_due') then
    raise exception 'invalid subscription status';
  end if;

  if p_host_id is not null then
    select * into host
    from public.host_profiles
    where id = p_host_id
    for update;

    if not found then
      apply_update := false;
    elsif apply_update and p_subscription_status is not null then
      if host.creem_subscription_updated_at is not null
         and (
           p_subscription_updated_at is null
           or p_subscription_updated_at < host.creem_subscription_updated_at
         ) then
        apply_update := false;
        action_name := 'stale';
      end if;
    else
      apply_update := false;
    end if;
  else
    apply_update := false;
  end if;

  insert into public.creem_webhook_events (
    id,
    event_type,
    host_id,
    subscription_id,
    action
  )
  values (
    p_event_id,
    p_event_type,
    p_host_id,
    p_subscription_id,
    case when apply_update then 'applied' else action_name end
  )
  on conflict (id) do nothing;

  get diagnostics inserted_count = row_count;

  if inserted_count = 0 then
    return jsonb_build_object('applied', false, 'reason', 'duplicate');
  end if;

  if apply_update then
    update public.host_profiles
    set
      creem_customer_id = coalesce(p_customer_id, creem_customer_id),
      creem_subscription_id = coalesce(p_subscription_id, creem_subscription_id),
      creem_subscription_updated_at = coalesce(
        p_subscription_updated_at,
        creem_subscription_updated_at
      ),
      subscription_status = p_subscription_status,
      subscription_current_period_end = coalesce(
        p_period_end,
        subscription_current_period_end
      ),
      subscription_cancel_at_period_end = coalesce(p_cancel_at_period_end, false)
    where id = p_host_id;

    return jsonb_build_object('applied', true, 'reason', 'applied');
  end if;

  return jsonb_build_object('applied', false, 'reason', action_name);
end;
$$;

revoke all on function public.apply_creem_billing_event(
  text, text, uuid, text, text, timestamptz, text, timestamptz, boolean, boolean
) from public, anon, authenticated;

grant execute on function public.apply_creem_billing_event(
  text, text, uuid, text, text, timestamptz, text, timestamptz, boolean, boolean
) to service_role;

-- Authenticated clients can update their own host_profiles row.
-- Billing columns stay server-managed so a browser cannot grant Pro.
create or replace function public.protect_host_billing_columns()
returns trigger
language plpgsql
set search_path = public, auth
as $$
declare
  jwt_role text;
begin
  jwt_role := auth.role();

  if jwt_role = 'service_role' or jwt_role is null then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.subscription_status := 'free';
    new.subscription_current_period_end := null;
    new.subscription_cancel_at_period_end := false;
    new.stripe_customer_id := null;
    new.stripe_subscription_id := null;
    new.creem_customer_id := null;
    new.creem_subscription_id := null;
    new.creem_subscription_updated_at := null;
    new.pro_access_granted := false;
    new.pro_access_granted_at := null;
    new.pro_access_granted_note := null;
    return new;
  end if;

  if new.subscription_status is distinct from old.subscription_status
     or new.subscription_current_period_end is distinct from old.subscription_current_period_end
     or new.subscription_cancel_at_period_end is distinct from old.subscription_cancel_at_period_end
     or new.stripe_customer_id is distinct from old.stripe_customer_id
     or new.stripe_subscription_id is distinct from old.stripe_subscription_id
     or new.creem_customer_id is distinct from old.creem_customer_id
     or new.creem_subscription_id is distinct from old.creem_subscription_id
     or new.creem_subscription_updated_at is distinct from old.creem_subscription_updated_at
     or new.pro_access_granted is distinct from old.pro_access_granted
     or new.pro_access_granted_at is distinct from old.pro_access_granted_at
     or new.pro_access_granted_note is distinct from old.pro_access_granted_note
  then
    raise exception 'billing columns are managed by the server';
  end if;

  return new;
end;
$$;

drop trigger if exists host_profiles_protect_billing_columns on public.host_profiles;

create trigger host_profiles_protect_billing_columns
  before insert or update on public.host_profiles
  for each row execute function public.protect_host_billing_columns();
