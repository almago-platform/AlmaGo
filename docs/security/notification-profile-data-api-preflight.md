# #185 — Data API : notifications et profil

## Audit lecture seule du 25 septembre 2026

### Notifications

Le rôle `authenticated` possède actuellement `SELECT`, `INSERT` et `UPDATE` au niveau table.

RLS :

- SELECT : propriétaire ou Admin ;
- UPDATE : propriétaire ;
- INSERT : Admin.

Le produit étudiant n’utilise l’UPDATE que pour `read_at`.

Les fonctions Admin `SECURITY INVOKER` insèrent les colonnes : `user_id`, `type`, `title`, `body`, `metadata`.

### Profiles

Le rôle `authenticated` possède actuellement `SELECT`, `INSERT` et `UPDATE` au niveau table.

La route profil applique une allow-list et des validations, mais utilise la session Supabase de l’utilisateur.

La route onboarding écrit aussi `onboarding_completed`, `onboarding_completed_at` et `full_name`.

Un appel direct Data API utilise le même rôle PostgreSQL `authenticated`. Une simple restriction de colonnes qui interdirait les champs workflow casserait donc aussi la route onboarding actuelle.

## Proposition sûre pour notifications

```sql
revoke update on table public.notifications from authenticated;
revoke insert on table public.notifications from authenticated;

grant update (read_at)
  on table public.notifications
  to authenticated;

grant insert (user_id, type, title, body, metadata)
  on table public.notifications
  to authenticated;
```

RLS continue à déterminer quelles lignes peuvent être modifiées ou insérées ; les grants de colonnes limitent quelles colonnes sont accessibles.

## Décision requise pour profiles

Ne pas prétendre qu’un simple RLS suffit.

Trois directions à évaluer séparément :

1. Conserver l’architecture actuelle et accepter que les champs workflow ne soient pas une frontière DB forte.
2. Rendre l’état onboarding dérivé de faits persistés (profil complet + consentement), afin de ne plus exposer de drapeau workflow modifiable.
3. Introduire une opération serveur/DB dédiée pour finaliser l’onboarding, avec revue sécurité explicite. Éviter une fonction `SECURITY DEFINER` uniquement destinée à contourner RLS sans modèle d’autorisation clair.

## Validation avant toute application notifications

1. Étudiant peut lire ses notifications.
2. Étudiant peut modifier uniquement `read_at` sur ses propres notifications.
3. Étudiant ne peut pas modifier `title`, `body`, `type`, `metadata`, `created_at` ou `user_id`.
4. Étudiant ne peut pas insérer une notification à cause de la policy Admin.
5. `admin_review_document` peut toujours insérer la notification.
6. `admin_update_application` peut toujours insérer la notification.
7. E2E étudiant/admin + Security Advisor après application.

Aucune modification Supabase n’a été appliquée pendant cette préparation.
