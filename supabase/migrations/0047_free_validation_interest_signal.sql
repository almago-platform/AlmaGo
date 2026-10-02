-- Free Validation Launch FVL-1:
-- explicit, auditable "I want to continue" demand signal.
-- This does not change customer_access, qualification, payment or document access.

alter table public.orientations
  add column if not exists free_validation_interest_token_hash text,
  add column if not exists free_validation_interest_token_expires_at timestamptz;

create unique index if not exists orientations_free_validation_interest_token_hash_unique
  on public.orientations (free_validation_interest_token_hash)
  where free_validation_interest_token_hash is not null;

create table if not exists public.free_validation_interest_signals (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.prospects(id) on delete cascade,
  orientation_id uuid not null references public.orientations(id) on delete cascade,
  signal text not null default 'wants_support'
    check (signal = 'wants_support'),
  source text not null default 'orientation_result'
    check (source in ('orientation_result', 'email_followup')),
  signal_version text not null
    check (char_length(signal_version) between 1 and 80),
  created_at timestamptz not null default now(),
  unique (orientation_id, signal)
);

create index if not exists free_validation_interest_signals_prospect_created_idx
  on public.free_validation_interest_signals (prospect_id, created_at desc);

alter table public.free_validation_interest_signals enable row level security;

revoke all on table public.free_validation_interest_signals from anon;
grant select on table public.free_validation_interest_signals to authenticated;
revoke insert, update, delete, truncate, references, trigger
  on table public.free_validation_interest_signals
  from authenticated;

grant select, insert
  on table public.free_validation_interest_signals
  to service_role;
revoke update, delete, truncate
  on table public.free_validation_interest_signals
  from service_role;

create policy "free validation interest linked user or admin read"
  on public.free_validation_interest_signals
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
