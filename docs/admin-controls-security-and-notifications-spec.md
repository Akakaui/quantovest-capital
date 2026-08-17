# Quantovest Capital — Admin Controls, Notifications, Email, and Security Specification

**Purpose:** This document maps the control plane required for the Quantovest investor platform. It explains what administrators should be able to control, how investors and administrators receive notifications, how plan-specific targeting works, how transactional email should be delivered, and how OTP/2FA must protect withdrawals and other sensitive actions.

**Target architecture:** Next.js App Router on Vercel, Supabase Auth, Supabase Postgres, Supabase Storage, Drizzle ORM, a transactional email provider, and an optional SMS/OTP provider.

## 1. The operating model

The platform should treat every important action as a **server-side business event**. The browser displays controls, but it must never be the authority for balances, plans, ROI, KYC status, withdrawal status, notification recipients, or payout decisions.

The standard flow is:

```text
Authenticated user or authorized admin action
        ↓
Server validates identity, role, permissions, input, and current record state
        ↓
Database transaction updates the business records and ledger
        ↓
An event is written to an outbox/event table
        ↓
In-app notification is created for each recipient
        ↓
Email job renders the correct template and sends through the provider
        ↓
Email delivery status is recorded and retried if necessary
        ↓
Audit record remains available to authorized staff
```

A financial action must not depend on an email being successfully delivered. The deposit, ROI, KYC, or withdrawal transaction should commit once, while notification and email delivery can retry independently.

## 2. Roles and account types

| Account or record | Can authenticate? | Receives notifications? | Can receive email? | Primary controls |
|---|---:|---:|---:|---|
| Investor user | Yes | Yes | Yes, subject to verified email and preferences | View account, submit deposits/KYC/withdrawals, receive ROI and status updates |
| Admin user | Yes | Yes | Yes, subject to staff preferences | Review queues, configure plans and payment instructions, publish ROI, send messages, approve/reject operations |
| Operations manager | Yes | Yes | Yes | Restricted admin permissions such as queues and messaging but not role management or payout-provider changes |
| Support staff | Yes | Yes | Yes | Read-only or limited support actions, no balance or payout mutation unless explicitly granted |
| Trader profile | Not necessarily | No by default | No by default | Public or investor-visible strategy record; receives notifications only after being linked to an authenticated trader user |
| Service/outbox worker | No browser login | No | Sends on behalf of the platform | Processes email and notification jobs using server-only credentials |

Do not hardcode the dummy investor or dummy admin as special production identities. In staging, create them as normal Supabase users with normal database records and verified test email addresses. A trader profile is not automatically a user account and should not receive email unless it has an explicit user relationship.

## 3. Admin control center

The admin dashboard should provide a dedicated control center with separate pages for configuration, operations, communication, security, and audit. Every mutation must be guarded by server-side permissions rather than only hidden buttons in the UI.

| Admin area | Required controls |
|---|---|
| Platform settings | Platform name, support email, default timezone, maintenance mode, minimum deposit, supported currencies, and notification defaults |
| Plans | Create/edit/archive plans, minimum and maximum deposit, ROI minimum and maximum, duration, supported traders, active status, and display order |
| Investor accounts | Search investors, view active plan, principal, balance, KYC status, notification preferences, email verification, 2FA status, and account status |
| Individual ROI | Select one investor, view active plan range, publish a validated ROI entry, add a note, schedule or reverse an entry, and view the audit history |
| Deposits | Configure bank and crypto instructions, wallet address, network, bank details, QR image, minimum amount, review proofs, approve/reject, assign or update plan, and trigger reward logic |
| KYC | Review documents through signed URLs, approve/decline, require resubmission, record a review note, and view reviewer history |
| Withdrawals | Configure minimums, review bank/crypto destinations, require OTP/2FA, approve/reject/hold, add a review note, and reconcile provider status |
| Referrals | Configure reward rate and threshold, inspect attribution, approve reward qualification, review referral withdrawals, approve/reject settlement, and audit balance holds |
| Traders | Create/edit/archive trader profiles, upload images, edit risk/return metadata, and decide whether a trader is visible to investors |
| Notifications | Send general messages, personalized messages, plan-targeted messages, event announcements, scheduled maintenance notices, and preview email templates |
| Notification preferences | Set default event preferences, allow or require investor opt-in for non-critical messages, and force critical security/financial notifications on |
| Email provider | Provider status, verified sender, test email, templates, retry status, bounce/complaint status, and delivery logs; secrets remain in Vercel environment variables |
| Admin users and permissions | Invite staff, assign roles, revoke sessions, enforce admin 2FA, and grant granular permissions |
| Audit logs | Filter by actor, investor, action, record type, status, date, IP, and request ID; export read-only reports |

