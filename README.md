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
