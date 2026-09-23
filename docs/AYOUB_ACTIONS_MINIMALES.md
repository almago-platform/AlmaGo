# AYOUB — Actions minimales requises

Le système AlmaGo est conçu pour fonctionner avec le moins d'intervention possible du propriétaire.

## Action immédiate — activer Gemini/Grok

Dans GitHub → **Settings → Secrets and variables → Actions** :

### Secrets
- `GEMINI_API_KEY` — nécessaire pour démarrer la file IA.
- `XAI_API_KEY` — optionnel mais recommandé pour fallback et revue croisée Grok.

Configurer d'abord un plafond de dépenses bloquant ou un solde prépayé chez chaque fournisseur. Ne jamais envoyer ces clés dans une issue, un commit ou un chat.

### Variables
- `ALMAGO_AI_BILLING_CAP_CONFIRMED=true`
- `ALMAGO_AI_ENABLED=true`
- optionnel : `ALMAGO_MAX_AI_TASKS_PER_DAY=4`

Une fois ces quatre éléments en place, le Master Orchestrator peut alimenter automatiquement Gemini/Grok à partir du plan.

## Action plus tard — E2E authentifiés

Pour débloquer A43, créer deux comptes **de test uniquement** (aucune donnée réelle) puis ajouter :

- `ALMAGO_E2E_STUDENT_EMAIL`
- `ALMAGO_E2E_STUDENT_PASSWORD`
- `ALMAGO_E2E_ADMIN_EMAIL`
- `ALMAGO_E2E_ADMIN_PASSWORD`
- variable `ALMAGO_AUTH_E2E_ENABLED=true`

## Action plus tard — observabilité

A44 nécessite un fournisseur d'observabilité/analytics et ses secrets. Cette étape reste volontairement bloquée tant qu'un compte n'est pas connecté.

## Figma

Figma est recommandé comme source visuelle de vérité pour le design system AlmaGo. La connexion doit être faite par le propriétaire dans ChatGPT/Figma ; aucune clé ne doit être mise dans le repository.

## Ce que le système fait sans Ayoub

- sélection de la prochaine tâche du Master Plan ;
- création et suivi des Issues ;
- routage AI / CODEX_REQUIRED / HUMAN_REQUIRED / SYSTEM ;
- Gemini puis Grok fallback ;
- revue croisée indépendante quand les deux fournisseurs sont disponibles ;
- tests, TypeScript, lint, build et diff check ;
- Playwright responsive, screenshots et axe ;
- Lighthouse advisory ;
- Vercel Preview ;
- contrôle de scope exact ;
- publication de l'état READY FOR MERGE ;
- nettoyage des branches déjà fusionnées ;
- watchdog des tâches IA bloquées.

**Aucune PR n'est fusionnée automatiquement.**
