-- Keep orientation_program_catalog subject to the caller's privileges and the
-- RLS policies of its underlying tables. Postgres views otherwise execute with
-- owner privileges by default.
alter view public.orientation_program_catalog
  set (security_invoker = true);
