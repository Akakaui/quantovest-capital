# Quantovest — Comprehensive Test Plan

> **Date:** 2026-08-20
> **Scope:** All investor dashboard features, admin panel features, and shared components
> **Auth model:** Supabase Auth (JWT Bearer token on API routes)

---

## Legend

| Symbol | Meaning |
|--------|---------|
| **DB** | Requires a working Supabase database |
| **Auth** | Requires a valid Supabase session |
| **Client** | Runs entirely in-browser with no DB dependency |
| **Ext API** | Calls an external third-party API |

---

## 0. Dependency Matrix

| Feature | Auth | DB | Ext API | Fallback Without DB |
|---------|------|----|---------|---------------------|
| Dashboard | ✅ | ✅ | — | Redirects to `/login` |
| Deposit | ✅ | ✅ | — | Uploads still work; submit fails |
| Withdraw | ✅ | ✅ | — | Profile load fails silently |
| History | ✅ | ✅ | — | Empty list shown |
| Portfolio | ✅ | ✅ | CoinGecko | Empty holdings; prices fail silently |
| Swap | ✅ | ✅ | — | Quote/execute fails |
| Traders | ✅ | ✅ | — | Empty trader list |
| Referrals | ✅ | ✅ | — | 401 message shown |
| KYC | ✅ | ✅ | — | Upload works; submit fails |
| Settings | ✅ | ✅ | — | Profile not loaded |
| Notifications (NC) | ✅ | ✅ | — | Empty list; 30s poll still runs |
| Onboarding Modal | ✅ | ✅ | — | PATCH fails silently; modal closes |
| Admin Dashboard | ✅ | ✅ | — | Counters show 0 |
| Admin Deposits | ✅ | ✅ | — | Empty list |
| Admin Withdrawals | ✅ | ✅ | — | Empty list |
| Admin KYC | ✅ | ✅ | — | Empty list |
| Admin Performance | ✅ | ✅ | — | Investor dropdown empty |
| Admin Plans | ✅ | ✅ | — | Empty list |
| Admin Traders | ✅ | ✅ | — | Empty list |
| Admin Notifications | ✅ | ✅ | — | Send fails |
| Admin Referrals | ✅ | ✅ | — | Empty list |
| Admin Deposit Instructions | ✅ | ✅ | — | Empty; save fails |

**Summary:** Every feature requires Auth + DB. Only the Portfolio page has an external API dependency (CoinGecko). The Onboarding modal and Tour are client-only UI state, but persisting answers requires DB.

---

## 1. Investor Dashboard — `app/dashboard/page.tsx`

### What it does
- Fetches profile, deposits, withdrawals, and KYC data in parallel
- Displays total portfolio balance (with mask/unmask toggle)
- Shows Total Invested, Total ROI Profit, Daily ROI, All-Time Return
- Renders a portfolio growth area chart (Recharts)
- Shows an AllocationRingChart for the current plan
- Shows a Daily ROI Strategy Activity Log (deposits + withdrawals)
- Triggers OnboardingModal if `onboardingCompleted === false`
- Triggers KycModal if `kycStatus !== 'approved'`
- Shows a 4-step interactive Welcome Tour (localStorage-gated)
- Has an Upgrade Plan modal with balance-based eligibility
- Has a KYC banner alert when not verified

### Step-by-step test
1. Log in as an investor with a complete profile (onboarding done, KYC approved)
2. Verify loading skeleton appears briefly
3. Confirm profile name, plan, and KYC status render in the header
4. Confirm balance card shows correct dollar amount
5. Click the eye icon → balance should mask to `••••••••`
6. Click eye again → balance unmasks
7. Verify Total Invested, Total ROI Profit, Daily ROI, All-Time Return values match DB
8. Verify the area chart renders with data points from approved deposits
9. Verify the AllocationRingChart renders for the current plan
10. Verify the Activity Log shows approved deposits and withdrawals sorted newest-first
11. Click "Upgrade Plan" → modal opens with plan tiers
12. Click "Upgrade" on an affordable plan → `POST /api/investor/upgrade` fires, plan updates
13. Click "ROI Calculator" → RoiCalculatorModal opens
14. If KYC is not approved → amber banner and "Complete Verification" button appear
15. Click "Upload Documents Now" → KycModal opens

### API endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/investor-profile` | Profile data |
| GET | `/api/deposits` | All deposits |
| GET | `/api/withdrawals` | All withdrawals |
| GET | `/api/kyc` | KYC applications |
| POST | `/api/investor/upgrade` | Plan upgrade |

