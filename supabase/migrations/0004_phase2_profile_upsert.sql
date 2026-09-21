-- Allow an authenticated student to create the own profile if an older account
-- predates the auth trigger. RLS still restricts the id to auth.uid().
grant insert on table public.profiles to authenticated;
drop policy if exists "profiles own insert" on public.profiles;
create policy "profiles own insert" on public.profiles
  for insert to authenticated
  with check (id = auth.uid());