## 4. General, personal, and plan-targeted messages

The admin composer should not have only one recipient mode. It should expose three explicit audiences.

| Audience mode | Recipient selection | Example |
|---|---|---|
| General broadcast | All active investors, all admins, all users, or a selected role | “Scheduled maintenance begins Saturday at 01:00 UTC.” |
| Personal message | One or more explicitly selected investor IDs | “Your submitted deposit proof needs a clearer image.” |
| Plan-targeted message | All active investors currently assigned to one or more selected plans | “Growth plan reporting will be published at 18:00 UTC.” |

The recipient query must run on the server at send time. Do not trust a list of recipient emails from the browser. The server should resolve the audience using current database state, create one in-app notification per recipient, and create one email-outbox item per verified email recipient.

The admin composer should show an audience preview before sending. The preview should include the recipient count, selected plans, excluded users, users without verified email, and users who disabled non-critical email. Sending should require confirmation for a large audience and should record the admin ID, recipient query, message content, template ID, and timestamp.

Plan targeting must use the investor’s **active plan assignment**, not the plan they once purchased or a client-side label. If an investor changes from Starter to Growth after a deposit approval, future plan-targeted messages should follow the current active plan. The original plan at the time of a financial event should remain recorded in that event’s snapshot.

## 5. Notification categories and recipient matrix

The following matrix defines who should receive each event.

| Event | Investor in-app | Investor email | Admin in-app | Admin email | Trader |
|---|---:|---:|---:|---:|---:|
| Deposit submitted | Optional receipt | Optional receipt | Yes | Yes | No |
| Deposit approved | Yes | Yes | Audit event | Optional | No |
| Deposit rejected | Yes | Yes | Audit event | Optional | No |
| Plan assigned or changed | Yes | Yes | Audit event | Optional | No |
| ROI published | Yes | Yes if enabled | Audit event | Optional | No |
| ROI corrected/reversed | Yes | Yes | Yes | Optional | No |
| KYC submitted | Status placeholder | Optional receipt | Yes | Yes | No |
| KYC approved | Yes | Yes | Audit event | Optional | No |
| KYC declined/resubmission requested | Yes | Yes | Audit event | Optional | No |
| Withdrawal submitted | Yes | Yes | Yes | Yes | No |
| Withdrawal OTP requested | Yes | Yes or SMS | No | No | No |
| Withdrawal approved | Yes | Yes | Audit event | Optional | No |
| Withdrawal rejected/held | Yes | Yes | Audit event | Optional | No |
| Referral reward credited | Yes | Yes | Audit event | Optional | No |
| Referral withdrawal requested | Yes | Yes | Yes | Yes | No |
| Referral withdrawal settled/rejected | Yes | Yes | Audit event | Optional | No |
| Trader profile added/updated | Optional | Optional | Audit event | Optional | Only if linked user |
| General admin broadcast | If selected | If enabled | Audit event | Optional | Only if selected and linked |
| Plan-targeted broadcast | Selected plan holders | If enabled | Audit event | Optional | No by default |
| Password/security change | Yes | Yes | Audit event | Optional | No |
| New login or suspicious activity | Yes | Yes | Optional | Optional | No |