### What could go wrong
- Any 401 → redirect to `/login`
- Any API failure → error state with "Try Again" button
- Empty deposits → chart shows single point at current balance
- Empty activity log → "No activity recorded yet" empty state
- Tour localStorage key missing → tour shows on every visit if not completed

### DB required? **YES** — all data comes from DB

---

## 2. Deposit — `app/dashboard/deposit/page.tsx`

### What it does
- Loads admin-configured deposit instructions (crypto/bank)
- Shows QR code or copyable details for the selected method
- User enters amount, uploads payment screenshot, submits
- File uploads to `/api/uploads` with purpose `deposit-proof`
- Creates deposit record via `POST /api/deposits`

### Step-by-step test
1. Navigate to `/dashboard/deposit`
2. Toggle between "Crypto" and "Bank" tabs → instruction details change
3. Click "Copy" → clipboard contains deposit details; toast says "Deposit details copied."
4. Enter an amount (default $500)
5. Upload a valid image file (JPEG/PNG/WebP)
6. Click "Submit Deposit"
7. Verify upload call fires to `/api/uploads` (purpose: `deposit-proof`)
8. Verify `POST /api/deposits` fires with `{ amountCents, method, proofPath }`
9. Success screen shows: "Deposit proof submitted"
10. Click "Make another deposit" → form resets
11. Try submitting without a file → error: "Upload the payment screenshot before submitting."
12. Verify deposit history list refreshes after submission

### API endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/deposit-instructions` | Admin-configured instructions |
| GET | `/api/deposits` | User's deposit history |
| POST | `/api/uploads` | Upload proof screenshot |
| POST | `/api/deposits` | Create deposit request |

### What could go wrong
- No instructions configured → blank instruction area
- File too large or wrong type → upload fails
- Network error during submit → error message shown
- Proof upload succeeds but deposit create fails → orphaned file

### DB required? **YES**

---

## 3. Withdraw — `app/dashboard/withdraw/page.tsx`

### What it does
- Loads profile (balance, plan, 2FA status, payout details) and withdrawal history
- Validates 2FA via client-side TOTP verification
- Checks payout destination is configured
- Warns if withdrawal would drop below plan minimum
- Supports "Close Account" mode (withdraws entire balance)
- Submits withdrawal via `POST /api/withdrawals`

### Step-by-step test
1. Navigate to `/dashboard/withdraw`
2. Verify available balance and plan minimum display correctly
3. Enter an amount → remaining balance recalculates
4. If amount would drop below plan minimum → amber warning appears
5. Toggle payout rail between "Bank Transfer" and "Crypto Wallet"
6. If payout details saved in Settings → green confirmation shows destination
7. If no payout details → amber warning with link to Settings
8. If 2FA enabled → TOTP input field appears
9. Enter invalid 2FA code → submit blocked: "Invalid 2FA code"
10. Enter valid 2FA code → submit allowed
11. Check "Close Account" toggle → amount auto-fills to full balance; red warning appears
12. Submit → `POST /api/withdrawals` fires with `{ amountCents, destinationType, destination, closeAccount }`
13. Success screen: "Withdrawal Request Submitted"
14. Click "New Request" → form resets
15. Verify withdrawal history panel refreshes

### API endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/investor-profile` | Balance, plan, 2FA, payout details |
| GET | `/api/withdrawals` | Withdrawal history |
| POST | `/api/withdrawals` | Create withdrawal request |

### What could go wrong
- No payout details → "No payout details found" error
- 2FA code expired → invalid code error
- Balance insufficient → server-side rejection
- Close account mode + server error → balance unchanged

### DB required? **YES**

---

## 4. Transaction History — `app/dashboard/history/page.tsx`

### What it does
- Fetches ledger entries from `/api/history` with optional type filter
- Client-side search filtering on description, type, referenceId
- Displays FilterBar, TransactionRow components
- ExportButton for CSV/data export

### Step-by-step test
1. Navigate to `/dashboard/history`
2. Verify loading skeleton (5 pulse rows) appears
3. Once loaded, verify transactions render with type, amount, description, date
4. Use FilterBar to filter by type (deposit, withdrawal, roi, etc.) → list updates
5. Type in search box → client-side filter narrows results
6. Empty state: "No transactions found" when no matches
7. Click ExportButton → verify export fires (CSV download or API call)
8. Verify entries sorted by date

### API endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/history?type=...` | Ledger entries |
| GET | `/api/history/export` | Export data (via ExportButton) |

### What could go wrong
- API returns 401 → silently fails, empty list
- Very large dataset → no pagination visible (potential performance issue)
- Export with no data → unclear behavior

### DB required? **YES**

---

## 5. Portfolio — `app/dashboard/portfolio/page.tsx`

