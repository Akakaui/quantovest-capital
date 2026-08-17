# Quantovest Capital — `develop` Branch Implementation Summary

**Document status:** Current handoff summary  
**Repository:** `Akakaui/quantovest-capital`  
**Branch:** `develop`  
**Latest verified commit:** `b88251e` — `Add deposit verification and event notifications`  
**Remote status:** `origin/develop` points to `b88251e`  
**Working tree at preparation time:** Clean  
**Prepared by:** Manus AI

## 1. Executive summary

The `develop` branch is the redesigned and backend-oriented version of Quantovest Capital. It combines the premium Editorial Signal interface with a separate investor workspace and operations console, then adds a progressively migrated persistent backend for referrals, ROI, profiles, traders, withdrawals, notifications, deposit verification, and KYC workflows.

The branch is materially more advanced than the original `master` branch. It contains the application structure and route handlers needed for a Vercel-hosted Next.js application using Supabase Auth, Supabase Storage, and Supabase Postgres through Drizzle ORM. However, it should still be treated as a **staging and integration branch**, not as a finished real-money production platform. The code now has many of the required persistence and authorization boundaries, but provider configuration, end-to-end reconciliation, remaining legacy-store replacement, payout settlement, security hardening, and staging tests must be completed before launch.

The most complete migrated business area is the referral system and its payout workflow. The newest work adds a persistent notification inbox, admin broadcasts and personalized messages, admin-managed bank and crypto deposit instructions, investor payment-proof uploads, deposit verification, plan assignment after approval, KYC review notifications, and separate admin/investor notification surfaces.

## 2. Branch history and migration milestones

| Commit | Scope |
|---|---|
| `218e4aa` | Original Quantovest Capital repository baseline on `master`. |
| `15612ba` | Premium design and product-feature merge into the Next.js source. |
| `fc1edad` | Initial persistent referral foundation: schema, Auth.js foundation, referral APIs, notifications foundation, investor referral dashboard, and deployment template. |
| `3a129a1` | Managed investor/admin workflow migration: persistent plans, investor accounts, traders, ROI entries, portfolio ledger, profile/media APIs, general withdrawal foundation, and referral payout review. |
| `36da5f9` | Supabase-oriented conversion: Drizzle PostgreSQL dialect, Supabase clients, Supabase identity helper, Storage upload foundation, middleware, Postgres migration path, and authorization conversion for key admin routes. |
| `b88251e` | Deposit verification and event notifications: admin broadcasts, notification center, payment instructions, proof uploads, deposit approval/rejection, KYC approval/decline notifications, admin queues, RLS additions, and upload tests. |

## 3. Product and interface changes

The public marketing site preserves the original Quantovest copy and major routes while incorporating the premium redesign. The branch includes the editorial hero composition, dark operational surfaces, responsive layouts, separate investor/admin navigation, preserved public informational pages, FAQ, legal pages, route aliases, and the asset-backed phone visual direction established earlier in the project.

The authenticated experience is split into two visual and navigational systems. Investors use the dark Investor Portal with dashboard, portfolio managers, deposits, withdrawals, referrals, KYC, settings, history, and notifications. Staff use a separate Operations Console with overview, ROI publishing, deposit queue, withdrawal queues, KYC queue, trader management, referral payout review, and notifications. The previous blinking staff/live-sync treatment was removed from the migrated surfaces.

The UI includes loading, empty, error, mobile, and responsive states in the migrated areas. The referral dashboard includes summary values, analytics, date filtering, a responsive chart, threshold-gated withdrawal, bank/crypto destination selection, and referral notification handling. The transaction history route has a live-data-oriented layout with filters and loading skeleton behavior from the managed migration work.

## 4. Authentication and authorization

The branch contains both the historical Auth.js compatibility layer and the newer Supabase Auth foundation. Supabase browser and server clients are available under `lib/supabase/client.ts` and `lib/supabase/server.ts`. The root `middleware.ts` refreshes Supabase sessions for requests, and `app/auth/callback/route.ts` provides the OAuth callback path.

The login and signup pages now expose Supabase email/password, Google, and Apple authentication paths while preserving the existing visual direction. The server-side identity helper in `lib/supabase/identity.ts` validates the current Supabase identity and reads the application role from the profile table. Key admin routes use this helper to restrict investor lists, ROI publication, trader operations, withdrawal processing, KYC review, deposit review, deposit-instruction changes, notification sending, and referral payout decisions.

