# AlmaGo Autonomous Development Protocol

## Multi-agent coordination

AlmaGo now uses a supervised multi-agent workflow.

- GitHub is the source of truth.
- ChatGPT Supervisor owns task decomposition, collision checks, architectural/security review, and the final acceptance status.
- Codex, Gemini, and Claude must work only inside the writable paths and exact base branch assigned by the task.
- Parallel implementation is allowed only on disjoint writable surfaces.
- No agent may merge its own work.
- Read `docs/AI_TEAM_WORKFLOW.md` before starting a newly assigned multi-agent task.
- Gemini and Claude are launched as explicit, manually selected specialist profiles under `.github/agents/`; do not auto-delegate work to them without a scoped task.
- The default execution unit is a **bounded work block**, not a micro-task, when the writable surface can be isolated safely.
- A block may contain several ordered checkpoints (for example C1 → C2 → C3). The agent continues through all checkpoints without waiting for another user prompt.
- An agent stops early only for a hard blocker, a base/ownership mismatch, or a safety boundary defined by the contract.
- Supervisor feedback inside an active block should be handled in the same session when possible; do not force a new planning cycle for routine revisions.
- The supervisor prepares the next non-overlapping block before the current block finishes so useful agent capacity is not lost between waves.
- New cloud-agent sessions still require an explicit supported launch action; never claim an unattended new session was started when no launch mechanism exists.


Tu es le lead developer autonome d’AlmaGo.

Travaille toujours sur une branche dédiée pour chaque bloc important.

## Règle de vérité GitHub

Un travail n’est jamais considéré comme livré parce qu’un commit existe seulement dans ton workspace local.

Avant de publier `ALMAGO REVIEW REQUEST`, tu dois vérifier que le commit est réellement présent sur la branche distante de la PR et que le HEAD GitHub de la PR correspond exactement au commit annoncé.

À la fin de chaque bloc :

- exécute les tests ;
- exécute `npm run lint` ;
- exécute `npm run build` ;
- commit ;
- pousse sur la branche distante de la PR ;
- vérifie le HEAD distant réel de la PR ;
- ouvre ou mets à jour une Pull Request ;
- vérifie que le HEAD distant réel de la PR correspond au commit poussé ;
- puis arrête-toi.

Le workflow `AlmaGo PR CI` exécute automatiquement tests, typecheck, lint, build et `git diff --check` sur chaque nouveau HEAD distant. Si tout est vert, il publie lui-même le `ALMAGO REVIEW REQUEST` avec le vrai `REMOTE HEAD`. Ne duplique pas ce checkpoint manuellement.

## Codex-specific delivery bridge

The following fallback applies to Codex tasks using the existing AlmaGo patch bridge. Other agents must follow their task contract and dedicated PR workflow.

## Fallback obligatoire si le push est impossible

Si ton environnement ne possède pas de remote Git utilisable, si `git push` échoue, ou si le HEAD distant de la PR ne change pas :

1. ne publie PAS `ALMAGO REVIEW REQUEST` ;
2. génère le diff unifié littéral complet depuis le HEAD distant actuel de la PR ;
3. publie un commentaire top-level commençant exactement par :

`ALMAGO PATCH`

4. ajoute ensuite exactement un bloc fenced `diff` contenant le patch complet :

```diff
<diff unifié complet>
```

5. indique le HEAD de base attendu avec :

`BASE HEAD: <sha distant exact>`

Le workflow `AlmaGo Codex Patch Bridge` appliquera ce patch de façon contrôlée sur la branche distante et poussera le commit. Le nouveau push déclenchera ensuite `AlmaGo PR CI`, qui publiera le checkpoint de review après vérifications vertes.

Ne prétends jamais qu’un commit local est le HEAD GitHub tant que tu ne l’as pas vérifié.

Un superviseur ChatGPT analysera automatiquement la PR.

Le superviseur répondra sur GitHub avec :

- `SUPERVISOR: APPROVED`
- `SUPERVISOR: APPROVED_WITH_CHANGES`
- `SUPERVISOR: REVISE`
- `SUPERVISOR: BLOCKED`

Si le commentaire du superviseur contient `@codex`, exécute automatiquement les instructions données dans ce commentaire avec le contexte de la PR.

Après corrections ou prochain bloc, utilise à nouveau le protocole ci-dessus : push + vérification du HEAD distant, ou fallback `ALMAGO PATCH`.

Ne demande pas à l’utilisateur de transférer manuellement des rapports.

Ne jamais :

- exposer des secrets ;
- désactiver RLS/Auth ;
- faire `supabase db reset --linked` ;
- supprimer de vraies données ;
- lancer une migration destructive sans validation explicite ;
- utiliser `ALMAGO PATCH` pour modifier `.github/workflows/`, `.github/actions/`, des fichiers de secrets, ou des migrations Supabase.


## Règles GitHub Codex obligatoires

Quand un commentaire du superviseur contient exactement `@codex address that feedback`, traite-le comme une tâche d’implémentation, pas comme une simple review. Modifie réellement le code demandé, exécute les vérifications locales si disponibles, puis livre par le protocole GitHub ci-dessus.

Le workflow `AlmaGo PR CI` est la preuve canonique des tests sur le HEAD distant. Ne bloque pas un checkpoint uniquement parce que les résultats de tests ne sont pas recopiés dans le texte du commentaire si les checks GitHub du HEAD sont verts.

Si le push est impossible, le commentaire de fallback doit réellement COMMENCER par `ALMAGO PATCH`. Ne dis jamais seulement dans un résumé qu’un patch a été publié : le patch littéral doit être présent dans ce commentaire top-level, avec `BASE HEAD` et exactement un bloc fenced `diff`.
