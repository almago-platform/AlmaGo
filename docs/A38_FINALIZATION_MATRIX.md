# A38 — matrice de finalisation minimale

**Statut : outil interne de préparation, non validé juridiquement.**

Cette matrice sépare ce qu'AlmaGo peut préparer automatiquement de ce qui doit réellement être confirmé ou relu par un humain.

| Sujet | État | Source / preuve | Action restante |
|---|---|---|---|
| Nom du service | établi | dépôt AlmaGo | aucune |
| Fonctions actuelles | établi | code + `docs/data-processing-inventory.md` | aucune |
| Supabase Auth/Postgres/Storage | établi | code/migrations | aucune |
| Vercel hébergement/déploiement | établi | dépôt/workflows | aucune |
| Analytics actif | aucun actuellement | code + A44 séparé | aucune pour A38 |
| Exploitant légal | inconnu | information business | propriétaire |
| Forme juridique | inconnue | information business | propriétaire |
| Adresse publique | inconnue | information business | propriétaire |
| E-mail public | inconnu | information business | propriétaire |
| Registre / numéro | inconnu/applicabilité | business + relecture | propriétaire/relecteur |
| TVA / W-IdNr | inconnu/applicabilité | business + relecture | propriétaire/relecteur |
| DPO | applicabilité non décidée | relecture juridique | relecteur |
| Activité réglementée | inconnue/applicabilité | business + relecture | propriétaire/relecteur |
| Gratuit/payant | inconnu | décision business actuelle | propriétaire |
| Politique de rétention | proposition prête | `docs/A38_RETENTION_POLICY_PROPOSAL.md` | accepter/modifier |
| Suppression Storage | séquence technique établie | Supabase docs | intégrer dans procédure finale |
| Base juridique des traitements | non décidée | RGPD + contexte réel | relecteur |
| Transferts internationaux | à confirmer | contrats/config fournisseurs | relecteur |
| Autorité de contrôle | dépend de l'établissement | contexte réel | relecteur |
| Conditions commerciales | dépend gratuit/payant | contexte réel | relecteur |
| Texte Mentions | brouillon prêt | `docs/legal-imprint-draft.md` | injecter données confirmées + relire |
| Texte Confidentialité | brouillon prêt | `docs/legal-privacy-draft.md` | injecter décisions + relire |
| Conditions d'utilisation | brouillon prêt | `docs/legal-terms-draft.md` | injecter décisions + relire |
| Publication finale | bloquée intentionnellement | gate A38 | seulement après relecture |

## Sources de contrôle

- DDG § 5 : informations générales du fournisseur, selon applicabilité.
- RGPD : principes, information des personnes et droits, selon les bases juridiques réellement retenues.
- TDDDG § 25 : accès/stockage sur l'équipement terminal, notamment pour un futur analytics.
- Supabase User Management : un utilisateur propriétaire d'objets Storage ne peut pas être supprimé avant traitement de ces objets.
- Supabase Delete Objects : suppression des fichiers via Storage API, pas par suppression SQL directe.

## Ordre de finalisation recommandé

1. propriétaire complète uniquement les informations business ;
2. propriétaire/relecteur accepte ou modifie la proposition de rétention ;
3. relecteur détermine les points d'applicabilité juridique ;
4. les trois textes canoniques sont remplis ;
5. vérification automatique des placeholders ;
6. relecture humaine finale ;
7. `A38_REVIEW_READY: true` ;
8. merge sur `main` ;
9. preuve exact-SHA générée ;
10. propriétaire poste exactement `A38 HUMAN REVIEW APPROVED`.

Aucune étape automatique ne remplace la relecture juridique humaine.
