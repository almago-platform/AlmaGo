-- Phase 2: student onboarding/profile fields.
alter table public.profiles
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists birth_date date,
  add column if not exists nationality text,
  add column if not exists current_city text,
  add column if not exists last_diploma text,
  add column if not exists bac_track text,
  add column if not exists bac_year integer,
  add column if not exists general_average numeric(4,2),
  add column if not exists institution text,
  add column if not exists current_university_studies text,
  add column if not exists current_field text,
  add column if not exists university_semesters integer,
  add column if not exists german_level text,
  add column if not exists english_level text,
  add column if not exists french_level text,
  add column if not exists language_certificate text,
  add column if not exists language_certificate_other text,
  add column if not exists study_language text,
  add column if not exists target_intake text,
  add column if not exists preferred_cities text[] not null default '{}',
  add column if not exists budget_range text,
  add column if not exists onboarding_completed boolean not null default false,
  add column if not exists onboarding_completed_at timestamptz;

alter table public.profiles
  add constraint profiles_general_average_range
    check (general_average is null or (general_average >= 0 and general_average <= 20)),
  add constraint profiles_bac_year_range
    check (bac_year is null or (bac_year between 1900 and 2200)),
  add constraint profiles_university_semesters_range
    check (university_semesters is null or (university_semesters between 0 and 100));

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();
