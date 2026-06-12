-- Team access: owners create sub-users with scoped dashboard permissions.

create table if not exists public.team_access_users (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references auth.users (id) on delete cascade,
  auth_user_id uuid not null references auth.users (id) on delete cascade,
  username text not null,
  login_email text not null,
  display_name text,
  permissions text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint team_access_users_username_unique unique (username),
  constraint team_access_users_auth_user_unique unique (auth_user_id),
  constraint team_access_users_login_email_unique unique (login_email)
);

create index if not exists team_access_users_host_id_idx
  on public.team_access_users (host_id);

create index if not exists team_access_users_auth_user_id_idx
  on public.team_access_users (auth_user_id);

alter table public.team_access_users enable row level security;

create policy "Owners manage team access users"
  on public.team_access_users for all
  using (auth.uid() = host_id)
  with check (auth.uid() = host_id);

create policy "Team members read own access row"
  on public.team_access_users for select
  using (auth.uid() = auth_user_id);

-- RLS helpers for host data shared with team members (read-only).

create or replace function public.team_member_host_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select host_id
  from public.team_access_users
  where auth_user_id = auth.uid()
  limit 1;
$$;

create or replace function public.is_host_owner_or_team_member(target_host_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() = target_host_id
    or exists (
      select 1
      from public.team_access_users t
      where t.auth_user_id = auth.uid()
        and t.host_id = target_host_id
    );
$$;

grant execute on function public.team_member_host_id() to authenticated;
grant execute on function public.is_host_owner_or_team_member(uuid) to authenticated;

-- Properties: team members can read host properties.
create policy "Team members read host properties"
  on public.properties for select
  using (public.is_host_owner_or_team_member(user_id));

-- Reservations: team members can read host reservations.
create policy "Team members read host reservations"
  on public.reservations for select
  using (
    exists (
      select 1
      from public.properties p
      where p.id = property_id
        and public.is_host_owner_or_team_member(p.user_id)
    )
  );

-- Calendar feeds: read for operational views.
create policy "Team members read host calendar feeds"
  on public.calendar_feeds for select
  using (
    exists (
      select 1
      from public.properties p
      where p.id = property_id
        and public.is_host_owner_or_team_member(p.user_id)
    )
  );

-- Booking requests: read for inquiries view.
create policy "Team members read host booking requests"
  on public.booking_requests for select
  using (public.is_host_owner_or_team_member(host_id));

-- Host profile: read for context.
create policy "Team members read host profile"
  on public.host_profiles for select
  using (public.is_host_owner_or_team_member(id));
