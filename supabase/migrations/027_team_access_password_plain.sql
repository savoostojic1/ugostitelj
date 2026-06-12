-- Store password for owner visibility (shared with staff on creation).

alter table public.team_access_users
  add column if not exists password_plain text;
