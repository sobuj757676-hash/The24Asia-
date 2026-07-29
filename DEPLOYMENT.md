# Deploying 24Asia to Vercel

This guide takes you from the GitHub repo to a live deployment on Vercel with a
Neon Postgres database.

> **Time:** ~15 minutes. **You need:** a GitHub account (repo already pushed),
> a [Vercel](https://vercel.com) account, and a [Neon](https://neon.tech)
> Postgres database (or any Postgres).

---

## 1. Prerequisites

- The repository is on GitHub: `sobuj757676-hash/The24Asia-`.
- A Postgres database. A Neon database is already provisioned for this project;
  you can reuse it or create your own (Neon → New Project → copy the **pooled**
  connection string).
- Node 20+ locally if you want to run migrations from your machine.

---

## 2. Push the deploy branch (done)

This branch (`deploy/vercel`) contains the deployment config:

- `package.json` build script uses **webpack** (`next build --webpack`) so the
  Serwist **service worker (PWA)** is generated. Turbopack build does not emit
  the service worker.
- `vercel.json` pins the serverless region to `iad1` (US-East) to sit next to
  the Neon database and minimise latency.

---

## 3. Import the project into Vercel

1. Go to **vercel.com → Add New → Project**.
2. **Import** the `The24Asia-` GitHub repo.
3. Framework preset: **Next.js** (auto-detected).
4. Build & Output settings — leave defaults. Vercel auto-detects **pnpm**.
   - Build command: `pnpm build` (runs `next build --webpack`)
   - Install command: `pnpm install`
5. **Do not click Deploy yet** — set environment variables first (next step),
   otherwise the build fails validation (`src/env.ts` requires `DATABASE_URL`
   and `BETTER_AUTH_SECRET`).

---

## 4. Environment variables

In **Project → Settings → Environment Variables**, add the following for the
**Production** (and Preview) environments.

### Required (build fails without these)

| Key | Value |
|---|---|
| `DATABASE_URL` | Your Neon **pooled** connection string (`postgresql://…-pooler.…/neondb?sslmode=require`) |
| `BETTER_AUTH_SECRET` | A random 32-byte secret. Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |

### Strongly recommended (set after you know your domain)

| Key | Value |
|---|---|
| `BETTER_AUTH_URL` | Your deployment URL, e.g. `https://the24asia.vercel.app` |
| `NEXT_PUBLIC_SITE_URL` | Same as above |
| `NEXT_PUBLIC_SITE_NAME` | `24Asia` |

### Optional (features light up when present)

| Key | Purpose |
|---|---|
| `RESEND_API_KEY` / `EMAIL_FROM` | Real transactional email (OTP, receipts). Without it, OTPs are logged to the server console. |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Live payments via Stripe Checkout. Without them the app runs in **test payment mode**. |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Web push notifications. Generate: `npx web-push generate-vapid-keys` |
| `VAPID_SUBJECT` | `mailto:hello@24asia.org` |

> Copy the exact values from your local `.env` (which is gitignored) or from the
> Neon / Stripe dashboards.

---

## 5. Prepare the database (migrations + seed)

The schema must exist in the database before the app can serve data. Run this
**once** from your machine, pointing at the production database:

```bash
# from the repo root, with the production DATABASE_URL exported
export DATABASE_URL="postgresql://…-pooler.…/neondb?sslmode=require"
pnpm install
pnpm db:migrate      # applies drizzle/*.sql
pnpm db:seed         # optional: loads demo courses/events/etc.
```

> If you reuse the Neon database already provisioned for this project, it is
> **already migrated and seeded** — you can skip this step.

---

## 6. Deploy

Click **Deploy** in Vercel. First build takes a few minutes. When it finishes
you'll get a URL like `https://the24asia.vercel.app`.

After the first deploy:
1. Set `BETTER_AUTH_URL` and `NEXT_PUBLIC_SITE_URL` to that URL (or your custom
   domain) if you hadn't already.
2. **Redeploy** (Deployments → ⋯ → Redeploy) so auth cookies and absolute URLs
   use the correct origin.

---

## 7. Create the first admin

Sign in once on the live site (email or phone OTP — in dev/without email the
code is printed in Vercel's function logs), then grant yourself the admin role:

```bash
export DATABASE_URL="postgresql://…-pooler.…/neondb?sslmode=require"
pnpm tsx --env-file=.env scripts/grant-role.ts you@example.com admin
```

Now `/admin` is available and you can configure everything (courses, events,
opportunities, content, users, feature flags, …).

---

## 8. Optional integrations

### Stripe (live payments)
1. Add `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
2. In the Stripe dashboard → Webhooks, add an endpoint:
   `https://YOUR_DOMAIN/api/payments/webhook`, event
   `checkout.session.completed`. Copy the signing secret into
   `STRIPE_WEBHOOK_SECRET`. Redeploy.

### Web push
Add the three `VAPID_*` vars. Users can then enable push from
**Account → Notifications**.

---

## 9. Custom domain

Vercel → Project → Settings → Domains → add your domain and follow the DNS
instructions. Then update `BETTER_AUTH_URL` and `NEXT_PUBLIC_SITE_URL` to the
custom domain and redeploy.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Build fails: `Invalid environment configuration` | `DATABASE_URL` or `BETTER_AUTH_SECRET` missing in Vercel env vars. |
| Signed in but redirected back to sign-in | `BETTER_AUTH_URL` doesn't match the deployment origin. Set it and redeploy. |
| Pages load but no data | Migrations/seed weren't run against the production `DATABASE_URL`. |
| PWA / offline not working | Ensure the build ran with `--webpack` (this repo's `build` script already does). |
| OTP code never arrives | No email provider configured — check Vercel function logs for the code, or set `RESEND_API_KEY`. |
| DB connection errors under load | Use the Neon **pooled** connection string (host contains `-pooler`). |

---

## Notes

- The app is a modular-monolith Next.js 16 App Router project; all routes are
  server-rendered on demand, so builds don't need the database to be reachable —
  only the env vars must be present.
- Neon scales to zero; the first request after idle may be slightly slower.
