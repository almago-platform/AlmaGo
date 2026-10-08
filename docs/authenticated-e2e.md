# AlmaGo — Authenticated E2E

La preuve authentifiée distingue désormais deux catégories :

- **étudiant** : compte de test dédié, automatisé sur VPS ;
- **admin réel unique** : validation humaine AAL2 liée au SHA exact déployé.

Cette séparation évite de conserver des comptes admin permanents uniquement pour les tests et interdit d’utiliser les identifiants personnels de l’administrateur réel dans GitHub Actions.

## Couverture automatisée

Le workflow vérifie automatiquement :

- connexion du compte étudiant de test ;
- accès à l’espace étudiant ;
- interdiction d’accès étudiant à l’administration ;
- refus des API admin pour l’étudiant ;
- qualité responsive/accessibilité de l’espace étudiant ;
- correspondance exacte entre le SHA GitHub et le SHA embarqué dans le build du VPS.

La frontière admin reste couverte automatiquement par les tests applicatifs et les tests RLS/pgTAP :

- admin AAL1 = refus ;
- admin AAL2 = autorisé ;
- rôle admin lu depuis la source immutable ;
- routes admin sensibles protégées par le garde canonique.

## Preuve admin en production

AlmaGo ne conserve qu’un seul admin réel. Ses mots de passe, cookies et secrets TOTP ne doivent jamais être placés dans GitHub Actions.

Pour une exécution VPS finale, A43 exige donc une validation humaine sur l’issue #84, liée au SHA exact :

`<!-- almago-a43-admin-human-approved:sha=<FULL_MAIN_SHA> -->`

Ce marqueur ne doit être ajouté qu’après avoir vérifié manuellement sur le SHA de build VPS exact :

1. connexion de l’admin réel ;
2. challenge MFA/TOTP ;
3. arrivée dans l’espace admin avec une session AAL2 ;
4. accès normal au cockpit admin ;
5. absence d’accès admin tant que la session reste AAL1.

Le workflow accepte uniquement une preuve publiée par un auteur GitHub avec une association `OWNER`, `MEMBER` ou `COLLABORATOR`.

Chaque nouveau SHA de `main` exige une nouvelle preuve. Une preuve ancienne ne peut pas valider un déploiement différent.

## Compte admin E2E jetable facultatif

Les tests Playwright conservent les scénarios admin AAL1/AAL2 pour le développement ou un environnement de test isolé.

Ils ne s’exécutent que si un futur compte admin de test **jetable** est explicitement configuré avec :

- `ALMAGO_E2E_ADMIN_EMAIL`;
- `ALMAGO_E2E_ADMIN_PASSWORD`;
- `ALMAGO_E2E_ADMIN_TOTP_SECRET`.

Ces variables ne sont plus requises par le workflow VPS canonique.

Ne jamais utiliser le compte admin personnel pour cette configuration.

## Configuration requise par le workflow canonique

Variables non sensibles :

- `ALMAGO_E2E_STUDENT_EMAIL`.

Secrets :

- `ALMAGO_E2E_STUDENT_PASSWORD`;
- configuration Supabase publique utilisée par l’application.

Aucun mot de passe, seed TOTP, token ou cookie ne doit apparaître dans un log, commentaire, artifact ou screenshot.

## Exécution

Le workflow **AlmaGo Authenticated E2E** peut être lancé manuellement et peut aussi être appelé par le **AlmaGo Release Gate**.

Cibles :

- `local` : serveur Next.js construit dans GitHub Actions ;
- `vps` : runtime canonique à `https://campusallemagne.tn` (aucun fallback Render).

Une exécution locale vérifie les régressions. Une exécution VPS exige en plus :

- A38 réellement fermé ;
- SHA VPS exact ;
- parcours étudiant automatisé réussi ;
- preuve humaine admin AAL2 exacte-SHA ;
- revalidation de A38 après les preuves.
