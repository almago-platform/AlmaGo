# AlmaGo

Socle technique de la V1 : Next.js App Router, TypeScript, Tailwind CSS, Supabase Auth, PostgreSQL et Supabase Storage privé.

La V1 couvre désormais l’authentification, l’onboarding et le tableau de bord étudiant, les documents privés, la checklist, l’orientation manuelle, le suivi des candidatures et un espace d’administration protégé par rôle. Les paiements automatisés et toute prise de décision d’admission par IA restent hors périmètre produit.

## Prérequis

- Node.js 20+
- npm
- Un projet Supabase personnel

## Installation locale

```bash
npm install
Copy-Item .env.example .env.local
npm run dev
```

Renseigner dans `.env.local` :

- `NEXT_PUBLIC_SUPABASE_URL` : Project URL de Supabase ;
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` : clé publishable du projet.

Ne jamais placer une clé `service_role` dans `.env.local` exposé au navigateur, dans Git ou dans `NEXT_PUBLIC_*`.

## Connecter Supabase

1. Créer un projet sur [supabase.com](https://supabase.com).
2. Dans **Project Settings → API**, copier l’URL et la clé publishable dans `.env.local`.
3. Lier le projet puis appliquer les migrations avec Supabase CLI :

   ```bash
   npx supabase link --project-ref VOTRE_PROJECT_REF
   npx supabase db push --dry-run
   npx supabase db push
   ```

   Les migrations sont versionnées dans `supabase/migrations/`. Ne les copiez pas manuellement dans le SQL Editor.
4. Dans **Authentication → Providers**, activer Email. Si la confirmation email est activée, ajouter `https://votre-domaine/auth/callback` dans les URL de redirection autorisées.
5. Vérifier le **Site URL** Supabase pour que le lien de récupération de mot de passe revienne vers votre domaine.
6. Créer un premier utilisateur avec l’authentification Supabase.
7. Pour promouvoir un compte en admin, vérifier son UUID puis exécuter manuellement, depuis l’éditeur SQL :

   ```sql
   update public.user_roles
   set role = 'admin'
   where user_id = 'UUID_DU_COMPTE';
   ```

   Ne jamais permettre à l’interface publique de modifier cette table.
8. Vérifier dans **Storage** que `student-documents` est privé et que les politiques de la migration sont présentes.

Commande de promotion manuelle pour votre compte de test (à exécuter uniquement dans le SQL Editor Supabase, en remplaçant le placeholder localement) :

```sql
update public.user_roles ur
set role = 'admin'
from auth.users u
where u.id = ur.user_id
  and u.email = 'VOTRE_EMAIL_DE_TEST';
```

Cette commande n’est jamais exposée à l’interface et aucun email réel n’est stocké dans le code.

## Vérifications

La CI des pull requests exécute les mêmes garde-fous sur le HEAD distant :

```bash
npm test
npx tsc --noEmit
npm run lint
npm run build
git diff --check
```

Les tests incluent des règles métier de candidature et des contrats de sécurité qui vérifient les gardes d’authentification, l’absence de clé service-role dans les clients Supabase et les protections RLS critiques des migrations.

Les politiques RLS distinguent l’historique visible (`application_events`) des journaux techniques internes (`technical_logs`). Les uploads futurs utiliseront un bucket privé, limité à 10 MiB et PDF/JPEG/PNG ; le contrôle antivirus pourra être ajouté dans une future route serveur sans changer cette frontière de stockage.