### What it does
- Fetches holdings, allocation, and live CoinGecko prices
- Shows summary cards: Total Value, Total Cost, P&L, P&L %
- Renders TradingView iframe chart for selected asset (BTC/ETH/SOL/XRP)
- Displays HoldingCards with live price + 24h change
- Shows AllocationPie breakdown

### Step-by-step test
1. Navigate to `/dashboard/portfolio`
2. Verify loading skeleton appears
3. Verify summary cards show Total Value, Total Cost, P&L, P&L %
4. Click BTC/ETH/SOL/XRP tabs → TradingView iframe reloads with correct symbol
5. Verify current price and 24h change display for selected asset
6. If holdings exist → HoldingCards show quantity, current price, cost basis, P&L
7. If no holdings → empty state: "No holdings yet. Deposit and copy a trader to start."
8. Verify AllocationPie renders with allocation data
9. CoinGecko price failure → graceful fallback to `currentPriceCents` from DB

### API endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/portfolio/holdings` | User's crypto holdings |
| GET | `/api/portfolio/allocation` | Allocation breakdown |
| GET | `/api/portfolio/prices?ids=...` | CoinGecko price proxy |

### What could go wrong
- CoinGecko rate limit → prices fall back to DB values
- No holdings → $0 values, empty allocation
- TradingView blocked by CSP → iframe blank
- Price API returns 0 → P&L calculations show $0

### DB required? **YES** (holdings + allocation). CoinGecko is external but has fallback.

---

## 6. Asset Swap — `app/dashboard/swap/page.tsx`

### What it does
- SwapForm: user picks from/to assets and amount
- SwapPreview: shows quote with rate, fee, receive amount
- SwapHistory: past swaps
- Tab toggle between Swap and History views

### Step-by-step test
1. Navigate to `/dashboard/swap`
2. Default tab is "Swap" → SwapForm renders
3. Select from/to assets and enter an amount
4. Submit form → `GET /api/swap/rate` fires → quote returned
5. SwapPreview shows: from, to, rate, fee, feeBps, receiveAmount
6. Click "Confirm" → `POST /api/swap/execute` fires → success toast
7. Click "Cancel" → returns to SwapForm
8. Switch to "History" tab → SwapHistory renders via `GET /api/swap/history`
9. Empty history → appropriate empty state

### API endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/swap/rate` | Get conversion quote |
| POST | `/api/swap/execute` | Execute the swap |
| GET | `/api/swap/history` | Swap history |

### What could go wrong
- Invalid amount → server rejection
- Rate expiry → stale quote
- Insufficient balance → server-side error
- Network error → no feedback beyond console

### DB required? **YES**

---

## 7. Traders (Copy Trading) — `app/dashboard/traders/page.tsx`

### What it does
- Lists active traders from `/api/admin/traders` (filtered by `active === 1`)
- Shows MyCopies (traders the user already follows)
- Click "Follow Strategy" → CopyModal opens
- CopyModal submits to `/api/traders/copy`
- Displays win rate, 30D return, risk level per trader

### Step-by-step test
1. Navigate to `/dashboard/traders`
2. Verify loading skeleton (4 cards) appears
3. Once loaded, verify only active traders appear
4. For each trader card: name, specialty, bio, win rate, 30D return, risk level render
5. If already copying → "STRATEGY ACTIVE" badge shown, button disabled
6. Click "Follow Strategy ($500 Min)" on a non-copied trader → CopyModal opens
7. In CopyModal, confirm copy → `POST /api/traders/copy` fires
8. On success → toast: "Successfully connected strategy!", MyCopies refreshes
9. Verify `/api/traders/my` is called to load current copies
10. Error state: "Failed to load traders" with Retry button

### API endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/admin/traders` | List all traders (public) |
| GET | `/api/traders/my` | User's current copies |
| POST | `/api/traders/copy` | Follow a trader |

### What could go wrong
- No active traders → empty grid
- Copy requires minimum balance → server-side rejection
- Rate/risk display uses bps → verify conversion (bps / 100)

### DB required? **YES**

---

## 8. Referrals — `app/dashboard/referrals/page.tsx`

### What it does
- Shows referral summary: available bonus, referral count, reward rate
- Create/refresh referral link
- Date-range analytics chart (SVG polyline)
- Withdraw referral bonus (min $500)
- Withdrawal form with bank/crypto destination

