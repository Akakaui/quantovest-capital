
## Quantovest runtime inspection — 2026-08-23

- The correct repository is `Akakaui/quantovest-capital`, a Next.js 14 App Router application with Supabase Auth, Supabase Storage, and Supabase Postgres through the `postgres` driver and Drizzle.
- The current `master` HEAD is `d3742cc` (`fix: bucket name quantovest`), with an active `develop` branch pointing to the same commit.
- `pnpm install --frozen-lockfile` completed, but `pnpm run build` fails during prerendering because the local environment has no Supabase URL/key. This is an environment/configuration failure, not yet a code compilation failure.
- Quantovest starts locally on port 3001 when placeholder public Supabase values are supplied. The public homepage renders successfully.
- Navigating to `/admin/login` is redirected by middleware to `/login` when unauthenticated. The login form is present and working as a route, but no credentials were entered.
- The investor API currently constructs a direct `postgres` client from `DATABASE_URL`; the reported `ENOTFOUND tenant/user postgres.cbttwftusrwisxblkdvs not found` is consistent with a malformed or wrong Supabase Postgres connection string/host, and cannot be fully verified without the deployed environment or a valid project configuration.
- The current upload route falls back to bucket `quantovest` when `SUPABASE_MEDIA_BUCKET` is absent, while the deployment docs and multiple UI URL builders use `quantovest-media`. This is an identified code/config mismatch likely responsible for file upload or post-upload retrieval failures.

## Production reproduction — 2026-08-23

- The live deployment is `https://quantovest-capital.vercel.app`.
- After secure browser sign-in, `/admin/investors` loads the admin shell and reproduces the exact reported failure:

  `Failed to fetch investors — (ENOTFOUND) tenant/user postgres.cbttwftusrwisxblkdvs not found`

- The error is rendered by the page from the API response and includes the deployed Next.js stack (`/var/task/.next/server/chunks/111.js`). The page then falls back to “No investors found.”
- This confirms the production authentication path works and the failure happens after admin authorization, in the server-side database connection/query path.
- The error text identifies the bad database endpoint/user configuration as `postgres.cbttwftusrwisxblkdvs`, not a missing admin permission.

## Production upload-path inspection — 2026-08-23

- The authenticated admin trader page at `/admin/traders` exposes the same `/api/uploads` path for profile images.
- A non-sensitive local JPG was selected successfully in the form, but no remote submission was performed yet. This avoids creating or modifying a trader record without confirmation.
- The live page currently has no active master traders, so the form is available for a clean upload-path test if the user confirms it.

## Investor-session QA — 2026-08-23

- The browser session is now authenticated as an investor; `/dashboard` loads the investor portal instead of redirecting to admin.
- The investor dashboard reports an unverified/pending KYC state and links to both Identity KYC and Deposit.
- The Identity KYC page loads at `/dashboard/kyc` with two file inputs, Government ID and Proof of address, and a disabled-until-ready Submit KYC verification button. At initial load the status briefly displays `LOADING`; no upload request has been made yet.

## Investor KYC upload reproduction — 2026-08-23

- On `/dashboard/kyc`, two harmless JPG test files were accepted by the browser file inputs.
- Submitting the KYC form changed the page status to `Uploading documents…`, confirming the request path was invoked. The next inspection will capture whether the failure occurs on the first `/api/uploads` request, the second upload, or the subsequent `/api/kyc` submission.

## Exact KYC request results — 2026-08-23

- A direct authenticated `POST /api/uploads` with purpose `kyc` returned HTTP **201** and JSON containing a generated path under the bucket **`quantovest`**. Therefore, the KYC file upload itself is not failing at the HTTP layer in the current deployment.
- The KYC page then calls `POST /api/kyc`; an authenticated diagnostic request returned HTTP **500** with an empty response body. The UI reduces this to `KYC submission failed.`
- The repository route shows that `/api/kyc` inserts into `kycApplications` through the same `DATABASE_URL`-backed Drizzle client used by `/api/admin/investors`. This strongly isolates the visible KYC failure to the database connection/configuration after the storage upload succeeds.
- The uploaded file is being written to `quantovest`, while the repository's storage policies and deployment documentation define `quantovest-media`; this is a separate storage namespace mismatch and can make the saved file inaccessible to the intended UI/policies even when the upload returns 201.

## Investor deposit-page inspection — 2026-08-23

- `/dashboard/deposit` loads for the investor and exposes four cryptocurrency options, a USD amount field defaulting to 1500, a transaction-proof file input, and a Submit Deposit Proof button.
- The selected default USDT (TRC-20) option displays: `Payment address for this option is currently being updated. Please choose another crypto method or check back in a few minutes.` This is a functional configuration issue independent of the upload endpoint.
- A harmless local JPG was accepted by the deposit-proof file input. No deposit proof was submitted and no financial record was created.

## Exact deposit upload result — 2026-08-23

