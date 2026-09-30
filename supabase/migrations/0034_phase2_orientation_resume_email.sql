-- P2.3B: secure prospect resume links and transactional delivery metadata.
-- Raw resume tokens are never persisted. Only SHA-256 hashes are stored.
-- Existing Phase 1 / Phase 2 rows remain valid because every new column is nullable.

alter table public.orientations
  add column if not exists resume_token_hash text,
  add column if not exists resume_token_expires_at timestamptz,
  add column if not exists delivery_provider text,
  add column if not exists delivery_message_id text,
  add column if not exists delivery_attempted_at timestamptz,
  add column if not exists delivered_at timestamptz;

create unique index if not exists orientations_resume_token_hash_unique
  on public.orientations (resume_token_hash)
  where resume_token_hash is not null;

create index if not exists orientations_resume_token_expiry_idx
  on public.orientations (resume_token_expires_at)
  where resume_token_hash is not null;

-- No grants or policies are widened here.
-- The existing RLS boundary remains unchanged and public resume lookup is performed
-- only through the bounded server route/page using the privileged server client.
