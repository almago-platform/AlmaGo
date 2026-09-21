-- rls_auto_enable is an event-trigger implementation detail, never an RPC endpoint.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
