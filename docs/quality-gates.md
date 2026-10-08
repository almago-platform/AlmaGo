# AlmaGo — Quality Gates

AlmaGo conserve uniquement des contrôles qui protègent le produit actuel.

## Pull requests

**AlmaGo PR CI** vérifie :

- tests applicatifs et métier ;
- tests d’autorisation Supabase ;
- TypeScript ;
- ESLint ;
- build Next.js de production ;
- syntaxe des workflows ;
- `git diff --check`.

## Browser Quality

**AlmaGo Browser Quality** se déclenche sur les changements UI pertinents et vérifie la régression responsive/accessibilité avec Playwright.

Le contrôle couvre les largeurs mobiles et desktop principales, l’absence de débordement horizontal, les parcours RTL utiles et les préférences de réduction des animations.

Un dispatch manuel peut exécuter la suite navigateur complète et Lighthouse en mode advisory.

## Authenticated E2E

**AlmaGo Authenticated E2E** est manuel et utilise exclusivement des comptes de test dédiés.

Il vérifie :

- isolation étudiant/admin ;
- espace étudiant ;
- espace admin ;
- responsive et accessibilité sur les parcours authentifiés.

## Release

**AlmaGo Release Gate** s’exécute uniquement depuis `main`.

Il rejoue tests, typecheck, lint et build puis vérifie que le runtime Render sert exactement le SHA courant avant les smoke tests publics.

Aucun workflow de qualité ne doit modifier les données métier de production, affaiblir RLS/Auth ou contourner une build défaillante.
