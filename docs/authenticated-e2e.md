# AlmaGo — Authenticated E2E

La suite authentifiée utilise uniquement des identités de test dédiées.

Elle vérifie :

- connexion étudiant ;
- interdiction d’accès étudiant à l’administration ;
- garde serveur du rôle admin et MFA ;
- qualité responsive/accessibilité de l’espace étudiant ;
- qualité responsive/accessibilité de l’espace admin.

## Configuration

Variables non sensibles :

- `ALMAGO_E2E_STUDENT_EMAIL`
- `ALMAGO_E2E_ADMIN_EMAIL`

Secrets :

- `ALMAGO_E2E_STUDENT_PASSWORD`
- `ALMAGO_E2E_ADMIN_PASSWORD`
- configuration Supabase publique utilisée par l’application.

Aucun mot de passe ne doit apparaître dans un log, commentaire, artifact ou screenshot.

## Exécution

Le workflow **AlmaGo Authenticated E2E** est lancé manuellement.

Cibles :

- `local` : serveur Next.js construit dans GitHub Actions ;
- `render` : runtime canonique configuré par `ALMAGO_PRODUCTION_URL`, avec fallback vers le service Render actuel.

Une exécution locale est une vérification de régression. Une exécution Render est la preuve avant release.
