# Quantovest Capital — Implementation, UI Refinement, GitHub Delivery, and Full QA Prompt

Copy the prompt below into your coding agent.

---

You are working on the Quantovest Capital repository: `Akakaui/quantovest-capital`.

Your job is to read the repository, inspect the confidential `.env.local` file available in the workspace, diagnose the production failures, implement the fixes, improve the product quality where requested, run comprehensive tests, and push the completed work to GitHub. Do not expose, print, commit, or upload any secret values. Never commit `.env.local`, service-role keys, database passwords, OAuth secrets, email keys, or VAPID private keys. Use redacted diagnostics only.

## 1. Start with a safe baseline

Read `README.md`, `docs/quantovest/DEPLOYMENT.md`, `.env.example`, `db/schema.ts`, `db/setup.sql`, all PostgreSQL migrations, `db/supabase/policies.sql`, `lib/db.ts`, `lib/supabase/*`, `lib/uploadRules.ts`, the relevant API routes under `app/api`, and the relevant admin/investor pages.

The implementation was delivered on the branch `fix/quantovest-supabase-workflows-ui`. If reproducing the work from a clean checkout, create or checkout that branch before reviewing the changes. Record the current commit, run `pnpm install --frozen-lockfile`, run the existing build/lint checks, and capture the baseline failures.

Inspect `.env.local` safely. Confirm only the following non-secret facts:

1. The Supabase project reference in `NEXT_PUBLIC_SUPABASE_URL`.
2. The database username, host, port, and database name after removing the password.
3. Whether the database username project reference matches the Supabase URL project reference.
4. Whether the database host is the correct Supabase pooler host for the actual project region.
5. Whether `SUPABASE_MEDIA_BUCKET` equals the canonical bucket name `quantovest-media`.

Do not assume that a syntactically valid pooler URI is operational. Use a read-only `select 1` connection test and report the exact server response.

## 2. Diagnose and fix the database connection correctly

The current production error is:

`(ENOTFOUND) tenant/user postgres.cbttwftusrwisxblkdvs not found`

It occurs after successful admin authentication on `/admin/investors`, and it also affects multiple database-backed investor and admin routes. The supplied local environment reproduces the same error during a read-only Postgres connection test, so treat the database configuration as an actual failing dependency rather than a frontend issue.

Determine the precise cause using the Supabase project’s actual database connection details. Validate all of the following:

- The Supabase project reference is correct.
- The Postgres pooler host region matches the project’s region.
- The pooler port is appropriate for the selected connection mode.
- The username is the correct project-scoped pooler username.
- The password is current and correctly URL-encoded.
- The target database is `postgres` unless Supabase explicitly specifies otherwise.
- SSL is configured correctly for the chosen connection.
- The deployed Vercel environment contains the corrected value, not merely the local `.env.local` value.

If the existing `DATABASE_URL` is wrong, correct it through the deployment environment rather than hardcoding credentials. If the project’s direct connection is unsuitable for Vercel, use the correct Supabase pooler connection string recommended for serverless workloads. Add a safe startup/configuration validator that reports categories such as “missing,” “malformed,” or “connection refused,” but never logs passwords or full connection strings.

Do not “fix” this by replacing database access with fake data, empty arrays, browser-only Supabase queries, or hardcoded investor records. Database failure must remain visible and actionable.

## 3. Fix the canonical Supabase Storage bucket

Use one canonical bucket name everywhere: `quantovest-media`.

The repository’s `.env.example`, deployment documentation, and storage policies use `quantovest-media`, but the current upload route falls back to `quantovest`. The live authenticated investor tests showed:

- `POST /api/uploads` with purpose `kyc` returns HTTP 201 but reports bucket `quantovest`.
- `POST /api/uploads` with purpose `deposit-proof` returns HTTP 201 but reports bucket `quantovest`.
- The KYC submission then fails at the database insert.

Implement the following:

- Change the upload route default to `quantovest-media`.
- Prefer failing with HTTP 503 and a clear configuration error if the bucket variable is missing, rather than silently using a different bucket.
- Ensure `SUPABASE_MEDIA_BUCKET` is set to `quantovest-media` in local and Vercel environments.
- Confirm the private bucket exists in Supabase.
- Confirm the policies in `db/supabase/policies.sql` match the actual bucket and folder layout.
- Ensure every UI media URL builder uses the same canonical bucket or, preferably, a shared server-generated signed URL helper for private objects.
- Do not use public object URLs for private KYC documents or payment proofs.
- Ensure admin review pages can securely preview private files using short-lived signed URLs, without exposing service-role credentials to the browser.
- Add tests for missing bucket configuration, invalid purposes, oversized files, unsupported MIME types, successful upload, and private-object access.