- A direct authenticated `POST /api/uploads` with purpose `deposit-proof` returned HTTP **201** and a generated path under bucket **`quantovest`**. The shared upload endpoint is therefore reachable and accepts the file; the reported failure is not an HTTP upload rejection for this test.
- The deposit page separately has a missing/disabled payment configuration for the default USDT (TRC-20) option, which prevents a user from obtaining a payment address before proof submission.
- The investor Transaction History page at `/dashboard/history` loads its filters and export control, but the content area showed loading skeletons during the initial inspection. This page needs a follow-up check for the final API response.

## Investor API audit — 2026-08-23

The authenticated investor session produced the following non-destructive GET results:

| Endpoint | Status | Observed result |
|---|---:|---|
| `/api/auth/me` | 200 | Authenticated investor identity returned correctly. |
| `/api/profile` | 500 | `Internal server error`. |
| `/api/investor-profile` | 200 | Profile summary returned with zero balances and no avatar. |
| `/api/deposit-instructions` | 200 | Empty array; no configured payment instructions. |
| `/api/kyc` | 200 | Empty array; no KYC record visible. |
| `/api/history` | 200 | Empty array. |
| `/api/portfolio/holdings` | 200 | Empty array. |
| `/api/portfolio/allocation` | 200 | Allocation payload returned successfully. |
| `/api/traders` | 500 | Empty array body despite server failure. |
| `/api/traders/my` | 200 | Empty array. |
| `/api/referrals/summary` | 500 | A fallback-shaped payload was returned with zero values. |
| `/api/referrals/analytics` | 500 | Empty array body. |
| `/api/referrals/link` | 500 | `null` body. |
| `/api/swap/history` | 200 | Empty array. |
| `/api/notifications` | 200 | Empty items and unread count 0. |
| `/api/plans` | 200 | Empty array; no plans returned. |

This shows the production database failure is broader than `/api/admin/investors`: several investor features that query database tables return HTTP 500, while some routes catch database errors and mask them with empty or zero-valued responses. The auth endpoint and a subset of profile/portfolio routes remain functional.

## Investor Portfolio Managers reproduction — 2026-08-23

- `/dashboard/traders` initially shows skeleton cards, then resolves to the visible error `Could not load portfolio managers. Please try again.` with a Retry button.
- This matches the non-destructive API check showing `GET /api/traders` returns HTTP 500 with an empty array body. The UI correctly exposes the failure instead of silently showing an empty list.

## Additional investor UI audit — 2026-08-23

- Investor Settings loads profile information and payout fields. The related `/api/profile` endpoint independently returns HTTP 500, so profile saves and payout-detail persistence are at risk even though the page renders existing data.
- Investor Withdrawal loads with available balance `$0.00` and a clear warning that no bank payout details are saved. No withdrawal was submitted.
- The withdrawal page is currently blocked by account state and missing payout configuration rather than exposing a new server error during read-only inspection.

## ROI calculator test — 2026-08-23

- The investor dashboard ROI calculator opens successfully and accepts synchronized numeric and range inputs.
- With `$7,500`, Growth Plan at `25%/day`, and 6 months, it displays a projected total capital of approximately `$1,320,788,185,756,548,900`.
- With the minimum `$1,500`, Starter Plan at `15%/day`, and 6 months, it displays projected profit of approximately `$1,255,086,882,304` and total capital of approximately `$1,255,086,883,804`.
- The calculator is mathematically applying daily compounding for the selected horizon, but the product framing presents these extreme outputs alongside “fixed daily return” and “guaranteed rate” language. This is a major product/credibility and financial-risk UX issue for later review, even though the input control itself works.

- At `$1,500` on the 3-month horizon, the calculator shows approximately `$188,237,605` projected profit and `$188,239,105` total capital.
- At `$1,500` on the 12-month horizon, it shows approximately `$55,795,821,418,815,490,000` projected profit and total capital. The horizon buttons recalculate correctly, but the scale makes the current financial presentation materially misleading and requires product/legal review later.

## Responsive QA measurements — 2026-08-23

- The live browser viewport measured approximately 1280×1100 during the dashboard inspection; the document had no horizontal overflow.
- Same-origin hidden-frame checks at 768×1024 (tablet) and 375×812 (mobile) reported no horizontal overflow: client widths were 762 and 369 respectively, with matching document scroll widths. This is a positive baseline for page-level responsiveness.
- The visual review still found a dense desktop-oriented dashboard: the persistent left navigation consumes substantial width, while the mobile behavior should be manually reviewed for touch target spacing, modal scaling, and whether the sidebar transforms into the intended mobile navigation.
- The ROI modal is functional at the tested viewport, but its extreme compounding projections dominate the experience and make the interface feel more like a promotional prototype than a mature financial product. This is recorded as a later UI/product recommendation, not a code defect for this audit.

## Admin session restored — 2026-08-23

