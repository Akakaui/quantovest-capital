# Quantovest Capital — One-Click Portability Guide

## Purpose

This repository now includes `db/quantovest-install.sql` as the canonical database bootstrap for a new Supabase project. A new owner can create a Supabase project, open the SQL Editor, paste that one file, and create the application schema, indexes, plan defaults, private media bucket, and row-level security policies in one run.

The bootstrap is intended for a **new project**. For an existing production project, use the numbered migration files instead of rerunning a full bootstrap blindly.

## One-click database setup

1. Create a new Supabase project.
2. Open **SQL Editor → New query**.
3. Copy the complete contents of `db/quantovest-install.sql`.
4. Paste it into an empty query tab.
5. Run it once from top to bottom.
6. Confirm that the `platformSettings` table, `quantovest-media` private bucket, plans, indexes, and policies exist.
7. Create the first administrator through the application or the controlled admin bootstrap process; never copy an existing customer or admin row into a new customer deployment.

The file uses `IF NOT EXISTS`, conflict-safe plan inserts, and guarded policy blocks so it is safe to use as a fresh-project bootstrap. It should not be treated as a general-purpose production migration because policy replacement and seed defaults are intentionally authoritative.

## Required application environment

Copy `.env.example` to `.env.local` for local development and configure the same variable names in Vercel for Preview and Production. The values must belong to the new owner’s Supabase, Resend, Tawk.to, and domain accounts.

| Variable | Required purpose | Exposure |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | New Supabase project URL | Browser-safe |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase client key | Browser-safe |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side admin/storage operations | Server-only |
| `SUPABASE_MEDIA_BUCKET` | Private media bucket; use `quantovest-media` | Server-side |
| `DATABASE_URL` | Supabase Postgres pooler connection | Server-only |
| `APP_PUBLIC_URL` | Canonical app URL for redirects and email links | Server-side |
| `ZOHO_SMTP_HOST` | Zoho SMTP host (`smtp.zoho.com`) | Server-only |
| `ZOHO_SMTP_PORT` | Zoho SMTP port (`465`) | Server-only |
| `ZOHO_SMTP_USER` | Business mailbox (`support@quantovests.com`) | Server-only |
| `ZOHO_SMTP_PASS` | Zoho app-specific password | Server-only |
| `EMAIL_FROM` | Verified business sender | Server-side |
| `NEXT_PUBLIC_TAWK_PROPERTY_ID` | Tawk.to property | Browser-safe |
| `NEXT_PUBLIC_TAWK_WIDGET_ID` | Tawk.to widget | Browser-safe |
| `JWT_SECRET` | Signing secret for expiring 2FA completion state | Server-only |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional Google OAuth provider credentials | Server-only |

Never commit `.env.local`, service-role keys, database passwords, Resend keys, OAuth secrets, QR payloads, wallet private keys, or recovery codes.

## What is intentionally not copied

The portable setup must not contain customer-specific users, balances, deposits, KYC files, ROI history, withdrawals, trader allocations, notifications, private wallet addresses, or authentication secrets. Those values belong to the deployment owner and must be configured separately.

The SQL bootstrap also does not configure Supabase Auth provider settings, OAuth consent branding, DNS, Resend domain verification, Zoho mailboxes, Vercel environment variables, or Tawk.to business hours. Those services require account-level setup outside PostgreSQL.

## Existing production upgrades

For the current Quantovest project, the `platformSettings` migration has already been applied in Supabase. Future schema changes should be added as a new numbered file under `db/migrations-pg/` and applied once to the relevant existing database. After a migration is verified, update `db/quantovest-install.sql` so a new installation remains complete.

## Remaining technical tasks

| Priority | Task | State |
|---|---|---|
| P0 | Configure Supabase Auth SMTP/Resend and fix normal email signup OTP delivery | External setup and production test remain |
| P0 | Verify Resend domain and configure business sender in Vercel | External DNS/provider setup remains |
| P0 | Test 2FA enrollment, login challenge, recovery code, throttling, logout, and expired completion state | Code is present; production QA remains |
| P1 | Decide and document whether upgrade is balance qualification or requires a new approved top-up deposit | Current code is qualification-based; explicit top-up flow remains optional |
| P1 | Complete Swap source/destination asset ledger accounting if it should represent actual asset balances | Current investor UX is polished; internal transaction model remains simplified |
| P1 | Test opted-in and opted-out strategy-performance emails after Resend setup | Code is wired; provider verification remains |
| P2 | Final mobile/tablet regression at 375px and 768px | Pending |
| P2 | Verify Admin Settings load/save from multiple browsers | Pending after migration and deployment configuration |
| P2 | Replace any remaining deployment-specific public URLs in content and documentation | Audit as part of each port |

## Definition of ready for a new owner

A port is ready when the new Supabase project accepts `db/quantovest-install.sql`, the app starts with the new environment values, signup and OAuth redirects use the new `APP_PUBLIC_URL`, the private media bucket accepts KYC/deposit uploads, Admin Settings persists across browsers, Resend sends from a verified sender, Tawk.to loads the correct property, and the complete investor/admin QA checklist passes without using the original deployment’s data.