Critical security and financial notifications should not be disabled. Marketing, educational, and non-critical operational messages may respect user preferences.

## 6. In-app notification behavior

The persistent `notifications` table is the source for the notification bell. Each record should contain the recipient user ID, event type, title, body, read state, created timestamp, optional related record type/ID, and a deduplication key.

The investor sees a notification center in the investor sidebar. The admin sees the same style of center in the operations sidebar, but receives staff queue alerts and audit messages. The notification API must always filter by the authenticated recipient ID unless the caller is an authorized admin using a separate administrative endpoint.

The notification center can poll periodically or use Supabase Realtime later. Polling is acceptable for the first production release if it has a bounded interval and does not use misleading “live sync” branding. The unread count should be calculated from server data, not local state.

## 7. Transactional email architecture

Real email requires a transactional provider such as Resend, Postmark, SendGrid, Amazon SES, or another provider supported by the deployment environment. The recommended initial implementation is a server-only HTTP adapter using Resend or an equivalent provider.

Required environment variables are:

```text
RESEND_API_KEY=server-only-provider-key
EMAIL_FROM=Quantovest Capital <notifications@verified-domain.com>
APP_PUBLIC_URL=https://your-production-domain.com
```

The provider sender domain must be verified before sending production email. The key must exist only in Vercel server environment variables and must never use a `NEXT_PUBLIC_` prefix.

The email system should have four layers:

| Layer | Responsibility |
|---|---|
| Event helper | Receives an event such as `deposit_approved` with a trusted record ID and recipient ID. |
| Template renderer | Loads the correct controlled template and safely interpolates server-derived variables. |
| Outbox | Stores recipient, template, subject, payload, status, attempts, provider ID, and error information. |
| Provider adapter | Sends the rendered message and records the provider response. |

The business transaction should write an outbox record after the event succeeds. A retry mechanism should process pending records. If the provider is temporarily unavailable, the in-app notification remains visible and the email can retry without repeating the deposit, ROI, KYC, or withdrawal action.

## 8. Email templates and personalization

System events should use controlled templates rather than arbitrary admin HTML. The subject, layout, security footer, dashboard URL, and compliance language should be controlled by code. Admins may provide a safe message body for broadcasts, but should not inject unrestricted script or untrusted HTML.

| Template | Server-derived fields |
|---|---|
| `deposit_approved` | Investor name, amount, currency, plan name, plan ROI range, approved date, dashboard URL |
| `plan_updated` | Investor name, previous plan, new plan, effective date, new limits, dashboard URL |
| `roi_published` | Investor name, ROI percentage, profit amount, date, plan snapshot, dashboard URL |
| `kyc_approved` | Investor name, approved date, dashboard URL |
| `kyc_declined` | Investor name, review note, resubmission URL |
| `withdrawal_submitted` | Investor name, amount, destination type, request ID, submitted date |
| `withdrawal_approved` | Investor name, amount, settlement status, request ID |
| `referral_reward_credited` | Investor name, reward amount, qualifying event, available balance |
| `admin_broadcast` | Investor name, admin message, selected audience label, dashboard URL |
| `security_alert` | Investor name, event time, approximate location/device metadata when appropriate, security URL |

Personalization means the same approved template can contain the recipient’s name, plan, amount, status, and secure dashboard link. It does not mean allowing the browser to submit arbitrary financial values. Financial values must be loaded from the database after authorization and should be formatted from integer cents or another exact representation.

For a general broadcast, the message body is common but each email still receives the correct recipient name, preference handling, dashboard URL, and recipient address. For a personal message, the recipient set is restricted to the admin’s selected users. For a plan-targeted message, the server resolves current active plan holders before creating delivery jobs.

## 9. Plan purchase and plan update event

When an investor submits a deposit, the account must remain pending until an authorized admin verifies the proof. Approval should execute one transaction that marks the deposit completed, selects or confirms the plan, updates the investor account, writes a deposit ledger event, and creates a plan-assignment event.

