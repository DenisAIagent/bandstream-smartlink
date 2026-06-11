# Revue juridique — CGU/CGV & mentions légales · juin 2026

> Analyse stricte des documents légaux des deux applications, chaque point vérifié
> contre le code et le produit réels. **Aucun texte légal n'a été modifié** : la
> rédaction de clauses contractuelles est une décision fondateur/avocat — ce rapport
> liste précisément quoi corriger, où, et pourquoi. Complète `RGPD-REVIEW.md`
> (la privacy policy, déjà auditée et corrigée, n'est pas re-traitée ici).

---

## App principale (bandstream-app)

### ✅ Solide (vérifié)
- **Mentions légales LCEN complètes** : BandStream SAS, RCS Paris 939 221 438,
  capital, siège (60 rue François 1er, 75008), directeur de la publication
  (Tachfin Khelil), hébergeur IONOS avec adresse et téléphone, TVA, DPO.
- **Propriété intellectuelle équitable** (terms art. 6.1) : l'artiste garde tous ses
  droits, licence technique non exclusive limitée à la durée du service.
- **Modification des CGU** avec préavis 30 jours ; recours interne sur modération ;
  juridiction conforme B2C ; suppression de compte à 30 jours **cohérente avec la
  purge réelle** implémentée pendant la revue RGPD.
- FR/EN substantiellement identiques.

### ❌ À corriger (par sévérité)

1. **CRITIQUE — Les CGU décrivent une « Phase Alpha Privée » sur invitation, pas le
   produit commercial.** Zéro mention des plans Free/Pro 5 €/Label 25 €, de l'add-on
   Boutique (+10/+30 €), du paiement Stripe, des smartlinks illimités, de l'équipe
   label (5 sièges) ni de l'export JSON. Vérifié : aucun prix dans `terms-fr.md`,
   « Alpha » dès la ligne 3. → Rédiger une section « Offres et tarifs » + définitions
   à jour avant toute commercialisation réelle.
2. **CRITIQUE — Aucun droit de rétractation** (0 occurrence du mot dans les CGU).
   Pour des abonnements B2C payants : art. L221-18 (14 jours) + clause de
   renonciation expresse pour exécution immédiate du service numérique
   (L221-28 13°) + formulaire type. Obligatoire dès que Pro est vendu en self-serve.
3. **HAUTE — Médiateur de la consommation « en cours de désignation »**
   (`legal-fr.md:75`, `terms-fr.md:207`). Toléré en alpha gratuite, non conforme
   (L612-1) dès le premier paiement. Action réelle : adhérer à un médiateur
   (CNPM, CM2C, FEVAD…) puis remplacer la mention.
4. **HAUTE — Plafond de responsabilité à 100 € en usage gratuit**
   (`terms-fr.md:177`) : potentiellement abusif en B2C ; la clause est partiellement
   sauvée par l'exclusion des garanties légales, mais à revoir avec l'avocat.
5. **MOYENNE — Suspension/suppression (art. 11)** : pas de modalités de
   remboursement prorata pour un abonnement payant ni de préavis avant suppression
   définitive.

---

## Boutique (bandstream-shop)

### ✅ Solide (vérifié)
- **Le rôle de plateforme est bien posé** : « l'artiste reste seul vendeur »,
  band.stream intermédiaire technique ; SIREN/adresse identiques et cohérents sur
  les 4 surfaces (mentions, footer, CGV template, factures).
- **CGV template** : rétractation 14 jours présente, prix TTC, ODR européenne
  mentionnée ; factures avec gestion TVA (`vatExempt`) ; avis vérifiés + modérés ;
  opt-in marketing désormais réel (revue RGPD).

### ❌ À corriger (par sévérité)

1. **CRITIQUE — Pas de directeur de la publication** dans les mentions légales
   boutique (vérifié : 0 occurrence). LCEN art. 6-III. → Ajouter à
   `lib/legal/company.ts` + page mentions.
2. **CRITIQUE — Exceptions au droit de rétractation absentes** du template CGV
   (vérifié : 0 occurrence de L221-28/renonciation) alors que la boutique **vend du
   digital téléchargeable** (DownloadGrant). Sans renonciation expresse recueillie
   avant paiement, le fan peut se rétracter d'un fichier déjà téléchargé. → Section
   « Exceptions » (produits personnalisés 3°, contenus numériques 13°) + recueil de
   la renonciation au checkout digital.
3. **HAUTE — Pas de CGU artistes** : la commission (3 % Pro / 0 % Label, codée en
   dur), la politique de suspension, la responsabilité contrefaçon et les délais de
   reversement ne sont contractualisés nulle part ; le `acceptTerms` à l'inscription
   ne pointe vers rien de spécifique. → Rédiger des CGU vendeurs.
4. **HAUTE — CGV template « à compléter par l'artiste »** (SIREN/TVA) sans
   formulaire backoffice ni validation : factures potentiellement incomplètes. →
   Formulaire « Infos légales » obligatoire avant la première vente.
5. **HAUTE — Médiateur conso non désigné** (même action réelle que côté app) ;
   **formulaire type de rétractation** non fourni dans l'email de confirmation.
6. **MOYENNE — Livraison** : pas de rappel du plafond légal de 30 jours (L216-1) ni
   de borne sur les délais saisis par l'artiste. **TVA** : pas de mention « TVA non
   applicable, art. 293 B du CGI » pour les vendeurs en franchise. **Relance
   panier** : à mentionner dans les CGV (cohérence avec l'opt-in).

---

## Verdict et ordre d'attaque

L'infrastructure légale est **sérieuse pour une alpha** (identités complètes,
cohérence des données société, clauses PI saines) mais **pas prête pour la
commercialisation ouverte**. Avant d'encaisser des abonnements et des ventes sans
invitation :

1. CGU app v2 « commerciale » (offres + prix + rétractation/renonciation) — rédaction avocat.
2. Boutique : directeur de publication (1 ligne de code) + exceptions rétractation
   digital + renonciation au checkout.
3. Désignation effective d'un médiateur de la consommation (action administrative,
   couvre les deux apps).
4. CGU artistes (commission, suspension, responsabilité).
5. Formulaire « infos légales vendeur » dans le backoffice boutique.

> Rapports d'agents complets disponibles dans l'historique de session ; chaque
> finding ci-dessus a été re-vérifié manuellement dans les fichiers cités.
