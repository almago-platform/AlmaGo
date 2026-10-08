-- AlmaGo admin: evidence-gated visa tracking for a single candidate.
-- NOT applied to production by this PR. This migration must pass a test database
-- and RLS review before deployment. Do not insert any real visa decisions.
--
-- The authenticated applicant NEVER gets direct access to these internal tables.
-- Student-facing updates belong to the existing, separately controlled messages.
create table public.visa_cases (
  student_id uuid primary key references auth.users(id) on delete cascade,
  track text not null check (track in ('studies', 'study_preparation', 'study_place_search')),
  residence_country text not null check (char_length(btrim(residence_country)) between 2 and 100),
  mission text not null check (char_length(btrim(mission)) between 3 and 160),
  status text not null default 'collecting' check (
    status in ('collecting','ready_for_review','submitted','appointment','awaiting_decision','approved','refused')
  ),
  official_source_url text not null check (official_source_url ~ '^https://[^[:space:]]+$'),
  source_verified_at timestamptz not null,
  evidence_document_id uuid null references public.documents(id) on delete restrict,
  note text null check (note is null or char_length(note) <= 2000),
  version integer not null default 1 check (version between 1 and 2147483647),
  updated_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index visa_cases_status_updated_idx on public.visa_cases(status,updated_at desc);

create table public.visa_case_events (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.visa_cases(student_id) on delete cascade,
  from_status text null,
  to_status text not null,
  track text not null,
  version integer not null,
  evidence_document_id uuid null references public.documents(id) on delete restrict,
  note text null,
  actor_id uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  unique(student_id,version)
);
create index visa_case_events_student_created_idx on public.visa_case_events(student_id,created_at desc);

alter table public.visa_cases enable row level security;
alter table public.visa_case_events enable row level security;

revoke all on table public.visa_cases, public.visa_case_events from public, anon, authenticated;
grant select,insert,update on public.visa_cases to authenticated;
grant select on public.visa_case_events to authenticated;
grant select,insert,update,delete on public.visa_cases,public.visa_case_events to service_role;

create policy "visa cases admin mfa select" on public.visa_cases
 for select to authenticated
 using ((select public.is_admin()) and (select auth.jwt()->>'aal') = 'aal2');
create policy "visa cases admin mfa insert" on public.visa_cases
 for insert to authenticated
 with check ((select public.is_admin()) and (select auth.jwt()->>'aal') = 'aal2'
   and updated_by = (select auth.uid()));
create policy "visa cases admin mfa update" on public.visa_cases
 for update to authenticated
 using ((select public.is_admin()) and (select auth.jwt()->>'aal') = 'aal2')
 with check ((select public.is_admin()) and (select auth.jwt()->>'aal') = 'aal2'
   and updated_by = (select auth.uid()));
create policy "visa events admin mfa select" on public.visa_case_events
 for select to authenticated
 using ((select public.is_admin()) and (select auth.jwt()->>'aal') = 'aal2');

-- Transition and evidence validation is database-enforced, even if a REST client
-- bypasses the admin UI. Also prevent cross-student evidence references.
create function private.guard_visa_case()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_verified boolean;
begin
  if auth.uid() is null or not public.is_admin()
    or (auth.jwt()->>'aal') is distinct from 'aal2'
    or new.updated_by is distinct from auth.uid()
  then
    raise exception 'visa_case_admin_mfa_required';
  end if;

  if (new.source_verified_at at time zone 'UTC')::date > (now() at time zone 'Europe/Berlin')::date
    or (new.source_verified_at at time zone 'UTC')::date < (now() at time zone 'Europe/Berlin')::date - 365
  then
    raise exception 'visa_source_verification_invalid';
  end if;

  if tg_op = 'UPDATE' then
    if new.student_id is distinct from old.student_id
      or new.created_at is distinct from old.created_at
      or new.version is distinct from old.version + 1
    then
      raise exception 'visa_case_immutable_identity_or_invalid_version';
    end if;

    if old.status not in ('collecting','ready_for_review')
      and new.status <> 'collecting'
      and (
        new.track is distinct from old.track
        or new.residence_country is distinct from old.residence_country
        or new.mission is distinct from old.mission
      ) then
      raise exception 'visa_case_consular_route_locked_after_submission';
    end if;

    if new.status is distinct from old.status and not (
      (old.status = 'collecting' and new.status = 'ready_for_review')
      or (old.status = 'ready_for_review' and new.status in ('collecting','submitted'))
      or (old.status = 'submitted' and new.status in ('appointment','awaiting_decision'))
      or (old.status = 'appointment' and new.status = 'awaiting_decision')
      or (old.status = 'awaiting_decision' and new.status in ('approved','refused'))
      or (old.status in ('approved','refused') and new.status = 'collecting')
    ) then
      raise exception 'visa_case_transition_not_allowed';
    end if;
  else
    if new.status <> 'collecting' or new.version <> 1 then
      raise exception 'visa_case_must_begin_collecting';
    end if;
  end if;

  if new.evidence_document_id is not null then
    select exists(
      select 1 from public.documents d
      where d.id = new.evidence_document_id
        and d.student_id = new.student_id
        and d.category = 'other'
        and d.status = 'approved'
    ) into v_verified;
    if not v_verified then
      raise exception 'visa_evidence_must_be_approved_other_document_for_student';
    end if;
  end if;

  if new.status in ('submitted','appointment','awaiting_decision','approved','refused')
     and new.evidence_document_id is null then
    raise exception 'visa_case_transition_requires_approved_evidence';
  end if;

  if tg_op = 'UPDATE'
    and new.status is distinct from old.status
    and new.status in ('submitted','appointment','approved','refused')
    and new.evidence_document_id is not distinct from old.evidence_document_id then
    raise exception 'visa_case_new_stage_requires_new_documentary_proof';
  end if;

  new.updated_at := now();
  return new;
end
$$;

create trigger visa_cases_guard
  before insert or update on public.visa_cases
  for each row execute function private.guard_visa_case();

-- Trigger-owned event writes: no direct INSERT/UPDATE/DELETE grants to clients.
-- Definer privileges are limited to inserting one event derived from NEW/OLD.
create function private.audit_visa_case()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not public.is_admin()
    or (auth.jwt()->>'aal') is distinct from 'aal2'
    or new.updated_by is distinct from auth.uid()
  then
    raise exception 'visa_case_audit_admin_mfa_required';
  end if;
  insert into public.visa_case_events(
    student_id,from_status,to_status,track,version,evidence_document_id,note,actor_id
  ) values (
    new.student_id,
    case when tg_op = 'INSERT' then null else old.status end,
    new.status,new.track,new.version,new.evidence_document_id,new.note,auth.uid()
  );
  return new;
end
$$;
create trigger visa_cases_audit
  after insert or update on public.visa_cases
  for each row execute function private.audit_visa_case();

revoke all on function private.guard_visa_case() from public, anon, authenticated;
revoke all on function private.audit_visa_case() from public, anon, authenticated;
comment on table public.visa_cases is
 'Internal evidence-gated visa operations, NOT an official consular status or eligibility decision.';
comment on table public.visa_case_events is
 'Append-only audit automatically emitted for each visa case insert/update.';
