-- Orientation university registry + reusable university media.
-- One canonical university row owns many verified or research programme rows.
-- Research-discovered universities stay inactive, private and unverified until reviewed.

alter table public.universities
  add column if not exists canonical_key text,
  add column if not exists aliases text[] not null default '{}',
  add column if not exists registry_status text not null default 'verified_catalogue'
    check (registry_status in ('verified_catalogue', 'research_candidate')),
  add column if not exists cover_image_url text
    check (cover_image_url is null or cover_image_url ~* '^https://[^[:space:]]+$'),
  add column if not exists cover_image_source_url text
    check (cover_image_source_url is null or cover_image_source_url ~* '^https://[^[:space:]]+$'),
  add column if not exists cover_image_attribution text
    check (cover_image_attribution is null or char_length(cover_image_attribution) <= 500),
  add column if not exists cover_image_license text
    check (cover_image_license is null or char_length(cover_image_license) <= 160),
  add column if not exists media_verified_at timestamptz;

update public.universities
set
  canonical_key = case
    when coalesce(website_url, source_url) ~* '^https?://'
      then 'host:' || lower(
        regexp_replace(
          split_part(split_part(coalesce(website_url, source_url), '://', 2), '/', 1),
          '^www\.',
          ''
        )
      )
    else 'name:'
      || lower(regexp_replace(btrim(name), '[[:space:]]+', ' ', 'g'))
      || '|city:'
      || lower(regexp_replace(btrim(coalesce(city, '')), '[[:space:]]+', ' ', 'g'))
  end,
  aliases = case
    when cardinality(aliases) = 0 then array[name]
    else aliases
  end
where canonical_key is null;

alter table public.universities
  drop constraint if exists universities_canonical_key_unique;
alter table public.universities
  add constraint universities_canonical_key_unique unique (canonical_key);

alter table public.orientation_research_programs
  add column if not exists university_id uuid
    references public.universities(id) on delete set null;

create index if not exists orientation_research_programs_university_idx
  on public.orientation_research_programs (university_id)
  where university_id is not null;

with research_keys as (
  select
    rp.id,
    case
      when rp.official_university_url ~* '^https?://'
        then 'host:' || lower(
          regexp_replace(
            split_part(split_part(rp.official_university_url, '://', 2), '/', 1),
            '^www\.',
            ''
          )
        )
      else 'name:'
        || lower(regexp_replace(btrim(rp.institution), '[[:space:]]+', ' ', 'g'))
        || '|city:'
        || lower(regexp_replace(btrim(coalesce(rp.city, '')), '[[:space:]]+', ' ', 'g'))
    end as canonical_key
  from public.orientation_research_programs rp
)
update public.orientation_research_programs rp
set university_id = u.id
from research_keys rk
join public.universities u on u.canonical_key = rk.canonical_key
where rp.id = rk.id
  and rp.university_id is null;

with research_keys as (
  select
    rp.id,
    rp.institution,
    rp.city,
    rp.official_university_url,
    case
      when rp.official_university_url ~* '^https?://'
        then 'host:' || lower(
          regexp_replace(
            split_part(split_part(rp.official_university_url, '://', 2), '/', 1),
            '^www\.',
            ''
          )
        )
      else 'name:'
        || lower(regexp_replace(btrim(rp.institution), '[[:space:]]+', ' ', 'g'))
        || '|city:'
        || lower(regexp_replace(btrim(coalesce(rp.city, '')), '[[:space:]]+', ' ', 'g'))
    end as canonical_key
  from public.orientation_research_programs rp
  where rp.university_id is null
),
grouped as (
  select
    canonical_key,
    min(institution) as name,
    min(city) as city,
    max(official_university_url) as official_university_url,
    array_agg(distinct institution order by institution) as aliases
  from research_keys
  group by canonical_key
)
insert into public.universities (
  name,
  aliases,
  city,
  country,
  website_url,
  source_url,
  canonical_key,
  registry_status,
  is_active,
  is_public,
  verified_at
)
select
  g.name,
  g.aliases,
  g.city,
  'DE',
  g.official_university_url,
  g.official_university_url,
  g.canonical_key,
  'research_candidate',
  false,
  false,
  null
