# AlmaGo — Master Plan total

Plan directeur reconstruit à partir du plan total défini le **22 septembre 2026** et aligné sur l’état réel du repository. Les IDs **A01–A45** et **E01–E06** sont des identifiants machine ajoutés pour permettre l’orchestration automatique.

## Gouvernance

- Ce plan est la source unique des améliorations AlmaGo : aucune IA ne doit inventer une fonctionnalité hors plan.
- Une seule tâche d’amélioration peut être active à la fois.
- Aucun workflow ne fusionne automatiquement une PR : les gates publient seulement un état **READY FOR MERGE**.
- Gemini/Grok ne traitent que des tâches bornées, non sensibles et de 1 à 3 fichiers.
- Auth, RLS, Supabase, Storage, permissions admin, migrations et secrets vont vers **CODEX/HUMAN REQUIRED**.
- Paiements, WhatsApp, scraping massif et application mobile native restent hors V1 sans validation explicite.
- Chaque tâche doit satisfaire ses critères puis passer tests, TypeScript, lint, build et les contrôles qualité applicables.

## Lot 1 — État réel, règles et tests

| ID | État | Tâche | Route | Dépendances |
|---|---|---|---|---|
| A01 | ✅ DONE | Inventorier les routes, écrans et capacités réelles | SYSTEM | — |
| A02 | ✅ DONE | Vérifier isolation étudiant/admin et gardes serveur | CODEX | A01 |
| A03 | ✅ DONE | Auditer RLS, Storage privé et privilèges Supabase | CODEX | A02 |
| A04 | ✅ DONE | Stabiliser statuts candidature et règles de deadline | CODEX | A03 |
| A05 | ✅ DONE | Distinguer chargement, erreur, vide et succès | AI | A04 |
| A06 | ✅ DONE | Ajouter tests métier et contrats sécurité | CODEX | A05 |
| A07 | ✅ DONE | Nettoyer documentation, branches et workflows redondants | SYSTEM | A06 |

## Lot 2 — Direction visuelle et écrans de référence

| ID | État | Tâche | Route | Dépendances |
|---|---|---|---|---|
| A08 | ✅ DONE | Appliquer identité visuelle AlmaGo inspirée TLScontact | AI | A07 |
| A09 | ⬜ TODO | Consolider tokens visuels et composants de base | AI | A08 |
| A10 | ⬜ TODO | Harmoniser shell et navigation étudiante | AI | A09 |
| A11 | ✅ DONE | Établir Mon dossier comme écran de référence | AI | A10 |
| A12 | ✅ DONE | Établir Mes documents comme écran de référence | AI | A11 |
| A13 | ⬜ TODO | Uniformiser visuellement les écrans Auth | CODEX | A12 |
| A14 | ⬜ TODO | Finaliser échelle typographique et rythme responsive | AI | A13 |
| A15 | ⬜ TODO | Finaliser focus hover disabled et feedback UI | AI | A14 |

## Lot 3 — Cœur du dossier étudiant

| ID | État | Tâche | Route | Dépendances |
|---|---|---|---|---|
| A16 | ✅ DONE | Rendre dashboard étudiant orienté prochaine action | AI | A15 |
| A17 | ⬜ TODO | Polir Mon profil et sa lisibilité | AI | A16 |
| A18 | ✅ DONE | Polir onboarding étudiant | AI | A17 |
| A19 | ✅ DONE | Fiabiliser Mes documents et ses états | CODEX | A18 |
| A20 | ✅ DONE | Rendre checklist honnête et actionnable | AI | A19 |
| A21 | ⬜ TODO | Optimiser navigation mobile étudiant | AI | A20 |
| A22 | ⬜ TODO | Uniformiser messages de récupération après erreur | AI | A21 |
| A23 | ⬜ TODO | Uniformiser loading et skeletons étudiants | AI | A22 |
| A24 | ⬜ TODO | Uniformiser microcopy étudiant en français | AI | A23 |

## Lot 4 — Orientation et suivi

| ID | État | Tâche | Route | Dépendances |
|---|---|---|---|---|
| A25 | ⬜ TODO | Polir cartes orientation et recommandations | AI | A24 |
| A26 | ✅ DONE | Fiabiliser états recommandation et intérêt | CODEX | A25 |
| A27 | ✅ DONE | Fiabiliser statuts et deadlines candidatures | CODEX | A26 |
| A28 | ⬜ TODO | Clarifier prochaine action dans Mes candidatures | AI | A27 |
| A29 | ⬜ TODO | Polir workflow admin Orientation | CODEX | A28 |
| A30 | ⬜ TODO | Polir workflow admin Candidatures | CODEX | A29 |
| A31 | ⬜ TODO | Auditer cohérence notifications et historique étudiant | CODEX | A30 |
| A32 | ⬜ TODO | Uniformiser vide erreur reprise Orientation/Candidatures | AI | A31 |

## Lot 5 — Vitrine et accès

| ID | État | Tâche | Route | Dépendances |
|---|---|---|---|---|
| A33 | ⬜ TODO | Restructurer landing autour proposition de valeur | AI | A32 |
| A34 | ⬜ TODO | Renforcer éléments de confiance landing | AI | A33 |
| A35 | ✅ DONE | Harmoniser login signup récupération | CODEX | A34 |
| A36 | ✅ DONE | Polir unauthorized et reset edge cases | CODEX | A35 |
| A37 | ⬜ TODO | Finaliser metadata SEO et partage social | AI | A36 |
| A38 | ⬜ TODO | Préparer confidentialité mentions et conditions | HUMAN | A37 |

## Lot 6 — Recette et publication

| ID | État | Tâche | Route | Dépendances |
|---|---|---|---|---|
| A39 | ✅ DONE | Ajouter smoke tests navigateur publics | SYSTEM | A38 |
| A40 | ✅ DONE | Ajouter matrice responsive et screenshots | SYSTEM | A39 |
| A41 | ✅ DONE | Ajouter audit accessibilité axe | SYSTEM | A40 |
| A42 | ✅ DONE | Ajouter budgets Lighthouse performance SEO | SYSTEM | A41 |
| A43 | ⛔ BLOCKED | Ajouter E2E authentifiés étudiant/admin | HUMAN | A42 |
| A44 | ⛔ BLOCKED | Connecter observabilité production et analytics | HUMAN | A43 |
| A45 | ⬜ TODO | Mettre en place recette finale et gate publication | SYSTEM | A44 |

## Extensions hors périmètre V1

- **E01 — Messagerie étudiant-AlmaGo** : DEFERRED
- **E02 — Notifications avancées multicanales** : DEFERRED
- **E03 — Sauvegarde profil section par section** : DEFERRED
- **E04 — Nouvelles structures de données produit** : DEFERRED
- **E05 — Paiements et facturation** : DEFERRED
- **E06 — Application mobile et canaux additionnels** : DEFERRED

## Boucle automatique

`AlmaGo Master Orchestrator` vérifie le plan après chaque changement de `main` et toutes les trois heures. Il crée la prochaine Issue éligible, choisit la route Gemini/Grok, Codex, humain ou système, maintient un tableau de progression GitHub et empêche le travail parallèle. Le watchdog bloque une tâche IA restée `RUNNING` plus de deux heures.
