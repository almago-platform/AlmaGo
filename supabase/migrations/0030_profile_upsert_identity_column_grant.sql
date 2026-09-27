-- Keep the restricted column-level profile write boundary introduced in 0029
-- while allowing Supabase/PostgREST upserts on profiles(id) to execute their
-- generated ON CONFLICT DO UPDATE statement.
--
-- The existing RLS ownership policy still requires id = auth.uid(), so this
-- does not allow an authenticated student to rebind another user's profile.
grant update (id) on table public.profiles to authenticated;
