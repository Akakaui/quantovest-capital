# Quantovest Capital Production QA Test Plan

**Status:** Draft for authenticated regression testing  
**Scope:** Investor and administrator journeys on desktop, tablet, and mobile  
**Test policy:** Use dedicated test accounts and non-sensitive test files. Never use real identity documents, real payment screenshots, real wallet transfers, or production customer data during QA.

## 1. Release gates

A release is ready only when the investor and admin journeys pass without uncaught browser errors, API 5xx responses, broken navigation, misleading empty states, or security-boundary failures. Any failure must be recorded with the route, role, reproduction steps, expected result, actual result, browser/device, timestamp, console error, network status, and severity.

| Severity | Definition | Release treatment |
| --- | --- | --- |
| P0 | Authentication bypass, cross-account data exposure, wrong wallet/network, unauthorized balance credit, or destructive data loss. | Stop testing and block release. |
| P1 | KYC/deposit approval, upload, notification, withdrawal, or core dashboard workflow is unusable. | Block release until fixed or explicitly waived. |
| P2 | Important feature is degraded but a safe workaround exists. | Fix before launch where practical; document waiver if not. |
| P3 | Cosmetic, copy, spacing, or minor responsive defect. | Track for follow-up. |

## 2. Test accounts and data

Prepare one administrator account, one new investor account, one existing investor account with completed onboarding, and one investor account with pending KYC. Use a small JPG or PNG test file containing no personal information for KYC and deposit-proof upload. Keep the test wallet addresses and screenshots clearly marked as test data unless the owner has explicitly approved a controlled production configuration.

## 3. Authentication, sessions, and role boundaries

| ID | Journey | Expected result | Result |
| --- | --- | --- | --- |
| AUTH-01 | Investor signs up with valid email/password. | Account is created, the user reaches the intended first-run experience, and the session is established. | ☐ |
| AUTH-02 | Investor signs in with valid credentials. | Dashboard opens with the correct investor identity and no stale account data. | ☐ |
| AUTH-03 | Invalid investor credentials. | Clear error appears without revealing whether an account exists. | ☐ |
| AUTH-04 | Admin signs in with valid admin credentials. | Admin console opens and investor-only controls are not shown. | ☐ |
| AUTH-05 | Investor requests `/admin` or `/api/admin/*`. | Access is denied or redirected; no admin data is returned. | ☐ |
| AUTH-06 | Admin requests investor-owned data for another account. | Authorization prevents cross-account access. | ☐ |
| AUTH-07 | Investor signs out. | Session is revoked, navigation returns to login, protected routes cannot be revisited with Back, and cached private data is cleared. | ☐ |
| AUTH-08 | Browser is closed and reopened after the configured session lifetime. | The user must sign in again; no indefinitely persistent authenticated session remains. | ☐ |
| AUTH-09 | Session expires while a form is open. | The next protected request returns a clear session-expired message and does not silently discard or submit the form. | ☐ |
| AUTH-10 | Two browser sessions use the same account; one signs out globally. | The other session is invalidated according to the intended global sign-out policy. | ☐ |
| AUTH-11 | Google sign-in. | The OAuth consent/account chooser displays the configured business/project branding rather than an unwanted Supabase project identifier. | ☐ |
| AUTH-12 | OAuth callback uses the production domain. | Redirect URI matches the configured production URL and does not expose internal project identifiers. | ☐ |

## 4. Onboarding and interactive tour

| ID | Journey | Expected result | Result |
| --- | --- | --- | --- |
| TOUR-01 | Brand-new investor signs in for the first time. | Onboarding appears once and guides the user to meaningful controls. | ☐ |
| TOUR-02 | New investor completes onboarding. | Completion is persisted server-side for that account. | ☐ |
| TOUR-03 | Completed investor signs out and signs in again. | Onboarding does not reappear. | ☐ |
| TOUR-04 | Existing account with incomplete onboarding signs in. | The app resumes or offers the incomplete steps intentionally rather than restarting randomly. | ☐ |
| TOUR-05 | User clicks Next, Back, Skip, and Finish. | Each control changes the highlighted target and scrolls to the relevant feature; no step is visually stagnant. | ☐ |
| TOUR-06 | Tour is tested on mobile and tablet. | Tooltip remains within viewport and points to usable controls. | ☐ |
| TOUR-07 | Tour is interrupted by refresh or route navigation. | State is restored or safely dismissed according to the product decision. | ☐ |

## 5. Investor dashboard and navigation

Test Overview, Portfolio Managers, Deposit, Withdraw, History, Portfolio, Swap, Referrals, Settings, notification center, support widget, KYC state, and mobile navigation. Confirm loading, empty, success, error, and retry states. Confirm amounts, statuses, dates, and labels are consistent across dashboard cards, history, and notifications.

## 6. KYC workflow

| ID | Journey | Expected result | Result |
| --- | --- | --- | --- |
| KYC-01 | Investor opens KYC page. | Requirements, supported formats, size limits, and privacy guidance are clear. | ☐ |
| KYC-02 | Uploads valid test ID and address files. | Both files upload to the canonical private bucket and return owner-scoped paths. | ☐ |
| KYC-03 | Uploads an unsupported type or oversized file. | Client and server reject it with a useful message. | ☐ |
| KYC-04 | Submits KYC. | Structured document references are stored and status becomes pending. | ☐ |
| KYC-05 | Refreshes KYC page. | Pending status persists and duplicate submissions are handled safely. | ☐ |
| KYC-06 | Admin opens KYC queue. | Correct investor record and private signed document links are shown. | ☐ |
| KYC-07 | Admin approves KYC. | Investor status changes to approved and the investor receives the intended notification/email. | ☐ |
| KYC-08 | Admin rejects KYC with a note. | Rejection reason is stored, investor sees it, and resubmission is possible. | ☐ |
| KYC-09 | Investor attempts to access another investor’s document path. | Access is denied. | ☐ |

