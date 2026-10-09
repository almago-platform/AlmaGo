# Campus Allemagne — Audit de français simple de la homepage

**Date :** 9 octobre 2026  
**Public principal :** futurs étudiants en Tunisie, y compris ceux qui comprennent le français courant mais pas le vocabulaire administratif.  
**Objectif éditorial :** phrases courtes, mots concrets et actions compréhensibles au premier coup d’œil. Viser un français courant proche de A2–B1 **sans prétendre à une certification linguistique**.  
**Périmètre audité :** uniquement les contenus français publics de la page d'accueil (Hero, raccourcis, À propos, six étapes illustrées, services, démonstration, FAQ, conclusion, pied de page).

## Sources contrôlées
- `src/content/native-copy.ts` → `const fr.home` (y compris le pied de page de l'accueil)
- `src/content/homepage-v42-copy.ts` → `homepageV42Copy.fr`
- Composants chargés par `src/app/page.tsx`, pour vérifier quels textes apparaissent vraiment à l'écran.

Ce document **n'est pas un audit de tout le site** : l'orientation, les formulaires, les pages de compte, les textes juridiques et les autres langues méritent une revue spécifique.

## Verdict avant corrections
Le français de la V4.4 était globalement correct, mais trop institutionnel à plusieurs endroits. Le lecteur devait comprendre des termes comme « prestations distinctes », « échéances », « organismes compétents », « données fictives », « critères » et « services activés ». Plusieurs phrases dépassaient une idée à la fois. Le risque principal était **la confusion entre l'orientation gratuite, les possibilités d'un compte gratuit et l'accompagnement payant**.

## Exemples de réécriture appliqués

| Avant | Après | Pourquoi |
|---|---|---|
| Votre projet d’études mérite plus que des informations éparpillées. | Préparez vos études en Allemagne plus facilement. | Titre direct et facile à lire |
| … informations, d’orientation et d’accompagnement … préparer chaque étape avec clarté. | … plateforme indépendante … informations, orientation gratuite … accompagnement proposé séparément. | Deux idées distinctes et une offre compréhensible |
| Sans confondre conseils, accompagnement et décisions officielles. | Nous vous guidons, mais les universités et les autorités prennent les décisions officielles. | Une responsabilité concrète |
| Une prochaine étape visible. | Savoir quoi faire ensuite. | Moins abstrait |
| Une relation transparente. | Des services expliqués clairement. | Ce que cela signifie pour l'étudiant |
| Aperçu explicatif — données fictives, sans accès à un dossier réel. | Exemple avec des données inventées : ce n’est pas un vrai dossier étudiant. | Explique « fictif » |
| Échéances. | Dates importantes. | Mot courant |
| Prestations proposées et leurs conditions. | Les services et le prix avant de décider. | Rend visible ce qui est payant |
| Préparer mes documents : « Ajoutez vos diplômes… » | « Rassemblez vos diplômes… » | N'insinue pas que le stockage de documents est gratuit |
| « Critères et sources officielles » | « Conditions et sites officiels » | Vocabulaire plus facile |

## Limites de confiance et de services — à préserver
1. **Orientation gratuite :** peut commencer sans compte et sans paiement.
2. **Compte gratuit :** retrouver son projet et ses options si l'orientation est liée au compte ; ne pas promettre toutes les fonctions client.
3. **Accompagnement :** facultatif, proposé séparément ; accès à certains outils seulement après offre acceptée, paiement et confirmation.
4. **Admission et visa :** aucune garantie ; les établissements et les autorités officiels décident.
5. **Préparation des candidatures :** Campus Allemagne aide à préparer ; l'étudiant suit la procédure de candidature indiquée par l'université.
6. **Liens et sources :** vérifier les conditions sur les sites officiels.

## Points à conserver
- Le ton respectueux (« vous »), avec des verbes concrets : commencer, choisir, vérifier, préparer, retrouver.
- Les mots **admission**, **visa**, **candidature**, **orientation**, **accompagnement** : ils sont nécessaires, mais le contexte doit les expliquer.
- Les six cartes photographiques originales, leurs étapes et les ancres existantes.
- La mention d'indépendance et l'absence de garantie d'admission et de visa.

## Risques résiduels / revue humaine souhaitable
- **« Orientation »** reste un mot spécialisé : un court questionnaire utilisateur tunisien peut vérifier si « trouver les études qui me conviennent » est encore plus parlant pour le CTA, sans modifier la promesse de service.
- **« Programme »**, **« candidature »**, **« admission »**, **« uni-assist »** restent nécessaires mais pourront recevoir une aide contextuelle au moment où l'utilisateur entame une démarche.
- Il faut **tester la compréhension sur téléphone auprès de plusieurs étudiants tunisiens**, sans les aider : « Qu'est-ce qui est gratuit ? », « Qui envoie le dossier ? », « Qui décide du visa ? ». Cette étape n'est **pas encore réalisée**.
- Auditer séparément les écrans d'inscription, d'orientation et le tableau de bord étudiant avant une communication plus large.

## Vérifications techniques requises
- Tests de copie française, limites des services payants et non-garantie ;
- tests de régression de langues FR/AR/EN/DE ;
- qualité navigateur desktop/mobile, responsive, navigation clavier ;
- garder les six images originales intactes.

**Conclusion :** l'essentiel du langage de la homepage est réécrit en français plus direct. Cette conclusion est un **jugement éditorial fondé sur les textes du dépôt**, pas une preuve d'un niveau A2/B1 certifié ni un résultat de test utilisateur.
