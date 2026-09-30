-- P2.8B follow-up: make the commercial-offer RLS correlation explicit.
-- 0040 was already applied in the connected Supabase environment before the
-- GitHub PR merged. Keep this additive repair so already-migrated environments
-- converge without rewriting migration history.

drop policy if exists "qualified prospect published offers read"
  on public.commercial_offers;

create policy "qualified prospect published offers read"
  on public.commercial_offers
  for select
  to authenticated
  using (
    (
      exists (
        select 1
        from public.customer_access ca
        where ca.user_id = (select auth.uid())
          and ca.status in (
            'qualified_prospect'::public.customer_lifecycle_status,
            'payment_pending'::public.customer_lifecycle_status,
            'paid_pending_validation'::public.customer_lifecycle_status
          )
      )
      and exists (
        select 1
        from public.commercial_offer_versions v
        where v.offer_id = public.commercial_offers.id
          and v.status = 'published'::public.commercial_offer_version_status
      )
    )
    or (select public.is_admin())
  );