## 7. BTC/USDT deposit workflow

The approved production methods are BTC on the Bitcoin network and USDT on TRON/TRC-20 only. ETH and USDT ERC-20 must not appear in the investor or admin method selectors, and the server must reject them even if a request is crafted manually.

| ID | Journey | Expected result | Result |
| --- | --- | --- | --- |
| DEP-01 | Admin opens Deposit Operations. | Only BTC and USDT TRC-20 instruction cards are available. | ☐ |
| DEP-02 | Admin enters the approved address and network label. | Values are saved and remain after refresh. | ☐ |
| DEP-03 | Admin uploads the cropped BTC QR asset. | Only the QR image is uploaded to private `quantovest-media`; no full screenshot is used. | ☐ |
| DEP-04 | Admin uploads the cropped USDT TRC-20 QR asset. | QR is linked to the matching USDT record. | ☐ |
| DEP-05 | Investor opens Deposit. | Only BTC and USDT TRC-20 are visible, with clear network warnings. | ☐ |
| DEP-06 | Investor copies BTC address. | Clipboard contains exactly the approved BTC address. | ☐ |
| DEP-07 | Investor copies USDT address. | Clipboard contains exactly the approved TRC-20 address. | ☐ |
| DEP-08 | Investor scans each QR. | QR decodes to the matching wallet/network; validate with an independent wallet scanner before production use. | ☐ |
| DEP-09 | Investor submits a valid test proof. | Proof is owner-scoped, stored privately, and deposit enters pending status. | ☐ |
| DEP-10 | Investor submits without proof or with an unsupported method. | Submission is rejected with a clear message. | ☐ |
| DEP-11 | Admin opens pending deposits. | Correct proof is accessible by a signed URL and method/address metadata is visible. | ☐ |
| DEP-12 | Admin approves a test deposit. | Balance/ledger update is idempotent and investor receives the intended notification/email. | ☐ |
| DEP-13 | Admin rejects a test deposit. | Rejection status and note are visible; balance is not credited. | ☐ |
| DEP-14 | Repeat the same approval request. | No duplicate credit or duplicate ledger entry occurs. | ☐ |

## 8. Withdrawals, plans, ROI, traders, swap, and referrals

Test minimum and maximum limits, invalid values, pending state, admin review, rejection, approval, balance effects, ledger entries, and notifications. For ROI, confirm the simple-return model, assumptions, illustrative language, non-guarantee disclaimer, input validation, chart labels, and mobile layout. For traders and swap, test empty, active, inactive, invalid-pair, fee, and confirmation states. For referrals, test attribution, qualifying deposit, reward idempotency, reward history, and referral-withdrawal review.

## 9. Notifications and email

| ID | Journey | Expected result | Result |
| --- | --- | --- | --- |
| NOT-01 | Investor submits KYC or deposit. | Admin notification is created. | ☐ |
| NOT-02 | Admin approves/rejects KYC or deposit. | Investor notification is created with the correct type, title, body, and related record. | ☐ |
| NOT-03 | Investor opens notification center. | Read/unread state updates and filters work. | ☐ |
| NOT-04 | Admin broadcasts an announcement. | Target selection works, content is delivered once, and errors are shown. | ☐ |
| NOT-05 | Resend is configured with the verified business domain. | Transactional email sender displays the business address, not a default or unverified address. | ☐ |
| NOT-06 | Email provider is unavailable. | The product logs the failure safely and does not falsely report delivery as successful. | ☐ |

## 10. Tawk.to support

Confirm the widget appears on public routes and is hidden on `/admin`. From a visitor browser, send a harmless test message; from the Tawk mobile app, receive and answer it, apply a tag, use a saved reply, and close the conversation. Confirm the offline form appears when the sole agent is Away or logged out. Tawk does not natively convert an unanswered online chat to an offline form after an arbitrary timeout, so this limitation must be documented rather than promised to customers.

## 11. Responsive and browser checks

Run the critical flows at 375×812, 390×844, 768×1024, 1024×768, and 1440×900. Check keyboard focus, labels, contrast, touch target size, sticky navigation, modals, file pickers, charts, copy buttons, QR display, and Tawk overlap. Test the latest Chrome, Safari/iOS if available, and Firefox. Record console errors and failed network requests separately from visual defects.

## 12. Defect log template

For every failure, record: `ID`, `severity`, `role`, `route`, `browser/device`, `preconditions`, `steps`, `expected`, `actual`, `console/network evidence`, `screenshot or recording`, `suspected root cause`, `owner`, `status`, and `retest result`.

## 13. Final sign-off

The investor tester signs off on investor workflows, the administrator signs off on admin workflows, and the owner confirms wallet addresses, networks, deposit methods, email sender identity, OAuth branding, and production environment variables. A build passing alone is not sufficient evidence for financial, authentication, or data-privacy workflows.

## References

[1]: https://supabase.com/docs/guides/auth/sessions Supabase Auth sessions documentation  
[2]: https://resend.com/docs/dashboard/domains/introduction Resend domain verification documentation  
[3]: https://help.tawk.to/article/adding-a-widget-to-your-website Tawk.to widget installation documentation
