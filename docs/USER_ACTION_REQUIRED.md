# AlmaGo — interventions propriétaire réellement requises

Ce fichier ne liste que les actions qui nécessitent le compte, une décision, un secret, un paiement ou une écriture production protégée du propriétaire.

Source opérationnelle de suivi : GitHub issue #22.

## 1. A38 — validation juridique humaine

Suivi humain/juridique : #66. La proposition de rétention/suppression et la matrice de finalisation doivent rester alignées avec le `main` courant.

À faire humainement :

- compléter `docs/A38_OWNER_CONFIRMATION.md` avec les informations publiques réellement applicables ;
- décider les règles de conservation et suppression ;
- faire relire les textes A38 par un humain compétent ;
- ne mettre `A38_REVIEW_READY: true` que lorsque les quatre fichiers juridiques ne contiennent plus de placeholders bloquants ;
- après la vraie relecture, poster exactement `A38 HUMAN REVIEW APPROVED` sur l’issue A38.

Ne jamais publier un mot de passe, une clé, un document d’identité ou une donnée étudiant dans GitHub.

## 2. A43 — deux mots de passe de comptes E2E

Les identités de test non sensibles sont déjà définies :

- étudiant : `phase3.student.a@almago.test`
- admin : `phase3.admin@almago.test`

Il reste uniquement à fournir dans **GitHub Actions Secrets** :

- `ALMAGO_E2E_STUDENT_PASSWORD`
- `ALMAGO_E2E_ADMIN_PASSWORD`

Ne pas ajouter les e-mails comme secrets sauf si l’on souhaite volontairement remplacer les identités par défaut. Ne pas créer de variable `ALMAGO_AUTH_E2E_ENABLED` : elle n’est pas requise par le workflow actuel.

A43 reste aussi bloquée tant que #286 empêche les jobs GitHub Actions d’exécuter leurs étapes.

Suivi durable : #84 (A43), #286 (runner GitHub Actions) et #448 (preuve exact-main). Le workflow A43 conserve le runtime Render `almago-dev`, le mode local et les garde-fous main-only/A38.

## 3. Render — connexion GitHub et health check

Runtime de recette actuel :

`https://almago-dev.onrender.com`

Action propriétaire suivie dans #389 :

- vérifier/reconnecter l’autorisation GitHub du service Render ;
- confirmer qu’un nouveau commit sur `main` déclenche réellement un deploy automatique ;
- définir `/api/health` comme health check du service existant.

Le dashboard affiche actuellement auto-deploy activé, mais les derniers deploys observés ont été déclenchés par API. Le health check du service est encore vide.

Le service est actuellement sur Render Free et peut s’endormir après inactivité. Passer à un plan payant est une décision propriétaire séparée ; aucun upgrade ne doit être lancé automatiquement.

## 4. Catalogue production — terminé

#176 est clôturée. Son journal de clôture rapporte :

- 1 recommandation test archivée ;
- 7 programmes test désactivés ;
- 8 universités test désactivées ;
- aucun DELETE ;
- post-contrôle : 0 fixture active.

**Ne pas rejouer cette opération depuis ce document.** Toute future vérification live doit être une tâche séparée et explicitement autorisée.

## 5. A44 — observabilité/analytics

A44 vient après A38 et A43.

À ce moment-là seulement :

- choisir le fournisseur ;
- configurer rétention/consentement conformément à la revue juridique ;
- placer les secrets fournisseur dans Render/GitHub, jamais dans le dépôt ou le chat ;
- tester avec des données synthétiques ;
- vérifier l’allow-list de télémétrie et l’absence de données personnelles inutiles ;
- définir les variables non sensibles `ALMAGO_OBSERVABILITY_ENABLED=true` et `ALMAGO_OBSERVABILITY_PROVIDER=<nom>` lorsque l’activation est réellement vérifiée.

Aucun fournisseur n’est activé automatiquement.

Intégrité de preuve A44 exact-main : #433. La preuve doit être liée au SHA exact du `main` courant et `main` revérifié avant clôture.

## 6. Supabase Auth — décision d’abonnement

Le Security Advisor signale encore la protection contre mots de passe compromis comme désactivée. La décision d’un éventuel passage Supabase Pro est suivie dans #179.

Aucun paiement/upgrade automatique.

## 7. Protection de `main`

`main` reste actuellement non protégée et aucun ruleset n’est actif. Suivi : #336.

Ne pas rendre obligatoire un check GitHub Actions tant que #286 n’est pas résolu, sinon les merges peuvent être bloqués par un job qui échoue avant toute étape.

## 8. A45 — final release gate

Suivi durable : #406 (gate final Render) et #439 (protection de `main`). Le gate final refuse de publier la readiness tant que `main` n’est pas protégée (#336) :

- capture du SHA exact de `main` ;
- preuve `/api/health` de la même révision ;
- smoke de `/`, `/login`, `/signup` sur Render ;
- revalidation que `main` n’a pas changé ;
- aucune fusion ni aucun déploiement déclenché par le gate.

A45 reste dépendante de A38, A43 et A44.

## Optionnel — Gemini/Grok

L’activation Gemini/Grok n’est **pas** une action nécessaire au lancement AlmaGo.

Ne l’activer que si souhaité et seulement après avoir configuré un plafond de dépenses fournisseur. Les clés restent dans GitHub Secrets ; aucune clé ne doit être copiée dans une Issue, un commit ou le chat.
