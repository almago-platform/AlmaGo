# Partner-Ready — démonstration e-mail et paiement

Issue: #688

La page `/admin/partner-demo` est une surface de démonstration réservée au mode `ALMAGO_PARTNER_PRELAUNCH_MODE=true`.

## E-mail

Les aperçus FR et AR réutilisent le vrai générateur de contenu transactionnel, mais avec :

- un profil d'orientation synthétique ;
- des URLs sur le domaine réservé `.invalid` ;
- un iframe sandboxé ;
- aucun appel à Resend ;
- aucune clé API ;
- aucun envoi réseau.

Cette surface sert à montrer le rendu et la logique produit avant la configuration du fournisseur e-mail réel.

## Paiement

Le simulateur représente les états :

`offre sélectionnée → payment_pending → paid_pending_validation → client_active → refunded`.

Il est volontairement **UI-only** :

- 0 € ;
- aucun checkout ;
- aucun webhook ;
- aucun prestataire ;
- aucune écriture Supabase ;
- aucune modification de `customer_access`.

Le backend P2.9 réel reste séparé et fail-closed en mode Partner-Ready.

## Pourquoi cette séparation

La démonstration partenaire doit rendre le produit compréhensible sans créer la moindre possibilité d'envoyer à un utilisateur réel ou d'encaisser de l'argent avant l'établissement légal et les validations finales.

Le vrai fournisseur e-mail et le vrai prestataire de paiement seront intégrés/activés ultérieurement, avec leurs credentials exclusivement dans les environnements protégés.
