-- PROPOSAL ONLY — DO NOT APPLY AUTOMATICALLY.
-- Issue #183: restrict authenticated catalogue reads to student-facing records.
--
-- Existing admin FOR ALL policies remain unchanged and continue to allow full
-- catalogue access to Admin users.

drop policy if exists "catalog authenticated read" on public.universities;
create policy "catalog student active read" on public.universities
  for select to authenticated
  using (is_active or public.is_admin());

drop policy if exists "programs authenticated read" on public.programs;
create policy "programs student publishable read" on public.programs
  for select to authenticated
  using (
    public.is_admin()
    or (
      is_active
      and verified_at is not null
      and (
        nullif(trim(source_url), '') ~* '^https?://'
        or nullif(trim(application_url), '') ~* '^https?://'
      )
      and exists (
        select 1
        from public.universities university
        where university.id = programs.university_id
          and university.is_active
      )
    )
  );

-- No table grants, rows, verification timestamps or catalogue records are changed.
