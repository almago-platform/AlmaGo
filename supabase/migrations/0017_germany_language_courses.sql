-- LOT 5: verified language-course catalogue foundation.
-- This migration intentionally does not derive visa or regulatory pathway decisions.

create table public.language_courses (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 180),
  provider_name text not null check (char_length(provider_name) between 1 and 180),
  city text check (city is null or char_length(city) between 1 and 180),
  language text not null check (char_length(language) between 1 and 80),
  purpose text not null check (purpose in ('study_preparation', 'standalone_language')),
  level_from text check (level_from is null or level_from in ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  level_to text check (level_to is null or level_to in ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  hours_per_week integer check (hours_per_week is null or hours_per_week between 1 and 168),
  starts_on date,
  ends_on date,
  price_cents integer check (price_cents is null or price_cents between 0 and 100000000),
  currency text check (currency is null or currency ~ '^[A-Z]{3}$'),
  source_url text check (
    source_url is null
    or (char_length(source_url) between 1 and 2048 and source_url ~* '^https?://')
  ),
  application_url text check (
    application_url is null
    or (char_length(application_url) between 1 and 2048 and application_url ~* '^https?://')
  ),
  verified_at timestamptz,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint language_courses_level_order check (
    level_from is null
    or level_to is null
    or array_position(array['A1','A2','B1','B2','C1','C2'], level_from)
      <= array_position(array['A1','A2','B1','B2','C1','C2'], level_to)
  ),
  constraint language_courses_date_order check (
    starts_on is null or ends_on is null or starts_on <= ends_on
  ),
  constraint language_courses_price_currency_pair check (
    price_cents is null or currency is not null
  ),
  constraint language_courses_active_requires_verification check (
    not is_active or (source_url is not null and verified_at is not null)
  )
);

create index language_courses_student_filter_idx
  on public.language_courses (purpose, language, city, level_from, level_to, starts_on)
  where is_active;

alter table public.language_courses enable row level security;

create policy "language courses publishable read"
  on public.language_courses
  for select
  to authenticated
  using (
    public.is_admin()
    or (
      is_active
      and verified_at is not null
      and verified_at <= now()
      and source_url is not null
      and source_url ~* '^https?://'
      and (application_url is null or application_url ~* '^https?://')
    )
  );

create policy "language courses admin insert"
  on public.language_courses
  for insert
  to authenticated
  with check (public.is_admin());

create policy "language courses admin update"
  on public.language_courses
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "language courses admin delete"
  on public.language_courses
  for delete
  to authenticated
  using (public.is_admin());

revoke all on table public.language_courses from public, anon;
grant select, insert, update, delete on table public.language_courses to authenticated;

drop trigger if exists language_courses_set_updated_at on public.language_courses;
create trigger language_courses_set_updated_at
  before update on public.language_courses
  for each row execute procedure public.set_updated_at();
