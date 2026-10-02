-- Orientation V4 A3 — reusable discovery knowledge and cache.
-- Server-only: anon/authenticated receive no table privileges.
-- Research leads are never exposed through orientation_program_catalog until B
-- verifies/promotes the relevant programme into the verified catalogue.

create table public.orientation_research_programs (
  id uuid primary key default gen_random_uuid(),
  dedupe_key text not null unique
    check (dedupe_key ~ '^[0-9a-f]{64}$'),
  institution text not null
    check (char_length(btrim(institution)) between 1 and 180),
  programme text not null
    check (char_length(btrim(programme)) between 1 and 220),
  degree text null
    check (degree is null or char_length(btrim(degree)) between 1 and 80),
  city text null
    check (city is null or char_length(btrim(city)) between 1 and 120),
  teaching_language text null
    check (teaching_language is null or char_length(btrim(teaching_language)) between 1 and 120),
  official_programme_url text null
    check (official_programme_url is null or official_programme_url ~* '^https://[^[:space:]]+$'),
  official_university_url text null
    check (official_university_url is null or official_university_url ~* '^https://[^[:space:]]+$'),
  source_urls text[] not null default '{}'::text[]
    check (cardinality(source_urls) <= 8),
  family_ids text[] not null default '{}'::text[]
    check (cardinality(family_ids) <= 16),
  research_status text not null default 'research_candidate'
    check (research_status in ('research_candidate','needs_review','rejected','promoted')),
  promoted_program_id uuid null references public.programs(id) on delete set null,
  rejection_reason text null
    check (rejection_reason is null or char_length(rejection_reason) <= 500),
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  last_provider text not null default 'openai'
    check (char_length(btrim(last_provider)) between 1 and 40),
  last_model text null
    check (last_model is null or char_length(btrim(last_model)) between 1 and 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (research_status <> 'promoted' or promoted_program_id is not null)
);

create index orientation_research_programs_family_ids_idx
  on public.orientation_research_programs using gin (family_ids);
create index orientation_research_programs_last_seen_idx
  on public.orientation_research_programs (last_seen_at desc)
  where research_status in ('research_candidate','needs_review','promoted');
create index orientation_research_programs_promoted_program_idx
  on public.orientation_research_programs (promoted_program_id)
  where promoted_program_id is not null;

create table public.orientation_discovery_runs (
  id uuid primary key default gen_random_uuid(),
  profile_fingerprint text not null
    check (profile_fingerprint ~ '^[0-9a-f]{64}$'),
  search_context jsonb not null
    check (jsonb_typeof(search_context) = 'object'),
  programme_family_ids text[] not null default '{}'::text[]
    check (cardinality(programme_family_ids) <= 16),
  search_queries text[] not null default '{}'::text[]
    check (cardinality(search_queries) <= 8),
  provider text not null
    check (provider in ('openai','knowledge_cache','mixed')),
  model text null
    check (model is null or char_length(btrim(model)) between 1 and 120),
  status text not null
    check (status in ('ready','unavailable')),
  candidate_count integer not null default 0
    check (candidate_count between 0 and 20),
  provider_requests integer not null default 0
    check (provider_requests >= 0 and provider_requests <= 9),
  web_search_calls integer not null default 0
    check (web_search_calls >= 0 and web_search_calls <= 32),
  input_tokens bigint not null default 0
    check (input_tokens >= 0),
  output_tokens bigint not null default 0
    check (output_tokens >= 0),
  total_tokens bigint not null default 0
    check (total_tokens >= 0),
  source_urls_seen integer not null default 0
    check (source_urls_seen >= 0),
  duration_ms integer not null default 0
    check (duration_ms >= 0),
  fresh_until timestamptz not null default (now() + interval '30 days'),
  created_at timestamptz not null default now()
);

create index orientation_discovery_runs_profile_fingerprint_idx
  on public.orientation_discovery_runs (profile_fingerprint, created_at desc);
create index orientation_discovery_runs_fresh_idx
  on public.orientation_discovery_runs (fresh_until desc)
  where status = 'ready';

create table public.orientation_discovery_run_candidates (
  run_id uuid not null references public.orientation_discovery_runs(id) on delete cascade,
  research_program_id uuid not null references public.orientation_research_programs(id) on delete cascade,
  discovery_reason text not null
    check (char_length(btrim(discovery_reason)) between 1 and 500),
  ordinal integer not null
    check (ordinal between 0 and 19),
  created_at timestamptz not null default now(),
  primary key (run_id, research_program_id),
  unique (run_id, ordinal)
);

create index orientation_discovery_run_candidates_program_idx
  on public.orientation_discovery_run_candidates (research_program_id);

alter table public.orientation_research_programs enable row level security;
alter table public.orientation_discovery_runs enable row level security;
alter table public.orientation_discovery_run_candidates enable row level security;

revoke all on table public.orientation_research_programs from public, anon, authenticated;
revoke all on table public.orientation_discovery_runs from public, anon, authenticated;
revoke all on table public.orientation_discovery_run_candidates from public, anon, authenticated;

grant select, insert, update, delete on table public.orientation_research_programs to service_role;
grant select, insert, update, delete on table public.orientation_discovery_runs to service_role;
grant select, insert, update, delete on table public.orientation_discovery_run_candidates to service_role;

comment on table public.orientation_research_programs is
  'Server-only reusable programme discovery knowledge. Records are research leads, not verified admission facts.';
comment on table public.orientation_discovery_runs is
  'Server-only, identity-minimised discovery run metadata and provider usage/cost observability.';
comment on table public.orientation_discovery_run_candidates is
  'Server-only linkage between discovery runs and reusable research programme records.';
