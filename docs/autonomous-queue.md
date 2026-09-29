# File de tâches AlmaGo avec Gemini et Groq

Le **Master Orchestrator** et le dispatcher autonome vérifient la file toutes les
**5 minutes**. Une tâche prête peut déclencher **AlmaGo AI Task Queue** uniquement
quand `ALMAGO_AI_ENABLED=true` et `ALMAGO_AI_FREE_ONLY=true`.

La file utilise d’abord **Gemini 2.5 Flash**. Si Gemini ne peut pas produire un
patch utilisable, elle essaie **Groq** avec `openai/gpt-oss-120b` lorsqu’une clé
Groq est configurée. Aucun xAI/Grok, Claude ou OpenAI API payant n’est utilisé
dans cette file free-only. Si tous les fournisseurs gratuits configurés sont
temporairement indisponibles ou limités, l’issue revient à `almago-ai-ready`
pour un cycle ultérieur au lieu d’être bloquée.

Il ouvre une PR après validation locale, vérifie le HEAD distant et déclenche
`AlmaGo PR CI`. La revue et la fusion restent humaines. Les autres workflows
Codex/superviseur sont indépendants et conservent leurs propres clés et quotas.
Le polling à 5 minutes ne signifie pas un appel Gemini toutes les 5 minutes :
sans tâche prête, sans variables d’activation ou lorsque le plafond journalier est
atteint, aucun travail fournisseur n’est lancé. GitHub Actions peut aussi être
retardé ou indisponible ; la cadence n’est donc pas une garantie temps réel.

## Activer en mode gratuit

1. Créer une clé Gemini dans Google AI Studio. Gemini 2.5 Flash dispose d’un
   Free Tier, avec des quotas définis par Google.
2. Facultatif mais recommandé : créer une clé Groq gratuite afin d’utiliser
   `openai/gpt-oss-120b` comme fallback. Dans GitHub,
   **Settings → Secrets and variables → Actions**, ajouter :
   - `GEMINI_API_KEY` ;
   - `GROQ_API_KEY` si Groq est utilisé.
   Ne jamais mettre une clé dans une issue, un fichier source ou une variable publique.
3. Dans *repository variables*, définir :
   - `ALMAGO_AI_ENABLED=true` ;
   - `ALMAGO_AI_FREE_ONLY=true` ;
   - optionnellement `ALMAGO_MAX_AI_TASKS_PER_DAY=10` ou jusqu’à `12`.
   Il n’est pas nécessaire de définir `ALMAGO_AI_BILLING_CAP_CONFIRMED` pour
   cette file. Les variables `ALMAGO_GEMINI_MODEL` et `ALMAGO_GROQ_MODEL`
   restent optionnelles.


4. Préparer une issue courte avec le label `almago-ai-ready` et la forme suivante.
   Les chemins doivent viser 1 à 3 fichiers existants dans `src/app/`,
   `src/components/`, `src/content/` ou `src/lib/`. Le label est retiré dès la prise en charge.

```md
<!-- almago-ai-task -->
Files:
- src/app/page.tsx
Goal: Clarify the main action on the home page.
Acceptance: The primary action is understandable on mobile.
```

Les issues autonomes courtes portant `almago-ai-ready` et le marqueur
`<!-- almago-ai-task -->` sont aussi prises automatiquement par le Master
Orchestrator lorsqu'aucune tâche du plan principal n'est à dispatcher. Elles sont
traitées dans l'ordre de création, une à la fois, avec les mêmes limites de quota,
de scope et de sécurité.

Pour une tâche précise, il reste possible de lancer **Actions → AlmaGo AI Task Queue → Run workflow**
avec son numéro d'issue. L'issue doit porter `almago-ai-ready`. Une tâche bloquée
prend le label `almago-ai-blocked` et demande une inspection avant toute relance.
Une PR ouverte prend le label `almago-ai-proposed`; le travail suivant se prépare
avec une nouvelle issue et ne modifie jamais cette PR automatiquement.

## Limites et contrôle

- Un lancement traite une issue et utilise au maximum deux appels fournisseur :
  Gemini puis Groq, ou un constructeur puis un reviewer indépendant. Les quotas
  gratuits réels des fournisseurs restent prioritaires.
- Le correctif doit être un diff unifié appliqué seulement aux fichiers désignés.
  Fichiers secrets, workflows, migrations, permissions et création/suppression de
  fichiers sont exclus.
- Les chemins sensibles sont refusés techniquement, pas seulement par le prompt :
  `src/app/api/`, `src/app/admin/`, les écrans/composants d’authentification,
  les composants admin, `src/lib/supabase/` et les helpers de rôles/permissions/
  sécurité ne peuvent pas être modifiés par la file autonome.
- Les patchs qui ajoutent des références à des clés secrètes, au service role,
  aux rôles admin ou à de l’exécution dynamique (`eval`/`new Function`) sont
  rejetés. Une proposition autonome est aussi limitée à 300 lignes modifiées.
- Tests, TypeScript, lint et build passent avant publication. Le CI distant
  recommence les vérifications sur le vrai commit de la PR.
- L'historique Actions permet de suivre les échecs et les quotas. L'absence de
  clés ou des variables free-only garde la file inactive. La file n'utilise
  volontairement aucun fournisseur payant.


## Revue indépendante Gemini ↔ Groq

Quand les deux fournisseurs sont configurés et que le premier patch a été obtenu au premier appel, AlmaGo utilise le second fournisseur comme reviewer indépendant. Le budget reste borné à **deux appels fournisseur maximum** : un appel de construction + un appel de revue. Si le constructeur a déjà utilisé le fallback (deux appels), la revue croisée est sautée plutôt que de dépenser un troisième appel.

Le reviewer ne produit pas de code. Il rend `APPROVED` ou `REVISE` en contrôlant le scope, les critères d’acceptation, les promesses produit, la sécurité et les régressions évidentes. Un verdict `REVISE` bloque la proposition avant création de PR.


## Plafond journalier de travail IA

La file applique aussi un plafond journalier de lancements fournisseur. Par défaut, au maximum **10 exécutions effectives de la file IA par jour UTC** peuvent passer le plafond journalier. Le Master Orchestrator peut vérifier le dépôt toutes les 5 minutes sans augmenter ce plafond. Une variable optionnelle `ALMAGO_MAX_AI_TASKS_PER_DAY` permet de choisir une valeur entre 1 et 12. Une fois le plafond atteint, l’Issue reste `almago-ai-ready` et attend le jour suivant ; aucun appel fournisseur supplémentaire n’est effectué.

Ce plafond opérationnel complète les quotas gratuits imposés par Google et Groq. Si un fournisseur renvoie une limite temporaire, la tâche peut être remise en attente pour un cycle ultérieur.