This area is not complete until the Supabase Auth providers are configured, the application profile synchronization is verified, admin promotion is controlled, callback URLs are correct for Vercel Preview and Production, and every remaining protected route consistently uses the same identity source. Some earlier referral handlers and legacy routes may still contain compatibility assumptions that must be audited before launch.

## 5. Database and persistence layer

The active schema is in `db/schema.ts`. It has been converted from MySQL-oriented Drizzle definitions to PostgreSQL-compatible Drizzle tables for Supabase. The database connection helper is in `lib/db.ts`, and Drizzle Kit is configured through `drizzle.config.ts` for PostgreSQL migrations.

The schema now covers the following major records:

| Data area | Persistent records |
|---|---|
| Identity | Users, Auth.js compatibility accounts, sessions, and verification tokens. |
| Investment plans | Active plans, minimum/maximum deposit boundaries, and allowed ROI ranges. |
| Investor accounts | Investor plan assignment, principal, balance, status, and profile-linked account state. |
| ROI | Per-investor ROI entries with plan-aware validation and ledger references. |
| Portfolio ledger | Deposits, ROI, withdrawals, referral rewards, and adjustments used for history and reconciliation. |
| Traders | Persistent trader profiles, specialty, returns, risk level, bio, and image metadata. |
| Referrals | Referral links, immutable attribution, reward records, idempotency keys, balance events, and referral withdrawals. |
| Notifications | User-targeted event messages, general broadcasts, personalized admin messages, read state, and timestamps. |
| Deposits | Investor deposit amount, payment method, proof storage path, selected plan, status, reviewer, and review note. |
| Deposit instructions | Admin-managed bank/crypto label, details, QR metadata, active state, and last updater. |
| KYC | Investor document storage path, pending/approved/declined status, reviewer, note, and timestamps. |
| Withdrawals | General investor withdrawal requests and referral bonus withdrawals with held/settled/released state handling. |

The PostgreSQL migration files are stored under `db/migrations-pg/`. The current generated migration files include `0000_long_synch.sql` and `0001_steady_living_lightning.sql`. The Supabase policy file is `db/supabase/policies.sql`.

## 6. Referral system

The referral system is designed around persistent records rather than browser-only state. An authenticated investor can create a referral link. A referred investor can be attributed once. The qualifying reward is intended to be **10% of the referred investor’s first approved qualifying deposit**, with an idempotency key preventing duplicate crediting for the same qualifying deposit.

The referral dashboard reads summary and analytics endpoints, including time-based signups and earnings. It supports custom date ranges, loading and empty states, and a withdrawal action that is disabled until the available referral balance reaches the configured **$500 minimum**. Referral withdrawals support bank and crypto destinations.

The withdrawal workflow moves available reward rows to a held state before creating a pending withdrawal request. This prevents repeated requests from spending the same reward balance. Admin approval settles held rewards; rejection releases them back to available status. Referral reward credits and payout decisions can generate notification events.

The remaining referral work is to verify that the first-approved-deposit reward is triggered automatically from the final deposit approval transaction, that every referral route uses Supabase identity consistently, and that all reward/balance events reconcile against the portfolio ledger in staging.

## 7. Individual investor plans and ROI

The admin performance workflow no longer targets one generic shared ROI value. The migrated route allows an authorized admin to load individual investors, inspect each investor’s active plan and permitted ROI range, select one investor, and publish an ROI percentage for that investor.

The server validates the submitted percentage against the investor’s active plan, calculates the corresponding profit, updates the persistent investor account, inserts an ROI record, and records the resulting movement in the portfolio ledger. The plan schema contains deposit thresholds and ROI boundaries so plan constraints can be enforced server-side rather than merely displayed in the UI.

This feature still requires full staging reconciliation. The investor overview, balance, ROI charts, and history screens must all read the same persistent account and ledger records. Any remaining local-store reads must be removed or explicitly limited to non-financial presentation state. The product also needs a clear operational policy for corrections, duplicate ROI publication, reversal entries, timestamps, and admin audit trails.

## 8. Investor and trader image uploads

The upload route at `app/api/uploads/route.ts` uses Supabase Storage and stores metadata/path references rather than image bytes in Postgres. Upload purposes are explicitly restricted to `avatar`, `trader`, `deposit-proof`, and `kyc`. The current validation accepts JPG, PNG, and WebP files up to 5 MB.

