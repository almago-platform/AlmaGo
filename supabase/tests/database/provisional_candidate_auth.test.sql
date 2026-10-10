begin;

create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;
select no_plan();

select ok(
  (select relrowsecurity from pg_class where oid = 'public.provisional_candidate_credentials'::regclass),
  'provisional candidate credentials enforce RLS'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.provisional_candidate_sessions'::regclass),
  'provisional sessions enforce RLS'
);

select ok(
  not has_table_privilege('anon', 'public.provisional_candidate_credentials', 'SELECT'),
  'anonymous callers cannot read provisional password hashes'
);
select ok(
  not has_table_privilege('authenticated', 'public.provisional_candidate_credentials', 'SELECT'),
  'authenticated callers cannot read unverified credentials'
);
select ok(
  not has_table_privilege('anon', 'public.provisional_candidate_sessions', 'SELECT'),
  'anonymous callers cannot read provisional session hashes'
);
select ok(
  not has_table_privilege('authenticated', 'public.provisional_candidate_sessions', 'INSERT'),
  'authenticated callers cannot mint provisional session rows'
);
select ok(
  not has_function_privilege('authenticated', 'public.record_provisional_login_failure(uuid)', 'EXECUTE'),
  'browser sessions cannot call privileged failed-login counter'
);
select ok(
  has_function_privilege('service_role', 'public.record_provisional_login_failure(uuid)', 'EXECUTE'),
  'trusted backend can enforce per-credential lockout'
);
select ok(
  (select count(*) = 0 from pg_policies
   where schemaname='public' and tablename in ('provisional_candidate_credentials','provisional_candidate_sessions')),
  'no permissive provisional row policies were created'
);

select * from finish();
rollback;
