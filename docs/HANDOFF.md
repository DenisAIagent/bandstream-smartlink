# Handoff — Update V1.1

> New document. It does not change anything written by the original author; it
> summarizes the V1.1 work for the next developer picking up the repo. The
> authoritative feature docs live in the **`# Update V1.1`** section of
> [`README.md`](../README.md); this file is the short, decision-oriented handoff.

---

## 1. One-paragraph summary

V1.1 turns band.stream from **one page per artist** into a **multi-release SmartLink
platform**: each artist (`Band`) now owns N `SmartLink`s (one per release) plus an
**Artist Hub** at the subdomain root. On top of that: **Free / Pro / Label** plans
with enforced quotas, **Label teams** (5 users sharing a roster), **superadmin roles
+ a client 360° page** for support, **per-artist/per-SmartLink Umami analytics**,
**Odesli autofill**, and a **security pass**. All original conventions were kept;
all original release-level fields are deprecated-but-retained behind a render
fallback so nothing breaks.

---

## 2. Where things live (V1.1 additions)

| Concern | Files |
|---|---|
| Data model | `prisma/schema.prisma` (`SmartLink`, `SmartLinkPlatform`, `LabelMember`, `Band.bio/socials/umamiWebsiteId`, `SubscriptionPlan.LABEL`) |
| Migration | `scripts/migrate-smartlinks.js` (idempotent backfill) |
| Services | `lib/services/{smartlink-create,smartlink-platforms,smartlink-upload,band-create,band-platforms,band-upload,umami,plan-limits,label-team}.ts` |
| Shared limits | `lib/plan-limits-shared.ts` |
| Auth/ownership | `lib/auth/ownership.ts` (`verifySmartLinkOwnership`), `lib/safe-fetch.ts` (SSRF guard) |
| Fan render | `app/customer/[locale]/[customer]/page.tsx` (hub) + `[slug]/page.tsx`; `components/bandstream/landingpages/hub/*`; `templates/adapter.ts` |
| Dashboard UI | `components/bandstream/dashboard/{ArtistSpace,LabelTeam}.tsx`, `dashboard/smartlinks/*`, `dashboard/stats/*`, `wizard/*` |
| Admin UI | `components/bandstream/admin/users/UserOverview.tsx`, smartlinks tab in `app/[locale]/admin/bands/edit/[id]/page.tsx` |
| API | `app/api/dashboard/{smartlinks,bands/[id]/smartlinks,label,limits,odesli}/*`, `app/api/admin/{users/[id]/{plan,role,overview},smartlinks,bands/[id]/smartlinks}/*` |

---

## 3. Key design decisions (and why)

1. **`SmartLink` as a separate model, `Band` = the artist.** A release is its own
   entity (slug, artwork, template, platform links, publish state). The subdomain
   root renders the hub; `/<slug>` renders a release.
2. **Root URL behaviour.** If an artist has no bio/socials and exactly one published
   SmartLink, the root renders that release inline (preserves shared links/QR codes
   and the Umami `/` path). Otherwise the hub is shown. A legacy fallback renders the
   old `Band` fields if no SmartLink exists yet.
3. **Plans gate server-side, before creation.** `canCreateArtist` /
   `canCreateSmartLink`. For label members, the **band owner's** plan governs the
   band's rights (`getBandOwnerPlan`).
4. **Label access is materialized as `UserBand MEMBER` rows**, so the existing
   `verifyBandOwnership` keeps working unchanged across the whole app.
5. **One Umami website per artist** because the v0.76 client can't filter stats by
   host; per-SmartLink stats use the `url` filter on `/<slug>`.
6. **Deprecate, don't delete.** `Band.album/template/musicSample` and `BandPlatform`
   are retained for the render fallback during/after migration.

---

## 4. Operating the new pieces

- **Backfill existing artists:** `node scripts/migrate-smartlinks.js` (safe to re-run).
- **Activate a Label/Pro account:** Admin → Users (or the client 360° page) → plan
  selector. No self-serve Label checkout in V1.1.
- **Provision analytics:** set the Umami env vars; websites are auto-created at
  publish time.
- **Local preview without login:** `PREVIEW_NO_AUTH=1` in a local `.env` only.

---

## 5. Open follow-ups (priority order)

1. **Finish i18n.** `fr`/`en` are complete; the other 24 locales fall back to
   English. Run `npm run translate -- en.json` (needs `OPENAI_API_KEY`).
2. **Remove the preview bypass** once a real test account exists. It is inert in
   production by design (`NODE_ENV` guard in `auth.ts`) but should not ship.
3. **Cleanup PR** after the SmartLink migration is verified in production: drop the
   deprecated `Band.album/template/musicSample` + `BandPlatform`, and the legacy
   FormData `POST`/`PUT` admin band routes.
4. **Security backlog** (from the V1.1 audit): strict nonce-based CSP, non-root
   Docker `USER`, OWNER-only restriction on plan changes, automatic cleanup of
   third-party band access on label off-boarding.

---

## 6. Verification done

- `npm run build` green (531 static pages); `tsc --noEmit` clean on new code.
- End-to-end (Playwright, 375 + 1440): create artist → SmartLink wizard with Odesli
  autofill → publish → hub lists releases → per-SmartLink stats; Free plan gate →
  upsell; Label roster `X/100`; label invite materializes roster access; client
  360° page.
- Security fixes verified functionally (path-traversal `400`, `javascript:` URL
  rejected, security headers present, socials zod rejection).
