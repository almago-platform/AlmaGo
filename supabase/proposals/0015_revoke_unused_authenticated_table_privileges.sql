-- PROPOSAL ONLY — DO NOT APPLY AUTOMATICALLY.
-- Issue #205: remove table privileges not required by AlmaGo application flows.
--
-- This proposal deliberately leaves SELECT/INSERT/UPDATE/DELETE untouched.
-- RLS policies and application CRUD semantics are not modified here.

revoke truncate, references, trigger
  on all tables in schema public
  from authenticated;

-- Before production application:
--   - run authenticated student/admin E2E;
--   - verify SECURITY INVOKER functions still work;
--   - rerun Supabase Security + Performance Advisors;
--   - obtain explicit approval.
