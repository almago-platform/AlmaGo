# AlmaGo — Repository Health

La maintenance dépendances ne doit pas consommer le temps du propriétaire.

- Dependabot propose au maximum deux PR npm et deux PR GitHub Actions en parallèle.
- Les mises à jour automatiques de version sont limitées aux patchs/minor ; les upgrades majeurs restent volontaires.
- Chaque lundi, `AlmaGo Repository Health` rejoue tests, TypeScript et lint puis archive un rapport npm audit/outdated.
- L’audit de dépendances est informatif : aucune dépendance n’est mise à jour ou supprimée directement par le rapport.
- Les PR Dependabot repassent dans les contrôles normaux du repository avant toute fusion.
