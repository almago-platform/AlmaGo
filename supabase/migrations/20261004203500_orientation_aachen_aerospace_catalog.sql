-- Add the verified Aerospace Bachelor offered in Aachen so Aerospace + Aachen
-- has a real exact-city catalogue match.
-- Official sources checked 2026-10-04:
-- https://www.fh-aachen.de/studium/studiengaenge/luft-und-raumfahrttechnik-beng
-- https://www.fh-aachen.de/studium/studiengaenge/luft-und-raumfahrttechnik-beng/bewerbung-und-zulassung
-- https://www.fh-aachen.de/en/studies/applying/international-applicants/applicants-with-foreign-proofs-of-education

do $$
declare
  fh_aachen_id uuid;
begin
  select id into fh_aachen_id
  from public.universities
  where canonical_key = 'host:fh-aachen.de'
     or (
       lower(name) = 'fh aachen'
       and lower(coalesce(city, '')) = 'aachen'
     )
  order by (canonical_key = 'host:fh-aachen.de') desc
  limit 1;

  if fh_aachen_id is null then
    raise exception 'Verified FH Aachen university identity is missing';
  end if;

  update public.universities
  set
    name = 'FH Aachen',
    city = 'Aachen',
    country = 'DE',
    website_url = 'https://www.fh-aachen.de/',
    source_url = 'https://www.fh-aachen.de/',
    verified_at = greatest(
      coalesce(verified_at, timestamptz '2026-10-04T00:00:00Z'),
      timestamptz '2026-10-04T00:00:00Z'
    ),
    bundesland = 'Nordrhein-Westfalen',
    university_type = 'FH',
    is_public = true,
    is_active = true,
    canonical_key = 'host:fh-aachen.de',
    registry_status = 'verified_catalogue',
    aliases = (
      select array_agg(distinct alias order by alias)
      from unnest(
        coalesce(aliases, '{}'::text[])
        || array['FH Aachen', 'FH Aachen – University of Applied Sciences']
      ) as merged(alias)
    ),
    updated_at = now()
  where id = fh_aachen_id;

  if not exists (
    select 1
    from public.programs
    where university_id = fh_aachen_id
      and lower(degree_level) = 'bachelor'
      and (
        lower(name) in (
          'luft- und raumfahrttechnik',
          'aerospace engineering'
        )
        or source_url in (
          'https://www.fh-aachen.de/studium/studiengaenge/luft-und-raumfahrttechnik-beng',
          'https://www.fh-aachen.de/en/studies/degree-programmes/aerospace-engineering-beng'
        )
      )
  ) then
    insert into public.programs (
      university_id,
      name,
      degree_level,
      field,
      teaching_language,
      application_url,
      requirements,
      source_url,
      verified_at,
      is_active,
      intake_terms,
      duration,
      english_level_required,
      uni_assist_required
    )
    values (
      fh_aachen_id,
      'Luft- und Raumfahrttechnik',
      'Bachelor',
      'Aerospace Engineering',
      'German',
      'https://www.fh-aachen.de/studium/studiengaenge/luft-und-raumfahrttechnik-beng/bewerbung-und-zulassung',
      jsonb_build_object(
        'source_checked_on', '2026-10-04',
        'degree', 'B.Eng.',
        'credit_points', 210,
        'admission_restriction', 'none',
        'english_requirement', 'B2',
        'foreign_hzb_application', 'uni-assist'
      ),
      'https://www.fh-aachen.de/studium/studiengaenge/luft-und-raumfahrttechnik-beng',
      timestamptz '2026-10-04T00:00:00Z',
      true,
      array['Winter'],
      '7 semesters',
      'B2',
      true
    );
  else
    update public.programs
    set
      name = 'Luft- und Raumfahrttechnik',
      degree_level = 'Bachelor',
      field = 'Aerospace Engineering',
      teaching_language = 'German',
      application_url = 'https://www.fh-aachen.de/studium/studiengaenge/luft-und-raumfahrttechnik-beng/bewerbung-und-zulassung',
      requirements = coalesce(requirements, '{}'::jsonb)
        || jsonb_build_object(
          'source_checked_on', '2026-10-04',
          'degree', 'B.Eng.',
          'credit_points', 210,
          'admission_restriction', 'none',
          'english_requirement', 'B2',
          'foreign_hzb_application', 'uni-assist'
        ),
      source_url = 'https://www.fh-aachen.de/studium/studiengaenge/luft-und-raumfahrttechnik-beng',
      verified_at = timestamptz '2026-10-04T00:00:00Z',
      is_active = true,
      intake_terms = array['Winter'],
      duration = '7 semesters',
      english_level_required = 'B2',
      uni_assist_required = true,
      updated_at = now()
    where university_id = fh_aachen_id
      and lower(degree_level) = 'bachelor'
      and (
        lower(name) in (
          'luft- und raumfahrttechnik',
          'aerospace engineering'
        )
        or source_url in (
          'https://www.fh-aachen.de/studium/studiengaenge/luft-und-raumfahrttechnik-beng',
          'https://www.fh-aachen.de/en/studies/degree-programmes/aerospace-engineering-beng'
        )
      );
  end if;
end
$$;
