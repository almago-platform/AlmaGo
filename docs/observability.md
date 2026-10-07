# AlmaGo — Observability contract

La télémétrie est fondée sur une liste blanche définie dans `config/telemetry-events.json` et validée côté runtime par `src/lib/telemetry.ts`.

Événements canoniques :

- `route_render_failed`
- `api_request_failed`
- `form_submit_result`
- `navigation_action`
- `web_vital`
- `phase2_funnel_step`

## Frontière de confidentialité

Ne jamais envoyer :

- noms, e-mails, téléphones ou adresses ;
- identifiants internes/étudiants ;
- mots de passe, tokens, cookies ou clés API ;
- contenu ou nom de documents privés ;
- notes/messages libres ;
- informations de profil sensibles ;
- URL complètes contenant des identifiants ou query strings ;
- IP brute depuis le code applicatif.

Les valeurs d’événements doivent rester dans les catégories explicitement autorisées.

## Activation d’un fournisseur

Avant d’activer un fournisseur externe :

1. valider la base légale et la notice de confidentialité ;
2. conserver les secrets uniquement côté serveur dans **Render environment variables and GitHub Actions secrets** ;
3. définir la rétention ;
4. désactiver la capture automatique non revue (session replay, profils, payloads réseau, URLs complètes) ;
5. tester avec des données synthétiques ;
6. inspecter les payloads réellement envoyés ;
7. surveiller les erreurs de livraison.

Les logs Render/Supabase restent des logs opérationnels et ne remplacent pas ce contrat de télémétrie produit.
