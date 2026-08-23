# Quantovest Capital — Non-Destructive QA Report

**Author:** Manus AI  
**Date:** 23 August 2026  
**Scope:** Live production QA of the investor and admin experiences, with repository correlation. No source code, deployment configuration, admin settings, approvals, ROI entries, notifications, or financial transactions were changed.

## Executive summary

The primary production failure is a **Supabase Postgres connection configuration problem**, not an admin authorization problem and not an investor-list SQL problem. The live admin session authenticates successfully, but database-backed requests fail with:

> `(ENOTFOUND) tenant/user postgres.cbttwftusrwisxblkdvs not found`

The same database failure affects the investor KYC submission, investor profile persistence, portfolio managers, referrals, and most admin queues. The application frequently converts HTTP 500 database failures into empty arrays, zero counts, loading placeholders, or “no records” messages, which makes the outage appear to be missing data.

The file-upload endpoint itself was tested from the authenticated investor session and returned **HTTP 201** for both KYC and deposit-proof uploads. However, it writes files to bucket **`quantovest`**, while the repository’s environment template, storage policies, deployment notes, and UI URL builders expect **`quantovest-media`**. Therefore, the upload request can succeed while the resulting files remain outside the bucket governed by the application’s expected policies and display paths.

## Environment and project checked

