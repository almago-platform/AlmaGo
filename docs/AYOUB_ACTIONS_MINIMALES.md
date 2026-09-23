# AYOUB — Actions minimales requises

Le système AlmaGo est conçu pour fonctionner avec le moins d’intervention possible du propriétaire.

## État actuel

Master Plan : **41/45 — 91 %**.

Chaîne restante avant la recette finale :

**A38 juridique → A43 E2E authentifiés → A44 observabilité/analytics → A45 gate de publication.**

## A38 — informations juridiques à confirmer

Ne jamais envoyer ici de mot de passe, clé privée, document d’identité ou autre secret.

Pour préparer les pages juridiques, confirmer uniquement les informations publiques nécessaires :

- nom légal de l’éditeur/exploitant du site (personne physique ou société) ;
- adresse postale/de contact à publier ;
- adresse e-mail publique de contact ;
- numéro d’immatriculation ou TVA uniquement si applicable ;
- AlmaGo est-il actuellement gratuit ou payant ;
- catégories de données utilisateur réellement conservées et règles de suppression/rétention déjà décidées ;
- personne qui effectuera la relecture juridique finale avant publication.

Le contenu ne doit pas être présenté comme final avant cette relecture humaine.

## A43 — E2E authentifiés

Le workflow est déjà prêt dans :

`.github/workflows/almago-authenticated-e2e.yml`

Créer deux comptes Supabase **réservés aux tests, sans donnée réelle** :

- un compte étudiant ;
- un compte admin avec une ligne `user_roles.role = 'admin'`.

Secrets GitHub Actions requis :

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `ALMAGO_E2E_STUDENT_EMAIL`
- `ALMAGO_E2E_STUDENT_PASSWORD`
- `ALMAGO_E2E_ADMIN_EMAIL`
- `ALMAGO_E2E_ADMIN_PASSWORD`

Variable GitHub Actions :

- `ALMAGO_AUTH_E2E_ENABLED=true`

Le test vérifie que :

- le compte étudiant atteint l’espace étudiant ;
- le compte étudiant ne peut pas entrer dans `/admin` ;
- le compte admin passe le garde de rôle côté serveur.

Ne jamais réutiliser les identifiants d’un vrai étudiant pour ces tests.

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
