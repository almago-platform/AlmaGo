-- Orientation V4 B — field-level programme verification engine.
-- Server-only verification history. This migration does not expose or promote
-- research candidates into the student-facing verified catalogue.

alter table public.orientation_research_programs
  add column verification_status text not null default 'unverified'
    check (verification_status in ('unverified','verified','needs_review','unknown')),
  add column last_verification_at timestamptz null;

create index orientation_research_programs_verification_status_idx
  on public.orientation_research_programs (verification_status, last_verification_at desc);

create table public.orientation_verification_runs (
  id uuid primary key default gen_random_uuid(),
  provider text not null
    check (provider in ('openai','deterministic')),
  model text null
    check (model is null or char_length(btrim(model)) between 1 and 120),
  status text not null
    check (status in ('disabled','ready','unavailable')),
  reason text null
    check (reason is null or reason in (
      'feature_disabled','missing_credentials','provider_error','no_candidates'
    )),
  candidate_count integer not null default 0
    check (candidate_count between 0 and 8),
  verified_count integer not null default 0
    check (verified_count between 0 and 8 and verified_count <= candidate_count),
  provider_requests integer not null default 0
    check (provider_requests between 0 and 9),
  web_search_calls integer not null default 0
    check (web_search_calls between 0 and 9),
  input_tokens bigint not null default 0 check (input_tokens >= 0),
  output_tokens bigint not null default 0 check (output_tokens >= 0),
  total_tokens bigint not null default 0 check (total_tokens >= 0),
  source_urls_seen integer not null default 0 check (source_urls_seen >= 0),
  duration_ms integer not null default 0 check (duration_ms >= 0),
  created_at timestamptz not null default now()
);

create table public.orientation_programme_verifications (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.orientation_verification_runs(id) on delete cascade,
  research_program_id uuid not null references public.orientation_research_programs(id) on delete cascade,
  overall_status text not null
    check (overall_status in ('verified','needs_review','unknown')),
  facts jsonb not null
    check (jsonb_typeof(facts) = 'array'),
  source_urls text[] not null default '{}'::text[]
    check (cardinality(source_urls) <= 24),
  verified_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (run_id, research_program_id)
);

create index orientation_programme_verifications_program_idx
  on public.orientation_programme_verifications
  (research_program_id, verified_at desc);

alter table public.orientation_verification_runs enable row level security;
alter table public.orientation_programme_verifications enable row level security;

revoke all on table public.orientation_verification_runs
  from public, anon, authenticated;
revoke all on table public.orientation_programme_verifications
  from public, anon, authenticated;

grant select, insert, update, delete
  on table public.orientation_verification_runs to service_role;
grant select, insert, update, delete
  on table public.orientation_programme_verifications to service_role;

comment on table public.orientation_verification_runs is
  'Server-only Orientation V4 verification run and provider usage history. Contains no student identity data.';
comment on table public.orientation_programme_verifications is
  'Server-only field-level programme verification facts and official-source provenance. Does not promote programmes automatically.';