### Step-by-step test
1. Navigate to `/dashboard/referrals`
2. Verify summary cards: Available Bonus ($), Referrals count, Reward Rate (10%)
3. Click "Create link" → `POST /api/referrals/link` fires → link displays
4. Click "Refresh link" → new link generated
5. Set date range (From/To) → `GET /api/referrals/analytics` fires with query params
6. If data exists → SVG chart renders with earnings over time
7. If no data → "No persisted referral activity" empty state
8. Withdrawal section: check if balanceCents >= $500 → "Eligible" badge
9. If below $500 → "Locked below $500" badge, form disabled
10. Fill withdrawal form → `POST /api/referrals/withdrawals` fires
11. Success: "Withdrawal request submitted for admin review."

### API endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/referrals/summary` | Referral summary |
| GET | `/api/referrals/analytics` | Date-range analytics |
| POST | `/api/referrals/link` | Create/refresh link |
| POST | `/api/referrals/withdrawals` | Request payout |

### What could go wrong
- 401 → "Sign in to view your live referral account"
- Invalid date range → 400 error: "Choose a valid date range"
- Balance below $500 → form disabled but still visible
- Withdrawal request needs admin approval → not instant

### DB required? **YES**

---

## 9. KYC — `app/dashboard/kyc/page.tsx`

### What it does
- Loads existing KYC application status
- Upload two documents (Government ID + Proof of Address)
- Each file uploads via `/api/uploads` with purpose `kyc`
- Submits paths joined by `|` to `POST /api/kyc`

### Step-by-step test
1. Navigate to `/dashboard/kyc`
2. Verify status badge shows current status (NOT SUBMITTED / PENDING / APPROVED)
3. If approved → shield icon + "Identity verified" message, no form
4. If not approved → upload form visible
5. Select Government ID file (JPEG/PNG/WebP)
6. Select Proof of Address file
7. Click "Submit KYC Documents"
8. Verify two sequential upload calls to `/api/uploads` (purpose: `kyc`)
9. Verify `POST /api/kyc` fires with `{ documentPath: "path1|path2" }`
10. Success: "Documents submitted for review."
11. Try submitting without both files → submit button disabled

### API endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/kyc` | Current application status |
| POST | `/api/uploads` | Upload document (×2) |
| POST | `/api/kyc` | Submit application |

### What could go wrong
- File too large → upload fails
- One upload succeeds, second fails → partial state
- Already approved → form hidden, only status shown
- Admin rejection → status updates to "rejected"

### DB required? **YES**

---

## 10. Settings — `app/dashboard/settings/page.tsx`

### What it does
- **Profile section:** Edit name, upload avatar → `PATCH /api/profile`
- **2FA section:** Configure TOTP (QR code + manual key), enable/disable 2FA → `PATCH /api/profile`
- **Payout details:** Save crypto wallet (address, network) and bank details → `PATCH /api/profile`
- **Notification preferences:** Toggle daily ROI reports, strategy alerts → `PATCH /api/profile`

### Step-by-step test
1. Navigate to `/dashboard/settings`
2. Verify profile loads: name, email, plan badge, avatar
3. Change display name → click "Save Profile"
4. Upload avatar image → `POST /api/uploads` (purpose: `avatar`) fires
5. Verify `PATCH /api/profile` fires with `{ name, image }`
6. **2FA Configure:** Click "Configure 2FA" → QR code modal opens
7. Scan QR with authenticator app → enter 6-digit code
8. Click "Verify & Enable" → `PATCH /api/profile` with `{ twoFactorEnabled: true, twoFactorSecret }`
9. Verify "Two-Factor Authentication" status changes to "Enabled"
10. **2FA Disable:** Click "Disable 2FA" → enter TOTP code
11. Click "Confirm Disable" → `PATCH /api/profile` with `{ twoFactorEnabled: false, twoFactorSecret: '' }`
12. **Payout Details:** Enter crypto address, network, bank details
13. Click "Save Payout Details" → `PATCH /api/profile` with payoutDetails object
14. **Notifications:** Toggle checkboxes → click "Save Preferences"
15. Verify `PATCH /api/profile` with `{ notificationPrefs }` fires

### API endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/investor-profile` | Profile data |
| GET | `/api/profile` | Settings (payout, 2FA, notifications) |
| POST | `/api/uploads` | Avatar upload |
| PATCH | `/api/profile` | Save profile, 2FA, payout, notifications |

### What could go wrong
- Avatar upload fails → profile save still works (without image)
- Invalid TOTP code → "Invalid verification code"
- 2FA enable without scanning QR → invalid code error
- Payout details saved but withdrawal still fails (if format is wrong)

### DB required? **YES**

---

## 11. Onboarding Modal — `components/OnboardingModal.tsx`

### What it does
- 5-step investor questionnaire (experience, assets, goals, deposit tier, risk)
- Persists answers via `PATCH /api/profile` with `{ onboardingAnswers, onboardingCompleted: true }`
- Triggered when `profile.onboardingCompleted === false`
- Client-only UI state (answers stored in React state)

