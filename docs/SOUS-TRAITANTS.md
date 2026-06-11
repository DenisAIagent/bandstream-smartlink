# Registre des sous-traitants — band.stream (app + boutique)

> RGPD art. 28 (contrats de sous-traitance) et art. 30 (registre des activités de
> traitement). Liste établie à partir du **code réellement déployé** (revue RGPD de
> juin 2026), pas des intentions. À tenir à jour à chaque nouvel appel sortant.
> La colonne « DPA » est à compléter par l'équipe : tous ces prestataires proposent
> un DPA standard à accepter en ligne — l'archiver (PDF) dans le drive juridique.

## App principale (bandstream-app)

| Sous-traitant | Traitement | Données transmises | Localisation | DPA |
|---|---|---|---|---|
| Google LLC (OAuth) | Connexion des comptes | email, nom, photo de profil | UE/US (CCT) | ☐ via Google Cloud/Workspace DPA |
| Stripe, Inc. | Abonnements Pro/Label | email, nom, données de paiement (jamais stockées chez nous) | UE/US (CCT) | ☐ Stripe DPA (services agreement) |
| Resend, Inc. | Emails transactionnels (codes de connexion, bienvenue) | email, nom | UE/US (CCT) | ☐ resend.com/legal/dpa |
| Slack (Salesforce) | Notifications internes connexion/inscription | email **pseudonymisé** (`d•••@domaine`) depuis la revue RGPD, nom | UE/US (CCT) | ☐ Slack DPA (slack.com/dpa) |
| Scaleway SAS | Stockage S3 (pochettes, extraits audio) | fichiers uploadés par les artistes | France (UE) | ☐ inclus CGV Scaleway (FR) |
| Umami (self-hosted) | Mesure d'audience des pages fans | pages vues, référents — **sans cookie, IP non stockée**, gaté consentement | notre infra (UE) | n/a (auto-hébergé) |
| Google (GTM/GA4, conteneur corporate + IDs artistes) | Mesure d'audience pages fans | chargé **uniquement après consentement** depuis la revue RGPD | UE/US (CCT) | ☐ Google Ads Data Processing Terms |
| IONOS SE | Hébergement / DNS | logs techniques | France/Allemagne (UE) | ☐ |

## Boutique (bandstream-shop)

| Sous-traitant | Traitement | Données transmises | Localisation | DPA |
|---|---|---|---|---|
| Stripe, Inc. (Connect) | Paiements des fans, KYC artistes | email, nom, adresse, paiement (chez Stripe) | UE/US (CCT) | ☐ Stripe Connected Account Agreement |
| Resend, Inc. | Emails transactionnels (commande, magic-link, relance opt-in) | email, nom, contenu commande | UE/US (CCT) | ☐ |
| Google / Meta / TikTok / Pinterest / Snapchat (pixels par boutique) | Publicité des artistes vendeurs | chargés **uniquement après consentement explicite** depuis la revue RGPD ; audiences hashées exportées **uniquement opt-in** | UE/US (CCT) | responsabilité conjointe artiste ↔ plateforme — encadrer dans les CGU artistes |
| Google Merchant Center / Meta Catalog | Flux produits | données produits uniquement (pas de données fans) | UE/US | ☐ |

## Rappels opérationnels

- **Transferts hors UE** : tous les prestataires US ci-dessus opèrent sous Clauses
  Contractuelles Types (CCT) ; les TIA sont mentionnées dans la politique de
  confidentialité (art. 7) — les archiver avec les DPA.
- **Purges planifiées** : `npm run purge:retention` (app, quotidien) et
  `GET /api/cron/anonymize-orders` (boutique, hebdo, secret CRON_SECRET) — à brancher
  dans l'ordonnanceur de prod.
- **Nouveau prestataire = nouvelle ligne ici + politique de confidentialité + DPA.**
