-- Phase 2 foundation: prospect identity, orientation persistence and commercial access.
-- This migration is intentionally inert for existing Phase 1 users:
-- existing students are backfilled as client_active, while new accounts start as prospect_account.
-- Anonymous/public writes are NOT enabled in P2.0; P2.3 will add a bounded server-side creation flow.

do $$
begin
  create type public.customer_lifecycle_status as enum (
    'prospect_account',
    'qualified_prospect',
    'payment_pending',
    'paid_pending_validation',
    'client_active',
    'client_completed'
  );
exception
  when duplicate_object then null;
end
$$;

create table if not exists public.prospects (
  id uuid primary key default gen_random_uuid(),
  email text not null check (char_length(email) between 3 and 320),
  user_id uuid unique references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists prospects_email_ci_unique
  on public.prospects (lower(email));

create index if not exists prospects_user_idx
  on public.prospects (user_id)
  where user_id is not null;

create table if not exists public.orientations (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.prospects(id) on delete cascade,
  engine_version text not null,
  input jsonb not null default '{}'::jsonb,
  result jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orientations_prospect_idx
  on public.orientations (prospect_id, created_at desc);

create table if not exists public.customer_access (
  user_id uuid primary key references auth.users(id) on delete cascade,
  status public.customer_lifecycle_status not null default 'prospect_account',
  status_changed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.prospects enable row level security;
alter table public.orientations enable row level security;
alter table public.customer_access enable row level security;

-- P2.0 deliberately exposes read-only authenticated access.
-- Anonymous orientation submission will be introduced later through a bounded server flow.
revoke all on table public.prospects from anon;
revoke all on table public.orientations from anon;
revoke all on table public.customer_access from anon;

grant select on table public.prospects to authenticated;
grant select on table public.orientations to authenticated;
grant select on table public.customer_access to authenticated;

revoke insert, update, delete on table public.prospects from authenticated;
revoke insert, update, delete on table public.orientations from authenticated;
revoke insert, update, delete on table public.customer_access from authenticated;

create policy "prospects linked user or admin read"
  on public.prospects
  for select
  to authenticated
  using (
    (user_id is not null and (select auth.uid()) = user_id)
    or (select public.is_admin())
  );

create policy "orientations linked user or admin read"
  on public.orientations
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.prospects p
      where p.id = prospect_id
        and p.user_id is not null
        and p.user_id = (select auth.uid())
    )
    or (select public.is_admin())
  );

create policy "customer access own or admin read"
  on public.customer_access
  for select
  to authenticated
  using (
    (select auth.uid()) = user_id
    or (select public.is_admin())
  );

-- Preserve Phase 1 access for every student account that already exists when this migration lands.
insert into public.customer_access (user_id, status)
select ur.user_id, 'client_active'::public.customer_lifecycle_status
from public.user_roles ur
where ur.role = 'student'
on conflict (user_id) do nothing;

-- New sign-ups become free prospect accounts at the commercial-access layer.
-- The technical role remains student and is intentionally independent.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'student')
  on conflict (user_id) do nothing;

  insert into public.customer_access (user_id, status)
  values (new.id, 'prospect_account')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

-- Trigger functions are not client RPC endpoints.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