Investor profile settings can update profile information and avatar metadata. Admin trader creation accepts validated image metadata instead of inserting a fixed demo URL. Deposit proofs and KYC documents also use the same controlled Storage upload endpoint.

Before production, Storage bucket policies must be applied and tested with real authenticated investor and admin sessions. The application should also use signed URLs or an intentionally controlled public policy for private documents. KYC documents and payment proofs should not be exposed through unrestricted public URLs.

## 9. Notifications

The persistent notification helper is in `lib/notifications.ts`. The investor notification API is in `app/api/notifications/route.ts`, and the admin sending API is in `app/api/admin/notifications/route.ts`. The reusable UI is `components/NotificationCenter.tsx`, mounted in both InvestorSidebar and AdminSidebar for desktop and mobile access.

The notification center polls for new records, displays an unread count, lists recent messages, and supports marking one notification or all notifications as read. It intentionally avoids the old blinking live-sync indicator.

Admins can send a general broadcast or a personalized notification. General messages are delivered to the selected audience represented by the API, while personalized messages target supplied investor IDs. Staff receive an audit notification so the operations team can see that a message was sent.

The current event workflow covers deposit submission, deposit approval, deposit rejection, KYC submission, KYC approval, KYC decline, referral reward activity, referral withdrawal activity, and admin messages. The remaining notification work is to audit every business mutation and ensure notifications are sent transaction-safely or through an outbox/retry pattern, add durable delivery/retry monitoring if external email or push channels are introduced, and confirm that broadcasts cannot be abused by non-admin users.

## 10. Admin-managed deposits and investor deposit verification

The investor deposit page now loads active payment instructions from `app/api/deposit-instructions/route.ts` instead of using hardcoded bank details or wallet addresses. The admin page at `/admin/deposits` uses `app/api/admin/deposit-instructions/route.ts` to configure bank and crypto instructions, including a display label, payment details, and optional QR image metadata.

Investors can select bank or crypto, copy the configured details, view QR metadata when available, enter a deposit amount, upload a payment screenshot, and submit a pending verification request. The screenshot is stored in Supabase Storage and the database retains the storage path.

The admin deposit queue at `app/api/admin/deposits/route.ts` lists pending proofs. Approval selects the submitted plan or matches an active plan by amount, marks the deposit completed, assigns the investor’s plan, increases principal and balance, records a deposit ledger event, and notifies the investor and admins. Rejection marks the request rejected and notifies both the investor and staff.

This flow still requires careful staging validation. The approval transaction must be tested for concurrent review attempts, duplicate callbacks, plan changes, insufficient configuration, reward triggering, and ledger consistency. The actual proof image must be viewable by authorized staff through a secure signed URL rather than merely displaying a storage path.

## 11. KYC workflow

The investor KYC page now uploads identity documents through Supabase Storage and submits a persistent application through `app/api/kyc/route.ts`. The admin queue at `/admin/kyc` reads `app/api/admin/kyc/route.ts` and supports approve or decline actions with notifications to the investor and admin team.

The current implementation stores the two uploaded document paths together in the application record. Before production, these should be modeled as separate document records or separate typed fields, with document type, expiry information where relevant, review evidence, and secure signed access. The system also still needs an explicit retention/deletion policy, access audit logging, provider integration if automated KYC is required, and a full update of the investor account’s authoritative KYC status used by every protected workflow.

## 12. General withdrawals

The branch includes a persistent investor withdrawal API at `app/api/withdrawals/route.ts` and an admin queue at `app/api/admin/withdrawals/route.ts`. Bank and crypto destinations are validated, funds are reserved through a held balance workflow, and rejection can restore the held amount. The existing referral withdrawal workflow follows a similar state model.

This does not yet constitute real payout settlement. A production integration still requires a bank or crypto payout provider, webhook verification, idempotency, sanctions and fraud checks, destination ownership checks, operational approval controls, payout status synchronization, and reconciliation against provider records. No real payment behavior should be assumed merely because the request and queue screens exist.

## 13. Supabase security policies and Storage

The file `db/supabase/policies.sql` enables row-level security for users, investor accounts, portfolio records, ROI, referrals, notifications, deposits, deposit instructions, KYC applications, withdrawals, traders, and plans. It defines an `is_admin()` helper and owner/admin access patterns. It also creates or references the private `quantovest-media` Storage bucket and adds owner/admin object policies.

