# AlmaGo — Quality Gates

La qualité navigateur complète les contrôles existants `npm test`, TypeScript, ESLint, build et sécurité/RLS.

## Contrôles automatiques publics

Le workflow **AlmaGo Browser Quality** exécute sur une build de production locale :

- Chromium desktop 1440×900 ;
- Chromium mobile 390×844 ;
- chargement de la landing, login, signup et unauthorized ;
- absence de débordement horizontal ;
- audit axe sur les violations `serious` et `critical` ;
- screenshots full-page conservés 7 jours ;
- Lighthouse sur la landing et login.

Les tests Playwright et axe sont bloquants. Les budgets Lighthouse sont d’abord **advisory** afin de mesurer la baseline sans bloquer le chantier ; ils pourront devenir bloquants une fois les scores stabilisés.

## Contrôles authentifiés

Les parcours étudiant/admin ne doivent pas utiliser de vraies données personnelles. Ils seront activés dans A43 uniquement avec deux comptes de test et des secrets GitHub dédiés.

## Design review

Les screenshots sont la base de la future revue visuelle automatique et de la comparaison avec les références Figma. Figma reste une connexion propriétaire : le code peut avancer sans cette connexion, mais l’intégration directe nécessite l’action du propriétaire.