The diagnostic files created during QA were harmless test JPGs. After the corrected configuration is verified, identify and remove those diagnostic objects from the incorrect `quantovest` bucket through an authorized cleanup procedure. Do not delete real user files.

## 4. Fix database error handling and empty-state masking

Audit every route that currently catches database errors and returns `[]`, `null`, zero counts, or a normal empty state. At minimum inspect:

- `/api/admin/dashboard`
- `/api/admin/investors`
- `/api/admin/deposits`
- `/api/admin/withdrawals`
- `/api/admin/kyc`
- `/api/admin/traders`
- `/api/admin/plans`
- `/api/admin/referrals/withdrawals`
- `/api/admin/swap-config`
- `/api/admin/deposit-instructions`
- `/api/profile`
- `/api/traders`
- `/api/referrals/*`
- `/api/kyc`
- `/api/deposits`
- `/api/withdrawals`

A valid empty dataset must be distinguishable from a failed dependency. Use consistent HTTP statuses, structured error codes, request IDs, and user-safe messages. Pages should show “Service temporarily unavailable” with Retry and support guidance when the API returns a server or dependency failure. They must not show “No investors found” or “No plans found” when the query failed.

Keep detailed stack traces server-side only. Never return database connection strings, passwords, or raw internal secrets in API responses.

## 5. Fix and test the KYC and deposit workflows

The KYC flow must be:

1. Authenticated investor opens `/dashboard/kyc`.
2. Government ID and proof-of-address files are validated client-side and server-side.
3. Each file uploads to `quantovest-media` under a safe path such as `kyc/<investor-id>/<uuid>.<extension>`.
4. The server creates the `kycApplications` record only after both uploads succeed.
5. The application status becomes `pending`.
6. Admin KYC queue shows the application and can securely preview the documents.
7. Admin approval or rejection updates the record and notifies the investor.

The deposit flow must be:

1. Admin configures payment instructions for every enabled currency.
2. Investor sees a valid payment address before being allowed to submit proof.
3. Investor selects a deposit amount, currency, and proof file.
4. Proof uploads to `quantovest-media` under `deposit-proof/<investor-id>/<uuid>.<extension>`.
5. The deposit record is created with pending status.
6. Admin Deposit Queue shows the proof through a signed URL.
7. Admin approval updates the investor balance and plan according to the business rules.
8. Admin rejection records a reason and notifies the investor.
9. Investor history and notifications update correctly.

Do not use real money, real approval, real withdrawal, or real notification actions during automated QA. Use test accounts and clearly marked test records, or use read-only/mocked execution where appropriate. Before any destructive or financial action in a browser, obtain explicit confirmation.

## 6. Authentication, cookies, and session behavior

Test email/password sign-in, sign-out, protected-route redirects, admin role checks, investor role checks, expired sessions, invalid sessions, and browser refresh behavior.

Verify that:

- Auth cookies use secure production settings.
- `HttpOnly`, `SameSite`, `Secure`, path, and expiration/max-age are appropriate.
- Sign-out invalidates the session on the server and clears client state.
- Expired sessions redirect to login instead of leaving stale private data visible.
- An admin cannot access investor-only routes unless the product explicitly supports that mode.
- An investor cannot access admin routes.
- Middleware and server-side identity checks agree on the user role.
- No sensitive data remains in localStorage after sign-out.
- Password reset and OAuth callback flows use the correct production redirect URLs.

Use test accounts only. Do not weaken authorization to make QA pass.

## 7. Popups, tours, tooltips, and onboarding

Audit every popup and overlay, including:

- KYC prompt.
- Funding warning.
- Onboarding/tour popup.
- ROI calculator modal.
- Upgrade-plan modal.
- 2FA setup and recovery-code modal.
- Notification and support widgets.
- Tooltips and helper labels.

The onboarding tour should appear only for a genuinely new account, not repeatedly for established users. Define a reliable server-side or account-created-at-based rule, with a versioned completion state so a future tour version can intentionally appear once. Do not rely only on a stale localStorage flag that survives account changes or causes the wrong account to inherit another user’s completion state.

Tooltips should appear when the relevant feature is new or contextually necessary, not on every visit for old accounts. They must be dismissible, keyboard accessible, screen-reader friendly, and positioned within the viewport. Escape and outside-click behavior must be consistent.

Every popup must have a loading state, an error state, a success state, a close action, focus management, and mobile-safe sizing. No modal may trap the user or block the primary workflow without a clear way to exit.

## 8. Remove inappropriate AI badges and labels

Search the entire repository for AI badges, “AI-powered,” “AI,” “intelligent,” or similar labels. Remove badges that do not represent a real user-facing AI feature. Do not use AI branding as decoration on financial workflows. Any remaining AI label must accurately describe a real capability, explain what it does, and avoid implying that an automated system guarantees financial performance.