These policies must be reviewed against the final table names and deployed in Supabase after the generated migrations. Route-handler authorization and database RLS are complementary; one must not be treated as a substitute for the other. The policies need an authenticated staging test matrix covering investor self-read/write, investor cross-account denial, admin queue access, private document access, and Storage path traversal attempts.

## 14. Vercel and Supabase configuration

The environment template is `.env.example`. It currently documents the Supabase URL and publishable browser key, the server-only service role key, the media bucket name, a pooled PostgreSQL `DATABASE_URL`, and compatibility/Auth.js values.

The expected deployment sequence is to create a Supabase staging project, configure Vercel Preview variables, apply the generated PostgreSQL migrations, apply RLS and Storage policies, configure Supabase Auth providers and redirect URLs, and then test the full investor/admin workflows in Preview. Production variables should be configured separately after staging verification. No secrets should be committed to GitHub.

The existing older deployment note at `docs/next-develop-deployment.md` contains earlier MySQL/Auth.js wording and should be treated as historical context. The current Supabase-oriented files and `docs/supabase-vercel-research.md` are the more relevant references for the present architecture. The deployment documentation should be consolidated and updated before launch so there is one authoritative setup guide.

## 15. Automated validation currently present

The latest validation completed before this handoff includes strict TypeScript compilation, `git diff --check`, a clean working tree check, remote branch alignment, and the Vitest suite. The current Vitest suite contains two focused tests for the upload-purpose allowlist and passed successfully.

The branch still needs a broader automated suite. API tests should cover identity denial, admin authorization, invalid amounts, duplicate deposit review, duplicate reward crediting, held-balance behavior, plan-range validation, notification targeting, Storage failures, and transaction rollback. Browser-level tests should cover the investor deposit, KYC, notification, withdrawal, referral, and admin queue flows at desktop and mobile widths.

## 16. What remains before production

The following table separates required work from optional refinement. The required items are security, correctness, infrastructure, or financial-control tasks rather than cosmetic improvements.

| Priority | Remaining work | Why it matters |
|---|---|---|
| P0 | Configure Supabase project, Vercel Preview/Production variables, Auth providers, Storage bucket, and redirect URLs. | Without these values the application cannot authenticate users, connect to the database, or upload files. |
| P0 | Apply and verify both PostgreSQL migrations and `db/supabase/policies.sql` in a staging Supabase project. | The schema and security rules do not exist merely because SQL files are committed. |
| P0 | Complete the Supabase identity audit across every protected route, especially legacy referral and dashboard routes. | Mixed session sources can create authorization inconsistencies. |
| P0 | Replace remaining local-store financial reads and mutations with persistent Postgres/ledger reads. | A financial UI must not show browser-local balances or statuses as authoritative data. |
| P0 | Connect deposit approval transactionally to first-approved-deposit referral reward creation and notification. | This is the business event that makes the advertised 10% referral behavior real and idempotent. |
| P0 | Add secure signed-URL access for payment proofs and KYC documents. | Staff must be able to review private evidence without exposing it publicly. |
| P0 | Integrate and test an actual payout provider for bank/crypto withdrawals. | Request and approval records alone do not transfer funds. |
| P0 | Implement durable audit logging for admin ROI, deposit, KYC, withdrawal, instruction, notification, and role actions. | Sensitive operations need traceability and dispute investigation support. |
| P1 | Finish admin queue coverage for deposits, KYC, general withdrawals, referral withdrawals, and user/account status. | Operations staff need one complete persistent workflow rather than mixed local and server queues. |
| P1 | Finish authoritative investor profile, plan, KYC, principal, balance, ROI, and history reads. | Every investor screen should agree with the same database ledger. |
| P1 | Add transaction rollback/idempotency tests and concurrency tests for approval/rejection actions. | Double-clicks, retries, and simultaneous reviews must not double-credit or double-release funds. |
| P1 | Add provider webhooks and reconciliation jobs for payouts and authentication events. | External state can change after the original request and must be synchronized safely. |
| P1 | Add rate limiting, CSRF/origin protections where needed, file malware scanning, MIME/content validation, and upload retention rules. | Financial and identity workflows need stronger abuse defenses than basic file extension checks. |
| P1 | Model KYC documents as typed records rather than joining two paths into one string. | Separate document review, retention, and access control require structured records. |
| P1 | Update the canonical deployment documentation to remove stale MySQL/Auth.js-first instructions. | Developers need one accurate migration and deployment procedure. |
| P2 | Expand Vitest and browser test coverage across the complete investor/admin workflow. | Current automated coverage is only a narrow utility test. |
| P2 | Perform final responsive and accessibility QA on every migrated route in authenticated and unauthenticated states. | Production readiness includes keyboard, focus, contrast, mobile, and error-state behavior. |
| P2 | Add email/push delivery only if required, using an outbox/retry design. | In-app notifications are present; external delivery needs a separate reliable channel. |
| P2 | Improve signed QR upload management, preview, replacement, and deactivation in admin settings. | Payment instructions need operational versioning and safe replacement. |