### Step-by-step test
1. Log in as a user with `onboardingCompleted: false`
2. Modal should auto-open over the dashboard
3. Step 1: Select experience level → click "Continue"
4. Step 2: Select asset interest → click "Continue"
5. Step 3: Select financial objective → click "Continue"
4. Step 4: Select target deposit tier → click "Continue"
5. Step 5: Select risk tolerance → click "Complete Onboarding"
6. Verify `PATCH /api/profile` fires with all 5 answers + `onboardingCompleted: true`
7. Modal closes after save
8. Refresh page → modal should NOT appear again
9. Click "Back" on steps 2-5 → returns to previous step
10. Default answers are pre-selected on each step

### API endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| PATCH | `/api/profile` | Save onboarding answers |

### What could go wrong
- Network error on final save → modal closes anyway (answers lost)
- User closes browser mid-onboarding → answers not saved
- No server validation of answers → any string accepted

### DB required? **YES** (to persist). UI works without DB but save fails silently.

---

## 12. Notification Center — `components/NotificationCenter.tsx`

### What it does
- Bell icon with unread count badge
- Opens dropdown with 3 tabs: All, Personal, Updates
- Polls `/api/notifications` every 30 seconds
- Marks individual or all notifications as read via `PATCH /api/notifications`
- Categorizes by type: personal (deposit, withdrawal, kyc, roi, referral, security, plan, swap) vs announcements (admin_broadcast, platform, system, etc.)

### Step-by-step test
1. Click bell icon → dropdown opens
2. Verify unread count badge matches API response
3. Click "All" tab → all notifications shown
4. Click "Personal" tab → only personal types shown
5. Click "Updates" tab → only announcement types shown
6. Click a notification → `PATCH /api/notifications` with `{ id }` → marks as read
7. Click "Mark all read" → `PATCH /api/notifications` with `{ all: true }`
8. Wait 30 seconds → auto-refresh fires
9. Unread count updates in badge
10. Empty state per tab: "No personal notifications", "No announcements yet", "No notifications yet"

### API endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/notifications` | Fetch notifications |
| PATCH | `/api/notifications` | Mark as read |

### What could go wrong
- 30s polling continues when component unmounted (if no cleanup) → memory leak
- Very many notifications → no pagination, performance concern
- Badge shows "9+" for >9 unread

### DB required? **YES**

---

## 13. Admin Dashboard — `app/admin/page.tsx`

### What it does
- Fetches investors, deposits, withdrawals, KYC counts in parallel
- Shows AUM (Assets Under Management), pending counts
- Quick navigation cards to Performance and Deposits
- Quick Message Composer: send announcement to all or by plan

### Step-by-step test
1. Log in as admin
2. Navigate to `/admin`
3. Verify loading skeleton appears then data loads
4. AUM = sum of all investor `balanceCents`
5. Pending Deposits count = total deposits (all statuses? or pending only?)
6. Pending Withdrawals count = withdrawals with `status === 'pending'`
7. KYC Queue count = total KYC rows
8. Click "Publish Daily ROI Percentage" card → navigates to `/admin/performance`
9. Click "Review Deposit Proofs" → navigates to `/admin/deposits`
10. **Quick Message:** Enter title + body, select audience (All / By Plan)
11. Click "Send to All" → `POST /api/admin/notifications` fires
12. Success: "Sent to N investors"
13. Empty title/body → send button disabled

### API endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/admin/investors` | All investors |
| GET | `/api/admin/deposits` | All deposits |
| GET | `/api/admin/withdrawals` | All withdrawals |
| GET | `/api/admin/kyc` | All KYC applications |
| POST | `/api/admin/notifications` | Send announcement |

### What could go wrong
- Non-admin user → 401/403 on all API calls
- AUM calculation includes all balances (no status filter)
- Message composer has no confirmation dialog

### DB required? **YES**

---

## 14. Admin Deposits — `app/admin/deposits/page.tsx`

### What it does
- Lists all deposit requests with proof images
- Admin can approve or reject each deposit
- Configure deposit instructions (bank/crypto) with label, details, QR path

### Step-by-step test
1. Navigate to `/admin/deposits`
2. Verify pending deposits list loads
3. Each deposit shows: investor ID, amount, method, proof image, status
4. Click "Approve" → `PATCH /api/admin/deposits` with `{ depositId, action: 'approve' }`
5. Deposit status changes to "approved"
6. Click "Reject" → same endpoint with `action: 'reject'`
7. Deposit status changes to "rejected"
8. **Deposit Instructions:** Edit bank details (label, details, QR path)
9. Click "Save bank instructions" → `PUT /api/admin/deposit-instructions`
10. Edit crypto details → save → `PUT /api/admin/deposit-instructions`

