-- PROPOSAL ONLY — DO NOT APPLY AUTOMATICALLY.
-- Issue #182: make application uniqueness NULL-safe on PostgreSQL 17.
--
-- Preconditions before production application:
--   1. confirm there are no duplicate (student_id, program_id, intake) groups,
--      including intake IS NULL;
--   2. confirm the business rule remains one application per
--      student/program/intake;
--   3. run authenticated E2E and DB advisors after the protected change;
--   4. obtain explicit approval for the production DB migration.

alter table public.applications
  drop constraint if exists applications_student_id_program_id_intake_key;

alter table public.applications
  add constraint applications_student_program_intake_unique
  unique nulls not distinct (student_id, program_id, intake);

-- No rows are deleted, merged or modified by this proposal.
