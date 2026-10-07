# AlmaGo

AlmaGo est une application Next.js pour l’accompagnement de candidats et étudiants vers l’Allemagne.

## Stack

- Next.js App Router + TypeScript
- React
- Supabase Auth, PostgreSQL et Storage privé
- Render comme runtime canonique
- GitHub Actions pour CI, qualité navigateur, E2E authentifiés et release

## Développement local

Pré-requis : Node.js 22+ et npm.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Variables minimales :

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Les clés serveur ne doivent jamais être placées dans `NEXT_PUBLIC_*` ni commitées.

## Base de données

Les migrations sont versionnées dans `supabase/migrations/`.

```bash
npx supabase link --project-ref VOTRE_PROJECT_REF
npx supabase db push --dry-run
npx supabase db push
```

Ne pas réécrire ou supprimer l’historique de migrations déjà appliqué en production.

Les tables exposées utilisent RLS. Les documents étudiants sont stockés dans un bucket privé et les contrôles d’autorisation restent côté serveur et base de données.

## Vérifications avant merge

```bash
npm test
npx tsc --noEmit
npm run lint
npm run build
git diff --check
```

La CI exécute aussi les tests d’autorisation Supabase locaux et les contrôles navigateur pertinents.

## Déploiement

`main` est déployée automatiquement sur Render. Le runtime doit exposer `/api/health` avec la branche et la révision de déploiement, sans secret.

Le workflow **AlmaGo Release Gate** vérifie le build et confirme que Render sert exactement la révision `main` attendue avant une release.

Voir :

- `docs/release-checklist.md`
- `docs/render-runbook.md`
- `docs/quality-gates.md`
- `docs/authenticated-e2e.md`
- `docs/observability.md`