After the transaction commits, the system should create:

1. An investor in-app `deposit_approved` notification.
2. An investor email using the `deposit_approved` template.
3. An investor in-app `plan_updated` notification when the active plan changes.
4. An investor email using the `plan_updated` template when the active plan changes.
5. An admin audit notification and optional staff email.
6. A referral reward event if the deposit qualifies as the referred investor’s first approved deposit.

The ROI range shown to the investor must come from the active plan record. The original plan and ROI boundaries should be snapshotted into the relevant financial event so later plan edits do not rewrite historical records.

## 10. OTP and 2FA requirements

The current visual 2FA state is not sufficient by itself. A production withdrawal flow needs a real challenge and verification process. The recommended design is authenticator-app TOTP for account-level 2FA, with email OTP as a fallback only where appropriate. SMS OTP should require a provider and additional anti-abuse controls.

| Action | Required security |
|---|---|
| Enable 2FA | Generate secret, show QR once, verify an initial TOTP code, then encrypt the secret at rest. |
| Disable 2FA | Require current password or provider reauthentication plus a current TOTP code. |
| Submit withdrawal | Require a recent authenticated session; require TOTP if enabled; otherwise require a one-time email challenge if policy allows. |
| Change bank/crypto destination | Require reauthentication and 2FA; apply a cooling-off period before the first withdrawal to a new destination. |
| Admin approve payout | Require admin 2FA and a separate permission such as `withdrawals.approve`. |
| Change plan or publish exceptional ROI | Require admin role and audit record; require step-up authentication for high-risk changes. |
| Change email/password | Require reauthentication and notify the old and new email addresses. |
| Disable security controls | Require a verified current factor and create a high-priority security audit event. |

OTP records should contain a hashed challenge, purpose, user ID, expiration, attempt count, consumed timestamp, and provider/channel. OTPs should be single-use, short-lived, rate-limited, and never stored in plaintext. The server must invalidate older challenges for the same purpose after a new challenge is issued.

For a withdrawal, the server should create the withdrawal request in a `security_pending` state, send the challenge, and only move it to `pending_review` after successful verification. Repeated failures should lock the challenge and notify the investor. Admins must never be able to read an investor’s OTP secret or plaintext code.

## 11. Notification preferences

Preferences should be stored per user and separated into required security/financial notices and optional communication categories.

| Preference | Default | Can investor disable? |
|---|---:|---:|
| Deposit status | Enabled | No |
| KYC status | Enabled | No |
| Withdrawal status | Enabled | No |
| Security alerts | Enabled | No |
| Plan assignment/change | Enabled | No |
| ROI publication | Enabled | Optional email disable only if permitted by policy |
| Referral activity | Enabled | Optional email disable; in-app remains available |
| General admin broadcasts | Enabled | Yes for non-critical messages |
| Educational/marketing messages | Disabled or opt-in | Yes |

Admins should be able to set platform defaults but should not silently disable critical investor notices. Every email job should evaluate the recipient’s preferences at send time, except mandatory security/financial events.

## 12. Audit and compliance records

Every sensitive admin operation should create an immutable audit record. At minimum, record the actor ID, actor role, action, target type, target ID, before and after values where safe, request ID, timestamp, IP hash or controlled metadata, and result.

Required audit events include plan creation/edit/archive, plan assignment, ROI publication/reversal, deposit instruction changes, deposit approval/rejection, KYC review, withdrawal approval/rejection, referral reward approval, notification broadcast, personalized message, role change, 2FA enable/disable, password/email change, and payout-provider status changes.

Audit records should not be editable from the normal admin UI. A restricted security administrator may export them. Sensitive document paths and payment details should be masked in list views while remaining available through controlled signed access when necessary.

## 13. Admin messaging workflow

The admin messaging page should follow this sequence:

```text
Choose audience: all / role / plan / selected users
        ↓
Enter title and message or select approved template
        ↓
Choose channels: in-app, email, or both
        ↓
Preview recipient count and sample rendering
        ↓
Confirm send and require admin reauthentication for large broadcasts
        ↓
Create per-recipient notification and email-outbox records
        ↓
Display delivery summary and audit ID
```

The admin should be able to search by investor name/email, filter by active plan, KYC state, account state, and email verification, then select individual recipients. The admin should not be able to target users based on untrusted browser-provided email addresses.

## 14. What will work after configuration, and what will not work automatically

Adding Supabase and email credentials will make the configured connection possible, but credentials alone do not guarantee every feature works. The following must all be true:

| Requirement | Effect |
|---|---|
| Supabase URL/key/database pooler configured | Database/auth/storage connections can operate. |
| Migrations and RLS applied | Tables and ownership policies exist. |
| Auth providers configured | Investors/admins can sign in through selected providers. |
| Verified email sender and provider key configured | Server can send transactional email. |
| Email outbox and provider adapter deployed | Events can be queued, sent, retried, and audited. |
| Event hooks wired to every business mutation | Deposit/plan/KYC/ROI/withdrawal events actually create messages. |
| User preferences and verified email state implemented | Optional email behavior is respected safely. |
| OTP/2FA challenge and verification implemented | Withdrawals can be protected with real step-up authentication. |
| Payout provider and webhooks integrated | Approved withdrawals can actually settle money. |
| Staging tests passed | The system has evidence that retries, double clicks, permissions, and failure states are safe. |

## 15. Implementation roadmap

The first implementation phase should add the notification event and email-outbox tables, a controlled template registry, a server-only provider adapter, and a retry-safe delivery function. The second phase should add recipient targeting by role, plan, and selected users, plus the admin composer and preview. The third phase should wire plan assignment, deposit approval, KYC status, ROI publication, withdrawal state, referral reward, and security events to the outbox. The fourth phase should implement TOTP/OTP and withdrawal step-up verification. The fifth phase should add audit logs, delivery dashboards, RLS tests, browser tests, and staging verification.

The current `develop` branch already has much of the in-app notification, deposit verification, admin message, and status-event foundation. The missing production layer is primarily the email outbox/provider adapter, plan-targeted recipient query and UI, notification preference persistence, real OTP/2FA delivery and verification, comprehensive event wiring, and audit/retry infrastructure.

## 16. Required environment configuration later

When you are ready to configure email, add the following through Vercel’s environment settings or the project’s secure secret workflow. Do not commit values to GitHub.

```text
RESEND_API_KEY=server-only-provider-key
EMAIL_FROM=Quantovest Capital <notifications@verified-domain.com>
APP_PUBLIC_URL=https://your-domain.com
```

For OTP/2FA, add only the provider variables required by the selected implementation. TOTP does not require a third-party delivery provider, but email OTP requires the transactional email provider and SMS OTP requires a separate SMS provider. Any service-role key must remain server-only.

## 17. Definition of done

The feature set should be considered complete only when an admin can configure plans, payment details, notification templates, recipient audiences, staff permissions, and security policy from the admin console; an investor can receive in-app and email messages for all required account events; plan-targeted messages resolve the correct active plan holders; deposit approval updates the plan and ledger exactly once; KYC and withdrawal decisions notify both sides; withdrawal OTP/2FA is actually verified before funds are reviewable; email failures retry without duplicating business actions; and every sensitive admin operation is visible in an immutable audit log.

## References

[1]: https://supabase.com/docs/guides/auth/server-side/creating-a-client "Supabase server-side authentication clients"
[2]: https://supabase.com/docs/guides/database/postgres/row-level-security "Supabase Row Level Security"
[3]: https://vercel.com/docs/environment-variables "Vercel environment variables"
[4]: https://resend.com/docs/send-with-nodejs "Resend transactional email API"
[5]: https://supabase.com/docs/guides/auth/auth-mfa/totp "Supabase TOTP multi-factor authentication"
