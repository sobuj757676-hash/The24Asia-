# 24Asia Community Impact Platform

A mobile-first, multilingual, installable **PWA** for [24Asia](https://www.24asia.org/) — a Singapore-based, migrant-led volunteer group offering free training, community activities and support for migrant workers.

This repository implements the **Phase 1A + 1B foundation** described in
[`24ASIA_PLATFORM_PRD.md`](./24ASIA_PLATFORM_PRD.md): one product with a public
website, authenticated member/volunteer portals, and a staff/admin operating
system — built on a single design system, identity/consent layer and structured
data model.

> **Scope note.** The PRD defines a phased, gated programme (Phases 0–4). It is
> explicit that "everything at once" is the top delivery risk. This codebase
> delivers the launch-critical (P0) foundation. High-risk capabilities
> (donation payments, recurring giving, merch checkout, public counselling
> intake, community) are **built but feature-flagged OFF** until their
> governance decision in PRD §30.2 is approved. See [Feature gates](#feature-gates).

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

- **Public website** (`/`) — home with live impact metrics, training catalogue &
  schedule, events, volunteer opportunities, get support + urgent help, impact,
  live shows, about/team/partners/contact, certificate verification, donate.
- **Member/personal hub** (`/account`) — my courses, certificates, events,
  granular communication preferences & consent.
- **Volunteer hub** (`/volunteer-portal`) — dashboard, applications, shifts,
  hours logging (goes to approval).
- **Admin** (`/admin`) — dashboard KPIs, program/application review (approve →
  auto-enrol), volunteer review, events, scoped people CRM, audit log, feature
  flags.

Routes under `/admin`, `/account`, `/volunteer-portal` are gated by
`src/middleware.ts` (session) and per-page permission checks.

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

## Feature gates

High-risk capabilities are seeded **disabled** and flipped only after the PRD
§30.2 governance decision. Manage them at `/admin/flags` (audited).

| Flag | Gated on |
|---|---|
| `donations.payment` | Charity/IPC + tax status + payment vendor |
| `donations.recurring` | Donor self-service controls (FUND-006) |
| `merch.payment` | Tax / fulfilment / refund review |
| `support.public_intake` | Named trained staffed coverage + SLAs |
| `community.enabled` | Moderators + safeguarding (Phase 3) |
| `notifications.push` | VAPID keys + consent tooling |

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

## What is intentionally NOT here (per PRD phasing)

Assessments/quizzes, full mentorship & referral closed-loop, community, payment
processing, SMS/WhatsApp/push delivery, partner portal, and content migration
from WordPress are later phases and/or require governance sign-off. The schema
and feature flags anticipate them.
