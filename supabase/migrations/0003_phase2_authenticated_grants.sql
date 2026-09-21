-- Phase 2 fix: table privileges are required in addition to RLS.
-- RLS remains enabled and is still the ownership boundary.
grant select, update on table public.profiles to authenticated;
grant select on table public.user_roles to authenticated;
grant select, insert, update on table public.consents to authenticated;
