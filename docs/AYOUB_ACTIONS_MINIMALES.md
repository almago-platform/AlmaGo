# AYOUB — Actions minimales requises avant lancement

## État actuel

Le compteur historique Phase 1 est **41/45 — 91 %**. Ce n'est pas un score de readiness produit.

Chaîne de fermeture :

**freeze → P2.4 → A38 → P2.3 email → A43 Render → offres/paiement → A44/P2.10 → QA finale → A45**

Chaîne de preuve Phase 1 sur un même SHA :

**A38 → A43 → A44 → A45**

Runtime canonique :

`https://almago-dev.onrender.com`

Infrastructure déjà résolue :
- GitHub Actions fonctionne ;
- `main` est protégé ;
- le check global requis est `verify` ;
- Render auto-deploy est restauré ;
- `/api/health` est configuré ;
- Vercel reste un miroir/preview utile mais n'est pas le runtime canonique ni un required check.

## Ce qu'il te reste réellement à faire

### 1. P2.4 — ajouter un secret serveur GitHub

Dans GitHub Actions Secrets, ajouter :

`SUPABASE_SECRET_KEY`

Ne jamais copier sa valeur dans le chat ou une Issue.

Ensuite la preuve #674 pourra tester signup, confirmation, login, reset, claim, idempotence et rejet d'un autre utilisateur.

### 2. A38 — finir les décisions juridiques humaines

À confirmer/finaliser :
- adresse publique ;
- identifiants légaux/fiscaux si applicables ;
- DPO ;
- activité réglementée éventuelle ;
- bases juridiques ;
- transferts internationaux ;
- autorité/droit/litiges ;
- relecteur compétent ;
- version/date d'entrée en vigueur.

Puis faire relire les textes et utiliser le gate A38.

### 3. Email transactionnel

Configurer le compte Resend, le domaine d'envoi et l'expéditeur. Les secrets vont dans l'environnement, jamais dans le repo/chat.

Après A38 : test réel FR + AR/RTL.

### 4. A43

Après A38, lancer **AlmaGo Authenticated E2E** sur `main` avec cible **Render**. Le workflow vérifie le SHA exact et peut fermer A43 automatiquement si tout passe.

### 5. Offres commerciales

Décider pour Bronze / Silver / Gold :
- services ;
- limites ;
- support ;
- prix ;
- devise.

Aucune offre n'est encore publiée dans le Supabase cible.

### 6. Paiement

Choisir/onboarder un prestataire compatible avec ton établissement réel. La base et la machine d'état P2.9 sont déjà déployées et testées ; il manque le vrai checkout/webhook et la preuve fournisseur.

### 7. A44 / analytics

Après A38 + A43 :
- choisir le fournisseur ;
- garder l'auto-capture intrusive désactivée ;
- appliquer la rétention/consentement ;
- tester uniquement avec événements allow-listés et données synthétiques.

### 8. Sécurité finale

Traiter les derniers advisors Supabase pertinents, notamment la protection contre mots de passe compromis si disponible sur le plan retenu.

### 9. A45

Quand toutes les preuves sont sur le même release candidate, lancer le Final Release Gate et saisir `RELEASE`.

Le gate doit confirmer le SHA exact de Render avant `RELEASE GATE: READY`.

## Ce que tu n'as plus à refaire

- réparer GitHub Actions ;
- créer les comptes E2E étudiant/admin ;
- reconnecter Render GitHub ;
- configurer le health check Render ;
- protéger `main` ;
- nettoyer les anciennes fixtures catalogue ;
- activer Gemini/Grok pour pouvoir lancer le produit.

## Garde-fous

- aucun secret dans le chat ;
- aucune donnée étudiante réelle pour les tests ;
- aucune publication commerciale avant CGV/prix réels ;
- aucune activation marketing/analytics avant A38/A44 ;
- pas de modification non indispensable après le freeze.


## Non requis maintenant

- activer Gemini/Grok ou un autre fournisseur IA externe ;
- changer de plan Render/Supabase sans besoin validé ;
- recréer les comptes E2E ;
- réouvrir les incidents #286/#389/#336 déjà résolus.
