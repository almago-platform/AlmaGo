-- #1071, phase 1 ONLY: inert seven-day provisional credential storage.
-- No existing auth, account role, commercial lifecycle, or RLS policy is changed.
-- Application access remains OFF until the security review and E2E release gate.
create table public.provisional_candidate_credentials (
  id uuid primary key default gen_random_uuid(),
  orientation_id uuid not null unique references public.orientations(id) on delete cascade,
  email text not null check (email = lower(btrim(email)) and char_length(email) between 3 and 320),
  first_name text not null check (char_length(first_name) between 1 and 100),
  last_name text not null check (char_length(last_name) between 1 and 100),
  password_hash text not null check (char_length(password_hash) between 50 and 512),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days'),
  revoked_at timestamptz,
  verified_user_id uuid references auth.users(id) on delete set null,
  constraint provisional_credential_window check (expires_at <= created_at + interval '7 days' and expires_at > created_at)
);

-- One pending credential per address. Existing verified auth.users accounts
-- are completely separate: no unverified identity can read their data.
create unique index provisional_candidate_credentials_email_key
  on public.provisional_candidate_credentials(email);
create index provisional_candidate_credentials_expiry_idx
  on public.provisional_candidate_credentials(expires_at);

create table public.provisional_candidate_sessions (
  id uuid primary key default gen_random_uuid(),
  credential_id uuid not null references public.provisional_candidate_credentials(id) on delete cascade,
  token_hash text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  constraint provisional_session_window check (expires_at > created_at and expires_at <= created_at + interval '7 days')
);
create index provisional_candidate_sessions_credential_idx
  on public.provisional_candidate_sessions(credential_id);
create index provisional_candidate_sessions_expiry_idx
  on public.provisional_candidate_sessions(expires_at);

alter table public.provisional_candidate_credentials enable row level security;
alter table public.provisional_candidate_sessions enable row level security;

revoke all on public.provisional_candidate_credentials from public, anon, authenticated;
revoke all on public.provisional_candidate_sessions from public, anon, authenticated;
grant select, insert, update, delete on public.provisional_candidate_credentials to service_role;
grant select, insert, update, delete on public.provisional_candidate_sessions to service_role;

comment on table public.provisional_candidate_credentials is
  'Feature-disabled staging for 7-day unverified identity. Never a Supabase verified account or commercial entitlement.';
comment on table public.provisional_candidate_sessions is
  'Opaque short-lived provisional cookies, hashed at rest; requires dedicated server-side authorization.';
