# AlmaGo — intervention minimale du propriétaire

Ce fichier contient uniquement les actions qui nécessitent forcément le compte du propriétaire. Tout le reste doit être automatisé dans le repository.

## À faire maintenant pour activer Gemini/Grok

Dans **GitHub → AlmaGo → Settings → Secrets and variables → Actions** :

1. Ajouter au moins un secret fournisseur :
   - `GEMINI_API_KEY`
   - et/ou `XAI_API_KEY`
2. Configurer chez le fournisseur un plafond de dépense bloquant avant activation.
3. Dans **Variables**, définir :
   - `ALMAGO_AI_BILLING_CAP_CONFIRMED=true`
   - `ALMAGO_AI_ENABLED=true`

Ne jamais mettre une clé API dans une Issue, un commit, une variable publique ou ce fichier.

## Plus tard — uniquement quand les tâches correspondantes sont atteintes

### E2E authentifiés

Les comptes **de test uniquement** existent déjà dans Supabase et leurs rôles étudiant/admin ont été vérifiés le 23/09/2026. Ne pas en créer de nouveaux. Si nécessaire, réinitialiser uniquement leurs mots de passe depuis Supabase, puis ajouter dans GitHub Actions Secrets :

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `ALMAGO_E2E_STUDENT_EMAIL`
- `ALMAGO_E2E_STUDENT_PASSWORD`
- `ALMAGO_E2E_ADMIN_EMAIL`
- `ALMAGO_E2E_ADMIN_PASSWORD`

Enfin définir `ALMAGO_AUTH_E2E_ENABLED=true`. Tant que cette variable reste absente/fausse, le workflow authentifié est ignoré. Après un run réussi, A43 est clôturée automatiquement ; aucune manipulation manuelle de label n’est nécessaire.

### Observabilité

Créer/choisir le compte Sentry ou analytics lors de A44, puis placer les secrets directement dans GitHub. Aucun secret ne doit passer dans le chat.

### Design Figma

Connecter Figma à ChatGPT/Codex quand tu veux activer la boucle design visuelle. Cette connexion nécessite ton action dans l’interface ; elle ne doit pas bloquer les tâches de code non visuelles.

## Codex / OpenAI

Le système n’utilise pas Codex pour les petites tâches. Les tâches sensibles ou complexes sont placées dans `almago-codex-required`. Si le quota OpenAI est épuisé, elles attendent sans bloquer les tâches Gemini/Grok déjà sûres, sauf quand elles sont une dépendance obligatoire du plan.
