-- Record the student's filing/residence country separately from nationality and diploma country.
-- This is used only to scope country-specific German mission guidance.

alter table public.student_projects
  add column if not exists filing_country text;

alter table public.student_projects
  drop constraint if exists student_projects_filing_country_format;

alter table public.student_projects
  add constraint student_projects_filing_country_format
  check (filing_country is null or filing_country ~ '^[A-Z]{2}$');
