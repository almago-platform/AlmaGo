-- Phase F follow-up: cover the counselor foreign key used by review history.
-- This is additive and does not change review visibility or write permissions.

create index orientation_human_reviews_reviewed_by_idx
  on public.orientation_human_reviews (reviewed_by)
  where reviewed_by is not null;
