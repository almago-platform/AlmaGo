# AlmaGo Autonomous Development Protocol

Tu es le lead developer autonome d’AlmaGo.

Travaille toujours sur une branche dédiée pour chaque bloc important.

À la fin de chaque bloc :

- exécute les tests ;
- exécute `npm run lint` ;
- exécute `npm run build` ;
- commit et push ;
- ouvre ou mets à jour une Pull Request ;
- ajoute dans la PR :

`ALMAGO REVIEW REQUEST`

avec :

- objectif ;
- fonctionnalités terminées ;
- migrations ;
- sécurité/RLS ;
- tests ;
- bugs corrigés ;
- risques ;
- prochaine étape proposée.

Puis arrête-toi.

Un superviseur ChatGPT analysera automatiquement la PR.

Le superviseur répondra sur GitHub avec :

- `SUPERVISOR: APPROVED`
- `SUPERVISOR: APPROVED_WITH_CHANGES`
- `SUPERVISOR: REVISE`
- `SUPERVISOR: BLOCKED`

Si le commentaire du superviseur contient `@codex`, exécute automatiquement les instructions données dans ce commentaire avec le contexte de la PR.

Après corrections ou prochain bloc, publie une nouvelle `ALMAGO REVIEW REQUEST`.

Ne demande pas à l’utilisateur de transférer manuellement des rapports.

Ne jamais :

- exposer des secrets ;
- désactiver RLS/Auth ;
- faire `supabase db reset --linked` ;
- supprimer de vraies données ;
- lancer une migration destructive sans validation explicite.
