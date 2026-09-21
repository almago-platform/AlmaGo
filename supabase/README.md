# Supabase

Les migrations SQL versionnées vivent dans `supabase/migrations`. La migration `0001_initial_schema.sql` crée le schéma V1, les rôles, les RLS et le bucket privé futur des documents.

L’antivirus et la route d’upload ne sont pas inclus en Phase 1. La limite de stockage (10 MiB) et les formats PDF/JPEG/PNG sont déjà déclarés au niveau du bucket ; la future route devra refaire ces contrôles côté serveur avant de créer la ligne `documents`.
