# Implementation Plan — Portal Security, Single-Plan Upgrade Flow, & Notifications

This plan implements a single-plan upgrade flow (rather than multiple plans) for investor accounts, including minimum balance requirements for plans, profit-only vs. full-withdrawal/close-account options, TOTP-based 2FA verification, settings-driven email preferences, and a floating customer support widget.

---

## User Review Required

> [!IMPORTANT]
> - **Upgrade Flow & Single Plan Model:** To keep user management simple, investors will have **one single active plan** at a time. Investors can upgrade to a higher plan (Starter -> Growth -> Elite) when their balance meets the plan's minimum threshold (e.g., $5,000 for Growth). If they have insufficient balance, the system will calculate the remaining amount they need to deposit.
> - **Plan Maintenance & Closures:**
>   - Investors must maintain the plan's minimum balance to earn ROI.
>   - Investors can withdraw profits as long as the balance remains above the minimum.
>   - Investors can request a **Full Withdrawal & Close Account**, which will withdraw the entire balance, set their plan to "None", and set their balance to 0 upon approval.
> - **TOTP 2FA Verification:** We will implement standard TOTP-based 2FA. Investors can scan a generated Google Authenticator QR code, verify it with a 6-digit code, and activate it. If 2FA is enabled, it will require a 6-digit TOTP code before submitting any withdrawal request.
> - **Notification & Email Preferences:** Checkboxes in Settings will allow users to opt-in or opt-out of notification emails. Security and withdrawal events are critical and will ignore opt-outs.

---

## Detailed Notification Mapping

The platform will trigger the following notifications on state mutations:

| Category | Event Trigger | Recipient | In-App Content | Email Content / Template |
|---|---|---|---|---|
| **Personal** | Deposit Submitted | Investor | "Deposit request of $X submitted." | Receipt email acknowledging pending review. |
| **Personal** | Deposit Approved | Investor | "Deposit approved. $X credited to your Y Plan." | Deposit confirmation + Plan details. |
| **Personal** | Deposit Rejected | Investor | "Deposit rejected: [Reason]" | Rejection alert + action link to retry. |
| **Personal** | KYC Submitted | Investor | "KYC documents uploaded successfully." | Receipt email acknowledging review queue. |
| **Personal** | KYC Approved | Investor | "KYC verification approved." | Account status upgrade confirmation. |
| **Personal** | KYC Rejected | Investor | "KYC verification declined: [Reason]" | Resubmission request with reason details. |
| **Personal** | Withdrawal Requested | Investor | "Withdrawal of $X requested." | Withdrawal ticket details + security alert. |
| **Personal** | Withdrawal Approved | Investor | "Withdrawal of $X processed." | Payout receipt. |
| **Personal** | Withdrawal Rejected | Investor | "Withdrawal of $X declined: [Reason]" | Decline explanation + support link. |
| **Personal** | Referral Reward | Referrer | "$X reward credited from referee." | Reward notification + updated bonus balance. |
| **Plan-Target** | Admin Broadcast | Plan Holders | "Firm Update: [Title]" | Rendered template sent to active plan holders. |
| **General** | Admin Broadcast | All Users | "Platform Notice: [Title]" | Rendered template sent to all active users. |

---

## Proposed Changes

### Component 1: Store & DB Upgrade Flow

#### [MODIFY] [`lib/store.ts`](file:///c:/Users/Owner/Documents/quantovest/lib/store.ts)
- Maintain the single active plan schema (the unique index on `investorId` in `investorAccounts` is kept).
- Reset `INITIAL_USER` to: balance = 0, totalInvested = 0, totalProfit = 0, dailyRoiPercent = 0, allTimeRoiPercent = 0, plan = 'None', kycStatus = 'unverified', onboardingCompleted = false. Clear queues to `[]`.
- Add settings fields to the `User` schema: `payoutBank`, `payoutCrypto`, `twoFactorEnabled`, `twoFactorSecret`, `notifyDailyRoi`, and `notifyStrategyAlerts`.
- Implement store functions:
  - `upgradePlan(targetPlanName: 'Starter' | 'Growth' | 'Elite')`: Switches the user's plan to the target plan if their balance meets the minimum deposit requirement.
  - `closeAccount()`: Set user's active plan to 'None' and balance to 0 (triggered after full withdrawal approval).

---

### Component 2: Dynamic Admin ROI Console (Single Plan with Range Info)

#### [MODIFY] [`app/admin/performance/page.tsx`](file:///c:/Users/Owner/Documents/quantovest/app/admin/performance/page.tsx)
- The investor selection list remains simple.
- When an investor is selected, display their single active plan, current balance, and allowed ROI range (min/max).
- Pre-validate that the entered ROI % falls within the selected investor's active plan limits before submission.

