# Quantovest Capital — Next.js `develop` deployment

This branch contains the premium Quantovest interface plus the first production-oriented port of the persistent investor referral foundation. The port uses Next.js App Router route handlers, Drizzle ORM, MySQL/TiDB, and Auth.js sessions.

## Required environment variables

Copy `.env.example` to the deployment provider's environment-variable manager. Do not commit a populated `.env` file.

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | MySQL or TiDB connection string used by Drizzle and Auth.js adapter tables. |
| `NEXTAUTH_SECRET` | Long random secret used to sign Auth.js sessions. |
| `NEXTAUTH_URL` | Canonical deployment URL, including `https://`. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional Google provider credentials. |
| `APPLE_CLIENT_ID` / `APPLE_CLIENT_SECRET` | Optional Apple provider credentials. |
| `EMAIL_SERVER` / `EMAIL_FROM` | Optional email-provider configuration for email sign-in. |

Provider credentials are optional only if that provider is not enabled in `lib/auth.ts`. At least one real provider must be configured before investor sign-in can be used in production.

## Database workflow

After `DATABASE_URL` is available locally or in the deployment environment, install dependencies and generate or apply migrations with the package scripts:

```bash
pnpm install
pnpm db:generate
pnpm db:migrate
```

The checked-in SQL files under `db/migrations/` are the source-controlled schema history for the Next.js port. Apply them against a new staging database first. The referral tables include immutable attribution, idempotent first-deposit rewards, held reward balances, withdrawal requests, and notifications.

## Referral behavior

The referral link is created by an authenticated investor and enters through `/r/:code`. A referred investor can be attributed once. The reward ledger is intended to credit **10% of the first approved qualifying deposit**, with idempotency enforced by the qualifying deposit key. The investor dashboard reads the summary and analytics route handlers, and the withdrawal route enforces the **$500 minimum**.

A payout request supports either a bank destination or a crypto wallet destination. To avoid double-spending in this migration slice, a withdrawal request reserves the investor's full currently available referral balance by moving those reward rows to `held`. Admin approval or rejection must release or settle those held rows in the corresponding admin route before enabling production payouts.

## Authentication and callback URLs

Configure the provider callback URLs for the deployed origin. For Auth.js, the standard callback is:

```text
https://YOUR_DOMAIN/api/auth/callback/PROVIDER
```

The exact provider identifier is `google`, `apple`, or `email` depending on the enabled adapter. Verify the callback URL in each provider console and verify that the deployment's `NEXTAUTH_URL` matches the public origin exactly.

## Verification checklist

Run `pnpm build` after adding production environment variables. Then verify a complete staging flow: sign in, create a referral link, open the link in a second account, approve a first deposit through the admin process, confirm the 10% notification and ledger entry, reach the $500 threshold, submit a bank and crypto withdrawal request in separate test records, and approve or reject each request from the admin console.

The current working-tree typecheck passes with `./node_modules/.bin/tsc --noEmit`. Production authentication, real email delivery, KYC verification, and payment-provider settlement still require provider credentials and completion of the remaining admin queue routes before launch.