- The connected browser is now authenticated as `Admin` at `/admin`.
- The admin Control Center loads and visibly reports `$0` AUM, 0 pending deposits, 0 pending withdrawals, and 0 pending KYC items.
- Read-only admin audit can now proceed; no admin mutations will be submitted.

## Admin API and deposit queue audit — 2026-08-23

The authenticated admin API checks returned: `/api/admin/dashboard` HTTP 200 with zero counts; `/api/admin/deposits`, `/api/admin/withdrawals`, `/api/admin/kyc`, `/api/admin/investors`, `/api/admin/traders`, `/api/admin/plans`, `/api/admin/referrals/withdrawals`, `/api/admin/swap-config`, and `/api/admin/deposit-instructions` all HTTP 500 (mostly empty-array bodies); `/api/admin/notifications` returned HTTP 405 for GET.

The visible admin Deposit Operations page loads the wallet-configuration forms and shows `No pending deposit proofs.` It does not expose the underlying HTTP 500 in the initial page text. The form includes four wallet address sections and optional QR image paths; no values were changed or saved.

## Admin Investors reproduction — 2026-08-23

- The live admin Investors page displays the full production error after loading: `Failed to fetch investors — (ENOTFOUND) tenant/user postgres.cbttwftusrwisxblkdvs not found`, followed by `No investors found.`
- This is a direct reproduction in the authorized admin session and confirms the failure is server-side database connectivity/configuration, not a frontend rendering issue.

## Admin KYC and withdrawal queue audit — 2026-08-23

- `/admin/kyc` loads and displays `No pending KYC applications.` It does not surface the underlying `/api/admin/kyc` HTTP 500 in the page text.
- `/admin/withdrawals` loads the queue shell with loading placeholders during the initial inspection; the underlying `/api/admin/withdrawals` endpoint returns HTTP 500 with an empty array body.
- The admin UI therefore masks database failures as empty or loading states on several operational queues, creating a risk that staff may interpret an unavailable queue as genuinely empty.

## Admin Plans reproduction — 2026-08-23

- `/admin/plans` resolves to `No plans found. Create one to get started.` while `/api/admin/plans` returns HTTP 500. The UI masks the database outage as an empty catalog.
- Because the investor-facing `/api/plans` also returns an empty array, the plan catalog is unavailable across both roles even though the dashboard calculator retains hardcoded Starter/Growth/Elite assumptions.

## Admin Portfolio Managers reproduction — 2026-08-23

- `/admin/traders` loads the create-trader form and resolves to `Active Master Traders (0)` with no visible error, while the underlying `/api/admin/traders` request returns HTTP 500 with an empty array body.
- This is another example of the admin UI presenting a database outage as a valid empty state. No trader was created and no image was uploaded from this admin session.

## Admin Notifications reproduction — 2026-08-23

- `/admin/notifications` loads the composer successfully, but the audience preview shows `Recipients 0` and the action button says `Send to 0 recipient(s)`, consistent with the failed database-backed user/plan queries.
- No notification was composed or sent. The underlying GET check for `/api/admin/notifications` returned HTTP 405, which may be intentional if the page only uses POST/other methods, but it should be verified against the page's actual fetch calls during remediation.

## Admin Settings reproduction — 2026-08-23

- `/admin/settings` loads the configuration form with platform name `Quantovest Capital`, support email `support@quantovest.com`, timezone `UTC`, minimum deposit amount `500000` cents ($5,000), maintenance mode off, and USD selected among supported currencies.
- No settings were changed or saved. The page's values appear to be local/default state; the admin settings GET/POST persistence path should be verified separately because the general database-backed admin endpoints are failing.

## Admin Referral Payouts reproduction — 2026-08-23

- `/admin/referrals` visibly shows `Unable to load the referral payout queue.` and then `No referral payout requests are currently recorded.`
- This matches the HTTP 500 result from `/api/admin/referrals/withdrawals`; the empty queue message is not trustworthy while the database connection is unavailable.

## Implementation verification — 2026-08-23

- The corrected local environment now connects successfully to Supabase Postgres using the project’s verified transaction pooler host. A read-only schema probe returned counts for users, investor accounts, deposits, KYC applications, plans, notifications, and traders without an ENOTFOUND error.
- Supabase Storage now contains `quantovest-media` with 5 policies, a 10 MB limit, and allowed MIME types image/jpeg, image/png, and application/pdf. The legacy `quantovest` bucket remains untouched with 0 policies to avoid destructive deletion.
- Application changes include canonical bucket enforcement, owner-scoped KYC and deposit proof validation, safe 503 database responses, signed private document previews for admin deposits and KYC, per-user onboarding completion, global logout handling, safer calculator projections, and removal of guaranteed-return marketing language.
- `pnpm run build` passes after the latest changes. Public `/api/plans` returns HTTP 200 locally, protected upload and deposit routes return HTTP 401 without a session, and `git diff --check` passes.
- The repository has no committed `.env.local`; `.gitignore` covers `.env*.local`. Vercel production environment update and authenticated live regression remain blocked until Vercel access is restored.
