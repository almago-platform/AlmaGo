-- Restore the public verified Orientation catalogue after the view was switched
-- to SECURITY INVOKER. The public catalogue client intentionally uses only the
-- publishable anon key, while direct anon access to programs/universities stays closed.
--
-- This bounded SECURITY DEFINER RPC exposes only the same verified public projection
-- as orientation_program_catalog and fixes its search path explicitly.

create or replace function public.read_orientation_program_catalog()
returns table (
  id uuid,
  name text,
  degree_level text,
  field text,
  teaching_language text,
  german_level_required text,
  english_level_required text,
  studienkolleg_required boolean,
  uni_assist_required boolean,
  intake_terms text[],
  winter_deadline date,
  summer_deadline date,
  application_url text,
  programme_source_url text,
  programme_verified_at timestamptz,
  university_id uuid,
  university_name text,
  university_city text,
  university_bundesland text,
  university_type text,
  university_is_public boolean,
  university_website_url text,
  university_source_url text,
  university_verified_at timestamptz,
  master_academic_prerequisites jsonb,
  university_cover_image_url text,
  university_cover_image_source_url text,
  university_cover_image_attribution text,
  university_cover_image_license text
)
language sql
stable
security definer
set search_path = ''
as $$
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
    and coalesce(u.source_url, u.website_url) ~* '^https?://[^[:space:]]+$'
  order by p.name;
$$;

revoke all on function public.read_orientation_program_catalog()
  from public, anon, authenticated;
grant execute on function public.read_orientation_program_catalog()
  to anon, authenticated;

comment on function public.read_orientation_program_catalog() is
  'Bounded public reader for the verified Orientation catalogue. Keeps direct anon SELECT closed on programs and universities.';