## 17. Recommended execution order

The safest next sequence is to create a Supabase staging project and configure Vercel Preview, then apply the Postgres migrations and RLS policies. After that, verify Supabase Auth and Storage with two test accounts: one investor and one admin. The next implementation pass should remove remaining local-store financial reads and connect the deposit approval transaction directly to referral reward creation, investor account updates, notifications, and the ledger.

Once those flows reconcile in staging, implement signed document access, audit logging, rate limits, payout-provider integration, and webhook reconciliation. Then run a complete test matrix for signup, KYC, deposit submission, admin approval/rejection, plan assignment, ROI publishing, referral reward credit, notification delivery, referral withdrawal, normal withdrawal, admin settlement, and history display. Only after those tests pass should the same migrations and policies be applied to a separate production Supabase project and Vercel Production environment.

## 18. Files to review first

| File or directory | Purpose |
|---|---|
| `db/schema.ts` | Current PostgreSQL Drizzle schema. |
| `db/migrations-pg/` | Generated PostgreSQL migration history. |
| `db/supabase/policies.sql` | Supabase RLS and Storage policy definitions. |
| `lib/db.ts` | Vercel/Supabase Postgres connection helper. |
| `lib/supabase/identity.ts` | Current server-side identity and role helper. |
| `lib/notifications.ts` | Persistent event and admin notification helpers. |
| `app/api/deposits/route.ts` | Investor deposit submission and history. |
| `app/api/admin/deposits/route.ts` | Admin deposit verification and plan/balance update. |
| `app/api/admin/deposit-instructions/route.ts` | Admin bank/crypto instruction configuration. |
| `app/api/kyc/route.ts` and `app/api/admin/kyc/route.ts` | Investor KYC submission and staff review. |
| `app/api/admin/roi/route.ts` | Individual plan-validated ROI publication. |
| `app/api/referrals/` and `app/api/admin/referrals/` | Referral attribution, analytics, rewards, notifications, and payout processing. |
| `app/api/withdrawals/route.ts` and `app/api/admin/withdrawals/route.ts` | General investor withdrawal and admin settlement. |
| `components/NotificationCenter.tsx` | Shared investor/admin notification inbox UI. |
| `.env.example` | Required environment-variable names without secrets. |
| `docs/supabase-vercel-research.md` | Supabase/Vercel connection and deployment notes. |

## 19. Final readiness statement

The `develop` branch is ready for the next **Supabase staging integration phase**. It is not yet safe to describe as ready for live investor deposits or live payout settlement. The remaining work is concentrated in real infrastructure configuration, persistent-read completion, event reconciliation, secure evidence access, provider settlement, auditability, and end-to-end testing.

No secrets are included in the branch. The original `master` branch remains the baseline repository, while `develop` contains the redesigned and progressively migrated product implementation.

## References

[1]: https://github.com/Akakaui/quantovest-capital/tree/develop "Quantovest Capital GitHub develop branch"
[2]: https://github.com/Akakaui/quantovest-capital/blob/develop/db/schema.ts "Quantovest PostgreSQL Drizzle schema"
[3]: https://github.com/Akakaui/quantovest-capital/blob/develop/db/supabase/policies.sql "Quantovest Supabase RLS and Storage policies"
[4]: https://github.com/Akakaui/quantovest-capital/blob/develop/.env.example "Quantovest environment template"
[5]: https://github.com/Akakaui/quantovest-capital/blob/develop/docs/supabase-vercel-research.md "Quantovest Supabase and Vercel research notes"
