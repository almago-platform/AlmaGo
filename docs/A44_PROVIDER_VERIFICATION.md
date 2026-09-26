# A44 — vérification fournisseur observabilité

A44_PROVIDER_VERIFIED: false

**Statut : fiche interne de vérification. Aucun secret, token, DSN privé ou clé API ne doit être ajouté ici.**

Cette fiche devient la preuve non sensible qu'un fournisseur réel a été connecté et vérifié avant que le gate A44 puisse clôturer la tâche.

## Configuration à confirmer

- Fournisseur : **[À REMPLIR]**
- Mode d'intégration : **[À REMPLIR]**
- Région / localisation des données connue : **[À REMPLIR]**
- Rétention configurée : **[À REMPLIR]**
- Capture automatique de données utilisateur : **[DÉSACTIVÉE / DÉCRIRE]**
- Session replay : **[DÉSACTIVÉ / DÉCRIRE]**
- Capture d'URL complète / query strings : **[DÉSACTIVÉE / DÉCRIRE]**
- Capture de payload réseau / corps de requêtes : **[DÉSACTIVÉE / DÉCRIRE]**
- Consentement / information utilisateur revue dans A38 : **[OUI / N/A + MOTIF]**
- Test synthétique sans donnée réelle : **[PASS / DÉCRIRE]**
- Date du test : **[À REMPLIR]**
- Relecteur : **[À REMPLIR]**

## Conditions pour passer A44_PROVIDER_VERIFIED à true

Toutes les conditions suivantes doivent être vraies :

1. A38 est terminée ;
2. A43 est terminée ;
3. le fournisseur est réellement connecté à l'environnement de production prévu ;
4. les secrets restent hors du dépôt ;
5. les événements envoyés respectent `config/telemetry-events.json` ;
6. aucune donnée interdite par `docs/observability.md` n'est envoyée ;
7. les réglages fournisseur automatiques ont été inspectés ;
8. un événement synthétique/test a été observé côté fournisseur ;
9. la rétention et le consentement/information ont été revus.

Seulement après cette vérification, remplacer :

`A44_PROVIDER_VERIFIED: false`

par :

`A44_PROVIDER_VERIFIED: true`.

Le workflow A44 vérifie ensuite cette fiche, les variables repository et les tests de frontière confidentialité avant de clôturer A44.
