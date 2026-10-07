# AlmaGo — Authenticated E2E

La suite authentifiée utilise uniquement des identités de test dédiées.

Elle vérifie :

- connexion étudiant ;
- interdiction d’accès étudiant à l’administration ;
- redirection d’un admin AAL1 vers le challenge MFA ;
- refus API admin tant que la session reste AAL1 ;
- accès admin après un challenge TOTP AAL2 vérifié ;
- qualité responsive/accessibilité de l’espace étudiant ;
- qualité responsive/accessibilité de l’espace admin.

## Configuration

Variables non sensibles :

- `ALMAGO_E2E_STUDENT_EMAIL`
- `ALMAGO_E2E_ADMIN_EMAIL`

Secrets :

- `ALMAGO_E2E_STUDENT_PASSWORD`
- `ALMAGO_E2E_ADMIN_PASSWORD`
- `ALMAGO_E2E_ADMIN_TOTP_SECRET`
- configuration Supabase publique utilisée par l’application.

Le compte admin E2E doit avoir un facteur TOTP déjà vérifié. Le workflow n’enrôle jamais automatiquement un facteur et n’affaiblit jamais le MFA pour les tests.

Aucun mot de passe, seed TOTP, token ou cookie ne doit apparaître dans un log, commentaire, artifact ou screenshot.

## Exécution

Le workflow **AlmaGo Authenticated E2E** peut être lancé manuellement et peut aussi être appelé par le **AlmaGo Release Gate**.

Cibles :

- `local` : serveur Next.js construit dans GitHub Actions ;
- `render` : runtime canonique configuré par `ALMAGO_PRODUCTION_URL`, avec fallback vers le service Render actuel.

Une exécution locale est une vérification de régression. Une exécution Render sur le SHA exact servi en production est la preuve authentifiée avant release.
