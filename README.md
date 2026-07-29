# 24Asia Community Impact Platform

A mobile-first, multilingual, installable **PWA** for [24Asia](https://www.24asia.org/) — a Singapore-based, migrant-led volunteer group offering free training, community activities and support for migrant workers.

This repository implements the **Phase 1A + 1B foundation** described in
[`24ASIA_PLATFORM_PRD.md`](./24ASIA_PLATFORM_PRD.md): one product with a public
website, authenticated member/volunteer portals, and a staff/admin operating
system — built on a single design system, identity/consent layer and structured
data model.

> **Scope.** This repository implements the **full platform across all PRD
> phases** — public site, learner/volunteer/partner portals, and a complete
> staff/admin operating system. The company configures everything through the
> admin panel (courses, events, opportunities, services, campaigns, products,
> content, users/roles, etc.). Sensitive/high-risk capabilities remain
> **admin-toggleable feature flags** (see [Feature flags](#feature-flags)) so
> the organisation controls when each goes live.

---

## Tech stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16 (App Router, RSC) + React 19 + TypeScript |
| Styling | Tailwind CSS v4 (CSS-first `@theme` tokens) + Radix primitives |
| Database | PostgreSQL (Neon serverless) |
| ORM / migrations | Drizzle ORM + drizzle-kit |
| Auth | better-auth — email + phone OTP, TOTP 2FA (staff MFA), admin plugin |
| Access control | RBAC + ABAC (`src/lib/auth/permissions.ts`) |
| i18n | next-intl — English (`en-SG`), Bengali (`bn`), Tamil (`ta`) |
| PWA / offline | Serwist service worker + web app manifest |
| Validation | Zod |

Architecture is a **modular monolith** (PRD §23): domain modules under
`src/db/schema/*` and `src/server/*`, with strict trust boundaries.

---

## Getting started

### Prerequisites
- Node.js 22+, pnpm 10+
- A PostgreSQL database (Neon recommended)

### Setup

```bash
pnpm install
cp .env.example .env      # fill in DATABASE_URL and BETTER_AUTH_SECRET
pnpm db:migrate           # apply schema
pnpm db:seed              # load baseline demo data
pnpm dev                  # http://localhost:3000
```

Generate a secret with `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`.

### Scripts

| Command | Purpose |
|---|---|
| `pnpm dev` | Dev server |
| `pnpm build` / `pnpm start` | Production build / serve |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint |
| `pnpm db:generate` | Generate a migration from schema changes |
| `pnpm db:migrate` | Apply migrations |
| `pnpm db:seed` | Seed baseline data |
| `pnpm db:studio` | Drizzle Studio |

### Bootstrapping an admin

Auth uses passwordless OTP, so create a user by signing in once, then grant a role:

```bash
pnpm tsx --env-file=.env scripts/grant-role.ts you@example.com admin
```

Roles: `admin`, `coordinator`, `finance`, `publisher`, `content_author`,
`trainer`, `support_coordinator`, `safeguarding_lead`, `auditor`, … (see
`src/lib/auth/permissions.ts`).

---

## Surfaces

- **Public website** (`/`) — home with live impact metrics, training catalogue,
  schedule & learning pathways, events, volunteer opportunities, get support +
  urgent help + private contact request, careers, community, live shows,
  impact, about/team/partners/contact, certificate verification, donate, shop,
  newsletter.
- **Member/personal hub** (`/account`) — courses, materials, assessments (take
  quizzes), certificates, events, career goals & mentorship, support requests,
  notifications (in-app + push), communication preferences & consent.
- **Volunteer hub** (`/volunteer-portal`) — dashboard, applications, shifts,
  hours logging, expense claims.
- **Partner portal** (`/partner-portal`) — linked partner contacts submit
  opportunity listings for review and manage their listings.
- **Admin operating system** (`/admin`) — dashboards + full configuration CRUD:
  programs (courses, cohorts, applications→auto-enrol, assessments,
  certificates, materials, pathways), events, volunteers (opportunities,
  reviews, expenses), content (pages, metrics, services, partners, episodes),
  shop + inventory, finance (donations, orders, refunds), support case queue,
  career/mentorship, community moderation, communications (campaigns, push),
  governance (risks, incidents, policies, meetings), assets, people CRM, users &
  roles, audit log, feature flags.

Routes under `/admin`, `/account`, `/volunteer-portal`, `/partner-portal` are
gated by `src/middleware.ts` (session) and per-page RBAC/ABAC permission checks.

## Capabilities by PRD phase

| Area | Status |
|---|---|
| Public site + PWA + i18n (en/bn/ta) | ✅ |
| Identity, RBAC+ABAC, consent, audit | ✅ |
| Programs: courses→cohorts→sessions→applications→enrolment→attendance | ✅ |
| Assessments, certificates (verifiable), materials, learning pathways | ✅ |
| Events, registrations, blood drives, live shows | ✅ |
| Volunteering: opportunities, applications, shifts, hours, expenses, recognition | ✅ |
| Payments: donations + shop checkout (Stripe-ready + test mode), refunds | ✅ |
| Support intake + referrals, career listings, mentorship | ✅ |
| Community + moderation (groups, posts, reports, queue) | ✅ |
| Notifications (in-app), web push, newsletters/campaigns | ✅ |
| Partner portal, inventory/assets, governance (risks/incidents/policies/meetings) | ✅ |
| Full admin configuration CRUD for every entity | ✅ |

---

## Data model

~42 tables across the PRD §12 domains: identity/RBAC/consent, CMS + localization,
learning (courses → cohorts → sessions → applications → enrolment → attendance →
certificates), events + registrations + blood donation + live shows,
volunteering (opportunities → applications → profiles → shifts → hours →
recognition), support/services, and operations (audit, feature flags,
notifications, inquiries, donations). Schema lives in `src/db/schema/`.

Every domain table carries a data-classification intent (public / internal /
confidential / restricted, PRD §12.2). Sensitive support narratives are kept out
of general CRM/search views.

---

## Feature flags

Capabilities are **admin-toggleable** at `/admin/flags` (every change is
audited), so the organisation decides when each goes live. Seeded **on** by
default for a ready-to-run platform:

| Flag | Controls |
|---|---|
| `donations.payment` | Online donation checkout |
| `donations.recurring` | Recurring donation plans |
| `merch.payment` | Shop checkout payment |
| `support.public_intake` | Public private-contact/support request form |
| `community.enabled` | Community groups & posting |
| `notifications.push` | Web push notifications |

## Payments

Runs in **test mode** out of the box (the full donation/shop flow works without
a processor). Set `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` to route through
Stripe Checkout; completion is confirmed by the signed webhook at
`/api/payments/webhook`. Card data never touches the platform.

## Push notifications

Web push uses VAPID keys (`VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`,
`NEXT_PUBLIC_VAPID_PUBLIC_KEY`). Generate with `npx web-push generate-vapid-keys`.

---

## Accessibility, privacy & security highlights

- WCAG 2.2 AA intent: semantic landmarks, skip link, visible focus, 44px touch
  targets, `prefers-reduced-motion`, no color-only meaning.
- Consent ledger + granular channel/topic communication preferences.
- Append-only audit trail for sensitive actions.
- Adults-first with a minimal age attestation and a restricted age-review state
  (no full DOB / identity documents collected by default).
- Security headers (HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy);
  admin/portal routes are `noindex`.
- PWA caches only public content — never auth/admin/restricted data; sign-out
  purges caches.

---

## Future enhancements

The platform is functionally complete across the PRD phases. Natural next steps
for a production rollout: WordPress content migration, SMS/WhatsApp delivery
providers, object-storage media uploads (S3/R2 wiring is stubbed via env),
skills passport / verifiable credentials, and Open Referral data exchange.
