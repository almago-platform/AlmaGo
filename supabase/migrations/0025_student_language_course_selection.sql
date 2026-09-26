-- Persist one current language-course choice per student.
-- The choice is factual user intent, not an admission/suitability/visa decision.

create table if not exists public.student_language_course_selections (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null unique references auth.users(id) on delete cascade,
  language_course_id uuid not null references public.language_courses(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.student_language_course_selections enable row level security;

create or replace function public.enforce_publishable_language_course_selection()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  course_record public.language_courses%rowtype;
begin
  select *
    into course_record
    from public.language_courses
   where id = new.language_course_id
   for share;

  if not found then
    raise exception 'language_course_not_found';
  end if;

  if not (
    course_record.is_active
    and course_record.verified_at is not null
    and course_record.verified_at <= now()
    and course_record.verified_at > now() - interval '30 days'
    and course_record.source_url is not null
    and course_record.source_url ~* '^https?://[^[:space:]]+$'
    and (
      course_record.application_url is null
      or course_record.application_url ~* '^https?://[^[:space:]]+$'
    )
  ) then
    raise exception 'language_course_not_publishable';
  end if;

  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists enforce_publishable_language_course_selection
  on public.student_language_course_selections;
create trigger enforce_publishable_language_course_selection
before insert or update of language_course_id
on public.student_language_course_selections
for each row execute function public.enforce_publishable_language_course_selection();

drop policy if exists "language course selection own or admin read"
  on public.student_language_course_selections;
create policy "language course selection own or admin read"
  on public.student_language_course_selections
  for select to authenticated
  using (student_id = auth.uid() or public.is_admin());

drop policy if exists "language course selection own insert"
  on public.student_language_course_selections;
create policy "language course selection own insert"
  on public.student_language_course_selections
  for insert to authenticated
  with check (student_id = auth.uid());

drop policy if exists "language course selection own or admin update"
  on public.student_language_course_selections;
create policy "language course selection own or admin update"
  on public.student_language_course_selections
  for update to authenticated
  using (student_id = auth.uid() or public.is_admin())
  with check (student_id = auth.uid() or public.is_admin());

drop policy if exists "language course selection own or admin delete"
  on public.student_language_course_selections;
create policy "language course selection own or admin delete"
  on public.student_language_course_selections
  for delete to authenticated
  using (student_id = auth.uid() or public.is_admin());

grant select, insert, update, delete
  on public.student_language_course_selections
  to authenticated;
