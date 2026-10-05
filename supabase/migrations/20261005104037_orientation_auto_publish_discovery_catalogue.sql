-- Publish reusable Orientation discoveries into the student-facing programme catalogue.
-- Discovery provenance remains explicit: these rows are usable catalogue data, not
-- manually verified admission facts.

alter table public.universities
  drop constraint if exists universities_registry_status_check;

alter table public.universities
  add constraint universities_registry_status_check
  check (registry_status in (
    'verified_catalogue',
    'discovered_catalogue',
    'research_candidate'
  ));

create or replace function public.publish_orientation_research_catalogue()
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  rp record;
  v_university_id uuid;
  v_program_id uuid;
  v_source_url text;
  v_degree_level text;
  v_field text;
  v_identity_url text;
  v_host text;
  v_parts text[];
  v_canonical_key text;
  v_name_key text;
  v_catalogue_before boolean;
  v_considered integer := 0;
  v_created integer := 0;
  v_reused integer := 0;
  v_universities_published integer := 0;
begin
  for rp in
    select
      r.*,
      (
        select dr.search_context ->> 'targetDegree'
        from public.orientation_discovery_run_candidates rc
        join public.orientation_discovery_runs dr on dr.id = rc.run_id
        where rc.research_program_id = r.id
        order by dr.created_at desc
        limit 1
      ) as run_target_degree
    from public.orientation_research_programs r
    where r.research_status in ('research_candidate', 'needs_review', 'promoted')
      and r.rejection_reason is null
    order by r.first_seen_at, r.id
  loop
    v_considered := v_considered + 1;

    v_source_url := coalesce(
      rp.official_programme_url,
      rp.source_urls[1],
      rp.official_university_url
    );

    v_degree_level := case
      when lower(coalesce(rp.degree, '')) like '%state examination%'
        or lower(coalesce(rp.degree, '')) like '%staatsexamen%'
        then 'State Examination'
      when lower(coalesce(rp.degree, '')) like '%not bachelor%'
        then coalesce(nullif(btrim(rp.degree), ''), 'Other')
      when lower(coalesce(rp.degree, '')) ~ '(bachelor|b[.]?[[:space:]]*(sc|eng|a|ed)[.]?)'
        then 'Bachelor'
      when lower(coalesce(rp.degree, '')) ~ '(master|m[.]?[[:space:]]*(sc|eng|a|ed)[.]?)'
        then 'Master'
      when lower(coalesce(rp.programme, '')) like '%bachelor%'
        then 'Bachelor'
      when lower(coalesce(rp.programme, '')) like '%master%'
        then 'Master'
      when lower(coalesce(rp.run_target_degree, '')) like '%bachelor%'
        then 'Bachelor'
      when lower(coalesce(rp.run_target_degree, '')) like '%master%'
        then 'Master'
      else coalesce(nullif(btrim(rp.degree), ''), 'Other')
    end;

    v_field := case
      when 'computer_engineering' = any(rp.family_ids) then 'Computer Engineering'
      when 'computer_science' = any(rp.family_ids) then 'Computer Science'
      when 'electrical_electronics' = any(rp.family_ids) then 'Electrical Engineering'
      when 'architecture' = any(rp.family_ids) then 'Architecture'
      when 'automotive_engineering' = any(rp.family_ids) then 'Automotive Engineering'
      when 'mechanical_automotive' = any(rp.family_ids) then 'Mechanical Engineering'
      when 'mechatronics_automotive' = any(rp.family_ids) then 'Mechatronics'
      when 'civil_engineering' = any(rp.family_ids) then 'Civil Engineering'
      when 'business_economics' = any(rp.family_ids) then 'Business / Economics'
      when 'biology_life_sciences' = any(rp.family_ids) then 'Biology / Life Sciences'
      when 'natural_sciences' = any(rp.family_ids) then 'Natural Sciences'
      when 'medicine_health' = any(rp.family_ids) then 'Medicine / Health'
      when 'mechanical_engineering' = any(rp.family_ids) then 'Mechanical Engineering'
      when 'mechatronics_robotics' = any(rp.family_ids) then 'Mechatronics / Robotics'
      when 'industrial_production' = any(rp.family_ids) then 'Industrial / Production Engineering'
      when 'aerospace_engineering' = any(rp.family_ids) then 'Aerospace Engineering'
      when 'energy_engineering' = any(rp.family_ids) then 'Energy Engineering'
      when 'chemistry' = any(rp.family_ids) then 'Chemistry'
      when 'physics' = any(rp.family_ids) then 'Physics'
      when 'mathematics' = any(rp.family_ids) then 'Mathematics'
      when 'earth_environment' = any(rp.family_ids) then 'Earth / Environmental Sciences'
      when 'languages_humanities' = any(rp.family_ids) then 'Languages / Humanities'
      else null
    end;

    v_university_id := rp.university_id;
    v_identity_url := rp.official_programme_url;

    if v_identity_url is null and v_university_id is not null then
      select coalesce(u.website_url, u.source_url)
      into v_identity_url
      from public.universities u
      where u.id = v_university_id;
    end if;

    v_canonical_key := null;
    if v_identity_url is not null then
      v_host := lower(
        regexp_replace(
          split_part(split_part(v_identity_url, '://', 2), '/', 1),
          '^www[.]',
          ''
        )
      );

      if v_host like '%.de' then
        v_parts := string_to_array(v_host, '.');
        if coalesce(array_length(v_parts, 1), 0) > 2 then
          v_host :=
            v_parts[array_length(v_parts, 1) - 1]
            || '.'
            || v_parts[array_length(v_parts, 1)];
        end if;
      end if;

      if nullif(v_host, '') is not null then
        v_canonical_key := 'host:' || v_host;

        select u.id
        into v_university_id
        from public.universities u
        where u.canonical_key = v_canonical_key
        limit 1;
      end if;
    end if;

    if v_university_id is null then
      select u.id
      into v_university_id
      from public.universities u
      where (
        lower(btrim(u.name)) = lower(btrim(rp.institution))
        or exists (
          select 1
          from unnest(u.aliases) alias_name
          where lower(btrim(alias_name)) = lower(btrim(rp.institution))
        )
      )
      and (
        rp.city is null
        or u.city is null
        or lower(btrim(u.city)) = lower(btrim(rp.city))
      )
      order by
        case u.registry_status
          when 'verified_catalogue' then 0
          when 'discovered_catalogue' then 1
          else 2
        end,
        u.created_at
      limit 1;
    end if;

    if v_university_id is null then
      v_name_key := 'name:'
        || lower(regexp_replace(btrim(rp.institution), '[[:space:]]+', ' ', 'g'))
        || '|city:'
        || lower(regexp_replace(btrim(coalesce(rp.city, '')), '[[:space:]]+', ' ', 'g'));

      v_canonical_key := coalesce(v_canonical_key, v_name_key);

      insert into public.universities (
        name,
        aliases,
        city,
        country,
        website_url,
        source_url,
        verified_at,
        is_active,
        is_public,
        canonical_key,
        registry_status
      )
      values (
        rp.institution,
        array[rp.institution],
        rp.city,
        'DE',
        case when v_canonical_key like 'host:%' then rp.official_university_url else null end,
        case when v_canonical_key like 'host:%' then coalesce(rp.official_university_url, v_source_url) else null end,
        null,
        true,
        false,
        v_canonical_key,
        'discovered_catalogue'
      )
      on conflict (canonical_key) do update
      set
        aliases = (
          select array_agg(distinct alias_value order by alias_value)
          from unnest(public.universities.aliases || excluded.aliases) alias_value
        ),
        city = coalesce(public.universities.city, excluded.city),
        website_url = coalesce(public.universities.website_url, excluded.website_url),
        source_url = coalesce(public.universities.source_url, excluded.source_url),
        registry_status = case
          when public.universities.registry_status = 'verified_catalogue'
            then 'verified_catalogue'
          else 'discovered_catalogue'
        end,
        is_active = true,
        updated_at = now()
      returning id into v_university_id;
    end if;

    select
      u.registry_status in ('verified_catalogue', 'discovered_catalogue')
      and u.is_active
    into v_catalogue_before
    from public.universities u
    where u.id = v_university_id;

    update public.universities
    set
      aliases = (
        select array_agg(distinct alias_value order by alias_value)
        from unnest(aliases || array[rp.institution]) alias_value
      ),
      city = coalesce(city, rp.city),
      registry_status = case
        when registry_status = 'verified_catalogue' then 'verified_catalogue'
        else 'discovered_catalogue'
      end,
      is_active = true,
      updated_at = now()
    where id = v_university_id;

    if not coalesce(v_catalogue_before, false) then
      v_universities_published := v_universities_published + 1;
    end if;

    if rp.university_id is distinct from v_university_id then
      update public.orientation_research_programs
      set university_id = v_university_id,
          updated_at = now()
      where id = rp.id;
    end if;

    v_program_id := rp.promoted_program_id;

    if v_program_id is null then
      select p.id
      into v_program_id
      from public.programs p
      where p.university_id = v_university_id
        and (
          (v_source_url is not null and p.source_url = v_source_url)
          or (
            lower(regexp_replace(btrim(p.name), '[[:space:]]+', ' ', 'g'))
              = lower(regexp_replace(btrim(rp.programme), '[[:space:]]+', ' ', 'g'))
            and lower(btrim(p.degree_level)) = lower(btrim(v_degree_level))
          )
        )
      order by
        (p.verified_at is not null) desc,
        p.is_active desc,
        p.created_at
      limit 1;
    end if;

    if v_program_id is null then
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
        is_active
      )
      values (
        v_university_id,
        rp.programme,
        v_degree_level,
        v_field,
        rp.teaching_language,
        null,
        jsonb_build_object(
          'catalogue_provenance', 'openai_discovery',
          'research_program_id', rp.id,
          'raw_degree', rp.degree,
          'family_ids', to_jsonb(rp.family_ids),
          'source_urls', to_jsonb(rp.source_urls),
          'verification_status', rp.verification_status,
          'first_seen_at', rp.first_seen_at,
          'last_seen_at', rp.last_seen_at
        ),
        v_source_url,
        null,
        true
      )
      returning id into v_program_id;

      v_created := v_created + 1;
    else
      update public.programs
      set
        is_active = true,
        field = coalesce(field, v_field),
        teaching_language = coalesce(teaching_language, rp.teaching_language),
        source_url = coalesce(source_url, v_source_url),
        requirements = case
          when verified_at is not null then requirements
          else coalesce(requirements, '{}'::jsonb) || jsonb_build_object(
            'catalogue_provenance', 'openai_discovery',
            'research_program_id', rp.id,
            'raw_degree', rp.degree,
            'family_ids', to_jsonb(rp.family_ids),
            'source_urls', to_jsonb(rp.source_urls),
            'verification_status', rp.verification_status,
            'first_seen_at', rp.first_seen_at,
            'last_seen_at', rp.last_seen_at
          )
        end,
        updated_at = now()
      where id = v_program_id;

      v_reused := v_reused + 1;
    end if;

    update public.orientation_research_programs
    set
      university_id = v_university_id,
      research_status = 'promoted',
      promoted_program_id = v_program_id,
      updated_at = now()
    where id = rp.id;
  end loop;

  return jsonb_build_object(
    'research_rows_considered', v_considered,
    'programmes_created', v_created,
    'programmes_reused', v_reused,
    'universities_published', v_universities_published
  );
