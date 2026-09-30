-- P2.7B: append-only, auditable prospect qualification history.
-- This migration is additive and does not change customer_access or Phase 1 entitlement.

do $$
begin
  create type public.prospect_qualification_state as enum (
    'not_evaluated',
    'too_early',
    'needs_information',
    'needs_verification',
    'ready_for_review',
    'qualified_prospect'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.prospect_qualification_origin as enum (
    'automatic',
    'human_review',
    'manual_override'
  );
exception
  when duplicate_object then null;
end
$$;

create table if not exists public.prospect_qualifications (
  id uuid primary key default gen_random_uuid(),
  orientation_id uuid not null references public.orientations(id) on delete cascade,
  engine_version text not null
    check (char_length(engine_version) between 1 and 80),
  state public.prospect_qualification_state not null,
  reason_codes text[] not null default '{}'::text[],
  missing_fields text[] not null default '{}'::text[],
  verification_requirements text[] not null default '{}'::text[],
  next_action text
    check (next_action is null or char_length(next_action) between 1 and 120),
  origin public.prospect_qualification_origin not null default 'automatic',
  reviewer_user_id uuid references auth.users(id) on delete set null,
  review_reason text
    check (review_reason is null or char_length(review_reason) between 1 and 1000),
  supersedes_id uuid references public.prospect_qualifications(id) on delete set null,
  created_at timestamptz not null default now(),

  constraint prospect_qualifications_reason_codes_bounded
    check (cardinality(reason_codes) <= 32),
  constraint prospect_qualifications_reason_codes_known
    check (
      reason_codes <@ array[
        'orientation_missing',
        'bac_status_missing',
        'target_degree_missing',
        'target_field_missing',
        'study_language_missing',
        'german_level_missing',
        'english_level_missing',
        'average_missing',
        'prior_diploma_missing',
        'bac_in_preparation',
        'first_degree_incomplete',
        'german_language_gap',
        'english_language_gap',
        'unsupported_project',
        'verification_required',
        'ready_for_human_review'
      ]::text[]
    ),
  constraint prospect_qualifications_missing_fields_bounded
    check (cardinality(missing_fields) <= 16),
  constraint prospect_qualifications_missing_fields_known
    check (
      missing_fields <@ array[
        'bacStatus',
        'targetDegree',
        'targetField',
        'studyLanguage',
        'germanLevel',
        'englishLevel',
        'generalAverage',
        'lastDiploma'
      ]::text[]
    ),
  constraint prospect_qualifications_verification_bounded
    check (cardinality(verification_requirements) <= 32),
  constraint prospect_qualifications_verification_known
    check (
      verification_requirements <@ array[
        'future_bac_roadmap',
        'bachelor_program_search',
        'master_program_search',
        'other_study_search',
        'german_preparation',
        'english_preparation',
        'finish_bac',
        'add_average',
        'add_prior_diploma',
        'complete_prior_degree',
        'strengthen_german',
        'strengthen_english',
        'compare_verified_programs',
        'academic_access',
        'master_entry_requirements',
        'language_requirement',
        'budget_requirement',
        'application_route_and_deadline'
      ]::text[]
    ),
  constraint prospect_qualifications_next_action_known
    check (
      next_action is null
      or next_action = any (
        array[
          'complete_project_information',
          'continue_preparation',
          'resolve_project_verification',
          'request_human_review'
        ]::text[]
      )
    ),
  constraint prospect_qualifications_automatic_never_qualified
    check (
      not (
        origin = 'automatic'::public.prospect_qualification_origin
        and state = 'qualified_prospect'::public.prospect_qualification_state
      )
    ),
  constraint prospect_qualifications_review_audit_required
    check (
      (
        origin = 'automatic'::public.prospect_qualification_origin
        and reviewer_user_id is null
        and review_reason is null
      )
      or
      (
        origin <> 'automatic'::public.prospect_qualification_origin
        and reviewer_user_id is not null
        and review_reason is not null
      )
    )
);

create index if not exists prospect_qualifications_orientation_history_idx
  on public.prospect_qualifications (orientation_id, created_at desc);

create index if not exists prospect_qualifications_reviewer_idx
  on public.prospect_qualifications (reviewer_user_id, created_at desc)
  where reviewer_user_id is not null;

-- Automatic recalculation is idempotent for one persisted orientation and one
-- engine version. Human review/override stays append-only and may supersede it.
create unique index if not exists prospect_qualifications_auto_once_idx
  on public.prospect_qualifications (orientation_id, engine_version)
  where origin = 'automatic'::public.prospect_qualification_origin;

alter table public.prospect_qualifications enable row level security;

revoke all on table public.prospect_qualifications from anon;
grant select on table public.prospect_qualifications to authenticated;
revoke insert, update, delete, truncate, references, trigger
  on table public.prospect_qualifications
  from authenticated;

-- Application persistence is backend-only and append-only. Even service-role
-- application code is not granted UPDATE/DELETE/TRUNCATE on this table.
grant select, insert on table public.prospect_qualifications to service_role;
revoke update, delete, truncate
  on table public.prospect_qualifications
  from service_role;

create policy "prospect qualifications linked user or admin read"
  on public.prospect_qualifications
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.orientations o
      join public.prospects p on p.id = o.prospect_id
      where o.id = orientation_id
        and p.user_id is not null
        and p.user_id = (select auth.uid())
    )
    or (select public.is_admin())
  );
