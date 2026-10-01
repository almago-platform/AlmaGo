-- Smart Orientation SO-3: keep transactional report delivery separate from
-- optional permission for Campus Allemagne to contact a prospect about their project.
-- This migration does not enable prospect capture or marketing/outreach.

alter table public.prospects
  add column if not exists contact_consent boolean not null default false,
  add column if not exists contact_consent_at timestamptz,
  add column if not exists contact_consent_version text;

do $$
begin
  alter table public.prospects
    add constraint prospects_contact_consent_consistency
    check (
      (
        contact_consent = false
        and contact_consent_at is null
        and contact_consent_version is null
      )
      or
      (
        contact_consent = true
        and contact_consent_at is not null
        and contact_consent_version is not null
        and char_length(contact_consent_version) between 1 and 80
      )
    );
exception
  when duplicate_object then null;
end
$$;

create index if not exists prospects_contact_consent_updated_idx
  on public.prospects (updated_at desc)
  where contact_consent = true;

-- RLS and grants stay unchanged. The bounded privileged backend remains the only
-- public-orientation write path; authenticated users retain their existing read boundary.
