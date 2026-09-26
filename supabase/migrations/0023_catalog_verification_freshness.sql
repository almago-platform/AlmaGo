-- Automatic freshness expiry for Germany catalogue records.
-- A catalogue verification is considered current for 30 days.
-- After that window, active records remain stored for admin review but disappear from student reads.

drop policy if exists "language courses publishable read" on public.language_courses;
create policy "language courses publishable read"
  on public.language_courses
  for select
  to authenticated
  using (
    public.is_admin()
    or (
      is_active
      and verified_at is not null
      and verified_at <= now()
      and verified_at > now() - interval '30 days'
      and source_url is not null
      and source_url ~* '^https?://'
      and (application_url is null or application_url ~* '^https?://')
    )
  );

drop policy if exists "finance insurance published or admin read" on public.finance_insurance_catalog;
create policy "finance insurance published or admin read"
  on public.finance_insurance_catalog
  for select to authenticated
  using (
    public.is_admin()
    or (
      is_active = true
      and verified_at is not null
      and verified_at <= now()
      and verified_at > now() - interval '30 days'
      and official_source_url ~* '^https?://[^[:space:]]+$'
      and (
        application_url is null
        or application_url ~* '^https?://[^[:space:]]+$'
      )
    )
  );

create index if not exists language_courses_verification_freshness_idx
  on public.language_courses (verified_at)
  where is_active and verified_at is not null;

create index if not exists finance_insurance_verification_freshness_idx
  on public.finance_insurance_catalog (verified_at)
  where is_active and verified_at is not null;
