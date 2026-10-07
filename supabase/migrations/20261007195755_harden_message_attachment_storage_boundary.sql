-- Follow-up hardening for the message attachment bucket that was provisioned
-- ahead of the corresponding application feature. Until candidate messaging is
-- deliberately reconciled, owner access follows the secured client boundary.

drop policy if exists "message attachments own read" on storage.objects;
create policy "message attachments own read"
  on storage.objects
  for select to authenticated
  using (
    bucket_id = 'dossier-message-attachments'
    and (select private.has_student_client_access())
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "message attachments own upload" on storage.objects;
create policy "message attachments own upload"
  on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'dossier-message-attachments'
    and (select private.has_student_client_access())
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "message attachments own delete" on storage.objects;
create policy "message attachments own delete"
  on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'dossier-message-attachments'
    and (select private.has_student_client_access())
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