### API endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/admin/deposits` | All deposits |
| PATCH | `/api/admin/deposits` | Approve/reject |
| GET | `/api/admin/deposit-instructions` | Current instructions |
| PUT | `/api/admin/deposit-instructions` | Save instructions |

### What could go wrong
- Approving a deposit credits the investor balance (server-side)
- Proof image URL might be invalid or expired
- No confirmation dialog before approve/reject

### DB required? **YES**

---

## 15. Admin Withdrawals — `app/admin/withdrawals/page.tsx`

### What it does
- Lists all withdrawal requests
- Admin can approve or reject each
- Shows investor ID, amount, destination type, destination, status

### Step-by-step test
1. Navigate to `/admin/withdrawals`
2. Verify withdrawal list loads (loading skeleton first)
3. Each withdrawal shows: investor ID, amount, destination, type, date
4. Pending withdrawals show "Approve" and "Reject" buttons
5. Click "Approve" → `PATCH /api/admin/withdrawals` with `{ withdrawalId, action: 'approve' }`
6. Click "Reject" → same with `action: 'reject'`
7. Non-pending withdrawals show status badge only
8. Empty state: "No withdrawals found."

### API endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/admin/withdrawals` | All withdrawals |
| PATCH | `/api/admin/withdrawals` | Approve/reject |

### What could go wrong
- Approving debits investor balance (server-side)
- No confirmation dialog
- Investor ID shown as raw UUID (not name)

### DB required? **YES**

---

## 16. Admin KYC — `app/admin/kyc/page.tsx`

### What it does
- Lists all KYC applications
- Admin can approve or decline
- Shows investor ID, document path, status, date

### Step-by-step test
1. Navigate to `/admin/kyc`
2. Verify KYC queue loads
3. Each application shows: investor ID, document path, created date
4. Click "Approve" → `PATCH /api/admin/kyc` with `{ applicationId, action: 'approve' }`
5. Click "Decline" → same with `action: 'decline'`
6. Success: "KYC approved and notifications sent."
7. Empty state: "No pending KYC applications."

### API endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/admin/kyc` | All KYC applications |
| PATCH | `/api/admin/kyc` | Approve/decline |

### What could go wrong
- Document path is a raw storage path (not rendered as image in this view)
- Approval updates investor's `kycStatus` to `approved`
- Notification sent on decision

### DB required? **YES**

---

## 17. Admin Performance (ROI Publishing) — `app/admin/performance/page.tsx`

### What it does
- Admin selects an investor from dropdown
- Shows investor info: name, plan, balance, daily ROI %
- One-click publish: credits fixed daily ROI based on plan
- Plan ROI: Starter=15%, Growth=25%, Elite=35%

### Step-by-step test
1. Navigate to `/admin/performance`
2. Verify investor dropdown loads (shows name, plan, balance)
3. Select an investor → info card appears
4. If investor has a plan → ROI percentage and daily profit amount displayed
5. If no plan → "This investor has no active plan" error state
6. Click "Publish N% ROI Now" → `POST /api/admin/roi` fires
7. Payload: `{ investorId, percentageBps, marketNote }`
8. Success: "Published N% ROI for [name]. $X.XX credited."
9. Investor data refreshes after publish
10. Quick Reference table shows all plan ROI rates

### API endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/admin/investors` | Investor list |
| POST | `/api/admin/roi` | Publish ROI |

### What could go wrong
- Publishing same ROI twice → double credit (no idempotency check visible)
- `percentageBps` = plan daily % × 100 (e.g., 15% → 1500 bps)
- No confirmation dialog before publishing
- Investor without plan → blocked in UI

### DB required? **YES**

---

## 18. Admin Plans — `app/admin/plans/page.tsx`

### What it does
- CRUD for investment plans (name, min/max deposit, ROI range, active flag)
- Create new plan, edit existing, toggle active/inactive

### Step-by-step test
1. Navigate to `/admin/plans`
2. Verify plan list loads
3. Each plan shows: name, active/inactive badge, min/max deposit, ROI range
4. Click "Create New Plan" → form expands
5. Fill form: name, min deposit (cents), max deposit (cents), min ROI (bps), max ROI (bps), active
6. Click "Create Plan" → `POST /api/admin/plans` fires
7. Success: "Plan created." → list refreshes
8. Click "Edit" on existing plan → form expands with current values
9. Click "Save Changes" → `PATCH /api/admin/plans` fires
10. Success: "Plan updated."
11. Click "Cancel" → form collapses
12. Toggle active checkbox → saves on next save

