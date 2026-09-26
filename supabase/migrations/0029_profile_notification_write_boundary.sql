-- Pre-launch integrity boundary for student-writable profile and notification data.
-- Direct Data API writes are restricted to the columns the product intentionally exposes.
-- Onboarding workflow fields are completed only through a narrow, validated RPC.

revoke insert, update on table public.profiles from authenticated;

grant insert (
  id,
  first_name,
  last_name,
  birth_date,
  nationality,
  current_city,
  phone,
  last_diploma,
  bac_track,
  bac_year,
  general_average,
  institution,
  current_university_studies,
  current_field,
  university_semesters,
  german_level,
  english_level,
  french_level,
  language_certificate,
  language_certificate_other,
  target_degree,
  target_field,
  study_language,
  target_intake,
  preferred_cities,
  budget_range
) on table public.profiles to authenticated;

grant update (
  first_name,
  last_name,
  birth_date,
  nationality,
  current_city,
  phone,
  last_diploma,
  bac_track,
  bac_year,
  general_average,
  institution,
  current_university_studies,
  current_field,
  university_semesters,
  german_level,
  english_level,
  french_level,
  language_certificate,
  language_certificate_other,
  target_degree,
  target_field,
  study_language,
  target_intake,
  preferred_cities,
  budget_range
) on table public.profiles to authenticated;

revoke update on table public.notifications from authenticated;
grant update (read_at) on table public.notifications to authenticated;

create or replace function private.sync_profile_full_name()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  derived_name text;
begin
  if new.first_name is not null or new.last_name is not null then
    derived_name := nullif(
      btrim(
        concat_ws(
          ' ',
          nullif(btrim(new.first_name), ''),
          nullif(btrim(new.last_name), '')
        )
      ),
      ''
    );
    new.full_name := derived_name;
  end if;
  return new;
end;
$$;

revoke execute on function private.sync_profile_full_name()
  from public, anon, authenticated;

drop trigger if exists profiles_sync_full_name on public.profiles;
create trigger profiles_sync_full_name
before insert or update of first_name, last_name
on public.profiles
for each row execute function private.sync_profile_full_name();

create or replace function private.complete_student_onboarding()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := auth.uid();
  updated_id uuid;
begin
  if caller is null then
    raise exception 'authentication_required';
  end if;

  if not exists (
    select 1
    from public.consents consent
    where consent.user_id = caller
      and consent.consent_type = 'profile_processing'
      and consent.policy_version = 'v1'
      and consent.revoked_at is null
  ) then
    raise exception 'active_profile_processing_consent_required';
  end if;

  update public.profiles profile
  set onboarding_completed = true,
      onboarding_completed_at = coalesce(profile.onboarding_completed_at, now())
  where profile.id = caller
    and nullif(btrim(profile.first_name), '') is not null
    and nullif(btrim(profile.last_name), '') is not null
    and nullif(btrim(profile.nationality), '') is not null
    and nullif(btrim(profile.target_degree), '') is not null
    and nullif(btrim(profile.target_field), '') is not null
    and nullif(btrim(profile.study_language), '') is not null
    and nullif(btrim(profile.target_intake), '') is not null
  returning profile.id into updated_id;

  if updated_id is null then
    raise exception 'onboarding_required_fields_missing';
  end if;
end;
$$;

revoke execute on function private.complete_student_onboarding()
  from public, anon;
grant execute on function private.complete_student_onboarding()
  to authenticated;

create or replace function public.complete_student_onboarding()
returns void
language sql
security invoker
set search_path = private
as $$
  select private.complete_student_onboarding();
$$;

revoke execute on function public.complete_student_onboarding()
  from public, anon;
grant execute on function public.complete_student_onboarding()
  to authenticated;
