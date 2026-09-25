-- PROPOSAL ONLY — DO NOT APPLY AUTOMATICALLY.
-- Issue #185: narrow notification writes at the PostgreSQL privilege boundary.
--
-- Existing RLS remains unchanged:
--   - SELECT: owner or Admin
--   - UPDATE: owner
--   - INSERT: Admin
--
-- Student product behavior only needs UPDATE(read_at).
-- Admin SECURITY INVOKER functions insert user_id/type/title/body/metadata.

revoke update on table public.notifications from authenticated;
revoke insert on table public.notifications from authenticated;

grant update (read_at)
  on table public.notifications
  to authenticated;

grant insert (user_id, type, title, body, metadata)
  on table public.notifications
  to authenticated;

-- This proposal intentionally does NOT change public.profiles.
-- Profile workflow fields require an architecture decision because the current
-- server routes and direct Data API calls both execute as authenticated.
