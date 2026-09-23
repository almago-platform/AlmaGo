# AYOUB — Actions minimales requises

Le système AlmaGo est conçu pour fonctionner avec le moins d’intervention possible du propriétaire.

## État actuel

Master Plan : **41/45 — 91 %**.

Chaîne restante avant la recette finale :

**A38 juridique → A43 E2E authentifiés → A44 observabilité/analytics → A45 gate de publication.**

## A38 — confirmation juridique minimale

Ne jamais envoyer ici de mot de passe, clé privée, document d’identité ou autre secret.

Le dépôt connaît déjà les catégories de données, Supabase/Vercel et l’état actuel **sans analytics actif**. Il n’est plus demandé de choisir un fournisseur analytics dans A38 : ce choix appartient à A44.

Une seule réponse propriétaire est requise via :

`docs/A38_OWNER_CONFIRMATION.md`

Elle regroupe uniquement les informations impossibles à déduire du code : identité publique de l’éditeur, statut juridique/commercial, conservation/suppression, éventuel DPO/activité réglementée et relecteur final.

Le contenu ne doit pas être présenté comme final avant cette relecture humaine.

Quand les quatre fichiers A38 sont complètement renseignés, `A38_REVIEW_READY: true` déclenche automatiquement une vérification des placeholders et publie la preuve liée au SHA exact de `main`. Après cette preuve et la vraie relecture humaine, la seule action mécanique finale du propriétaire est de poster exactement `A38 HUMAN REVIEW APPROVED` sur l’Issue A38. Le gate vérifie le propriétaire + le SHA avant de fermer A38 et relancer l’orchestrateur.

## A43 — E2E authentifiés

Le workflow est déjà prêt dans :

`.github/workflows/almago-authenticated-e2e.yml`

Des identités Supabase **réservées aux tests, sans donnée réelle**, existent déjà et ont été vérifiées le 23/09/2026 :

- au moins un compte étudiant avec le rôle `student` ;
- un compte admin avec le rôle `admin`.

**Ne pas créer de nouveaux comptes pour A43.** Réutiliser ces identités dédiées. Si leurs mots de passe ne sont plus connus, les réinitialiser depuis le compte propriétaire Supabase avant de renseigner GitHub Actions.

Pour empêcher l'utilisation accidentelle d'un vrai compte, conserver uniquement des adresses dédiées contenant `e2e` ou `test`.

Configuration A43 requise :

Secrets GitHub Actions :
- `NEXT_PUBLIC_SUPABASE_URL` — déjà configuré ;
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — déjà configuré ;
- `ALMAGO_E2E_STUDENT_PASSWORD` ;
- `ALMAGO_E2E_ADMIN_PASSWORD`.

Les identités de test non sensibles sont définies par défaut dans le workflow :
- étudiant : `phase3.student.a@almago.test` ;
- admin : `phase3.admin@almago.test`.

Elles peuvent être remplacées plus tard par les variables GitHub non sensibles `ALMAGO_E2E_STUDENT_EMAIL` et `ALMAGO_E2E_ADMIN_EMAIL` si nécessaire, sans modifier le code.

Aucune variable d'activation supplémentaire n'est requise. Le workflow détecte automatiquement si la configuration nécessaire est disponible :

- sur un `push` pertinent, il se met en attente proprement si la configuration est incomplète ;
- dès que les secrets sont présents, les changements Auth/étudiant/admin déclenchent automatiquement le parcours E2E ;
- un lancement manuel (`workflow_dispatch`) échoue explicitement si un secret requis manque, au lieu de produire un faux résultat.

Il ne reste donc que les **deux mots de passe des comptes de test** à renseigner. Le Master Orchestrator sonde automatiquement A43 à chaque passage (push sur `main` et toutes les trois heures). Tant que les mots de passe manquent, le probe se termine proprement sans faux échec ; dès qu'ils sont présents, le vrai parcours E2E s'exécute et A43 se clôture automatiquement. Un lancement manuel reste possible uniquement pour obtenir la preuve immédiatement, mais il n'est plus obligatoire.

Le test vérifie que :

- le compte étudiant atteint l’espace étudiant ;
- le compte étudiant ne peut pas entrer dans `/admin` ;
- le compte admin passe le garde de rôle côté serveur.

Ne jamais réutiliser les identifiants d’un vrai étudiant pour ces tests. Aucun mot de passe de test ne doit être ajouté au repository, à une Issue ou au chat.

## A44 — observabilité et analytics

Choisir et connecter un fournisseur de production avant d’activer le tracking.

Chemin simple recommandé :

- Vercel pour le contexte déploiement/runtime ;
- PostHog, ou un fournisseur équivalent approuvé, pour analytics produit et observabilité.

Avant activation :

- définir une petite allow-list d’événements produit ;
- ne jamais envoyer le contenu des documents, mots de passe, tokens, notes libres, e-mails ou autre donnée personnelle inutile ;
- conserver les secrets fournisseur uniquement dans GitHub/Vercel ;
- faire correspondre la rétention et le tracking avec la politique de confidentialité validée en A38.

A44 reste bloquée tant qu’un compte fournisseur n’est pas connecté.

Après activation et vérification, renseigner aussi les variables GitHub Actions non sensibles :
- `ALMAGO_OBSERVABILITY_ENABLED=true`
- `ALMAGO_OBSERVABILITY_PROVIDER=<nom-du-fournisseur>`

Le Final Release Gate exige ces deux preuves en plus de la clôture A44.

## A45 — gate final

A45 est gérée par le système et dépend d’A44. Elle doit fournir un gate de publication visible avant une mise en production critique.

## Optionnel — file Gemini/Grok

Seulement si l’on veut réactiver la file IA externe :

### Secrets

- `GEMINI_API_KEY`
- `XAI_API_KEY` — optionnel

### Variables

- `ALMAGO_AI_BILLING_CAP_CONFIRMED=true`
- `ALMAGO_AI_ENABLED=true`
- optionnel : `ALMAGO_MAX_AI_TASKS_PER_DAY=4`

Configurer d’abord un plafond de dépenses bloquant ou un solde prépayé chez chaque fournisseur.

## Ce que le système fait déjà sans Ayoub

- sélection et suivi du Master Plan ;
- création et suivi des issues ;
- tests, TypeScript, lint, build et diff check ;
- Playwright desktop/mobile et screenshots ;
- audit axe accessibilité ;
- Lighthouse advisory ;
- contrôles Vercel quand disponibles ;
- protections de scope et de secrets ;
- nettoyage des branches fusionnées ;
- watchdog des automations.

**Aucune PR n’est fusionnée automatiquement.**
