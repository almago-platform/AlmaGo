-- Campus Allemagne P8: source freshness revalidation on the existing regulatory source registry.

create or replace function public.admin_refresh_regulatory_source_freshness(
  p_now timestamptz default now()
)
returns integer
language plpgsql
security invoker
set search_path = public
as $$
declare
  changed_count integer := 0;
begin
  if not public.is_admin() then
    raise exception 'admin_required';
  end if;

  update public.regulatory_sources
  set
    verification_status = 'needs_reverification',
    updated_at = now()
  where is_active
    and verification_status = 'verified'
    and review_due_at is not null
    and review_due_at <= p_now;

  get diagnostics changed_count = row_count;
  return changed_count;
end;
$$;

revoke all on function public.admin_refresh_regulatory_source_freshness(timestamptz) from public, anon;
grant execute on function public.admin_refresh_regulatory_source_freshness(timestamptz) to authenticated;
