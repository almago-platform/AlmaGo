# AlmaGo V3 — déploiement multilingue

**Statut : fondation prête, traductions publiques non encore activées**  
**Date : 24 septembre 2026**

## Principe

AlmaGo ne doit pas afficher un sélecteur de langue simplement pour paraître international.

Une langue devient visible uniquement lorsque les pages principales sont entièrement traduites, relues et testées dans cette langue.

## Langues prévues

- Français — prêt, langue publique actuelle.
- English — prévu.
- Deutsch — prévu.
- العربية — prévu, avec prise en charge RTL.

La source technique de vérité est `src/lib/public-locales.ts`.

## Pages à couvrir avant activation d'une langue

1. homepage ;
2. connexion / inscription / récupération ;
3. Centre d’aide ;
4. Comprendre les démarches ;
5. Selon votre pays de diplôme ;
6. espace étudiant : shell, dossier, profil, documents, démarches, orientation, candidatures ;
7. erreurs, états vides et confirmations ;
8. pages juridiques après validation A38.

## Critères de qualité

Une langue ne passe à `ready` que si :

- toutes les pages ci-dessus sont couvertes ;
- aucune traduction automatique brute n'est exposée sans relecture ;
- les termes administratifs allemands importants restent reconnaissables et sont expliqués ;
- les dates, pluriels et formats sont adaptés ;
- les liens officiels restent identiques et valides ;
- les limites du rôle d'AlmaGo sont conservées ;
- la navigation mobile est vérifiée ;
- l'accessibilité est vérifiée ;
- l'arabe est contrôlé en RTL ;
- les textes juridiques sont traités séparément et validés.

## Règle d'activation

Tant qu'une langue est `planned`, AlmaGo ne doit pas la proposer comme langue disponible à l'utilisateur.

Cela évite les pages partiellement traduites, les mélanges de langues et une impression de service inachevé.
