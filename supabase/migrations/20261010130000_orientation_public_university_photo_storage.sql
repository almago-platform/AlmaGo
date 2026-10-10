-- Public, non-personal university imagery only. Write access stays service-role only.
-- Attribution and the authoritative licensing/source URL live in public.universities.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'orientation-university-media',
  'orientation-university-media',
  true,
  4194304,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = true,
    file_size_limit = 4194304,
    allowed_mime_types = excluded.allowed_mime_types;

-- No INSERT/UPDATE/DELETE policies granted to anon or authenticated users.
-- The server-only privileged client handles licence-checked ingestion.
