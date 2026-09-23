# File de tâches AlmaGo avec Gemini et Grok

Le workflow **AlmaGo AI Task Queue** examine au plus une issue par lancement quotidien
(03:17 UTC). Il appelle Gemini une fois, puis Grok une fois seulement si Gemini répond
401, 402, 403 ou 429. Si une clé manque, le fournisseur correspondant est ignoré.
Une réponse invalide ou des tests en échec bloquent la tâche sans nouvelle dépense.

Il ouvre une PR après validation locale, vérifie le HEAD distant et déclenche
`AlmaGo PR CI`. La revue et la fusion restent humaines. Les autres workflows
Codex/superviseur sont indépendants et conservent leurs propres clés et quotas.
GitHub Actions peut être retardé ou indisponible : « quotidien » ne signifie pas
continu ni garanti en permanence.

## Activer avec un budget de 10 € par mois

1. Créer des clés API de service chez Google AI Studio et, si souhaité, xAI.
   Configurer chez chaque fournisseur un plafond de dépenses bloquant
   compatible avec **10 € au total par mois**, ou un solde prépayé sans recharge
   automatique. Si un plafond ferme assez bas n'est pas disponible, ne pas activer
   le fournisseur payant. Vérifier devises, frais, seuils et tarifs dans leurs
   consoles respectives. Les limites de fréquence du workflow ne constituent
   pas une garantie de plafond financier.
2. Dans GitHub, **Settings → Secrets and variables → Actions**, ajouter au moins
   `GEMINI_API_KEY` ou `XAI_API_KEY` comme *repository secret*. Ne jamais mettre
   une clé dans une issue, un fichier source ou une variable publique.
3. Dans *repository variables*, définir `ALMAGO_AI_BILLING_CAP_CONFIRMED=true`
   seulement une fois les plafonds vérifiés, puis `ALMAGO_AI_ENABLED=true`.
   Supprimer `ALMAGO_AI_ENABLED` ou le passer à `false` pour arrêter la file.
   Les variables optionnelles `ALMAGO_GEMINI_MODEL` et `ALMAGO_XAI_MODEL`
   permettent de choisir un modèle disponible sur le compte.
4. Préparer une issue courte avec le label `almago-ai-ready` et la forme suivante.
   Les chemins doivent viser 1 à 3 fichiers existants dans `src/app/`,
   `src/components/` ou `src/lib/`. Le label est retiré dès la prise en charge.

```md
<!-- almago-ai-task -->
Files:
- src/app/page.tsx
Goal: Clarify the main action on the home page.
Acceptance: The primary action is understandable on mobile.
```

Pour une tâche précise, lancer aussi **Actions → AlmaGo AI Task Queue → Run workflow**
avec son numéro d'issue. L'issue doit porter `almago-ai-ready`. Une tâche bloquée
prend le label `almago-ai-blocked` et demande une inspection avant toute relance.
Une PR ouverte prend le label `almago-ai-proposed`; le travail suivant se prépare
avec une nouvelle issue et ne modifie jamais cette PR automatiquement.

## Limites et contrôle

- Un lancement traite une issue, deux requêtes API au maximum et aucun nouvel
  appel après une erreur de patch ou de validation. Les lancements manuels
  peuvent accroître la dépense : le plafond chez les fournisseurs est essentiel.
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
- L'historique Actions et les tableaux de facturation des fournisseurs permettent
  de suivre les échecs et les coûts. L'absence de clés ou de variables garde la
  file inactive et ne déclenche aucun appel API payant.


## Revue indépendante Gemini ↔ Grok

Quand les deux fournisseurs sont configurés et que le premier patch a été obtenu au premier appel, AlmaGo utilise le second fournisseur comme reviewer indépendant. Le budget reste borné à **deux appels fournisseur maximum** : un appel de construction + un appel de revue. Si le constructeur a déjà utilisé le fallback (deux appels), la revue croisée est sautée plutôt que de dépenser un troisième appel.

Le reviewer ne produit pas de code. Il rend `APPROVED` ou `REVISE` en contrôlant le scope, les critères d’acceptation, les promesses produit, la sécurité et les régressions évidentes. Un verdict `REVISE` bloque la proposition avant création de PR.


## Plafond journalier de travail IA

La file applique aussi un plafond journalier de lancements fournisseur. Par défaut, au maximum **4 exécutions de la file IA par jour UTC** peuvent passer le budget gate. Une variable optionnelle `ALMAGO_MAX_AI_TASKS_PER_DAY` permet de choisir une valeur entre 1 et 12. Une fois le plafond atteint, l’Issue reste `almago-ai-ready` et attend le jour suivant ; aucun appel fournisseur supplémentaire n’est effectué.

Ce plafond opérationnel complète — mais ne remplace jamais — le plafond financier configuré directement chez Google/xAI.
