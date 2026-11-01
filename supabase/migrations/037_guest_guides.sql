-- Hostvia Guest Guide: anonymous drafts + owned published guides

create table if not exists public.guest_guide_drafts (
  id uuid primary key default gen_random_uuid(),
  draft_token text not null,
  content jsonb not null default '{}'::jsonb,
  theme text not null default 'signature-beige',
  section_order text[] not null default array[
    'welcome','checkin','wifi','property','rules','checkout','local','emergency','contact'
  ],
  section_visibility jsonb not null default '{}'::jsonb,
  claimed_by uuid references auth.users (id) on delete set null,
  claimed_at timestamptz,
  expires_at timestamptz not null default (now() + interval '30 days'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint guest_guide_drafts_theme_check check (
    theme in ('signature-beige', 'mediterranean-escape', 'midnight-luxury')
  )
);

create unique index if not exists guest_guide_drafts_token_idx
  on public.guest_guide_drafts (draft_token);

create index if not exists guest_guide_drafts_expires_idx
  on public.guest_guide_drafts (expires_at);

create table if not exists public.guest_guides (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  property_id uuid references public.properties (id) on delete set null,
  draft_id uuid references public.guest_guide_drafts (id) on delete set null,
  slug text not null,
  title text not null,
  theme text not null default 'signature-beige',
  content jsonb not null default '{}'::jsonb,
  section_order text[] not null default array[
    'welcome','checkin','wifi','property','rules','checkout','local','emergency','contact'
  ],
  section_visibility jsonb not null default '{}'::jsonb,
  cover_image_url text,
  status text not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint guest_guides_theme_check check (
    theme in ('signature-beige', 'mediterranean-escape', 'midnight-luxury')
  ),
  constraint guest_guides_status_check check (
    status in ('draft', 'published', 'unpublished')
  ),
  constraint guest_guides_slug_format check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    and char_length(slug) between 2 and 80
  )
);

create unique index if not exists guest_guides_slug_unique_idx
  on public.guest_guides (lower(slug));

create index if not exists guest_guides_user_id_idx
  on public.guest_guides (user_id);

create index if not exists guest_guides_status_idx
  on public.guest_guides (status);

create trigger guest_guide_drafts_updated_at
  before update on public.guest_guide_drafts
  for each row execute function public.set_updated_at();

create trigger guest_guides_updated_at
  before update on public.guest_guides
  for each row execute function public.set_updated_at();

alter table public.guest_guide_drafts enable row level security;
alter table public.guest_guides enable row level security;

-- Drafts are accessed only via service-role API (token cookie). No direct client RLS.
-- Owners manage their published guides.

create policy "Owners select own guest guides"
  on public.guest_guides for select
  using (auth.uid() = user_id);

create policy "Owners insert own guest guides"
  on public.guest_guides for insert
  with check (auth.uid() = user_id);

create policy "Owners update own guest guides"
  on public.guest_guides for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Owners delete own guest guides"
  on public.guest_guides for delete
  using (auth.uid() = user_id);

-- Public read of published guides only (anon + authenticated)
create policy "Public read published guest guides"
  on public.guest_guides for select
  to anon, authenticated
  using (status = 'published');

-- Storage paths for guest guide images live under host-assets:
--   {userId}/guest-guides/{guideId}/...
--   drafts/{draftToken}/...  (service-role uploads only)
-- Existing host-assets policies already cover authenticated user folders.
-- Draft uploads go through API with service role and never rely on anon storage writes.

create or replace function public.get_public_guest_guide(p_slug text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  result json;
begin
  select json_build_object(
    'id', g.id,
    'slug', g.slug,
    'title', g.title,
    'theme', g.theme,
    'content', g.content,
    'section_order', g.section_order,
    'section_visibility', g.section_visibility,
    'cover_image_url', g.cover_image_url,
    'published_at', g.published_at,
    'updated_at', g.updated_at
  )
  into result
  from public.guest_guides g
  where lower(g.slug) = lower(p_slug)
    and g.status = 'published';

  return result;
end;
$$;

grant execute on function public.get_public_guest_guide(text) to anon, authenticated;
