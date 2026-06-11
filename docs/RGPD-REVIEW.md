# Revue RGPD — band.stream (app + boutique) · juin 2026

> Audit strict des deux applications (bandstream-app, bandstream-shop), corrections
> appliquées immédiatement pour tout ce qui relève du code, et liste des décisions
> produit/juridiques restantes. Vérification fonctionnelle par interception réseau.

---

## 1. Corrigé dans cette revue ✅

### bandstream-app

| Finding | Article | Correction | Fichiers |
|---|---|---|---|
| GTM corporate + GA/GTM artiste chargés **avant** consentement sur les pages fans (l'IP part chez Google au chargement, consent default posé par un `useEffect` = course perdable) | 7, lignes CEPD | **Aucun script tiers avant consentement** : nouveau `ConsentGatedTrackers` (réagit aussi à la révocation en direct) ; injections inconditionnelles retirées du layout | `components/bandstream/trackers/ConsentGatedTrackers.tsx`, `app/customer/[locale]/[customer]/layout.tsx` |
| Panneau « gérer mes cookies » cassé : perdait le `privacyId` (lignes Consent orphelines), cookie sans `domain` racine, pas de notification des trackers | 7.3 (retrait aussi simple) | privacyId préservé, même portée de cookie que le bandeau, `gtag consent update` + événement `bandstream:consent` | `consentmanager/ConsentManagerSettings.tsx` |
| **Aucun moyen de supprimer son compte** (promis par la policy) | **17** | `DELETE /api/dashboard/account` : dépublication immédiate des pages, suppression équipe/tickets/invitations, cascade User ; confirmation « SUPPRIMER » ; garde-fou comptes internes | `app/api/dashboard/account/route.ts`, `components/bandstream/dashboard/PrivacyRights.tsx` (Réglages → Confidentialité) |
| **Aucune portabilité** | **20** | `GET /api/dashboard/account/export` → JSON téléchargeable (profil, artistes, smartlinks, équipe, support) | `app/api/dashboard/account/export/route.ts` |
| Soft-deletes jamais purgés, consentements et tokens conservés indéfiniment | 5.1.e | Script de purge idempotent : soft-deleted > 30 j, Consent > 13 mois, tokens/sessions expirés. `npm run purge:retention` | `scripts/purge-retention.js` |
| Resend et Slack absents de la liste des sous-traitants (Slack reçoit email+nom à chaque connexion/inscription) | 13, 28 | Ajoutés au tableau des destinataires (FR + EN) | `content/legal/privacy-{fr,en}.md` |

### bandstream-shop

| Finding | Article | Correction | Fichiers |
|---|---|---|---|
| Pixels GA4/Ads/Meta/TikTok/Pinterest/Snapchat injectés **avant** l'affichage du bandeau ; Meta sans revoke ; TikTok/Pinterest/Snapchat sans aucun consent mode ; GA4 en `analytics_storage: granted` par défaut (GA4 n'est PAS exempté par la CNIL) | 7 | `ShopTrackingScripts` devient client et **gaté sur le cookie `bs_consent`** : refus ou absence de choix = zéro requête tierce ; injection live à l'acceptation via l'événement `bs:consent` ; les conversions checkout no-op sans les loaders (gatées de fait) | `components/public/ShopTrackingScripts.tsx` |
| Texte du bandeau inexact (« audience anonymisée sans ton consentement ») | 13 | Texte honnête : rien n'est activé sans accord, liste des services | `components/public/CookieBanner.tsx` |

### Vérification (preuves)
- **Interception réseau Playwright** sur une page fan : `0` requête vers googletagmanager/google-analytics/facebook/tiktok avant consentement ; `18` après « Accepter » (GTM + GA + TikTok du conteneur corporate). 
- Export : `200`, JSON complet. Suppression : `400` sans confirmation, `403 internal_account` pour un compte interne (garde-fou).
- `tsc` propre sur les deux apps ; purge exécutée à blanc (`smartlinks=0 bands=0 …`).

---

## 2. Décisions produit / juridiques restantes (à arbitrer) ⚠️

Priorité haute :
1. **Boutique — opt-in marketing au checkout** (art. 6/21, ePrivacy) : la relance panier
   abandonné (avec code promo) et l'export d'emails hashés vers Google Customer Match /
   Meta Custom Audiences (`/api/customers/export?format=hashed`) reposent sur une base
   « intérêt légitime » fragile. Décision : ajouter une case opt-in au checkout Stripe
   (custom field) et filtrer relances + exports sur ce flag, ou assumer l'intérêt
   légitime documenté + opt-out 1 clic dans chaque email.
2. **Boutique — droits des acheteurs (fans)** : pas d'interface de suppression/export
   pour les acheteurs (adresses de livraison stockées en JSON sans purge). Décision :
   page `/account/data-rights` + anonymisation des commandes > 3 ans (garantie légale),
   cron de purge analogue à celui de l'app.
3. **DPA sous-traitants** : vérifier que les DPA Slack, Resend, Scaleway, Stripe, Umami
   sont signés/archivés (art. 28). Slack : envisager de pseudonymiser les notifications
   (ID interne plutôt qu'email en clair) — décision produit.

Priorité moyenne :
4. **Cron de purge en production** : brancher `npm run purge:retention` (app) en tâche
   quotidienne (Railway/K8s CronJob). Le script existe, il n'est pas encore planifié.
5. **Demande d'avis post-livraison (boutique)** : documenter la base légale (relation
   post-vente) dans les CGV ou ajouter l'opt-in au checkout (même case que #1).
6. **`trackingMeta` (app)** : champ configurable par les artistes mais jamais injecté.
   Soit implémenter un MetaPixel gaté consentement (marketing, pas analytics), soit
   retirer le champ de l'UI.
7. **Rétention boutique** : RateLimitCounter (IP/emails), sessions expirées — ajouter
   une purge planifiée ; vérifier que `lib/encryption.ts` chiffre réellement les tokens
   GMC/Meta/TikTok (AES-256-GCM).

Priorité basse :
8. Politique de confidentialité : préciser le mécanisme de purge à 30 jours désormais
   réel, et l'existence de l'export self-serve. Registre des traitements (art. 30) à
   formaliser hors code.

---

## 3. Déjà conforme (constaté pendant l'audit)

- Bandeau app : refus aussi simple qu'accepter, non bloquant, cookie 1 an ; Umami gaté
  consentement, self-hosted, sans cookie ; table Consent minimale (pas d'IP, pas d'email).
- Auth : codes email 15 min purgés après usage ; guards `requireAuth/requireAdmin`
  systématiques + backstop middleware ; `check-customer` ne fuit rien.
- Politique de confidentialité app complète (DPO, bases légales, TIA Schrems II,
  durées) ; mentions légales boutique complètes ; CSP nonce boutique.
- Boutique : tokens de téléchargement hashés + expirants ; pas de données carte
  stockées ; avis publics sans email ; un avis par email/produit ; webhooks Stripe
  signés ; factures immuables.
