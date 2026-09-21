-- Phase 3: private documents, student-visible history, and a small checklist workflow.
alter table public.documents
  add column if not exists category text not null default 'other' check (category in (
    'passport', 'baccalaureate', 'transcripts', 'language_certificate',
    'university_attestation', 'cv', 'motivation_letter', 'translation', 'admission', 'other'
  )),
  add column if not exists admin_comment text,
  add column if not exists reviewed_at timestamptz;

alter table public.checklist_templates
  add column if not exists category text not null default 'Profil';

alter table public.student_checklist_items
  drop constraint if exists student_checklist_items_status_check;

update public.student_checklist_items
set status = case status
  when 'done' then 'completed'
  when 'blocked' then 'waiting_almago'
  else status
end;

alter table public.student_checklist_items
  add constraint student_checklist_items_status_check check (status in (
    'not_started', 'todo', 'in_progress', 'waiting_student', 'waiting_almago', 'completed'
  ));

create unique index if not exists student_checklist_items_student_template_unique
  on public.student_checklist_items (student_id, template_id)
  where template_id is not null;

create table if not exists public.student_history (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists student_history_student_created_idx
  on public.student_history(student_id, created_at desc);

alter table public.student_history enable row level security;

drop policy if exists "student history own or admin read" on public.student_history;
create policy "student history own or admin read" on public.student_history
  for select to authenticated
  using (student_id = auth.uid() or public.is_admin());

drop policy if exists "student history admin write" on public.student_history;
create policy "student history admin write" on public.student_history
  for insert to authenticated
  with check (public.is_admin() and actor_id = auth.uid());

drop policy if exists "checklist student update" on public.student_checklist_items;

drop policy if exists "documents student allowed delete" on public.documents;
create policy "documents student allowed delete" on public.documents
  for delete to authenticated
  using (
    student_id = auth.uid()
    and status in ('pending', 'rejected', 'replace_required')
  );

create or replace function public.can_delete_own_document_object(object_name text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.documents
    where storage_path = object_name
      and student_id = auth.uid()
      and status in ('pending', 'rejected', 'replace_required')
  );
$$;

grant execute on function public.can_delete_own_document_object(text) to authenticated;

drop policy if exists "document objects own allowed delete" on storage.objects;
create policy "document objects own allowed delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'student-documents'
    and public.can_delete_own_document_object(name)
  );

insert into public.checklist_templates (key, title, description, category, sort_order)
values
  ('profile_complete', 'Profil AlmaGo terminé', 'Compléter et valider le profil étudiant.', 'Profil', 10),
  ('passport', 'Passeport validé', 'Ajouter un passeport lisible puis attendre sa validation.', 'Documents', 20),
  ('translation', 'Traductions nécessaires', 'Préparer les traductions demandées pour le dossier.', 'Traduction', 30),
  ('orientation', 'Orientation universitaire', 'Attendre les recommandations manuelles AlmaGo.', 'Orientation', 40),
  ('applications', 'Préparer les candidatures', 'Les candidatures seront préparées avec AlmaGo.', 'Candidatures', 50),
  ('admission', 'Suivre les admissions', 'Suivre les décisions des universités.', 'Admission', 60),
  ('germany_preparation', 'Préparer l’arrivée en Allemagne', 'Préparer les étapes après admission.', 'Préparation Allemagne', 70)
on conflict (key) do update set
  title = excluded.title,
  description = excluded.description,
  category = excluded.category,
  sort_order = excluded.sort_order;

create or replace function public.ensure_student_checklist_items(target_student_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.student_checklist_items (student_id, template_id, title, description, status)
  select target_student_id, template.id, template.title, template.description, 'todo'
  from public.checklist_templates template
  where template.is_active
  on conflict (student_id, template_id) where template_id is not null do nothing;
end;
$$;

create or replace function public.sync_profile_checklist()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.ensure_student_checklist_items(new.id);
  if new.onboarding_completed then
    update public.student_checklist_items item
    set status = 'completed', completed_at = coalesce(item.completed_at, now())
    from public.checklist_templates template
    where item.student_id = new.id
      and item.template_id = template.id
      and template.key = 'profile_complete';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_sync_checklist on public.profiles;
create trigger profiles_sync_checklist
  after insert or update of onboarding_completed on public.profiles
  for each row execute procedure public.sync_profile_checklist();

create or replace function public.sync_document_checklist()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.ensure_student_checklist_items(new.student_id);
  if new.category = 'passport' then
    update public.student_checklist_items item
    set status = case new.status
        when 'approved' then 'completed'
        when 'replace_required' then 'waiting_student'
        when 'rejected' then 'waiting_student'
        else 'todo'
      end,
      completed_at = case when new.status = 'approved' then coalesce(item.completed_at, now()) else null end
    from public.checklist_templates template
    where item.student_id = new.student_id
      and item.template_id = template.id
      and template.key = 'passport';
  end if;
  return new;
end;
$$;

drop trigger if exists documents_sync_checklist on public.documents;
create trigger documents_sync_checklist
  after insert or update of status, category on public.documents
  for each row execute procedure public.sync_document_checklist();

select public.ensure_student_checklist_items(id) from public.profiles;
update public.student_checklist_items item
set status = 'completed', completed_at = coalesce(item.completed_at, now())
from public.checklist_templates template, public.profiles profile
where item.student_id = profile.id
  and item.template_id = template.id
  and template.key = 'profile_complete'
  and profile.onboarding_completed;

grant select, insert, update, delete on table public.documents to authenticated;
grant select on table public.checklist_templates to authenticated;
grant select, update on table public.student_checklist_items to authenticated;
grant select, insert on table public.student_history to authenticated;
grant select, insert, update on table public.notifications to authenticated;