## 9. ROI calculator and financial UX

Keep the calculator mathematically testable, but revise the product presentation in a separate UI commit or clearly isolated change:

- Show the exact compounding assumption and number of compounding periods.
- Avoid “guaranteed rate” and similar claims unless they are legally approved and factually supportable.
- Avoid presenting exponential long-term outputs without a warning that the model is hypothetical and not a promise of returns.
- Use sensible number formatting and compact notation for very large values.
- Add a clear risk disclaimer beside the result, not only in a footer.
- Validate minimum, maximum, empty, decimal, negative, extremely large, and pasted inputs.
- Ensure the numeric field and range slider remain synchronized.
- Test 3-, 6-, and 12-month horizons at Starter, Growth, and Elite assumptions.

## 10. UI maturity and responsive improvement

Preserve the existing visual identity but make the product feel like a mature operations platform rather than a prototype. Prioritize:

- A clear system-health banner when backend services are unavailable.
- Distinct empty, loading, error, and permission-denied states.
- Consistent spacing, typography, status colors, and button hierarchy.
- More useful empty-state copy with next steps and support links.
- Consistent skeletons that match the final content shape.
- Less decorative noise in financial and admin workflows.
- Clear primary actions and safer secondary/destructive action styling.
- Strong keyboard focus states and screen-reader labels.
- Mobile navigation that does not hide critical actions.
- Responsive modal widths, file-input usability, table overflow behavior, and touch target sizes.
- No horizontal overflow at 375px, 768px, tablet landscape, and desktop widths.
- No clipped toast, tooltip, chat widget, or action button at any supported width.

Test at approximately 375×812, 390×844, 768×1024, 1024×768, and desktop widths. Check portrait and landscape orientations where practical.

## 11. Full end-to-end QA matrix

Create a QA checklist and attach evidence for each item. Cover:

### Public and authentication

Homepage, navigation, plans, FAQ, services, contact, signup validation, duplicate signup, login success/failure, logout, password reset, OAuth callback handling, cookie expiry, protected-route redirects, and role separation.

### Investor

Dashboard loading, profile, avatar upload, KYC upload and submission, KYC status, deposit instructions for every currency, deposit proof upload, deposit history, portfolio, holdings, trader browsing, trader copy preview without execution, withdrawals with validation but no payout, history filters/export, referrals, swap read-only views, notifications, settings, 2FA setup screens, onboarding, tours, tooltips, popups, responsive behavior, and accessibility basics.

### Admin

Control Center metrics, Investors, Deposits, Withdrawals, KYC, Plans, Traders, Daily ROI screen without publishing, Referral Payouts without approving, Notifications without sending, Settings without saving, support links, private document preview, search/filter states, loading/error/empty states, authorization, responsive behavior, and accessibility basics.

### API and reliability

Run a read-only status matrix for all GET endpoints. Test missing environment variables, invalid database configuration, invalid storage bucket, expired auth, unauthorized access, forbidden access, malformed input, oversized files, unsupported MIME types, network failure, database failure, and retry behavior.

## 12. Build, test, commit, and push

Run all available checks, including TypeScript, lint, production build, unit tests, route tests, and any browser/E2E tests. Add focused regression tests for the database connection diagnostics, canonical storage bucket, KYC submission, deposit proof flow, and error-state distinction.

Review the diff carefully. Confirm no secret files are tracked:

```bash
git status --short
git diff --check
git ls-files | grep -E '(^|/)\.env|secret|credential|key' || true
```

Do not commit `.env.local` or any secret. Commit in logical commits, for example:

1. `fix: correct Supabase database and storage configuration handling`
2. `fix: distinguish service errors from empty data states`
3. `fix: harden kyc and deposit workflows`
4. `refactor: scope onboarding tours and tooltips to account versions`
5. `polish: improve responsive and financial UX`
6. `test: add end-to-end regression coverage`

Push the branch to GitHub:

```bash
git push -u origin fix/production-db-storage-and-qa
```

Open a pull request against the repository’s default branch. Do not merge automatically unless explicitly authorized. In the final report include:

- Root cause of the production ENOTFOUND error.
- Exact environment/deployment change required.
- Storage bucket mismatch and corrected canonical name.
- Every changed file and why it changed.
- Test commands and pass/fail results.
- Remaining known issues.
- Any test records or diagnostic files created and cleanup status.
- Pull request URL and commit IDs.

The implementation is not complete until the corrected local environment passes the database read-only connection test, the production environment has been updated with the matching values, KYC and deposit proof can be uploaded and persisted in test mode, admin queues show those test records, and the full QA matrix has been executed without weakening security or creating unapproved financial side effects.