from grouped g
on conflict (canonical_key) do update
set
  aliases = (
    select array_agg(distinct merged_alias.alias order by merged_alias.alias)
    from unnest(public.universities.aliases || excluded.aliases) as merged_alias(alias)
  ),
  city = coalesce(public.universities.city, excluded.city),
  website_url = coalesce(public.universities.website_url, excluded.website_url),
  source_url = coalesce(public.universities.source_url, excluded.source_url),
  updated_at = now();

with research_keys as (
  select
    rp.id,
    case
      when rp.official_university_url ~* '^https?://'
        then 'host:' || lower(
          regexp_replace(
            split_part(split_part(rp.official_university_url, '://', 2), '/', 1),
            '^www\.',
            ''
          )
        )
      else 'name:'
        || lower(regexp_replace(btrim(rp.institution), '[[:space:]]+', ' ', 'g'))
        || '|city:'
        || lower(regexp_replace(btrim(coalesce(rp.city, '')), '[[:space:]]+', ' ', 'g'))
    end as canonical_key
  from public.orientation_research_programs rp
)
update public.orientation_research_programs rp
set university_id = u.id
from research_keys rk
join public.universities u on u.canonical_key = rk.canonical_key
where rp.id = rk.id
  and rp.university_id is null;

-- Existing view column order is preserved; new media fields are appended.
create or replace view public.orientation_program_catalog
with (security_barrier = true)
as
select
  p.id,
  p.name,
  p.degree_level,
  p.field,
  p.teaching_language,
  p.german_level_required,
  p.english_level_required,
  p.studienkolleg_required,
  p.uni_assist_required,
  p.intake_terms,
  p.winter_deadline,
  p.summer_deadline,
  p.application_url,
  p.source_url as programme_source_url,
  p.verified_at as programme_verified_at,
  u.id as university_id,
  u.name as university_name,
  u.city as university_city,
  u.bundesland as university_bundesland,
  u.university_type,
  u.is_public as university_is_public,
  u.website_url as university_website_url,
  u.source_url as university_source_url,
  u.verified_at as university_verified_at,
  case
    when lower(p.degree_level) = 'master'
      and jsonb_typeof(p.requirements -> 'academic_prerequisites') = 'object'
    then p.requirements -> 'academic_prerequisites'
    else '{}'::jsonb
  end as master_academic_prerequisites,
  u.cover_image_url as university_cover_image_url,
  u.cover_image_source_url as university_cover_image_source_url,
  u.cover_image_attribution as university_cover_image_attribution,
  u.cover_image_license as university_cover_image_license
from public.programs p
join public.universities u on u.id = p.university_id
where p.is_active
  and u.is_active
  and u.registry_status = 'verified_catalogue'
  and p.verified_at is not null
  and p.verified_at <= now()
  and p.source_url ~* '^https?://[^[:space:]]+$'
  and p.application_url ~* '^https?://[^[:space:]]+$'
  and u.verified_at is not null
  and u.verified_at <= now()
  and coalesce(u.source_url, u.website_url) ~* '^https?://[^[:space:]]+$';

revoke all on table public.orientation_program_catalog from public;
grant select on table public.orientation_program_catalog to anon, authenticated;

comment on column public.universities.canonical_key is
  'Stable university identity: official host when known, otherwise normalized university name + city.';
comment on column public.universities.aliases is
  'Observed institution-name aliases collapsed into this canonical university record.';
comment on column public.universities.cover_image_url is
  'Cached reusable university image URL; license/source metadata is stored alongside it.';
comment on table public.orientation_research_programs is
  'Server-only reusable programme discovery knowledge. Programme rows now reference one canonical university registry row.';
comment on view public.orientation_program_catalog is
  'Public, read-only, verified academic catalogue projection for Orientation V4. Includes safe cached university media and bounded Master prerequisites; excludes research-only and student data.';