end;
$$;

revoke all on function public.publish_orientation_research_catalogue()
  from public, anon, authenticated;
grant execute on function public.publish_orientation_research_catalogue()
  to service_role;

create or replace view public.orientation_program_catalog
with (security_barrier = true, security_invoker = true)
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
  and u.registry_status in ('verified_catalogue', 'discovered_catalogue')
  and (
    (p.verified_at is not null and p.verified_at <= now())
    or p.requirements ->> 'catalogue_provenance' = 'openai_discovery'
  )
  and (p.source_url is null or p.source_url ~* '^https?://[^[:space:]]+$')
  and (p.application_url is null or p.application_url ~* '^https?://[^[:space:]]+$')
  and (
    u.registry_status = 'discovered_catalogue'
    or (u.verified_at is not null and u.verified_at <= now())
  )
  and (
    coalesce(u.source_url, u.website_url) is null
    or coalesce(u.source_url, u.website_url) ~* '^https?://[^[:space:]]+$'
  );

revoke all on table public.orientation_program_catalog from public;
grant select on table public.orientation_program_catalog to anon, authenticated;

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
    and u.registry_status in ('verified_catalogue', 'discovered_catalogue')
    and (
      (p.verified_at is not null and p.verified_at <= now())
      or p.requirements ->> 'catalogue_provenance' = 'openai_discovery'
    )
    and (p.source_url is null or p.source_url ~* '^https?://[^[:space:]]+$')
    and (p.application_url is null or p.application_url ~* '^https?://[^[:space:]]+$')
    and (
      u.registry_status = 'discovered_catalogue'
      or (u.verified_at is not null and u.verified_at <= now())
    )
    and (
      coalesce(u.source_url, u.website_url) is null
      or coalesce(u.source_url, u.website_url) ~* '^https?://[^[:space:]]+$'
    )
  order by p.name;
$$;

revoke all on function public.read_orientation_program_catalog()
  from public, anon, authenticated;
grant execute on function public.read_orientation_program_catalog()
  to anon, authenticated;

comment on function public.publish_orientation_research_catalogue() is
  'Promotes reusable Orientation discovery rows into the published programme catalogue without claiming manual verification. Service-role only.';
comment on view public.orientation_program_catalog is
  'Public read-only Orientation catalogue. Includes manually verified programmes and automatically published OpenAI discoveries; verified_at remains null for discovery-only rows.';

select public.publish_orientation_research_catalogue();
