-- Vacation rental website builder.
-- Anonymous projects are token-scoped. One permanent website per host account.
-- Public URLs stay on the existing host username. public_site_mode selects
-- the booking site or the published website without deleting either.

alter table public.host_profiles
  add column if not exists public_site_mode text not null default 'booking';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'host_profiles_public_site_mode_check'
  ) then
    alter table public.host_profiles
      add constraint host_profiles_public_site_mode_check
      check (public_site_mode in ('booking', 'website'));
  end if;
end $$;

create table if not exists public.website_projects (
  id uuid primary key default gen_random_uuid(),
  draft_token text not null,
  user_id uuid references auth.users (id) on delete set null,
  website_id uuid,
  document jsonb not null default '{}'::jsonb,
  claimed_by uuid references auth.users (id) on delete set null,
  claimed_at timestamptz,
  expires_at timestamptz not null default (now() + interval '14 days'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists website_projects_token_idx
  on public.website_projects (draft_token);

create index if not exists website_projects_expires_idx
  on public.website_projects (expires_at);

create table if not exists public.websites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid references public.website_projects (id) on delete set null,
  slug text not null,
  status text not null default 'draft',
  theme text not null default 'luxe',
  draft_document jsonb not null default '{}'::jsonb,
  published_document jsonb,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint websites_status_check check (status in ('draft', 'published', 'unpublished')),
  constraint websites_theme_check check (theme in ('luxe', 'coastal', 'nature', 'minimal', 'escape')),
  constraint websites_slug_format check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    and char_length(slug) between 2 and 50
  )
);

create unique index if not exists websites_user_id_idx
  on public.websites (user_id);

create unique index if not exists websites_slug_idx
  on public.websites (lower(slug));

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'website_projects_website_id_fkey'
  ) then
    alter table public.website_projects
      add constraint website_projects_website_id_fkey
      foreign key (website_id) references public.websites (id) on delete set null;
  end if;
end $$;

drop trigger if exists website_projects_updated_at on public.website_projects;
create trigger website_projects_updated_at
  before update on public.website_projects
  for each row execute function public.set_updated_at();

drop trigger if exists websites_updated_at on public.websites;
create trigger websites_updated_at
  before update on public.websites
  for each row execute function public.set_updated_at();

alter table public.website_projects enable row level security;
alter table public.websites enable row level security;

drop policy if exists "Owners select own websites" on public.websites;
create policy "Owners select own websites"
  on public.websites for select
  using (auth.uid() = user_id);

-- No direct client writes. Drafts, claims and publishing go through server routes.

