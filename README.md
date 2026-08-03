# Fawtara — Modular Document & Invoice SaaS

Multi-tenant SaaS for creating professional documents (Tenders, Offer Letters,
NOCs, Policy Letters) and **Tax Invoices**, with native **Arabic (RTL)**
support, **dual-branding** (your logo + client logo), and a built-in
**VAT engine**. Region-agnostic by design.

Built **Supabase-first**: the PRD's Prisma / Clerk / S3 / BullMQ / Playwright
stack is realised with Supabase Postgres + RLS, Supabase Auth, and Supabase
Storage. PDF export in this MVP uses the browser's print-to-PDF against an A4
print stylesheet; a headless-render Edge Function is the phase-2 upgrade.

## Deployment
Deployed as a **fully static client-side SPA** to **GitHub Pages** at
`https://box-the-third.github.io/fawtara/` (`output: 'export'`, `basePath: /fawtara`).
Auth, the auth gate, and all data fetching run in the browser against Supabase
(the anon/publishable key is public; RLS enforces isolation). Pushing to `main`
triggers `.github/workflows/deploy.yml`, which builds and publishes `out/`.

## Stack
- **Next.js 14** (App Router, TypeScript, static export) + **Tailwind CSS**
- **Supabase** — Postgres (RLS), Auth (browser client, localStorage session), Storage
- Project: `Fawtara-Docs-SaaS` (`xlfoesqvxevsnkebmnas`, region `eu-central-1`)

## The buyer's journey
`/` landing → `/signup` → `/onboarding` (create org) → `/dashboard`
→ `/documents/new` (live VAT preview) → `/documents/view?id=…` (view + Export PDF).
Fully responsive: desktop sidebar, mobile bottom-tab navigation.

## Multi-tenancy
`auth.users` ─< `memberships` >─ `organizations`. Every tenant table is gated by
`is_org_member(org_id)` in RLS. Orgs are created atomically with an owner
membership via the `create_organization` RPC. Invoice numbers come from
`next_document_number` (e.g. `INV-2026-0001`).

## Getting started
```bash
npm install
cp .env.example .env.local   # already populated for the live project
npm run dev                  # http://localhost:3000/fawtara  (note the base path)
```

`.env.local` needs:
```
NEXT_PUBLIC_SUPABASE_URL=https://xlfoesqvxevsnkebmnas.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable key>
```

Demo login (seeded, pre-confirmed): `demo@fawtara.app` / `Password123!`

## Supabase Auth configuration (required for the live site)
In the Supabase dashboard → **Authentication → URL Configuration**:
- **Site URL:** `https://box-the-third.github.io/fawtara`
- **Redirect URLs (allow list):** add `https://box-the-third.github.io/fawtara/login/`
  (keep `http://localhost:3100/fawtara/login/` for local dev)

This is what points new-account confirmation emails at the deployed app instead
of localhost. `emailRedirectTo` is computed from the current origin + base path.

## Database
Schema lives in `supabase/migrations/` (`0001_init.sql`, `0002_harden_rls_and_functions.sql`),
already applied to the live project. Regenerate types after schema changes.

## Roadmap (phase 2)
- Headless-Chromium PDF Edge Function; optional regional e-invoicing adapters (QR / compliance)
- Logo storage in Supabase Storage via a server route (service role) — currently logos are embedded data URLs
- Editable HTML/CSS (Handlebars) templates per org
- Team invites & roles, product catalog line-item picker
- Enable leaked-password protection in Supabase Auth settings
