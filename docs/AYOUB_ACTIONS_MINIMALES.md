# AYOUB — Actions minimales requises avant lancement

Le système AlmaGo est conçu pour réduire l’intervention propriétaire, mais certaines étapes ne peuvent pas être automatisées de façon sûre.

## État actuel

Master Plan : **41/45 — 91 %** *(compteur historique du plan A01–A45, pas un score de readiness lancement)*.

Chaîne de release :

**A38 juridique → A43 E2E authentifiés → A44 observabilité → A45 gate final Render**

Runtime canonique de recette :

`https://almago-dev.onrender.com`

GitHub Actions a actuellement un incident séparé : les workflows sont créés mais certains jobs échouent avant toute étape avec `steps: null`. Suivi : #286.

## Séquence release candidate — un seul SHA

Avant l’approbation finale A38, terminer et merger uniquement les changements réellement destinés au lancement, puis finaliser la protection de `main` suivie dans #336.

Ensuite :

1. relever le **SHA exact** du release candidate sur `main` ;
2. ne plus merger ni pousser sur `main` pendant la séquence de preuve ;
3. exécuter **A38 → A43 → A44 → A45** contre ce même SHA ;
4. si `main` change avant A45, considérer les preuves exact-SHA précédentes comme périmées et recommencer la chaîne de preuve sur le nouveau SHA.

C’est une règle d’intégrité de preuve. Elle ne déclenche aucun verrouillage, merge ou déploiement automatique.

## Ce qu’il te reste réellement à faire

### A38 — juridique

Suivi humain/juridique : #66. La proposition de rétention/suppression, la matrice de finalisation et les faits Render/Vercel doivent rester alignés avec le `main` courant.

Compléter `docs/A38_OWNER_CONFIRMATION.md`, décider conservation/suppression, faire relire les textes, puis n’activer `A38_REVIEW_READY: true` qu’une fois les placeholders réellement résolus.

Après la relecture humaine, poster exactement :

`A38 HUMAN REVIEW APPROVED`

sur l’issue A38.

### A43 — E2E étudiant/admin

Les comptes test existent déjà.

Il manque uniquement deux GitHub Actions Secrets :

- `ALMAGO_E2E_STUDENT_PASSWORD`
- `ALMAGO_E2E_ADMIN_PASSWORD`

Les e-mails test sont déjà définis par défaut dans le workflow. Aucune variable d’activation supplémentaire n’est nécessaire.

Le workflow ne pourra toutefois produire une vraie preuve tant que #286 empêche le runner GitHub d’exécuter ses étapes.

Suivi durable : #84 (A43), #286 (runner GitHub Actions) et #448 (preuve exact-main). Le workflow conserve la cible Render avec réveil `/api/health`, le mode local et les garde-fous main-only/A38.

### Render

Suivi : #389.

Dans le dashboard Render :

- reconnecter/réautoriser GitHub si nécessaire ;
- vérifier qu’un push sur `main` déclenche réellement un deploy ;
- définir `/api/health` comme health check.

Le service est Free et peut afficher un écran de réveil après inactivité. Un éventuel plan payant est une décision séparée.

### Catalogue production — terminé

#176 est clôturée. Le journal de clôture indique :

- 1 recommandation test archivée ;
- 7 programmes test désactivés ;
- 8 universités test désactivées ;
- aucun DELETE ;
- post-contrôle : 0 fixture active.

**Ne pas rejouer cette opération depuis ce document.**

### A44 — observabilité

Après A38 + A43 :

- choisir le fournisseur ;
- définir rétention/consentement ;
- stocker les secrets dans Render/GitHub ;
- tester avec données synthétiques ;
- activer seulement après vérification de l’allow-list et de la confidentialité.

Le runtime est Render, pas Vercel.

Intégrité de preuve A44 exact-main : #433. La preuve doit être produite depuis le SHA exact du `main` courant, puis `main` revérifié avant toute clôture A44.

### Supabase Auth

#179 suit la décision optionnelle d’un passage Pro pour la protection contre mots de passe compromis.

### Protection GitHub

#336 suit la protection de `main`.

Ne pas exiger le check GitHub Actions cassé tant que #286 n’est pas résolu.

### A45

Suivi durable : #406 (gate final Render) et #439 (protection de `main`). Le gate doit exiger que `main` soit protégée (#336) et que le service live rapporte le SHA exact de `main` avant de publier `RELEASE GATE: READY`.

## Ce qui n’est pas requis maintenant

- activer Gemini/Grok ;
- connecter Figma ;
- passer Render ou Supabase sur un plan payant ;
- créer de nouveaux comptes E2E ;
- fournir les e-mails E2E comme secrets ;
- créer une variable `ALMAGO_AUTH_E2E_ENABLED`.

## Garde-fous

- aucun secret dans GitHub Issues, commits, logs ou chat ;
- aucune vraie donnée étudiant dans les E2E ;
- aucune modification Auth/RLS/Storage pour faire passer un test ;
- aucune fusion automatique ;
- aucune montée de plan payant automatique.
