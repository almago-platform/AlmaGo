-- Phase 4: table privileges required for the existing RLS policies.
-- RLS remains the authorization boundary; these grants only make the
-- policy-protected operations reachable by authenticated clients.
grant select, insert, update on table public.universities to authenticated;
grant select, insert, update on table public.programs to authenticated;
grant select, insert, update on table public.program_recommendations to authenticated;
grant select, insert, update on table public.applications to authenticated;
grant select, insert on table public.application_events to authenticated;
