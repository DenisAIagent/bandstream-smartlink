# band.stream

**band.stream** is a smart-link platform for musicians and bands. Each artist gets a personalized landing page at `<artist>.band.stream` that aggregates streaming platform links (Spotify, Apple Music, Deezer, YouTube, etc.), displays cover art, plays audio previews, and promotes upcoming events with ticketing links.

The platform includes a back-office admin panel for managing bands, platforms, users, and beta invites, with role-based access control and internationalization support.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (App Router, standalone output) |
| Language | TypeScript |
| UI | [Tailwind CSS](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/), [shadcn/ui](https://ui.shadcn.com/), [Lucide icons](https://lucide.dev/) |
| State | [Redux Toolkit](https://redux-toolkit.js.org/) |
| Database | PostgreSQL with [Prisma ORM](https://www.prisma.io/) |
| Auth | [Auth.js v5](https://authjs.dev/) (NextAuth) -- Google OAuth + email auth codes |
| Email | [Resend](https://resend.com/) with [React Email](https://react.email/) templates |
| Object Storage | S3-compatible (Scaleway / MinIO) via AWS SDK v3 |
| Analytics | [Umami](https://umami.is/) (self-hosted), Google Analytics, Google Tag Manager |
| Notifications | Slack webhooks (user sign-in/sign-up events) |
| i18n | [next-intl](https://next-intl-docs.vercel.app/) (currently `en` and `fr`) |
| Charts | [Recharts](https://recharts.org/) |
| Forms | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) validation |
| Container | Docker (multi-stage build) |
| Node.js | 22.11.0 |

---

## Architecture

### Subdomain Routing

The middleware (`middleware.ts`) implements subdomain-based routing:

1. **Customer subdomains** (`<artist>.band.stream`) -- When a request arrives at a subdomain, the middleware extracts the artist name from the hostname, verifies the band exists via `/api/check-customer`, and rewrites the request to `/customer/fr/<artist>`.
2. **Internal subdomains** (`*.internal.band.stream`) -- Requests are passed through to the i18n middleware without customer detection.
3. **Dev subdomains** (`<artist>.dev.band.stream`) -- Handled the same as production subdomains, for staging/testing.
4. **Root domain** (`band.stream`) -- Serves the main marketing/login pages with i18n routing.

### Auth Flow

Authentication uses Auth.js v5 with the Prisma adapter and JWT session strategy:

- **Google OAuth** -- Primary sign-in method.
- **Email auth codes** -- A time-limited code (15-minute expiry) is sent to the user's email; the `Credentials` provider validates it against the database.
- **Invite-only registration** -- New users must have a `UserInvite` record to create an account. Existing users can always sign in.
- **Slack notifications** -- Every sign-in attempt and new account creation triggers a Slack webhook notification.
- **Welcome email** -- Sent automatically via Resend when a new user account is created.

After sign-in, users are redirected to `/admin`.

### Role-Based Access Control

Two role hierarchies exist:

- **User roles** (global): `OWNER > ADMIN > CUSTOMER > READER`
- **UserBand roles** (per-band): `OWNER > ADMIN > MEMBER`

The `RoleGuard` component and `hasBandStreamPermission()` helper enforce access at the UI and API levels. The middleware redirects unauthenticated users away from `/admin` and `/api/admin` routes.

### Internationalization

The app uses `next-intl` with locale-prefixed routes (`/en/...`, `/fr/...`). Translation files live in `/messages/<locale>.json`. A translation script (`scripts/translate.js`) uses the OpenAI API to auto-translate the source language file to all other supported locales.

Currently active locales: `en`, `fr`. The codebase includes translation files for 26 languages (commented out in routing config).

---

## Directory Structure

```
bandstream-new/
├── app/
│   ├── api/                    # API routes
│   │   ├── admin/              # Protected admin APIs (bands, platforms, users)
│   │   ├── auth/[...nextauth]/ # Auth.js route handler
│   │   ├── check-customer/     # Customer existence check (used by middleware)
│   │   ├── consent/            # Cookie consent API
│   │   └── mails/              # Welcome email trigger endpoint
│   ├── customer/[locale]/[customer]/  # Customer-facing band landing pages
│   └── [locale]/               # Locale-prefixed app routes
│       ├── admin/              # Admin panel pages (bands, platforms, users, beta)
│       ├── login/              # Login page
│       └── page.tsx            # Home page
├── auth.ts                     # Auth.js configuration (providers, callbacks, events)
├── auth.config.ts              # Auth.js edge-compatible config
├── middleware.ts               # Subdomain routing + auth protection + i18n
├── components/
│   ├── auth/                   # Auth components (LoginForm, LogoutButton, RoleGuard)
│   ├── bandstream/
│   │   ├── admin/              # Admin UI (tables, forms, sidebar, breadcrumbs)
│   │   ├── landingpages/       # Customer-facing band page components
│   │   ├── i18n/               # Language selector
│   │   ├── trackers/           # Google Analytics, GTM, consent manager
│   │   └── toasts/             # Toast notifications
│   ├── charts/                 # Recharts chart components
│   ├── mails/                  # React Email templates (Welcome, Connect, CreateAccount)
│   ├── ui/                     # shadcn/ui primitives
│   └── umami/                  # Umami analytics client
├── hooks/                      # Custom React hooks
├── i18n/                       # next-intl config and routing
├── lib/
│   ├── actions/                # Server actions (band CRUD, invites, email sending)
│   ├── auth/providers/         # Custom auth provider (BandStreamMail)
│   ├── forms/                  # Zod validation schemas
│   ├── mailers/                # Email transport (Resend via mailjet.ts)
│   ├── middleware-utils/       # Customer-check helper
│   ├── queries/                # Prisma query functions (bands, platforms, users)
│   ├── rbac/                   # Role hierarchy and permission checks
│   ├── slack/                  # Slack webhook integration
│   ├── prisma.ts               # Prisma client singleton
│   ├── scalewayStorage.ts      # S3 upload/delete helpers
│   └── utils.ts                # General utilities
├── messages/                   # i18n translation JSON files (26 languages)
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Prisma migration history
├── public/                     # Static assets (images, fonts, logos, SVG)
├── scripts/
│   └── translate.js            # OpenAI-powered translation script
├── store/                      # Redux store and slices
├── styles/                     # Global CSS
├── types/                      # TypeScript type definitions
├── Dockerfile                  # Multi-stage Docker build
├── docker-compose.yaml         # Local PostgreSQL setup
├── entrypoint.sh               # Container entrypoint (migrations + start)
└── next.config.ts              # Next.js configuration
```

---

## Local Development Setup

### Prerequisites

- Node.js 22.11.0 (see `.node-version`)
- PostgreSQL (or use Docker Compose)
- An S3-compatible object storage (Scaleway, MinIO, etc.)

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd bandstream-new
npm ci --legacy-peer-deps
```

### 2. Start PostgreSQL

Using Docker Compose:

```bash
docker compose up -d
```

This starts a PostgreSQL instance on port 5432 with user `user`, password `password`, and database `bandstream`.

### 3. Configure environment variables

```bash
cp .env.template .env
```

Edit `.env` with your values (see [Environment Variables Reference](#environment-variables-reference) below).

### 4. Set up the database

```bash
npx prisma migrate dev
npx prisma generate
```

### 5. Run the development server

```bash
npm run dev
```

The app starts on `http://0.0.0.0:3000`.

### Local subdomain testing

To test subdomain routing locally, add entries to `/etc/hosts`:

```
127.0.0.1  band.stream
127.0.0.1  myband.band.stream
```

And set `ROOT_DOMAIN=band.stream` in your `.env`.

---

## Environment Variables Reference

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:password@localhost:5432/bandstream` |
| `ROOT_DOMAIN` | Base domain for subdomain routing | `band.stream` |
| `ROOT_DOMAIN_URL` | Full URL of the root domain | `https://band.stream` |
| `AUTH_SECRET` | Auth.js secret for JWT signing | (random string) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | |
| `SCALEWAY_ACCESS_KEY` | S3 access key | |
| `SCALEWAY_SECRET_KEY` | S3 secret key | |
| `SCALEWAY_ENDPOINT` | S3 endpoint URL | `https://s3.fr-par.scw.cloud` |
| `SCALEWAY_BUCKET_NAME` | S3 bucket name | `bands` |
| `S3_BAND_COVER_PATH` | Public URL prefix for cover images | `https://bands.s3.fr-par.scw.cloud/covers/` |
| `S3_BAND_MUSIC_PATH` | Public URL prefix for music files | `https://bands.s3.fr-par.scw.cloud/music/` |
| `RESEND_API_KEY` | Resend API key for transactional emails | |
| `SLACK_WEBHOOK_URL_USERS` | Slack webhook for user event notifications | |
| `INTERNAL_API_TOKEN` | Token for internal API calls (welcome email) | |
| `ADMIN_PASSWORD` | Admin password (legacy) | |
| `OPENAI_API_KEY` | OpenAI key for translation script | |
| `BUILD_ID` | Custom build identifier (optional) | `development` |
| `PORT` | Server port (optional, default 3000) | `3000` |

---

## Database Schema Overview

The database is managed by Prisma with PostgreSQL. Key models:

### Core Models

- **Band** -- Represents an artist/band. Has a unique `domainname` (used for subdomain routing), cover image, album name, music sample URL, tracking IDs (GTAG/GTM/Meta), ticketing URL, and next event info (date, type, location). Supports publish/unpublish timestamps.
- **Platform** -- Streaming platforms (Spotify, Deezer, etc.) with a name, shortname, logo, and base URL.
- **BandPlatform** -- Many-to-many join between Band and Platform, storing a `customURL` for each band's link on each platform.

### Auth Models

- **User** -- Auth.js user with email, role (`OWNER`, `ADMIN`, `READER`, `CUSTOMER`), invite-gating (`isAllowed`), and email auth code fields.
- **Account** -- OAuth account links (Auth.js managed).
- **Session** -- User sessions (Auth.js managed).
- **VerificationToken** -- Email verification tokens (Auth.js managed).
- **Authenticator** -- WebAuthn credentials (Auth.js managed).

### Access Control Models

- **UserBand** -- Many-to-many between User and Band with a role (`OWNER`, `ADMIN`, `MEMBER`).
- **UserInvite** -- Beta invite records (email + who invited them).

### Other Models

- **Consent** -- Cookie consent records (analytics + marketing flags per privacy ID).

### Enums

- `UserRole`: `OWNER | ADMIN | READER | CUSTOMER`
- `UserBandRole`: `OWNER | ADMIN | MEMBER`
- `EventType`: `CONCERT | SHOW | FESTIVAL`

---

## Deployment

### Docker Build

The project uses a multi-stage Dockerfile:

1. **Builder stage** -- Installs dependencies, generates Prisma client, builds Next.js in standalone mode.
2. **Runner stage** -- Copies only the standalone build, static assets, Prisma client, and migrations. Runs `entrypoint.sh` which executes `prisma migrate deploy` then starts the Node.js server.

```bash
docker build -t bandstream .
docker run -p 3000:3000 --env-file .env bandstream
```

The build accepts a `SCALEWAY_ENDPOINT` build arg (defaults to `https://s3.internal.band.stream`).

### Kubernetes

The application is designed to run on Kubernetes. The Docker image exposes port 3000. You will need:

- A PostgreSQL instance (or managed database) accessible via `DATABASE_URL`
- S3-compatible storage (Scaleway Object Storage or self-hosted MinIO)
- Kubernetes secrets for all environment variables
- An ingress controller configured with wildcard DNS for `*.band.stream` subdomain routing

### CI/CD

Build and push the Docker image to your container registry. The entrypoint script handles database migrations automatically on startup, so deployments are zero-downtime friendly as long as migrations are backward-compatible.

---

## Integrations

### Resend (Email)

Transactional emails are sent via [Resend](https://resend.com/) (`lib/mailers/mailjet.ts` -- named for historical reasons). Email templates are built with React Email (`components/mails/`):

- **WelcomeEmail** -- Sent when a new user account is created.
- **ConnectEmail** -- Connection/auth code emails.
- **CreateAccountEmail** -- Account creation emails.

Requires the `RESEND_API_KEY` environment variable.

### Umami (Analytics)

Self-hosted [Umami](https://umami.is/) analytics. The `UmamiClient` component (`components/umami/`) uses the `@umami/api-client` package to fetch website analytics data.

### S3 Object Storage (Scaleway / MinIO)

Band cover images and music samples are stored in S3-compatible object storage (`lib/scalewayStorage.ts`). The module provides `uploadFile()` and `deleteFile()` functions using AWS SDK v3 with `forcePathStyle: true` for compatibility.

Files are uploaded with `public-read` ACL and served directly from the storage endpoint.

### Slack

User sign-in attempts and new account creations trigger Slack webhook notifications to a `#users-and-customers` channel (`lib/slack/slack.ts`). Requires `SLACK_WEBHOOK_URL_USERS`.

### Google Analytics / Tag Manager

Per-band tracking is supported via `trackingGTAG`, `trackingGTM`, and `trackingMeta` fields on the Band model. Components in `components/bandstream/trackers/` inject the relevant scripts.

### Cookie Consent

A consent manager (`components/bandstream/trackers/consentmanager/`) handles GDPR-compliant cookie consent. Consent records (analytics/marketing flags) are stored in the `Consent` database table.

---

## Translation Script

The project includes an automated translation script:

```bash
npm run translate -- en.json
```

This reads the source language file from `messages/`, sends each key's value to OpenAI GPT-4 for translation, and writes the translated JSON files for all other languages in the `messages/` directory. Requires `OPENAI_API_KEY`.

---

## Contributing

1. Create a feature branch from `main`.
2. Install dependencies: `npm ci --legacy-peer-deps` (peer dependency overrides are needed for React 19 RC compatibility).
3. Run the dev server: `npm run dev`.
4. Follow existing code patterns:
   - Server actions in `lib/actions/`
   - Database queries in `lib/queries/`
   - Zod validation schemas in `lib/forms/`
   - UI components follow shadcn/ui conventions
5. Run lint before committing: `npm run lint`.
6. If adding new database fields, create a Prisma migration: `npx prisma migrate dev --name <description>`.
7. If adding new i18n strings, add them to `messages/en.json` and run the translate script.
8. Submit a pull request with a clear description of changes.

---
---

# Update V1.1

> This section documents everything added on top of the original platform. The
> content above is unchanged. V1.1 turns band.stream from a **one-page-per-artist**
> tool into a **multi-release SmartLink platform** with subscription plans, label
> teams, and an internal support back-office. All additions follow the existing
> conventions (route guards in `lib/auth/api-guard.ts`, ownership in
> `lib/auth/ownership.ts`, services in `lib/services/`, `next-intl` flat
> namespaces, Prisma additive migrations).

## 1. What changed at a glance

| Before (V1.0) | After (V1.1) |
|---|---|
| 1 artist = 1 smart-link page | 1 artist = **N SmartLinks** (one per release) + an **Artist Hub** page |
| `<artist>.band.stream` = the page | `<artist>.band.stream` = the **hub** (bio, socials, release list); `<artist>.band.stream/<slug>` = a **release SmartLink** |
| No subscription logic | **Free / Pro / Label** plans with enforced quotas |
| Single user per account | **Label teams** (up to 5 users sharing a roster) |
| Admin = band/platform/user CRUD | + **Superadmin roles** and a **client 360° profile** for support |
| Umami client unused | **Per-artist and per-SmartLink** analytics, consent-gated click tracking |
| Manual platform links | **Odesli/Songlink autofill** (one paste → every platform) |

The original release-level fields on `Band` (`album`, `template`, `musicSample`,
`BandPlatform`) are **kept but deprecated** — they back a legacy render fallback so
nothing breaks during/after the migration.

---

## 2. New domain model

### SmartLink (one release per artist)

```
model SmartLink {
  id, bandId (→ Band), title, slug,
  coverImage, musicSample, template,
  publishedAt, unpublishedAt, deletedAt, uuid,
  platforms: SmartLinkPlatform[]
  @@unique([bandId, slug])
}

model SmartLinkPlatform {  // per-release platform links
  smartLinkId (→ SmartLink, cascade), platformId (→ Platform), customURL
  @@unique([smartLinkId, platformId])
}
```

### Artist Hub fields (added to `Band`)

```
Band.bio       String?   // shown on the hub
Band.socials   Json?     // fixed keys: instagram, tiktok, youtube, x, facebook, website (zod-validated, https only)
Band.umamiWebsiteId String? @unique  // one Umami website per artist
```

### Plans & label teams

```
enum SubscriptionPlan { FREE | PRO | LABEL }   // LABEL added

model LabelMember {  // a collaborator invited to a label account
  labelOwnerId (→ User "LabelOwner"), email, userId? (→ User "LabelMembership")
  @@unique([labelOwnerId, email])
}
```

> **Migration**: `node scripts/migrate-smartlinks.js` (idempotent) creates one
> SmartLink per existing Band, copying `album→title`, cover, sample, template,
> `BandPlatform→SmartLinkPlatform`, and publish state. Slug is derived from the
> album name (or `latest`), uniquified per band, and kept out of `RESERVED_SLUGS`.

---

## 3. Subscription plans

Limits live in `lib/plan-limits-shared.ts` (`null` = unlimited):

| Plan | Artists | SmartLinks / artist | Team seats |
|---|---|---|---|
| **Free** | 1 | 1 | 1 |
| **Pro** (€5/mo) | 1 | unlimited | 1 |
| **Label** (€25/mo) | 100 | unlimited | **5** (manager + 4) |

- Enforced **server-side before creation**: `canCreateArtist` / `canCreateSmartLink`
  in `lib/services/plan-limits.ts`. Over-limit returns `403 { error: "plan_limit" }`
  or `403 { error: "plan_limit_artists" }`; the UI shows an upsell card instead of
  the wizard.
- Plan is **activated manually by the team** (no self-serve Label checkout in V1.1):
  the user table and the client 360° page have a plan selector →
  `PATCH /api/admin/users/[id]/plan`.
- For a label, the **plan that governs a band's rights is the band owner's plan**
  (`getBandOwnerPlan`), so a Free team member inherits the label's Pro/Label rights
  on the roster's artists.

---

## 4. Label teams (shared roster)

A Label account = a **manager** + up to **4 invited members**, all working on the
**same roster**.

- Invite by email in **Settings → Label team** (`POST /api/dashboard/label/members`).
  Existing users get access immediately; unknown emails create a `UserInvite` and
  are resolved on first login (`resolveLabelMemberships` in `auth.ts`).
- Access is **materialized as `UserBand MEMBER`** rows on every band the manager
  owns (`lib/services/label-team.ts`). Artists created by any member belong to the
  **manager** (single quota) and are shared with the whole team.
- Removing a member deletes their non-OWNER `UserBand` rows on the label's bands.

---

## 5. Superadmin & client 360°

For customer follow-up and support by the band.stream team:

- **Internal roles**: `OWNER` (superadmin) and `ADMIN`. Only an OWNER can change a
  user's role (`PATCH /api/admin/users/[id]/role`), and **cannot change their own**.
- **Client 360° page** (`/admin/users/[id]`): identity, plan & role selectors, full
  artist roster (with published/total SmartLink counts and links to edit), label
  team, and the 10 most recent support tickets — backed by
  `GET /api/admin/users/[id]/overview`.

---

## 6. Analytics (Umami)

- **One Umami website per artist** (`Band.umamiWebsiteId`), provisioned lazily at
  publish time (`ensureBandWebsite`). Per-SmartLink stats use Umami's `url` filter
  (`/<slug>`), since all pages render at `/` on the artist subdomain.
- **Consent-gated tracking**: `UmamiTracker` loads the script only after analytics
  consent (`ConsentManager` dispatches a `bandstream:consent` event). Platform
  clicks fire `umami.track('listen_<platform>', { platform, band })`.
- **Dashboard stats** (`/dashboard/bands/[id]/stats`): summary cards on every plan;
  time-series, per-platform clicks, and traffic sources on Pro/Label; a pill row
  filters by SmartLink. Free shows a Pro upsell.
- Env: `UMAMI_API_CLIENT_ENDPOINT` (+ `_USER_ID` / `_SECRET`) or `UMAMI_API_KEY`,
  and `NEXT_PUBLIC_UMAMI_SCRIPT_URL`.

---

## 7. Odesli / Songlink autofill

In the SmartLink wizard (step 2) and the admin band editor, pasting one
track/album link fetches **all** platform links at once via
`POST /api/dashboard/odesli/resolve` (Songlink). Unknown platforms are created on
the fly; an unresolvable link (e.g. an artist page) returns `422 unresolvable_url`
with a clear message.

---

## 8. Security hardening (V1.1 audit)

A full application security review was run and the following were fixed:

| Severity | Fix |
|---|---|
| Critical | Preview auth bypass (`PREVIEW_NO_AUTH`) is **force-disabled when `NODE_ENV=production`** and `.env` is excluded from the Docker context. |
| High | `domainname` is **validated on every update** (`isValidDomainname`) — it feeds S3 keys, so this blocks path traversal. |
| High | Middleware **backstop** returns `401` on `/api/admin` & `/api/dashboard` if a handler ever lacks a guard. |
| Medium | Admin uploads re-encode through `sharp` with a server-set content-type; **size caps + pixel limits** on all uploads. |
| Medium | **SSRF guard** (`lib/safe-fetch.ts`: https-only, blocks private/loopback/metadata IPs, timeout, size cap) on the Odesli thumbnail fetch; middleware no longer derives the fetch scheme from a client header. |
| Low | `customURL` rejects `javascript:`/`data:` schemes; security headers (HSTS, `nosniff`, `X-Frame-Options`, Referrer-Policy, Permissions-Policy) in `next.config.ts`; `check-customer` no longer leaks draft existence. |

> **Open items**: a strict nonce-based CSP, a non-root Docker `USER`, and an
> OWNER-only restriction on plan changes are recommended before public production.

---

## 9. New API surface (V1.1)

All under the existing guard conventions (`requireAuth` + ownership for dashboard,
`requireAdmin` for admin):

```
# SmartLinks (dashboard, mirrored under /api/admin for the team)
GET/POST   /api/dashboard/bands/[id]/smartlinks            # list / create (plan-gated)
GET        /api/dashboard/bands/[id]/smartlinks/check-slug
GET/PUT/DELETE /api/dashboard/smartlinks/[id]
POST       /api/dashboard/smartlinks/[id]/publish | unpublish | upload
PUT/DELETE /api/dashboard/smartlinks/[id]/platforms[/[platformId]]

# Artist & catalog
GET        /api/dashboard/platforms                        # read-only catalog
GET        /api/dashboard/limits                           # label-aware quotas
POST       /api/dashboard/odesli/resolve                   # Songlink autofill

# Label teams
GET/POST   /api/dashboard/label/members
DELETE     /api/dashboard/label/members/[id]

# Admin / support
PATCH      /api/admin/users/[id]/plan
PATCH      /api/admin/users/[id]/role                       # OWNER only
GET        /api/admin/users/[id]/overview                   # client 360°
```

---

## 10. Use cases & user stories

### UC-1 — Independent artist, first release (Free)
> *As a solo artist, I want to publish a smart link for my new single in under two
> minutes, so I can share one link everywhere.*
- Sign in → **Create artist** (name + subdomain) → **Create SmartLink** wizard:
  title → paste a Spotify link (**Odesli fills every platform**) → pick a template →
  **Publish**. Live at `myband.band.stream` (single release renders inline at the root).

### UC-2 — Artist with a catalog (Pro)
> *As a touring artist, I want one smart link per release and a hub page that lists
> them all, so fans land on my latest drop or browse everything.*
- Upgrade to Pro → create multiple SmartLinks (`/single-1`, `/album-2`, …) → add a
  **bio and social links**: the root `<artist>.band.stream` becomes the **hub**
  listing every release. Each SmartLink has its own artwork, template, and stats.

### UC-3 — Label managing a roster (Label)
> *As a label manager, I want my team to manage 100 artists from one account, so we
> don't share passwords or hit per-artist limits.*
- Team activates a **Label** plan → **Settings → Label team**: invite up to 4
  collaborators. Everyone sees the shared roster (counter `X/100`), can create
  artists (counted on the label's quota), and edit/publish their SmartLinks.

### UC-4 — Release rollout with autofill
> *As an artist/manager, I want to add all 10 streaming links at once, so I don't
> copy-paste each platform.*
- Wizard step 2 → paste the album's Spotify/Apple/Deezer link → **Auto-fill** →
  all platforms pre-filled, editable, then saved.

### UC-5 — Measuring a campaign
> *As a Pro/Label user, I want to see views and platform clicks per release, so I
> know what's converting.*
- **Stats** → summary cards, daily time-series, **clicks per platform**, traffic
  sources; a pill row switches between "All" and each SmartLink.

### UC-6 — Customer support (band.stream team)
> *As a band.stream admin, I want a 360° view of a customer, so I can help them and
> manage their plan/role.*
- **Users → click a name** → client 360°: identity, plan & role selectors, full
  roster with edit links, label team, and recent support tickets.

### UC-7 — Upgrade prompt at the limit
> *As a Free user hitting the limit, I want a clear path to upgrade, so I understand
> why I'm blocked.*
- Creating a 2nd SmartLink (Free) or a 2nd artist (Free/Pro) shows an **upsell card**
  ("unlimited SmartLinks / up to 100 artists is a Pro/Label feature") linking to
  billing, instead of a raw error.

---

## 11. Known follow-ups (handoff)

- **i18n**: `fr` and `en` are complete for all V1.1 strings; the other 24 locales
  currently fall back to English. Run `npm run translate -- en.json` (needs
  `OPENAI_API_KEY`) to generate them.
- **Preview bypass**: `PREVIEW_NO_AUTH=1` is a **local-only** convenience that forges
  an OWNER session; it is inert in production by design. Remove it once a real test
  account exists.
- **Legacy code**: the original FormData `POST`/`PUT` admin band routes and the
  deprecated `Band.album/template/musicSample` + `BandPlatform` are kept for the
  render fallback — schedule a cleanup PR after the SmartLink migration is verified
  in production.
- **New env vars** to provision in production: Umami (`UMAMI_API_CLIENT_*` /
  `UMAMI_API_KEY`, `NEXT_PUBLIC_UMAMI_SCRIPT_URL`) and the real Stripe keys
  (`STRIPE_API_KEY`, `STRIPE_PRICE_ID_PRO`, `STRIPE_WEBHOOK_SECRET`).

---
---

# Update V1.2

> Appended after V1.1 — original content above is unchanged. V1.2 adds the
> **Merch Shop add-on** (SSO bridge to the separate `bandstream-shop` app) and a
> **strict GDPR compliance pass** across both applications.

## 1. Merch Shop add-on

The shop (separate repo/app `bandstream-shop`, own database and sessions) is sold
as a **paid add-on**, not included in any plan: **+€10/month on Pro (1 shop),
+€30/month on Label (up to 100 shops), Free not eligible**. The main app is the
**source of truth** (`Subscription.shopAddon`), activated manually by the team.

- **Admin space entry**: sidebar → "Shop" (ADD-ON badge) → `/admin/shop`.
  Locked → upsell page with pricing; active → "Open the shop" button.
- **Client 360° page**: new "Shop: Active/Inactive" selector next to Plan/Role
  (`PATCH /api/admin/users/[id]/addons`, refuses FREE).
- **SSO bridge — no re-login**: `GET /api/dashboard/shop/sso` signs a 60-second
  HMAC token (`lib/shop-sso.ts`, shared secret `SHOP_SSO_SECRET`) and redirects to
  the shop's `/sso/bandstream`, which verifies, syncs plan + add-on onto
  `ShopArtist` (PRO→SOLO, LABEL→LABEL), opens its own session and lands on the
  shop back-office — in a new tab. The shop's direct login keeps working.
- Env (both sides): `SHOP_PUBLIC_URL`, `SHOP_SSO_SECRET` (identical value).

## 2. GDPR compliance pass (strict)

Full report: [`docs/RGPD-REVIEW.md`](docs/RGPD-REVIEW.md) · processors register:
[`docs/SOUS-TRAITANTS.md`](docs/SOUS-TRAITANTS.md).

- **Zero third-party scripts before consent** on fan pages: GTM/GA now mount via
  `ConsentGatedTrackers` (network-verified: 0 external requests pre-consent).
  Same on the shop: all pixels (GA4/Ads/Meta/TikTok/Pinterest/Snapchat) load only
  after explicit accept.
- **Data subject rights, self-serve**: account deletion (art. 17) and JSON export
  (art. 20) in Dashboard → Settings → Privacy; same for shop fans on their
  account page (anonymization keeps accounting data, art. 17.3.b).
- **Retention**: `npm run purge:retention` (soft-deletes >30 d, consents >13 mo,
  expired tokens/sessions) — wire as a daily cron in production. Shop:
  `GET /api/cron/anonymize-orders` (orders >3 y, CRON_SECRET auth).
- **Marketing opt-in at shop checkout** (Stripe `consent_collection`): abandoned-
  cart emails and hashed audience exports are now **opt-in-only**.
- **Minimization**: Slack notifications pseudonymized (`d•••@domain`); consent
  settings panel fixed (kept `privacyId`, root-domain cookie, live revocation).

## 3. Legal review

CGU/CGV and legal notices of both apps were audited (no legal text modified —
wording is a founder/lawyer decision): see [`docs/LEGAL-REVIEW.md`](docs/LEGAL-REVIEW.md).
Headline: the app ToS still describe the **private alpha** (no plans/pricing, no
withdrawal right) and must be rewritten before open commercialization; the shop
needs a publication director, digital-goods withdrawal exceptions, seller ToS and
a consumer mediator designation.

---
---

# Update V1.3

> Appended after V1.2 — original content above is unchanged. V1.3 connects the
> **internal CRM** (sales + customer service, separate Turbo monorepo in
> `Logiciels internes/bandstream-crm`: Fastify API + Vite/React front).

## Internal CRM bridge

- **Team-only entry**: admin sidebar → "CRM" (Internal badge), visible to
  OWNER/ADMIN roles only — this is an internal tool, not a client surface.
- **SSO, no re-login**: `GET /api/admin/crm/sso` (requireAdmin) signs a
  60-second HMAC token (`signSSOTokenWith`, shared secret `CRM_SSO_SECRET`)
  and redirects to the CRM's `GET /api/v1/auth/sso/bandstream`, which:
  - verifies the token (`BANDSTREAM_SSO_SECRET`, same value);
  - **only signs in existing active agents** (no auto-provisioning — the
    CRM's own RBAC/skills stay sovereign; unknown email → login page with
    an explicit error);
  - stores a hashed refresh token, sets the `refresh_token` httpOnly cookie
    (same flow as its password login, audit-logged as `sso_login_bandstream`)
    and redirects to the CRM front, whose `checkAuth()` bootstraps the
    session — in a new tab.
- **Env**: app `CRM_PUBLIC_URL` (the origin serving the CRM front — `/api/v1`
  is reverse-proxied to its API) + `CRM_SSO_SECRET`; CRM `BANDSTREAM_SSO_SECRET`
  (identical). Local dev: app :3002, CRM API :3005, CRM front :5173.

## Customer data sync (app → CRM)

The CRM mirrors band.stream customers automatically — its integration contract
(`integrations/bandstream-platform.ts`) was already specified, this implements it:

- **Outbound events** (`lib/crm-events.ts`, fire-and-forget, never blocks the
  app): `signup` (auth createUser), `plan_change` (admin PATCH + Stripe webhook
  upgrade/downgrade/cancel), `shop_addon`. The CRM webhook
  (`POST /api/v1/bandstream/webhook`, HMAC token, same shared secret) upserts
  the `customers` row (source `bandstream`, plan mapped FREE/PRO/LABEL →
  gratuit/artiste/label) and appends a timeline interaction.
- **Platform API for the CRM** (`/api/crm/v1/*`, `Authorization: Bearer
  CRM_API_KEY`): `ping`, `accounts/find?email=`, `accounts/:id/artists`,
  `accounts/:id/smartlinks` — the CRM customer page reads artists & smartlinks
  LIVE from the app (no copy). Configure URL + key in the CRM `/settings` page
  (stored encrypted, `ADS_ENCRYPTION_KEY` required CRM-side).
- **Billing tab**: the CRM reads subscriptions/invoices straight from Stripe by
  customer email — give it a restricted read-only `STRIPE_SECRET_KEY`.
- Env: app `CRM_API_URL` + `CRM_API_KEY`.