### API endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/admin/plans` | List plans |
| POST | `/api/admin/plans` | Create plan |
| PATCH | `/api/admin/plans` | Update plan |

### What could go wrong
- Minimum deposit in cents (100000 = $1000) → confusing UI
- ROI in bps (100 = 1%) → format helper exists
- No delete operation → only toggle active
- Unlimited max deposit → null value

### DB required? **YES**

---

## 19. Admin Traders — `app/admin/traders/page.tsx`

### What it does
- Create trader profiles with image upload
- Form: name, specialty, win rate, 30D return, risk level, bio, image
- Lists existing traders

### Step-by-step test
1. Navigate to `/admin/traders`
2. Verify existing traders list loads
3. Fill form: name, image, specialty (dropdown), win rate, return rate, risk level, bio
4. Click submit → `POST /api/uploads` (purpose: `trader`) fires for image
5. Then `POST /api/admin/traders` fires with all fields
6. Success: "Trader profile created." → list refreshes
7. Verify trader appears in list with correct stats
8. Stats stored as bps: winRate × 100, returnRate × 100

### API endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/admin/traders` | List traders |
| POST | `/api/uploads` | Upload trader image |
| POST | `/api/admin/traders` | Create trader |

### What could go wrong
- Image upload fails → trader creation blocked
- Win rate entered as percentage (92.5) → stored as 9250 bps
- No edit/delete for existing traders (only create)

### DB required? **YES**

---

## 20. Admin Notifications — `app/admin/notifications/page.tsx`

### What it does
- Advanced notification composer with 3 audience modes: All, Selected Users, Plan-Targeted
- User search with checkboxes for personal messages
- Plan selection for plan-targeted messages
- Optional email delivery toggle
- Live preview sidebar with recipient count

### Step-by-step test
1. Navigate to `/admin/notifications`
2. Verify investors and plans load
3. **All Investors mode:** Select "All Investors" → recipient count = total investors
4. **Personal Message mode:** Select "Personal Message"
5. Type in search box → investors filter by name/email
6. Check/uncheck individual investors → recipient count updates
7. **Plan-Targeted mode:** Select "Plan-Targeted"
8. Click plan buttons (Starter/Growth/Elite) → recipient count updates
9. Enter title and body
10. Toggle "Also send via email" checkbox
11. Click "Send to N recipient(s)" → `POST /api/admin/notifications` fires
12. Payload: `{ title, body, audience, plans?, userIds? }`
13. Success: "Notification delivered to N recipient(s)."
14. Preview sidebar shows: recipient count, title, body, channels, audience

### API endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/admin/investors` | Investor list for search |
| GET | `/api/plans` | Plan list |
| POST | `/api/admin/notifications` | Send notification |

### What could go wrong
- Empty title/body → send button disabled
- Zero recipients → send button disabled
- Email delivery requires external email service (may not be configured)
- Plan fallback if API fails: defaults to Starter/Growth/Elite

### DB required? **YES**

---

## 21. Admin Referrals — `app/admin/referrals/page.tsx`

### What it does
- Lists pending referral payout requests
- Admin can approve or reject with a review note
- Shows amount, destination type, destination, status

### Step-by-step test
1. Navigate to `/admin/referrals`
2. Verify payout queue loads
3. Each row shows: amount, destination type, investor ID, status, destination
4. Enter a review note (optional)
5. Click "Approve" → `PATCH /api/admin/referrals/withdrawals` fires
6. Payload: `{ withdrawalId, action: 'approve', reviewNote }`
7. Click "Reject" → same with `action: 'reject'`
8. Success: "Referral withdrawal approved/rejected."
9. Empty state: "No referral payout requests are currently recorded."

### API endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/admin/referrals/withdrawals` | Payout queue |
| PATCH | `/api/admin/referrals/withdrawals` | Approve/reject |

### What could go wrong
- Review note is optional → can approve without context
- No confirmation dialog
- Investor ID shown as raw UUID

### DB required? **YES**

---

## 22. Admin Deposit Instructions (via Admin Deposits page)

> Handled in section 14. The admin deposits page includes the deposit instructions editor.

---

## 23. Admin Swap Config — `app/admin/swap-config` (route exists, page not found)

The API route `/api/admin/swap-config` exists but no admin page was found at `app/admin/swap-config/page.tsx`. Configuration may be done via API directly or through another mechanism.

---

## 24. Admin Settings, Support, Investors, Login

These pages exist but were not in the original request. Key ones:
- `app/admin/settings/page.tsx` — Admin account settings
- `app/admin/support/page.tsx` — Support ticket management
- `app/admin/investors/page.tsx` — Investor management
- `app/admin/login/page.tsx` — Admin login page

