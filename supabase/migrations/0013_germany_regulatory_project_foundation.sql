-- Germany/Tunisia worksite LOT 0 + LOT 1: dated regulatory truth and student project.
create type public.student_project_path as enum (
  'university_search',
  'german_preparation_and_studies',
  'master_and_language',
  'language_only'
);

create table public.regulatory_sources (
  id uuid primary key default gen_random_uuid(),
  jurisdiction text not null check (jurisdiction in ('DE', 'TN', 'DE-TN')),
  authority text not null,
  title text not null,
  source_url text not null check (source_url ~ '^https://'),
  topic text not null,
  published_on date,
  checked_on date not null,
  effective_from date,
  effective_until date,
  summary text not null,
  requirements jsonb not null default '[]'::jsonb check (jsonb_typeof(requirements) = 'array'),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (effective_until is null or effective_from is null or effective_until >= effective_from)
);

create table public.student_projects (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null unique references auth.users(id) on delete cascade,
  path public.student_project_path not null,
  target_degree text,
  target_field text,
  target_intake text,
  preferred_cities text[] not null default '{}',
  current_german_level text,
  target_german_level text,
  notes text check (char_length(notes) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index regulatory_sources_topic_active_idx
  on public.regulatory_sources(topic, checked_on desc) where is_active;
create index student_projects_student_idx on public.student_projects(student_id);

alter table public.regulatory_sources enable row level security;
alter table public.student_projects enable row level security;

create policy "regulatory sources authenticated read" on public.regulatory_sources
  for select to authenticated using (true);
create policy "regulatory sources admin write" on public.regulatory_sources
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "student projects own or admin read" on public.student_projects
  for select to authenticated using (student_id = auth.uid() or public.is_admin());
create policy "student projects own insert" on public.student_projects
  for insert to authenticated with check (student_id = auth.uid());
create policy "student projects own update" on public.student_projects
  for update to authenticated using (student_id = auth.uid()) with check (student_id = auth.uid());
create policy "student projects admin write" on public.student_projects
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

grant select on table public.regulatory_sources to authenticated;
grant select, insert, update on table public.student_projects to authenticated;

drop trigger if exists regulatory_sources_set_updated_at on public.regulatory_sources;
create trigger regulatory_sources_set_updated_at before update on public.regulatory_sources
  for each row execute procedure public.set_updated_at();
drop trigger if exists student_projects_set_updated_at on public.student_projects;
create trigger student_projects_set_updated_at before update on public.student_projects
  for each row execute procedure public.set_updated_at();

-- Initial official sources are deliberately factual metadata, not copied legal advice.
insert into public.regulatory_sources
  (jurisdiction, authority, title, source_url, topic, checked_on, summary, requirements)
values
  ('DE', 'Auswärtiges Amt', 'Visa for studying', 'https://www.auswaertiges-amt.de/en/visa-service/buergerservice/faq/08-studentenvisum/606690', 'study_visa', '2026-09-24',
   'Official federal entry point for study-visa requirements; details must be rechecked before every filing.',
   '["admission_or_preparatory_course","proof_of_financing","health_insurance"]'::jsonb),
  ('DE-TN', 'Ambassade d’Allemagne à Tunis', 'Visa national pour études', 'https://tunis.diplo.de/tn-fr/service/05-visaeinreise/visa-etudes-1672418', 'study_visa_tunisia', '2026-09-24',
   'Local German mission instructions for applicants filing in Tunisia; the mission checklist prevails at filing time.',
   '["appointment","application_documents","mission_checklist"]'::jsonb),
  ('DE', 'uni-assist e.V.', 'Check: university admission', 'https://www.uni-assist.de/en/how-to-apply/get-information/check-university-admission/', 'university_admission', '2026-09-24',
   'Official uni-assist guidance for checking educational credentials and the application route used by participating universities.',
   '["education_certificates","university_specific_requirements"]'::jsonb);
