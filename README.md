# HF E-Autos

Website for the used-EV dealership **HF E-Autos** (Wiesbaden). Next.js 15 (App
Router) · React 19 · TypeScript · Tailwind CSS v4. Live inventory is pulled from
the dealer's **mobile.de** account and re-synced automatically once a day.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in the values you have
npm run dev                  # http://localhost:3000
```

Without any environment variables the site still runs: it serves
`FALLBACK_VEHICLES` from [`data/vehicles.ts`](data/vehicles.ts) and the contact
form shows phone / e-mail fallbacks.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Absolute base URL (OG tags, sitemap, JSON-LD). |
| `MOBILE_DE_USERNAME` / `MOBILE_DE_PASSWORD` | mobile.de **Search API / Ad-Integration** Basic-Auth user. |
| `MOBILE_DE_SELLER_ID` | The `customerId` / `mobileSellerId` used to restrict the Search API inventory (`879460`). This is not the dealer customer number. |
| `KV_REST_API_URL` + `KV_REST_API_TOKEN` | Vercel KV / Upstash Redis (REST). Preferred store. |
| `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` | Alternative Upstash-native names. |
| `REDIS_URL` | Alternative plain Redis connection string. |
| `SYNC_SECRET` | Shared secret for manually triggering the sync endpoint. |
| `CRON_SECRET` | Set in Vercel so the daily Cron call is authenticated automatically. |
| `RESEND_API_KEY` | Enables the contact form. Without it the form is disabled gracefully. |
| `CONTACT_TO_EMAIL` / `CONTACT_FROM_EMAIL` | Recipient / sender for contact-form mails. |

If no KV/Redis vars are set, the sync writes to `data/vehicles.json` (local dev
only – serverless filesystems are read-only).

## mobile.de sync

- Client + mapping: [`lib/mobileDe.ts`](lib/mobileDe.ts)
- Storage abstraction: [`lib/store.ts`](lib/store.ts)
- Read helper used by every page: [`lib/vehicles.ts`](lib/vehicles.ts) (`getVehicles()`)

### Endpoints

| Route | Behaviour |
| --- | --- |
| `GET /api/vehicles` | Current stored vehicle list (falls back to `FALLBACK_VEHICLES`). |
| `GET /api/sync-vehicles` | Sync **status** only: `{ count, lastSync, storage, mobileDeConfigured }`. |
| `GET /api/sync-vehicles?sync=1` | Runs a sync. Secret-gated. |
| `POST /api/sync-vehicles` | Runs a sync. Secret-gated. |
| `POST /api/contact` | Sends the contact form via Resend (`501` when unconfigured). |

Secret is accepted via `Authorization: Bearer <secret>`, `x-sync-secret: <secret>`
or `?token=<secret>`, matched against `SYNC_SECRET` **or** `CRON_SECRET`. If
neither secret is configured the endpoint is open.

The sync reads every public ad from mobile.de's Search API (Ad-Integration), maps
each to the `Vehicle` type, diffs against the stored snapshot and only rewrites
storage when something actually changed (id set / price / mileage / images).
Vehicles that disappear from mobile.de are dropped.

### Daily automation

[`vercel.json`](vercel.json) registers a Cron job hitting
`/api/sync-vehicles?sync=1` every day at 14:00 UTC (15:00 German winter time, 16:00 in summer). Add `CRON_SECRET` to the Vercel
project so the call authenticates itself.

Manual trigger during local dev:

```bash
curl "http://localhost:3000/api/sync-vehicles?sync=1&token=$SYNC_SECRET"
```

## Deployment (Vercel)

1. Import the repo, framework preset **Next.js**.
2. Add all environment variables above (Production + Preview).
3. Provision **Upstash Redis** via the Vercel Marketplace (gives `KV_REST_API_*`).
4. Deploy. Confirm the Cron job appears under **Settings → Cron Jobs**, then run
   it once manually from the dashboard.

## Pages

`/` · `/unsere-angebote` · `/unsere-angebote/[vehicleSlug]` · `/ueber-uns` ·
`/leistungen` · `/kontakt` · `/impressum` · `/datenschutz`

## Editing content

Almost everything the dealer needs to change lives in
[`lib/site.ts`](lib/site.ts): address, phone, WhatsApp, opening hours, Impressum
data, navigation, mega-menu categories, services copy, footer links. Values still
marked `«…»` (opening hours, USt-IdNr.) need to be filled in.