The inspected source repository is [Akakaui/quantovest-capital](https://github.com/Akakaui/quantovest-capital) [1]. The live deployment tested was [quantovest-capital.vercel.app](https://quantovest-capital.vercel.app) [2]. The local project installed successfully, but a production build without Supabase environment variables failed during prerendering because the public Supabase URL and key were absent. The working tree was left unmodified; the only local additions are this QA report and diagnostic notes outside the tracked source files.

## Confirmed production failures

| Severity | Area | Exact observation | Status |
|---|---|---|---|
| Critical | Database connectivity | `/admin/investors` displays `Failed to fetch investors — (ENOTFOUND) tenant/user postgres.cbttwftusrwisxblkdvs not found`. | Reproduced |
| Critical | KYC submission | KYC files upload with HTTP 201, but `POST /api/kyc` returns HTTP 500 and the UI displays `KYC submission failed.` | Reproduced |
| High | Storage namespace | Upload response reports bucket `quantovest`; repository policies and UI expect `quantovest-media`. | Confirmed by code and live response |
| High | Admin queues | Deposits, withdrawals, KYC, traders, plans, referral withdrawals, swap configuration, and deposit instructions return HTTP 500, mostly with empty-array bodies. | Reproduced |
| High | Investor data | `/api/profile` returns HTTP 500; `/api/traders` returns HTTP 500; referral endpoints return HTTP 500. | Reproduced |
| High | Payment setup | Investor Deposit defaults to USDT (TRC-20) but displays `Payment address for this option is currently being updated.`; `/api/deposit-instructions` returns an empty array. | Reproduced |
| Medium | Error masking | Several pages display “No investors found,” “No plans found,” or empty queues after failed API calls. | Reproduced |
| Medium | Calculator presentation | Daily compounding produces implausibly huge values while the UI uses “fixed daily return” and “guaranteed rate” language. | Reproduced; product/legal review recommended |

## Exact reproduction evidence

### Admin Investors

After secure authentication as an administrator, the page `/admin/investors` loaded the admin shell and then displayed the full production error. The corresponding API request returned HTTP 500 with the same ENOTFOUND detail and a deployed Next.js stack trace. The admin role and session were valid, so the failure occurs after authorization in the server-side database layer.

The repository route `app/api/admin/investors/route.ts` obtains a shared Postgres client and executes a raw SQL query. The client is created in `lib/db.ts` from `process.env.DATABASE_URL`. Because the error names `postgres.cbttwftusrwisxblkdvs` as an unresolvable tenant/user host, the production `DATABASE_URL` is malformed, stale, or uses an invalid Supabase pooler/direct-connection format. A valid Supabase pooler URI should use the project-specific pooler host and username format documented by the project, such as `postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres` [3].

### Investor KYC upload and submission

In the authenticated investor session, `/dashboard/kyc` accepted two harmless JPG test files. Submitting the form showed `Uploading documents…`. A direct authenticated request to `POST /api/uploads` with purpose `kyc` returned:

```json
{
  "status": 201,
  "ok": true,
  "body": {
    "path": "kyc/<investor-id>/<uuid>.jpg",
    "bucket": "quantovest"
  }
}
```

The following authenticated `POST /api/kyc` request returned HTTP 500 with an empty body. The page reduced this to `KYC submission failed.` The repository route confirms that the next operation is an insert into `kycApplications` through the same `DATABASE_URL`-backed Drizzle client. This isolates the visible KYC failure to the database write after storage upload, not to file validation or Supabase Storage transport.

### Investor deposit-proof upload

The Deposit page accepted a harmless JPG in its proof field. A direct authenticated request to `POST /api/uploads` with purpose `deposit-proof` returned HTTP 201 and a path under bucket `quantovest`. No deposit proof was submitted, and no financial deposit record was created.

The page also showed that the default USDT (TRC-20) payment address is unavailable. Since `/api/deposit-instructions` returned an empty array, the investor cannot reliably obtain payment instructions before submitting proof.

### Investor API audit

| Endpoint | Status | Result |
|---|---:|---|
| `/api/auth/me` | 200 | Investor identity returned correctly. |
| `/api/profile` | 500 | Internal server error. |
| `/api/investor-profile` | 200 | Summary returned with zero values. |
| `/api/deposit-instructions` | 200 | Empty array; no payment instructions. |
| `/api/kyc` | 200 | Empty array; no KYC record visible. |
| `/api/history` | 200 | Empty array. |
| `/api/portfolio/holdings` | 200 | Empty array. |
| `/api/portfolio/allocation` | 200 | Allocation payload returned. |
| `/api/traders` | 500 | Empty array body despite server failure. |
| `/api/traders/my` | 200 | Empty array. |
| `/api/referrals/summary` | 500 | Zero-valued fallback payload. |
| `/api/referrals/analytics` | 500 | Empty array. |
| `/api/referrals/link` | 500 | `null` body. |
| `/api/swap/history` | 200 | Empty array. |
| `/api/notifications` | 200 | Empty items and unread count 0. |
| `/api/plans` | 200 | Empty array. |

### Admin API and page audit

`/api/admin/dashboard` was the notable successful database-related response, returning HTTP 200 with zero counts. The following endpoints returned HTTP 500: `/api/admin/deposits`, `/api/admin/withdrawals`, `/api/admin/kyc`, `/api/admin/investors`, `/api/admin/traders`, `/api/admin/plans`, `/api/admin/referrals/withdrawals`, `/api/admin/swap-config`, and `/api/admin/deposit-instructions`. `/api/admin/notifications` returned HTTP 405 for GET, which may be intentional because the composer may use a different method, but it should be verified during remediation.

The visible pages often concealed those failures. The admin Deposit page showed no pending proofs, the KYC page showed no pending applications, the Plans page showed no plans, and the Traders page showed zero active traders. The Referral Payout page did expose `Unable to load the referral payout queue.` The Notifications page loaded but showed `Recipients 0`, which is consistent with failed investor/plan lookups.

## Root-cause correlation in source

| Finding | Repository evidence |
|---|---|
| Invalid database connection | `lib/db.ts` passes `process.env.DATABASE_URL` directly to `postgres(...)` without validating that it is a project-specific Supabase URI. |
| Investor failure is connection-level | `app/api/admin/investors/route.ts` catches the database exception and returns the exact error as HTTP 500. Replacing Drizzle with raw SQL did not help because the connection fails before the query can execute. |
| KYC submission depends on same broken DB | `app/api/kyc/route.ts` inserts into `kycApplications` using `getDb()` after the upload succeeds. |
| Bucket mismatch | `app/api/uploads/route.ts` defaults to `quantovest`; `.env.example`, `db/supabase/policies.sql`, `docs/quantovest/DEPLOYMENT.md`, and UI public URL builders use `quantovest-media`. |
| Error masking | Several API routes return `[]`, `null`, or zero-valued fallback payloads after catching database errors, allowing pages to display empty states as if the database were healthy. |

## Calculator and responsive QA

The pre-remediation calculator audit recorded exponentially large outputs from daily compounding. The implementation now uses a simple-return presentation with transparent assumptions, synchronized amount controls, compact number formatting, and a risk disclaimer beside the result. The original extreme-output measurements remain historical evidence only and should not be treated as current product behavior.

The implementation removes misleading “guaranteed” language and avoids presenting hypothetical exponential outcomes as expected performance. Financial language and assumptions should still receive appropriate legal and compliance review before production launch.

Responsive measurements found no horizontal overflow at the current browser viewport and in same-origin test frames of 768×1024 and 375×812. This is a positive baseline. The layout remains dense and desktop-oriented, so a later visual pass should review mobile navigation, modal sizing, touch targets, and the amount of information shown above the fold.

## Later UI maturity recommendations

The current interface is visually coherent but still feels like an early operational prototype because many screens show sparse content, default empty states, and highly promotional financial projections. The highest-value later improvements would be to replace raw empty states with explicit service-health messaging, distinguish “no records” from “temporarily unavailable,” add retry and support escalation paths, unify bucket/configuration-driven media URLs, and add clear calculation assumptions and risk disclosures beside the ROI outputs. Admin pages should show a small data-source health indicator when a queue is unavailable rather than reporting zero records.

The public and investor financial language should also receive legal and compliance review before launch. Terms such as “guaranteed rate” and fixed daily returns can materially change user expectations, especially when the calculator displays exponential values that exceed plausible operational scales.

## Remediation status and remaining actions

1. **Implemented locally and committed:** the database configuration validator and corrected Supabase transaction-pooler handling are included in the pushed fix branch. Vercel must still be updated and redeployed by the project owner or local agent.
2. **Verified locally:** the corrected connection reached the intended Supabase database and the required schema was readable.
3. **Implemented and configured in Supabase:** `quantovest-media` is the canonical private bucket and the application no longer silently falls back to the legacy bucket. Vercel still needs the matching environment value.
4. **Pending production regression:** after Vercel redeployment, re-test uploads, KYC, deposits, and the corresponding admin queues with clearly marked test records.
5. **Implemented:** database dependency failures now use explicit service-unavailable handling rather than being presented as valid empty datasets.
6. **Pending production regression:** verify payment instructions for every enabled currency before submitting proof.
7. **Implemented in UI, review still recommended:** simple-return assumptions and risk disclosures are now visible, but final financial/compliance language should be approved before launch.

## Testing boundary

The audit intentionally did not save settings, publish ROI, approve or reject KYC, approve or reject deposits, process withdrawals, send notifications, create traders, create plans, or submit a financial deposit. The upload reproduction used harmless diagnostic JPG content. Any remaining diagnostic objects should be removed only through an authorized cleanup procedure after confirming they are not real user files.

## References

[1]: https://github.com/Akakaui/quantovest-capital "Quantovest Capital source repository"
[2]: https://quantovest-capital.vercel.app "Quantovest Capital live deployment"
[3]: https://github.com/Akakaui/quantovest-capital/blob/fix/quantovest-supabase-workflows-ui/docs/quantovest/DEPLOYMENT.md "Quantovest deployment and Supabase configuration notes"
