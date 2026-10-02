-- Free Validation Launch FVL-4A:
-- append-only free-pilot access events, completely separate from payment/customer_access.
-- No real pilot access is enabled by this migration alone.

create table if not exists public.free_validation_pilot_access_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  prospect_id uuid not null references public.prospects(id) on delete cascade,
  action text not null check (action in ('grant', 'revoke')),
  reason text check (reason is null or char_length(reason) between 1 and 500),
  performed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists free_validation_pilot_access_user_created_idx
  on public.free_validation_pilot_access_events (user_id, created_at desc);

create index if not exists free_validation_pilot_access_prospect_created_idx
  on public.free_validation_pilot_access_events (prospect_id, created_at desc);

alter table public.free_validation_pilot_access_events enable row level security;

revoke all on table public.free_validation_pilot_access_events from anon;

grant select on table public.free_validation_pilot_access_events to authenticated;
revoke insert, update, delete, truncate, references, trigger
  on table public.free_validation_pilot_access_events
  from authenticated;

grant select, insert
  on table public.free_validation_pilot_access_events
  to service_role;
revoke update, delete, truncate
  on table public.free_validation_pilot_access_events
  from service_role;

create policy "free pilot own or admin read"
  on public.free_validation_pilot_access_events
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or (select public.is_admin())
  );

comment on table public.free_validation_pilot_access_events is
  'FVL-4 append-only pilot grants/revocations. Separate from commercial payment lifecycle.';