---

### Component 3: TOTP 2FA & Notification Preferences in Settings

#### [MODIFY] [`app/dashboard/settings/page.tsx`](file:///c:/Users/Owner/Documents/quantovest/app/dashboard/settings/page.tsx)
- **Security & 2FA Panel:**
  - If 2FA is disabled, display a "Configure 2FA" button.
  - Clicking it displays a Google Authenticator setup modal showing a generated TOTP secret, a QR code image (using standard QR Server API), and an input for verification.
  - Verifying the 6-digit code saves `user.twoFactorEnabled = true` and the secret key.
  - If 2FA is enabled, display an option to disable it, requiring a valid TOTP code to confirm.
- **Unified Payout Details:**
  - Inputs for Crypto wallet address (and network) and Bank details. Saved to profile on submit.
- **Notification Preferences:**
  - Bind checkboxes to `user.notifyDailyRoi` and `user.notifyStrategyAlerts` state.

---

### Component 4: Withdrawal Options & Upgrade Controls

#### [MODIFY] [`app/dashboard/page.tsx`](file:///c:/Users/Owner/Documents/quantovest/app/dashboard/page.tsx)
- Add a visible **Upgrade Plan** button in the header or active plan section.
- Tapping it displays plan cards (Starter, Growth, Elite) with minimum balance requirements.
- Show an "Upgrade" action for plans higher than their current one:
  - If the user has enough balance, complete the upgrade.
  - If they have insufficient balance, show a message: "Upgrade requires a minimum balance of $X. You need to deposit at least $Y more to qualify." with a link to Deposit.
- Add an onboarding tour card explaining:
  - Balance requirements.
  - Profit withdrawals.
  - Account closures.

#### [MODIFY] [`app/dashboard/withdraw/page.tsx`](file:///c:/Users/Owner/Documents/quantovest/app/dashboard/withdraw/page.tsx)
- Remove the destination input fields. Read details automatically from Settings based on the payout rail selected.
- Add a checkbox/switch: **"Close Account & Withdraw Entire Balance"**.
  - If checked, disable the amount input and default it to their full balance.
  - If unchecked, restrict the withdrawal amount so that the remaining balance doesn't fall below the active plan's minimum threshold (e.g. $1,500 for Starter, $7,500 for Growth). Display a warning if they try to withdraw past it.
- **2FA Challenge Check:** If 2FA is enabled in settings, show a 6-digit 2FA OTP code input field on submission. Verification is required before the request is submitted.

#### [MODIFY] [`app/dashboard/referrals/page.tsx`](file:///c:/Users/Owner/Documents/quantovest/app/dashboard/referrals/page.tsx)
- Wrap in the `InvestorSidebar` shell layout, change colors to dashboard colors (`bg-[#0A0F11]`).
- Clean up referral withdrawal fields to use the saved payout address from Settings.

---

### Component 5: Admin Messaging Composer (General, Personal, Plan-Targeted)

#### [NEW] [`app/admin/notifications/page.tsx`](file:///c:/Users/Owner/Documents/quantovest/app/admin/notifications/page.tsx)
- Admin UI to send broadcasts:
  - **Audience Selector:** General broadcast (all users), Personal message (select specific user), or Plan-targeted message (select Starter, Growth, or Elite plan holders).
  - Preview recipient count before sending.
  - Create correct in-app `notifications` records and send simulated emails depending on recipient preferences.

---

### Component 6: Customer Support Widget & Drawers

#### [MODIFY] [`components/TawkToWidget.tsx`](file:///c:/Users/Owner/Documents/quantovest/components/TawkToWidget.tsx)
- If default credentials are present, render a floating chat widget at the bottom right. Clicking it launches a support dialog with a simulated interactive helper assisting with deposits, KYC, and withdrawals.
- If real credentials are provided, load the live chat script.

#### [MODIFY] [`components/InvestorSidebar.tsx`](file:///c:/Users/Owner/Documents/quantovest/components/InvestorSidebar.tsx) & [`components/AdminSidebar.tsx`](file:///c:/Users/Owner/Documents/quantovest/components/AdminSidebar.tsx)
- Remove bottom nav bar.
- Implement mobile sticky top header (`flex md:hidden`) containing avatar (left drawer trigger) and bell icon (right drawer trigger). Remove Quick Actions list.

#### [MODIFY] [`components/NotificationCenter.tsx`](file:///c:/Users/Owner/Documents/quantovest/components/NotificationCenter.tsx)
- Rebuild as a right-side drawer panel with overlay backdrop.
