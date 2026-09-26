-- Enforce one application per student/program/intake even when intake is NULL.
-- PostgreSQL 17 supports UNIQUE NULLS NOT DISTINCT.

do $$
begin
  if exists (
    select 1
    from public.applications
    group by student_id, program_id, intake
    having count(*) > 1
  ) then
    raise exception 'applications_duplicate_student_program_intake';
  end if;
end $$;

alter table public.applications
  drop constraint if exists applications_student_id_program_id_intake_key;

alter table public.applications
  add constraint applications_student_id_program_id_intake_key
  unique nulls not distinct (student_id, program_id, intake);
