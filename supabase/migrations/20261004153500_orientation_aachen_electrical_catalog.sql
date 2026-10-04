-- Close the Aachen Electrical Engineering catalogue gap exposed by Orientation V4.
-- Sources mirror the already-reviewed programme references in
-- src/lib/orientation/verified-academic-options.ts (checked 2026-10-02).
-- Unknown values remain NULL/defaulted rather than inferred.

do $$
declare
  rwth_id uuid;
  fh_aachen_id uuid;
begin
  select id into rwth_id
  from public.universities
  where canonical_key = 'host:rwth-aachen.de'
     or name = 'RWTH Aachen University'
  order by (canonical_key = 'host:rwth-aachen.de') desc
  limit 1;

  if rwth_id is null then
    insert into public.universities (
      name,
      aliases,
      city,
      country,
      website_url,
      source_url,
      verified_at,
      bundesland,
      university_type,
      is_public,
      is_active,
      canonical_key,
      registry_status
    )
    values (
      'RWTH Aachen University',
      array['RWTH Aachen University'],
      'Aachen',
      'DE',
      'https://www.rwth-aachen.de/',
      'https://www.rwth-aachen.de/',
      timestamptz '2026-10-02T00:00:00Z',
      'Nordrhein-Westfalen',
      'TU',
      true,
      true,
      'host:rwth-aachen.de',
      'verified_catalogue'
    )
    returning id into rwth_id;
  else
    update public.universities
    set
      name = 'RWTH Aachen University',
      aliases = (
        select array_agg(distinct alias order by alias)
        from unnest(
          coalesce(aliases, '{}'::text[])
          || array['RWTH Aachen University']
        ) as merged(alias)
      ),
      city = 'Aachen',
      country = 'DE',
      website_url = 'https://www.rwth-aachen.de/',
      source_url = 'https://www.rwth-aachen.de/',
      verified_at = greatest(
        coalesce(verified_at, timestamptz '2026-10-02T00:00:00Z'),
        timestamptz '2026-10-02T00:00:00Z'
      ),
      bundesland = 'Nordrhein-Westfalen',
      university_type = 'TU',
      is_public = true,
      is_active = true,
      canonical_key = 'host:rwth-aachen.de',
      registry_status = 'verified_catalogue',
      updated_at = now()
    where id = rwth_id;
  end if;

  select id into fh_aachen_id
  from public.universities
  where canonical_key = 'host:fh-aachen.de'
  limit 1;

  if fh_aachen_id is null then
    insert into public.universities (
      name,
      aliases,
      city,
      country,
      website_url,
      source_url,
      verified_at,
      bundesland,
      university_type,
      is_public,
      is_active,
      canonical_key,
      registry_status
    )
    values (
      'FH Aachen',
      array['FH Aachen', 'FH Aachen – University of Applied Sciences'],
      'Aachen',
      'DE',
      'https://www.fh-aachen.de/',
      'https://www.fh-aachen.de/',
      timestamptz '2026-10-02T00:00:00Z',
      'Nordrhein-Westfalen',
      'FH',
      true,
      true,
      'host:fh-aachen.de',
      'verified_catalogue'
    )
    returning id into fh_aachen_id;
  else
    update public.universities
    set
      name = 'FH Aachen',
      aliases = (
        select array_agg(distinct alias order by alias)
        from unnest(
          coalesce(aliases, '{}'::text[])
          || array['FH Aachen', 'FH Aachen – University of Applied Sciences']
        ) as merged(alias)
      ),
      city = 'Aachen',
      country = 'DE',
      website_url = 'https://www.fh-aachen.de/',
      source_url = 'https://www.fh-aachen.de/',
      verified_at = greatest(
        coalesce(verified_at, timestamptz '2026-10-02T00:00:00Z'),
        timestamptz '2026-10-02T00:00:00Z'
      ),
      bundesland = 'Nordrhein-Westfalen',
      university_type = 'FH',
      is_public = true,
      is_active = true,
      registry_status = 'verified_catalogue',
      updated_at = now()
    where id = fh_aachen_id;
  end if;

  if not exists (
    select 1
    from public.programs
    where university_id = rwth_id
      and lower(degree_level) = 'bachelor'
      and (
        lower(name) = lower('Elektrotechnik und Informationstechnik')
        or source_url = 'https://www.elektrotechnik.rwth-aachen.de/cms/elektrotechnik-und-informationstechnik/studium/beratung-kontakt/bachelor-studium/~bfsmts/alle-infos-rund-um-die-bewerbung/'
      )
  ) then
    insert into public.programs (
      university_id,
      name,
      degree_level,
      field,
      teaching_language,
      application_url,
      source_url,
      verified_at,
      is_active,
      requirements
    )
    values (
      rwth_id,
      'Elektrotechnik und Informationstechnik',
      'Bachelor',
      'Electrical Engineering',
      'German',
      'https://www.elektrotechnik.rwth-aachen.de/cms/elektrotechnik-und-informationstechnik/studium/beratung-kontakt/bachelor-studium/~bfsmts/alle-infos-rund-um-die-bewerbung/',
      'https://www.elektrotechnik.rwth-aachen.de/cms/elektrotechnik-und-informationstechnik/studium/beratung-kontakt/bachelor-studium/~bfsmts/alle-infos-rund-um-die-bewerbung/',
      timestamptz '2026-10-02T00:00:00Z',
      true,
      jsonb_build_object('source_checked_on', '2026-10-02')
    );
  else
    update public.programs
    set
      name = 'Elektrotechnik und Informationstechnik',
      degree_level = 'Bachelor',
      field = 'Electrical Engineering',
      teaching_language = 'German',
      application_url = 'https://www.elektrotechnik.rwth-aachen.de/cms/elektrotechnik-und-informationstechnik/studium/beratung-kontakt/bachelor-studium/~bfsmts/alle-infos-rund-um-die-bewerbung/',
      source_url = 'https://www.elektrotechnik.rwth-aachen.de/cms/elektrotechnik-und-informationstechnik/studium/beratung-kontakt/bachelor-studium/~bfsmts/alle-infos-rund-um-die-bewerbung/',
      verified_at = timestamptz '2026-10-02T00:00:00Z',
      is_active = true,
      requirements = coalesce(requirements, '{}'::jsonb)
        || jsonb_build_object('source_checked_on', '2026-10-02'),
      updated_at = now()
    where university_id = rwth_id
      and lower(degree_level) = 'bachelor'
      and (
        lower(name) = lower('Elektrotechnik und Informationstechnik')
        or source_url = 'https://www.elektrotechnik.rwth-aachen.de/cms/elektrotechnik-und-informationstechnik/studium/beratung-kontakt/bachelor-studium/~bfsmts/alle-infos-rund-um-die-bewerbung/'
      );
  end if;

  if not exists (
    select 1
    from public.programs
    where university_id = fh_aachen_id
      and lower(degree_level) = 'bachelor'
      and (
        lower(name) in ('elektrotechnik', 'electrical engineering')
        or source_url in (
          'https://www.fh-aachen.de/studium/studiengaenge/elektrotechnik-beng',
          'https://www.fh-aachen.de/en/studies/degree-programmes/electrical-engineering-beng'
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
      source_url,
      verified_at,
      is_active,
      requirements
    )
    values (
      fh_aachen_id,
      'Elektrotechnik',
      'Bachelor',
      'Electrical Engineering',
      'German',
      'https://www.fh-aachen.de/studium/studiengaenge/elektrotechnik-beng',
      'https://www.fh-aachen.de/studium/studiengaenge/elektrotechnik-beng',
      timestamptz '2026-10-02T00:00:00Z',
      true,
      jsonb_build_object('source_checked_on', '2026-10-02')
    );
  else
    update public.programs
    set
      name = 'Elektrotechnik',
      degree_level = 'Bachelor',
      field = 'Electrical Engineering',
      teaching_language = 'German',
      application_url = 'https://www.fh-aachen.de/studium/studiengaenge/elektrotechnik-beng',
      source_url = 'https://www.fh-aachen.de/studium/studiengaenge/elektrotechnik-beng',
      verified_at = timestamptz '2026-10-02T00:00:00Z',
      is_active = true,
      requirements = coalesce(requirements, '{}'::jsonb)
        || jsonb_build_object('source_checked_on', '2026-10-02'),
      updated_at = now()
    where university_id = fh_aachen_id
      and lower(degree_level) = 'bachelor'
      and (
        lower(name) in ('elektrotechnik', 'electrical engineering')
        or source_url in (
          'https://www.fh-aachen.de/studium/studiengaenge/elektrotechnik-beng',
          'https://www.fh-aachen.de/en/studies/degree-programmes/electrical-engineering-beng'
        )
      );
  end if;

  -- Re-link the historical FH Aachen discovery aliases to the single verified
  -- university identity. Their old rows remain non-public, so this is safe and
  -- avoids destructive cache cleanup.
  update public.orientation_research_programs
  set university_id = fh_aachen_id,
      updated_at = now()
  where lower(coalesce(institution, '')) in (
      'fh aachen',
      'fh aachen – university of applied sciences'
    )
     or lower(coalesce(official_programme_url, '')) like 'https://www.fh-aachen.de/%';
end
$$;
