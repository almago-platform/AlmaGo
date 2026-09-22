# AlmaGo Autonomous Development Protocol

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
- ajoute dans la PR :

`ALMAGO REVIEW REQUEST`

avec obligatoirement une ligne :

`REMOTE HEAD: <sha GitHub exact de la PR>`

et :

- objectif ;
- fonctionnalités terminées ;
- migrations ;
- sécurité/RLS ;
- tests ;
- bugs corrigés ;
- risques ;
- prochaine étape proposée.

Puis arrête-toi.

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

Le workflow `AlmaGo Codex Patch Bridge` appliquera ce patch de façon contrôlée sur la branche distante, poussera le commit, vérifiera le nouveau HEAD GitHub, puis publiera lui-même `ALMAGO REVIEW REQUEST`.

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
