-- AlmaGo V1 foundation. Apply through Supabase migrations or the SQL editor.
-- No application feature is implemented by this migration.

create extension if not exists "pgcrypto";

create type public.app_role as enum ('student', 'admin');
create type public.document_status as enum ('pending', 'reviewed', 'rejected', 'quarantined');
create type public.application_status as enum ('draft', 'planned', 'submitted', 'in_review', 'accepted', 'rejected', 'withdrawn');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  country text not null default 'TN',
  education_level text,
  target_degree text,
  target_field text,
  language_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'student',
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role)
  values (new.id, 'student')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create table public.universities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text,
  country text not null default 'DE',
  website_url text,
  source_url text,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.programs (
  id uuid primary key default gen_random_uuid(),
  university_id uuid not null references public.universities(id) on delete restrict,
  name text not null,
  degree_level text not null,
  field text,
  teaching_language text,
  application_url text,
  requirements jsonb not null default '{}'::jsonb,
  source_url text,
  verified_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Recommendations are manual admin actions in V1; no matching or scoring is stored here.
create table public.program_recommendations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  program_id uuid not null references public.programs(id) on delete restrict,
  admin_id uuid not null references auth.users(id) on delete restrict,
  note text,
  status text not null default 'recommended' check (status in ('recommended', 'accepted', 'dismissed')),
  created_at timestamptz not null default now(),
  unique (student_id, program_id)
);

create table public.checklist_templates (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  title text not null,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.student_checklist_items (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  template_id uuid references public.checklist_templates(id) on delete set null,
  title text not null,
  description text,
  due_date date,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done', 'blocked')),
  completed_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Storage metadata only. File bytes belong to the private Supabase Storage bucket.
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null unique,
  original_filename text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 10485760),
  status public.document_status not null default 'pending',
  uploaded_by uuid not null references auth.users(id) on delete restrict,
  reviewed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  program_id uuid not null references public.programs(id) on delete restrict,
  intake text,
  status public.application_status not null default 'draft',
  deadline date,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, program_id, intake)
);

-- Student-visible history. Internal technical events live in technical_logs below.
create table public.application_events (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  message text,
  visible_to_student boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  metadata jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  consent_type text not null,
  policy_version text not null,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  unique (user_id, consent_type, policy_version)
);

-- Private staff notes. They are deliberately never exposed by student policies.
create table public.admin_notes (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  admin_id uuid not null references auth.users(id) on delete restrict,
  note text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Internal-only operational/audit log. There is intentionally no student SELECT policy.
create table public.technical_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  event_name text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index student_checklist_items_student_idx on public.student_checklist_items(student_id);
create index documents_student_idx on public.documents(student_id);
create index applications_student_idx on public.applications(student_id);
create index application_events_application_idx on public.application_events(application_id, created_at desc);
create index notifications_user_idx on public.notifications(user_id, created_at desc);
create index admin_notes_student_idx on public.admin_notes(student_id, created_at desc);

-- RLS is enabled on every application table. The service role remains server-only.
do $$ declare t text; begin
  foreach t in array array['profiles','user_roles','universities','programs','program_recommendations','checklist_templates','student_checklist_items','documents','applications','application_events','notifications','consents','admin_notes','technical_logs'] loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

create policy "profiles own read" on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "profiles own update" on public.profiles for update to authenticated using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());
create policy "roles own read or admin" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.is_admin());

create policy "catalog authenticated read" on public.universities for select to authenticated using (true);
create policy "catalog admin write" on public.universities for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "programs authenticated read" on public.programs for select to authenticated using (true);
create policy "programs admin write" on public.programs for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "recommendations student or admin read" on public.program_recommendations for select to authenticated using (student_id = auth.uid() or public.is_admin());
create policy "recommendations admin write" on public.program_recommendations for all to authenticated using (public.is_admin()) with check (public.is_admin() and admin_id = auth.uid());

create policy "checklist templates authenticated read" on public.checklist_templates for select to authenticated using (true);
create policy "checklist templates admin write" on public.checklist_templates for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "checklist student or admin" on public.student_checklist_items for select to authenticated using (student_id = auth.uid() or public.is_admin());
create policy "checklist student update" on public.student_checklist_items for update to authenticated using (student_id = auth.uid()) with check (student_id = auth.uid());
create policy "checklist admin write" on public.student_checklist_items for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "documents student or admin read" on public.documents for select to authenticated using (student_id = auth.uid() or public.is_admin());
create policy "documents student insert" on public.documents for insert to authenticated with check (
  student_id = auth.uid()
  and uploaded_by = auth.uid()
  and status = 'pending'
  and size_bytes <= 10485760
  and mime_type in ('application/pdf', 'image/jpeg', 'image/png')
);
create policy "documents admin update" on public.documents for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "documents admin delete" on public.documents for delete to authenticated using (public.is_admin());

create policy "applications student or admin read" on public.applications for select to authenticated using (student_id = auth.uid() or public.is_admin());
create policy "applications student insert" on public.applications for insert to authenticated with check (student_id = auth.uid());
create policy "applications student update" on public.applications for update to authenticated using (student_id = auth.uid()) with check (student_id = auth.uid());
create policy "applications admin write" on public.applications for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "visible application events" on public.application_events for select to authenticated using ((visible_to_student and exists (select 1 from public.applications a where a.id = application_id and a.student_id = auth.uid())) or public.is_admin());
create policy "application events admin write" on public.application_events for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "notifications own read" on public.notifications for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "notifications own update" on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "notifications admin write" on public.notifications for insert to authenticated with check (public.is_admin());
create policy "consents own read" on public.consents for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "consents own insert" on public.consents for insert to authenticated with check (user_id = auth.uid());
create policy "consents own revoke" on public.consents for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "admin notes admin only" on public.admin_notes for all to authenticated using (public.is_admin()) with check (public.is_admin() and admin_id = auth.uid());
-- No technical_logs policy: authenticated clients cannot read or write internal logs.

-- Future upload boundary: private bucket, 10 MiB maximum, allow-list enforced by the future upload route.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('student-documents', 'student-documents', false, 10485760, array['application/pdf','image/jpeg','image/png'])
on conflict (id) do update set public = false, file_size_limit = 10485760, allowed_mime_types = excluded.allowed_mime_types;

create policy "document objects own folder" on storage.objects for select to authenticated
using (bucket_id = 'student-documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "document objects own upload" on storage.objects for insert to authenticated
with check (bucket_id = 'student-documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "document objects admin read" on storage.objects for select to authenticated
using (bucket_id = 'student-documents' and public.is_admin());
