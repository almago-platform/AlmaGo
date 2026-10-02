-- Orientation V4 F — human validation review bundles.
-- Internal review state is deliberately separated from student-facing
-- program_recommendations. A review approval never publishes a recommendation.

create table public.orientation_human_reviews (
  id uuid primary key default gen_random_uuid(),
  orientation_id uuid null unique
    references public.orientations(id) on delete set null,
  profile_fingerprint text not null
    check (profile_fingerprint ~ '^[0-9a-f]{64}$'),
  profile jsonb not null
    check (jsonb_typeof(profile) = 'object'),
  bundle jsonb not null
    check (jsonb_typeof(bundle) = 'object'),
  pipeline_status text not null
    check (pipeline_status in (
      'ready',
      'partial',
      'insufficient_evidence',
      'route_requires_review',
      'profile_incomplete',
      'provider_unavailable'
    )),
  selected_count integer not null default 0
    check (selected_count between 0 and 4),
  review_status text not null default 'pending'
    check (review_status in (
      'pending',
      'approved',
      'changes_requested',
      'rejected'
    )),
  approved_selection jsonb not null default '[]'::jsonb
    check (jsonb_typeof(approved_selection) = 'array'),
  counselor_note text null
    check (counselor_note is null or char_length(counselor_note) <= 2000),
  reviewed_by uuid null references auth.users(id) on delete set null,
  reviewed_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint orientation_human_reviews_review_consistency
    check (
      (review_status = 'pending'
        and reviewed_by is null
        and reviewed_at is null)
      or
      (review_status <> 'pending'
        and reviewed_by is not null
        and reviewed_at is not null)
    )
);

create index orientation_human_reviews_status_created_idx
  on public.orientation_human_reviews (review_status, created_at desc);

create index orientation_human_reviews_profile_created_idx
  on public.orientation_human_reviews (profile_fingerprint, created_at desc);

create index orientation_human_reviews_orientation_idx
  on public.orientation_human_reviews (orientation_id)
  where orientation_id is not null;

alter table public.orientation_human_reviews enable row level security;

revoke all on table public.orientation_human_reviews
  from public, anon, authenticated;

grant select, update
  on table public.orientation_human_reviews
  to authenticated;

grant select, insert, update, delete
  on table public.orientation_human_reviews
  to service_role;

create policy "orientation human reviews admin read"
  on public.orientation_human_reviews
  for select
  to authenticated
  using ((select public.is_admin()));

create policy "orientation human reviews admin update"
  on public.orientation_human_reviews
  for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

comment on table public.orientation_human_reviews is
  'Admin-only Orientation V4 A/B/C/D review bundles. Approval remains separate from program_recommendations publication.';
