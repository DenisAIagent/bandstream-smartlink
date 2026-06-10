# Rapport — Intégration de la nouvelle landing page `home`

**Date** : 21 avril 2026
**Périmètre** : remplacement de `app/[locale]/page.tsx` par la nouvelle landing fournie en HTML/CSS/assets.
**Contrainte tenue** : zéro impact sur le reste de l'application.

---

## 1. Ce qui a été fait

### Nouveau dossier isolé

Tout le nouveau code est regroupé dans `app/[locale]/_home/` (le préfixe `_` empêche Next.js de le router comme une URL).

```
app/[locale]/_home/
├── Home.tsx                      Composant serveur racine, sélectionne FR ou EN
├── HomeClient.tsx                Orchestration client (thème, scroll nav, reveal)
├── home.module.css               Tout le CSS du draft, scopé (CSS Modules)
├── content/
│   ├── types.ts                  Typage de la copie éditoriale
│   ├── fr.ts                     Contenu français (copie source du draft)
│   ├── en.ts                     Traduction anglaise
│   ├── platforms.ts              10 plateformes de streaming (SVG + couleurs)
│   └── templates.ts              Définition des 6 templates SmartLink
└── sections/
    ├── Nav.tsx                   Navigation fixe
    ├── Hero.tsx / HeroVisual.tsx Hero + phone mockup animé
    ├── LiveCounter.tsx           Compteur de streams en direct
    ├── TemplatePhone.tsx         Phone + 6 templates en carrousel
    ├── PlatformIcon.tsx          Icône plateforme
    ├── icons.tsx                 Icônes UI (flèche, soleil, lune…)
    ├── PlatformsStrip.tsx        Bandeau plateformes
    ├── Steps.tsx                 Section « Prêt en 30 secondes »
    ├── Features.tsx              Section fonctionnalités
    ├── Smartlinks.tsx            Showcase interactif des templates
    ├── Manifesto.tsx             Bloc manifeste
    ├── Compare.tsx               Tableau comparatif concurrents
    ├── Pricing.tsx               Grille tarifaire
    ├── CtaBig.tsx                CTA final avec formulaire email
    └── Footer.tsx                Pied de page
```

### Assets ajoutés

```
public/images/home/
├── logo-bandstream-black.png
├── logo-bandstream-white.png
├── les-failles-du-monde.png
├── les-failles-du-monde.mp3
├── og.jpg                        Preview social (1200×630) — version FR
├── og-en.jpg                     Preview social (1200×630) — version EN
└── platforms/                    10 SVG (spotify, apple, deezer, etc.)
```

### Fichier modifié

- `app/[locale]/page.tsx` — remplacé par un import de `<Home />`, avec `generateMetadata` pour les SEO tags FR/EN (title, description, canonical, Open Graph, Twitter Card, og:image localisée).

### Fichier de sauvegarde

- `app/[locale]/page.backup.tsx.txt` — ancienne version de `page.tsx` (5 774 lignes) conservée avec extension `.txt` pour ne pas être compilée. Permet un rollback en une commande.

---

## 2. Isolation vérifiée

- **Dossier** `_home/` privé (pas de route publique accidentelle).
- **CSS** en CSS Modules, toutes les règles sont scopées sous la classe racine `.home`.
- **Thème** dark/light géré via un attribut dédié `data-home-theme` et une clé localStorage `bs-home-theme`. Aucun conflit avec l'attribut global `[data-theme]` déjà utilisé ailleurs.
- **i18n** : le contenu FR/EN est local au dossier `_home/content/`, sans toucher aux fichiers `messages/*.json` partagés avec l'admin et le dashboard.
- **Fonts** : les familles `Goodly` et `Poppins` nécessaires étaient déjà déclarées dans `app/globals.css`, elles sont réutilisées directement. Aucune font dupliquée, aucun nouveau `@font-face`.
- **Formulaire alpha** : branché sur l'endpoint existant `POST /api/newsletter` (Brevo, déjà en place). Aucun nouvel endpoint créé.
- **Aucune nouvelle dépendance npm** ajoutée.
- **Preview social réseaux** (Open Graph + Twitter Card) : chaque locale sert sa propre image (`og.jpg` pour FR, `og-en.jpg` pour EN), avec largeur, hauteur, type MIME et `alt` renseignés.

---

## 3. Fichiers intouchés

- `middleware.ts`
- `app/[locale]/layout.tsx`
- `app/globals.css`
- `tailwind.config.ts`, `next.config.ts`, `postcss.config.mjs`
- `messages/*.json`
- `components/**`
- `lib/**`
- `prisma/**`
- `app/api/**`
- Toutes les autres routes : `/login`, `/admin`, `/dashboard`, `/pdb`, `/ads`, `/customer`

---

## 4. Validation

- `npx tsc --noEmit` : propre sur tout le nouveau code `_home/`.
- `npm run build` : compilation Next.js réussie (`✓ Compiled successfully`).
- Dev server : `/fr` et `/en` répondent 200 avec le rendu attendu.
- Smoke test des routes adjacentes : `/fr/login`, `/fr/pdb`, `/fr/ads` répondent 200, intactes.
- Contenu FR et EN rendus correctement.
- Rollback testé : `cp page.backup.tsx.txt page.tsx` restaure l'ancienne home.

---

## 5. Erreurs pré-existantes (hors scope, non touchées)

Deux erreurs TypeScript présentes dans le code avant le début de cette intervention ont été identifiées. Elles ne sont pas liées à la landing page et n'ont pas été corrigées pour respecter la règle de scope strict.

1. `app/api/stripe/webhook/route.ts:175`
   `error TS2339: Property 'subscription' does not exist on type 'Invoice'.`

2. `components/bandstream/landingpages/BandCoverImage.tsx:220`
   `error TS2322: Type 'string | null' is not assignable to type 'string | undefined'.`

Ces deux erreurs n'impactent pas le build Next.js (configuration `typescript.ignoreBuildErrors: true`), mais sont à traiter dans un ticket séparé.

Par ailleurs, en lancement local sans `.env`, l'auth middleware (`AUTH_SECRET` manquant) log une erreur sur chaque requête. Cet état existe indépendamment de la landing et n'a aucune incidence sur le rendu public.

---

## 6. Rollback

Une seule commande :

```bash
cd app/[locale]
cp page.backup.tsx.txt page.tsx
```
