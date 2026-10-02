-- Orientation V4 Master compatibility increment.
-- Extends the existing bounded public catalogue projection with only the
-- structured academic prerequisite object used for verified Master matching.
-- Internal catalogue notes and every student/prospect table remain excluded.

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
  case
    when lower(p.degree_level) = 'master'
      and jsonb_typeof(p.requirements -> 'academic_prerequisites') = 'object'
    then p.requirements -> 'academic_prerequisites'
    else '{}'::jsonb
  end as master_academic_prerequisites,
  u.id as university_id,
  u.name as university_name,
  u.city as university_city,
  u.bundesland as university_bundesland,
  u.university_type,
  u.is_public as university_is_public,
  u.website_url as university_website_url,
  u.source_url as university_source_url,
  u.verified_at as university_verified_at
from public.programs p
join public.universities u on u.id = p.university_id
where p.is_active
  and u.is_active
  and p.verified_at is not null
  and p.verified_at <= now()
  and p.source_url ~* '^https?://[^[:space:]]+$'
  and p.application_url ~* '^https?://[^[:space:]]+$'
  and u.verified_at is not null
  and u.verified_at <= now()
  and coalesce(u.source_url, u.website_url) ~* '^https?://[^[:space:]]+$';

revoke all on table public.orientation_program_catalog from public;
grant select on table public.orientation_program_catalog to anon, authenticated;

comment on view public.orientation_program_catalog is
  'Public, read-only, verified academic catalogue projection for Orientation V4. Includes bounded Master academic prerequisites; excludes internal notes and all student data.';