create or replace function public.claim_website_project(
  p_token text,
  p_replace_draft boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_project public.website_projects%rowtype;
  v_existing public.websites%rowtype;
  v_website_id uuid;
  v_slug text;
  v_base text;
  v_candidate text;
  v_n integer := 2;
begin
  if v_user is null then
    return jsonb_build_object('ok', false, 'error', 'unauthorized');
  end if;

  if p_token is null or char_length(p_token) < 32 or char_length(p_token) > 128 then
    return jsonb_build_object('ok', false, 'error', 'invalid_token');
  end if;

  select * into v_project
  from public.website_projects
  where draft_token = p_token
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  if v_project.claimed_by is not null and v_project.claimed_by <> v_user then
    return jsonb_build_object('ok', false, 'error', 'claimed_by_other');
  end if;

  if v_project.claimed_at is not null and v_project.website_id is not null then
    select * into v_existing from public.websites where id = v_project.website_id;
    if found and v_existing.user_id = v_user then
      return jsonb_build_object('ok', true, 'websiteId', v_existing.id, 'created', false);
    end if;
    return jsonb_build_object('ok', false, 'error', 'claimed_by_other');
  end if;

  if v_project.expires_at < now() then
    return jsonb_build_object('ok', false, 'error', 'expired');
  end if;

  select * into v_existing from public.websites where user_id = v_user;
  if found then
    if coalesce(p_replace_draft, false) then
      update public.websites
      set
        draft_document = v_project.document,
        theme = case
          when v_project.document->>'theme' in ('luxe', 'coastal', 'nature', 'minimal', 'escape')
            then v_project.document->>'theme'
          else theme
        end
      where id = v_existing.id;

      update public.website_projects
      set
        claimed_by = v_user,
        claimed_at = now(),
        user_id = v_user,
        website_id = v_existing.id
      where id = v_project.id;

      return jsonb_build_object(
        'ok', true,
        'websiteId', v_existing.id,
        'created', false,
        'replacedDraft', true
      );
    end if;

    return jsonb_build_object(
      'ok', false,
      'error', 'account_has_website',
      'websiteId', v_existing.id
    );
  end if;

  select lower(username) into v_slug
  from public.host_profiles
  where id = v_user;

  if v_slug is null or v_slug = '' then
    v_base := lower(coalesce(v_project.document #>> '{profile,name}', 'stay'));
    v_base := regexp_replace(v_base, '[^a-z0-9]+', '-', 'g');
    v_base := trim(both '-' from v_base);
    if char_length(v_base) < 2 then
      v_base := 'stay';
    end if;
    v_base := left(v_base, 40);
    v_candidate := v_base;
    while exists (
      select 1 from public.websites where lower(slug) = v_candidate
      union all
      select 1 from public.host_profiles where lower(username) = v_candidate
    ) or v_candidate = any (array[
      'www','app','api','admin','dashboard','mail','smtp','staging','dev','test',
      'host','guide','login','register','website','preview','blog','support','help'
    ]) loop
      v_candidate := left(v_base, 36) || '-' || v_n::text;
      v_n := v_n + 1;
      if v_n > 40 then
        v_candidate := left(v_base, 32) || '-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 6);
        exit;
      end if;
    end loop;
    v_slug := v_candidate;
  end if;

  if char_length(v_slug) < 2 then
    v_slug := v_slug || 'stay';
  end if;
  v_slug := left(v_slug, 50);

  insert into public.websites (
    user_id,
    project_id,
    slug,
    status,
    theme,
    draft_document
  )
  values (
    v_user,
    v_project.id,
    v_slug,
    'draft',
    case
      when v_project.document->>'theme' in ('luxe', 'coastal', 'nature', 'minimal', 'escape')
        then v_project.document->>'theme'
      else 'luxe'
    end,
    coalesce(v_project.document, '{}'::jsonb)
  )
  returning id into v_website_id;

  update public.website_projects
  set
    claimed_by = v_user,
    claimed_at = now(),
    user_id = v_user,
    website_id = v_website_id
  where id = v_project.id;

  return jsonb_build_object(
    'ok', true,
    'websiteId', v_website_id,
    'created', true,
    'slug', v_slug
  );
end;
$$;

revoke all on function public.claim_website_project(text, boolean) from public;
revoke all on function public.claim_website_project(text, boolean) from anon;
grant execute on function public.claim_website_project(text, boolean) to authenticated;

create or replace function public.get_public_host_profile(p_username text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  result json;
begin
  select json_build_object(
    'username', hp.username,
    'business_name', coalesce(hp.business_name, hp.username),
    'cover_image_url', hp.cover_image_url,
    'logo_url', hp.logo_url,
    'description', hp.description,
    'footer_description', hp.footer_description,
    'contact_email', hp.contact_email,
    'contact_phone', hp.contact_phone,
    'location', hp.location,
    'map_embed_url', hp.map_embed_url,
    'social_links', hp.social_links,
    'public_site_mode', coalesce(hp.public_site_mode, 'booking')
  )
  into result
  from public.host_profiles hp
  where lower(hp.username) = lower(p_username)
    and hp.is_published = true;

  return result;
end;
$$;

create or replace function public.get_published_website(p_username text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  result json;
begin
  select json_build_object(
    'websiteId', w.id,
    'username', hp.username,
    'status', w.status,
    'theme', w.theme,
    'publishedAt', w.published_at,
    'updatedAt', w.updated_at,
    'document', w.published_document,
    'pro', (
      coalesce(hp.pro_access_granted, false)
      or hp.subscription_status in ('active', 'past_due')
    ),
    'host', json_build_object(
      'businessName', hp.business_name,
      'contactEmail', hp.contact_email,
      'contactPhone', hp.contact_phone,
      'location', hp.location,
      'mapEmbedUrl', hp.map_embed_url,
      'logoUrl', hp.logo_url
    ),
    'properties', coalesce((
      select json_agg(json_build_object(
        'id', p.id,
        'slug', p.slug,
        'name', p.name,
        'shortDescription', p.short_description,
        'description', p.description,
        'address', p.address,
        'imageUrl', p.image_url,
        'galleryUrls', p.gallery_urls,
        'capacity', p.capacity,
        'amenities', p.amenities,
        'startingPrice', p.starting_price,
        'currencyCode', coalesce(nullif(btrim(p.currency_code), ''), 'EUR')
      ) order by p.created_at)
      from public.properties p
      where p.user_id = hp.id
        and p.is_public = true
    ), '[]'::json)
  )
  into result
  from public.websites w
  join public.host_profiles hp on hp.id = w.user_id
  where lower(hp.username) = lower(p_username)
    and w.status = 'published'
    and hp.public_site_mode = 'website'
    and hp.is_published = true
    and w.published_document is not null;

  return result;
end;
$$;

revoke all on function public.get_published_website(text) from public;
grant execute on function public.get_published_website(text) to anon, authenticated;