---

## Cross-Cutting Concerns

### Authentication Flow
1. All API routes require a valid Supabase JWT
2. Missing/expired token → 401 → redirect to `/login`
3. Admin routes likely check `role === 'admin'` server-side
4. No middleware-level auth guard visible in client code

### Error Handling Pattern
- Client shows `LoadingSkeleton` during fetch
- On API error → `ErrorState` with retry button (dashboard) or silent failure (other pages)
- Error messages are user-friendly strings, not raw errors

### Responsive Design
- All pages use `flex-col md:flex-row` layout
- Mobile bottom bar via `pb-24 md:pb-8`
- Sidebar hidden on mobile (`hidden md:flex`)

### Data Consistency
- No optimistic updates (except some local state changes)
- After mutations, pages re-fetch via `load()` calls
- No WebSocket/real-time subscriptions visible

---

## Test Execution Checklist

```
[ ] 1.  Dashboard - Login and verify all data loads
[ ] 2.  Dashboard - Balance mask/unmask toggle
[ ] 3.  Dashboard - Upgrade plan modal
[ ] 4.  Dashboard - KYC banner when not verified
[ ] 5.  Dashboard - Welcome tour (first-time user)
[ ] 6.  Deposit - Toggle crypto/bank instructions
[ ] 7.  Deposit - Copy deposit details
[ ] 8.  Deposit - Submit deposit with proof
[ ] 9.  Deposit - Submit without file → error
[ ] 10. Withdraw - Load profile and validate payout details
[ ] 11. Withdraw - 2FA validation (enable 2FA first)
[ ] 12. Withdraw - Below-minimum warning
[ ] 13. Withdraw - Close account mode
[ ] 14. Withdraw - Missing payout details warning
[ ] 15. History - Load and filter transactions
[ ] 16. History - Search functionality
[ ] 17. History - Export button
[ ] 18. Portfolio - Load holdings and prices
[ ] 19. Portfolio - Switch asset tabs (TradingView)
[ ] 20. Portfolio - Empty holdings state
[ ] 21. Portfolio - CoinGecko price fallback
[ ] 22. Swap - Get quote and preview
[ ] 23. Swap - Execute swap
[ ] 24. Swap - View swap history
[ ] 25. Traders - Load active traders
[ ] 26. Traders - Follow strategy (CopyModal)
[ ] 27. Traders - Already following badge
[ ] 28. Referrals - Create referral link
[ ] 29. Referrals - Analytics chart
[ ] 30. Referrals - Withdrawal request (min $500)
[ ] 31. KYC - Upload two documents
[ ] 32. KYC - Submit and verify status
[ ] 33. Settings - Edit name and avatar
[ ] 34. Settings - Enable 2FA (full flow)
[ ] 35. Settings - Disable 2FA
[ ] 36. Settings - Save payout details
[ ] 37. Settings - Save notification preferences
[ ] 38. Onboarding - Complete 5-step questionnaire
[ ] 39. Notifications - Open/close, tabs, mark read
[ ] 40. Notifications - Auto-refresh (30s)
[ ] 41. Admin Dashboard - Verify counters
[ ] 42. Admin Dashboard - Send announcement
[ ] 43. Admin Deposits - Approve/reject deposit
[ ] 44. Admin Deposits - Edit deposit instructions
[ ] 45. Admin Withdrawals - Approve/reject withdrawal
[ ] 46. Admin KYC - Approve/decline application
[ ] 47. Admin Performance - Select investor and publish ROI
[ ] 48. Admin Plans - Create new plan
[ ] 49. Admin Plans - Edit existing plan
[ ] 50. Admin Traders - Create trader with image
[ ] 51. Admin Notifications - Send to all investors
[ ] 52. Admin Notifications - Send to selected users
[ ] 53. Admin Notifications - Send to plan targets
[ ] 54. Admin Referrals - Approve/reject payout
[ ] 55. Responsive - Mobile layout (all pages)
[ ] 56. Error states - API failure handling
[ ] 57. Auth - Unauthenticated access → redirect
[ ] 58. Auth - Admin routes for non-admin → rejection
```

---

## Notes

- **No swap-config or deposit-instructions admin pages exist** as standalone pages; deposit instructions are managed within the admin deposits page.
- **ROI page at `app/admin/roi/`** does not exist; ROI publishing is on `app/admin/performance/`.
- The codebase uses `force-dynamic` on dashboard and admin pages to prevent caching.
- All monetary values are stored in **cents** (integers) and displayed as dollars.
- ROI rates use **basis points** (bps): 1% = 100 bps.
