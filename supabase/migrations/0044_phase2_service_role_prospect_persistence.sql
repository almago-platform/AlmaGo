-- P2.4: allow the privileged backend to persist and clean up prospect orientations.
-- The service-role client is the only server path allowed to perform these writes.
-- Public/anon/authenticated grants and RLS policies are intentionally unchanged.

grant select, insert, update, delete
  on table public.prospects
  to service_role;

grant select, insert, update, delete
  on table public.orientations
  to service_role;
