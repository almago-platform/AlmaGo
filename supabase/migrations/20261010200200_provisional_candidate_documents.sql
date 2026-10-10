-- #1071: private objects owned ONLY by an authenticated seven-day
-- provisional credential. Existing student document RLS is unchanged.
create table public.provisional_candidate_documents (
  id uuid primary key default gen_random_uuid(),
  credential_id uuid not null references public.provisional_candidate_credentials(id) on delete cascade,
  category text not null check (category in ('passport','baccalaureate','transcripts','language_certificate')),
  storage_path text not null unique,
  original_filename text not null,
  mime_type text not null check (mime_type in ('application/pdf','image/jpeg','image/png')),
  size_bytes integer not null check (size_bytes between 1 and 10485760),
  status text not null default 'pending' check (status in ('pending','migrated')),
  migrated_document_id uuid references public.documents(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint provisional_doc_owner_path check (storage_path like credential_id::text || '/%')
);
create index provisional_candidate_documents_owner_idx
  on public.provisional_candidate_documents(credential_id,created_at desc);
alter table public.provisional_candidate_documents enable row level security;
revoke all on public.provisional_candidate_documents from public, anon, authenticated;
grant select, insert, update, delete on public.provisional_candidate_documents to service_role;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values (
  'provisional-starter-documents',
  'provisional-starter-documents',
  false,
  10485760,
  array['application/pdf','image/jpeg','image/png']
)
on conflict (id) do update
  set public = false, file_size_limit = 10485760,
      allowed_mime_types = excluded.allowed_mime_types;

-- No storage.objects policies: only trusted server-side service_role may
-- access these files. Verify this via local DB tests before release.
