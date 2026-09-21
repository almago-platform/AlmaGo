-- SECURITY DEFINER functions are not public RPC endpoints by default.
-- Trigger functions stay callable by their triggers; direct clients get no EXECUTE grant.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.ensure_student_checklist_items(uuid) from public, anon, authenticated;
revoke execute on function public.sync_profile_checklist() from public, anon, authenticated;
revoke execute on function public.sync_document_checklist() from public, anon, authenticated;

-- These functions only need the caller's own RLS privileges.
alter function public.can_delete_own_document_object(text) security invoker;
alter function public.admin_review_document(uuid, public.document_status, text) security invoker;

revoke execute on function public.can_delete_own_document_object(text) from public, anon;
grant execute on function public.can_delete_own_document_object(text) to authenticated;

revoke execute on function public.admin_review_document(uuid, public.document_status, text) from public, anon;
grant execute on function public.admin_review_document(uuid, public.document_status, text) to authenticated;

-- is_admin() is evaluated inside RLS policies. It is intentionally available
-- only to signed-in users and only reveals the caller's own role.
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;
