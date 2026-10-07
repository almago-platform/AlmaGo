-- rls_auto_enable is an event-trigger implementation detail, never an RPC endpoint.
-- Some early environments created it outside the versioned migrations. A clean
-- database must still be able to replay this migration set from scratch.
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end
$$;
