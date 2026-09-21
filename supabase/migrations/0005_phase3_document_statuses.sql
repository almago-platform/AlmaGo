-- Phase 3 extends the existing document lifecycle without removing legacy values.
alter type public.document_status add value if not exists 'approved';
alter type public.document_status add value if not exists 'replace_required';
