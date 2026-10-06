# AlmaGo — Quality Gates

La qualité navigateur complète les contrôles canoniques `npm test`, TypeScript, ESLint, build, sécurité et isolation des rôles.

La référence de design figée pour V3.2 est `docs/product-system-v3-2-freeze.md`.

## CI canonique de pull request

**AlmaGo PR CI** reste le gate de construction principal. Il vérifie notamment :

- tests ;
- syntaxe YAML des workflows ;
- TypeScript ;
- lint ;
- build Next.js de production ;
- contrôle du diff.

Une PR visuelle ne remplace jamais ce gate par un simple screenshot.

## Browser Quality automatique — Public / candidate

**AlmaGo Browser Quality** se déclenche automatiquement sur les PR vers `main` lorsqu’un fichier UI/public pertinent change.

Le gate automatique est volontairement borné aux projets Chromium suivants :

- 320×720 — mobile compact ;
- 390×844 — mobile ;
- 1280×800 — desktop intermédiaire ;
- 1440×900 — desktop.

Il exécute `tests/e2e/visual-v3-2-gate.spec.mjs` et vérifie notamment :

- chargement réussi des routes publiques/candidat représentatives ;
- contenu principal visible ;
- absence de débordement horizontal ;
- présence des surfaces premium attendues ;
- vrai passage arabe `lang="ar"` + `dir="rtl"` ;
- absence de débordement sur les parcours RTL testés ;
- comportement `prefers-reduced-motion: reduce`.

Des screenshots déterministes homepage/orientation et les résultats d’échec Playwright sont conservés comme artifacts pendant 7 jours.

Le gate a déjà détecté un défaut réel à 1280 px : l’arrivée du sélecteur de langue au breakpoint `xl` élargissait le header de 24 px. Le correctif a été validé par le même gate avant merge.

## Suite navigateur manuelle complète

Un dispatch manuel de **AlmaGo Browser Quality** conserve la suite Playwright complète sur la matrice configurée :

`320 / 360 / 375 / 390 / 430 / 768 / 1024 / 1280 / 1440 / 1920`.

Le mode manuel conserve aussi les outils de revue plus coûteux ou plus larges :

- Gemini visual review, uniquement si les variables/billing gates prévus sont activés ;
- Lighthouse advisory.

Gemini et Lighthouse ne se déclenchent pas automatiquement sur chaque PR.

## Contrôles authentifiés

Les parcours Student/Admin restent séparés du gate public.

**A43 Authenticated E2E** utilise exclusivement des identités de test dédiées et vérifie :

- isolation Student/Admin ;
- matrice qualité Student Space ;
- matrice qualité Admin Space ;
- responsive/accessibilité ;
- exactitude de la révision Render lorsque la cible est Render.

Les secrets A43 ne doivent pas être copiés dans Browser Quality.

## RTL, accessibilité et motion

- Public, Prospect et Student peuvent être réellement RTL lorsqu’ils sont localisés.
- Admin reste volontairement LTR tant que l’espace Admin n’est pas localisé.
- Les valeurs techniques mixtes doivent rester isolées.
- Les interactions essentielles ne dépendent jamais d’une animation.
- `prefers-reduced-motion` doit neutraliser le mouvement non essentiel.
- Les tests axe historiques restent complémentaires aux contrôles structurels V3.2.

## Release

Le design freeze V3.2 n’est pas un lancement.

A45 reste le dernier gate de publication et conserve ses propres prérequis humains, sécurité, observabilité, E2E authentifiés et preuve de révision Render exacte.
