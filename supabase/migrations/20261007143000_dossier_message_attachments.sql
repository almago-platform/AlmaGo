-- Messaging V2: candidate/student <-> Campus messages can include one private attachment.
-- Attachments remain communication artefacts and are deliberately separate from official dossier documents.

alter table public.student_dossier_messages
  add column if not exists attachment_storage_path text,
  add column if not exists attachment_name text,
  add column if not exists attachment_mime_type text,
  add column if not exists attachment_size_bytes bigint;

alter table public.student_dossier_messages
  drop constraint if exists student_dossier_messages_body_check;

alter table public.student_dossier_messages
  add constraint student_dossier_messages_body_or_attachment_check
  check (
    char_length(btrim(body)) between 2 and 4000
    or attachment_storage_path is not null
  );

alter table public.student_dossier_messages
  drop constraint if exists student_dossier_messages_attachment_metadata_check;

alter table public.student_dossier_messages
  add constraint student_dossier_messages_attachment_metadata_check
  check (
    (
      attachment_storage_path is null
      and attachment_name is null
      and attachment_mime_type is null
      and attachment_size_bytes is null
    )
    or (
      attachment_storage_path is not null
      and nullif(btrim(attachment_name), '') is not null
      and attachment_mime_type in ('application/pdf', 'image/jpeg', 'image/png')
      and attachment_size_bytes > 0
      and attachment_size_bytes <= 10485760
    )
  );

create unique index if not exists student_dossier_messages_attachment_path_uidx
  on public.student_dossier_messages(attachment_storage_path)
  where attachment_storage_path is not null;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'dossier-message-attachments',
  'dossier-message-attachments',
  false,
  10485760,
  array['application/pdf','image/jpeg','image/png']
)
on conflict (id) do update
set public = false,
    file_size_limit = 10485760,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "message attachments own read" on storage.objects;
create policy "message attachments own read"
  on storage.objects
  for select to authenticated
  using (
    bucket_id = 'dossier-message-attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "message attachments admin read" on storage.objects;
create policy "message attachments admin read"
  on storage.objects
  for select to authenticated
  using (
    bucket_id = 'dossier-message-attachments'
    and public.is_admin()
  );

drop policy if exists "message attachments own upload" on storage.objects;
create policy "message attachments own upload"
  on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'dossier-message-attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "message attachments admin upload" on storage.objects;
create policy "message attachments admin upload"
  on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'dossier-message-attachments'
    and public.is_admin()
  );

drop policy if exists "message attachments own delete" on storage.objects;
create policy "message attachments own delete"
  on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'dossier-message-attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "message attachments admin delete" on storage.objects;
create policy "message attachments admin delete"
  on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'dossier-message-attachments'
    and public.is_admin()
  );

create or replace function private.validate_student_dossier_message()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if auth.uid() is null then
    raise exception 'authentication_required';
  end if;

  new.body := btrim(new.body);
  new.attachment_name := nullif(btrim(new.attachment_name), '');

  if new.attachment_storage_path is not null
    and new.attachment_storage_path not like new.student_id::text || '/%'
  then
    raise exception 'invalid_message_attachment_path';
  end if;

  if new.sender_role = 'student' then
    if new.student_id <> auth.uid() or new.sender_id <> auth.uid() then
      raise exception 'invalid_student_sender';
    end if;

    if not exists (
      select 1
      from public.user_roles roles
      where roles.user_id = auth.uid()
        and roles.role = 'student'
    ) then
      raise exception 'student_role_required';
    end if;
    new.student_read_at := coalesce(new.student_read_at, now());
    new.admin_read_at := null;
  elsif new.sender_role = 'admin' then
    if not public.is_admin() or new.sender_id <> auth.uid() then
      raise exception 'invalid_admin_sender';
    end if;
    new.admin_read_at := coalesce(new.admin_read_at, now());
    new.student_read_at := null;
  end if;

  return new;
end;
$$;

revoke all on function private.validate_student_dossier_message()
  from public, anon, authenticated;


create or replace function private.notify_student_dossier_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  assigned_admin uuid;
begin
  if new.sender_role = 'admin' then
    insert into public.notifications (user_id, type, title, body, metadata)
    values (
      new.student_id,
      'student_dossier_message',
      'Nouveau message Campus Allemagne',
      case
        when new.attachment_storage_path is not null
          then 'Campus Allemagne vous a envoyé un nouveau message avec une pièce jointe.'
        else 'Campus Allemagne vous a envoyé un nouveau message.'
      end,
      jsonb_build_object(
        'student_id', new.student_id,
        'message_id', new.id,
        'has_attachment', new.attachment_storage_path is not null,
        'dedupe_key', 'student-dossier-message:' || new.id::text
      )
    )
    on conflict do nothing;
  else
    select assigned_admin_id
      into assigned_admin
      from public.student_case_assignments
     where student_id = new.student_id;

    if assigned_admin is not null then
      insert into public.notifications (user_id, type, title, body, metadata)
      values (
        assigned_admin,
        'admin_student_message',
        'Nouvelle réponse dossier',
        case
          when new.attachment_storage_path is not null
            then 'Un candidat ou étudiant vous a envoyé un message avec une pièce jointe.'
          else 'Un candidat ou étudiant vous a répondu dans son dossier.'
        end,
        jsonb_build_object(
          'student_id', new.student_id,
          'message_id', new.id,
          'has_attachment', new.attachment_storage_path is not null,
          'dedupe_key', 'admin-student-message:' || new.id::text || ':' || assigned_admin::text
        )
      )
      on conflict do nothing;
    else
      insert into public.notifications (user_id, type, title, body, metadata)
      select
        roles.user_id,
        'admin_student_message',
        'Nouvelle réponse dossier',
        case
          when new.attachment_storage_path is not null
            then 'Un candidat ou étudiant sans conseiller attribué a envoyé un message avec une pièce jointe.'
          else 'Un candidat ou étudiant sans conseiller attribué a répondu dans son dossier.'
        end,
        jsonb_build_object(
          'student_id', new.student_id,
          'message_id', new.id,
          'has_attachment', new.attachment_storage_path is not null,
          'dedupe_key', 'admin-student-message:' || new.id::text || ':' || roles.user_id::text
        )
      from public.user_roles roles
      where roles.role = 'admin'
      on conflict do nothing;
    end if;
  end if;

  insert into public.technical_logs (
    actor_id,
    event_name,
    entity_type,
    entity_id,
    metadata
  )
  values (
    auth.uid(),
    'student_dossier_message_created',
    'student',
    new.student_id,
    jsonb_build_object(
      'message_id', new.id,
      'sender_role', new.sender_role,
      'has_attachment', new.attachment_storage_path is not null
    )
  );

  return new;
end;
$$;

revoke all on function private.notify_student_dossier_message()
  from public, anon, authenticated;
