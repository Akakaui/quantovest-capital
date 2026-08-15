# Quantovest Capital — Master Build Plan

**Version:** 2.0 (Refined Specification)  
**Author:** AI Engineering & Design Team  
**Design Reference:** `design-system.md`  

---

## 1. Executive Summary & Architecture Overview

Quantovest Capital is an institutional-grade copytrading platform for **FX, Crypto, and Stocks**. Investors pick a plan ($500, $5,000, or $15,000), complete onboarding, deposit funds, and copy top-performing master traders while Quantovest automatically manages multi-asset allocation.

### Tech Stack & Libraries
- **Framework:** Next.js (App Router, TypeScript)
- **Styling:** Tailwind CSS + CSS Custom Properties from `design-system.md`
- **Icons:** `@iconify/react` with Solar Icons set (`solar:*`)
- **Motion & Animations:** Framer Motion (components/reveals) + GSAP & ScrollTrigger (homepage 3D scroll-driven phone sequence) + Lenis (smooth scrolling)
- **Charts:** Recharts + Custom SVG Signal Line animated path
- **State & Data Layer:** React Context / Zustand state store (`lib/store.ts`) pre-configured for Supabase, handling user sessions, KYC states, daily ROI % updates, master trader directory, deposits, and withdrawal queues.

---

## 2. Design System Tokens & Rules (`design-system.md`)

- **Dual-Mode Theme Control**:
  - **Light Mode (`data-theme="light"`)**: Public interior pages (*How It Works, About, Services, Plans, FAQ, Legal, Contact, Auth*).
  - **Dark Mode (`data-theme="dark"`, `#0A0D0C`)**: Investor Portal, Admin Panel, and Homepage Hero Band.
- **Brand Tokens**:
  - Accent Color: `--accent-signal` (`#22C55E` green).
  - Semantic Up / Down: `#22C55E` / `#CF202F` (text/icons only, never button backgrounds).
- **Typography Scale**:
  - Display & Headings: `Inter` at **font-weight 400** (calm, institutional feel).
  - Financial Data & Numbers: `JetBrains Mono` for all balances, ROI percentages, prices, and timestamps.
- **Radii & Geometry**:
  - CTA Buttons: `--radius-pill` (`100px`).
  - Cards & Mockups: `--radius-xl` (`24px`).
  - Avatars & Badges: `--radius-full` (`9999px`).

---

## 3. Detailed Page Map, Copy & Asset Plan

### 3.1 Public Marketing Site (Pre-Login)

#### Page 1: Homepage (`/`)
- **Hero Band (Dark Mode `#0A0D0C`)**:
  - *Headline*: "Your Capital. Their Expertise." (`display-mega`, Inter weight 400).
  - *Subheadline*: "Institutional copytrading across FX, Crypto, and Stock markets. Access top-tier strategy execution starting at $500."
  - *3D Scroll-Driven Phone Sequence*: Sticky viewport pin + GSAP ScrollTrigger scrubbing 3D phone rotation while screens crossfade (*Dashboard → Copy Traders → Plans → ROI Calculator*). Progress indicators track position.
  - *CTAs*: Primary Pill Button "Get Started" + Secondary Pill Button "Calculate ROI".
- **Live Market Ticker**: Continuous horizontal marquee showing FX pairs (EUR/USD, GBP/USD), Crypto (BTC/USD, ETH/USD), and Stocks (NVDA, AAPL, TSLA) with JetBrains Mono price feeds and green/red trend badges.
- **Stats Bar**: "Over $42M+ Managed AUM", "94.2% Trader Win Rate", "14,800+ Active Investors" (count-up numbers + Signal Line underlines).
- **How It Works Overview**: 4-step horizontal process cards with Solar outline icons.
- **Investment Plans Preview**: Tier cards ($500, $5,000, $15,000) with target ROI ranges.
- **Interactive ROI Calculator**: Slider for deposit amount ($500 – $50,000+), plan selector, and projected 6-month / 12-month return display.
- **Trust & Logo Bar**: Grayscale institutional partner logos + compliance risk disclaimers.

#### Page 2: How It Works (`/how-it-works`) (Light Mode)
- *Headline*: "Algorithmic Precision Meets Master Trader Insight"
- *Copy*: Comprehensive 4-step explanation:
  1. *Account & Plan Selection*: Choose your capital tier ($500 Starter, $5,000 Growth, $15,000 Elite).
  2. *Identity Verification*: Rapid 2-minute KYC onboarding for institutional compliance.
  3. *Fund & Copy*: Deposit funds via bank wire or crypto, then select master traders to copy.
  4. *Automated Allocation & Daily Returns*: Quantovest balances your exposure across FX, Crypto, and Stocks while daily performance updates directly to your dashboard.

#### Page 3: About Us (`/about`) (Light Mode)
- *Headline*: "Democratizing Institutional Asset Management"
- *Copy*: Our story, risk management framework, institutional liquidity partners, and transparency guarantee.

#### Page 4: Services (`/services`) (Light Mode)
- *Headline*: "Multi-Asset Copytrading Solutions"
- *Sections*:
  - **Foreign Exchange (FX)**: High-frequency currency pairing strategies, tight spread execution, major & minor pairs.
  - **Cryptocurrency Markets**: BTC/ETH trend following, DeFi yield arbitrage, 24/7 market coverage.
  - **Global Equities (Stocks)**: US tech & blue-chip stock momentum copytrading.

#### Page 5: Investment Plans (`/plans`) (Light Mode)
- *Headline*: "Transparent Plans Built for Every Investor Tier"
- **Starter Plan ($500 Min Deposit)**:
  - Target ROI: 8% – 12% monthly
  - Market Focus: FX & Top Crypto Assets
  - Fee Structure: 0% Management Fee, 15% Performance Fee
  - CTA: "Select Starter Plan"
- **Growth Plan ($5,000 Min Deposit)** *(Featured Tier)*:
  - Target ROI: 14% – 18% monthly
  - Market Focus: FX, Crypto & US Equities
  - Priority Execution & Dedicated Account Manager
  - CTA: "Select Growth Plan"
- **Elite Plan ($15,000 Min Deposit)**:
  - Target ROI: 20% – 28% monthly
  - Market Focus: Full Multi-Asset Access + Custom Risk Controls
  - VIP Concierge & Direct Master Trader Insights
  - CTA: "Select Elite Plan"
- **Full Embedded ROI Calculator**: Interactive slider with custom payout breakdowns.

#### Page 6: FAQ (`/faq`) (Light Mode)
- Categorized accordions:
  - *General*: How does copytrading work? Can I withdraw anytime?
  - *Security & Verification*: Why is KYC required? How are my funds protected?
  - *Deposits & Withdrawals*: What payment methods are supported? What is the withdrawal processing time?
  - *Traders & Returns*: How are master traders selected? How are daily returns calculated?

#### Pages 7–10: Legal, Contact & Live Chat (`/legal/*`, `/contact`) (Light Mode)
- Privacy Policy, Terms of Service, Risk Disclosure, AML/KYC Policy, Contact Form.
- **Live Chat Widget Integration**: Embedded mobile-ready live chat support widget (e.g. Crisp / Tawk.to script loader or interactive float widget). Allows the site owner/admin to respond to investor live chats instantly from their mobile phone app.

#### Page 11: Auth (`/login`, `/signup`) (Light Mode & Dark Card)
- **Google Sign-In & Email Authentication**:
  - One-click **"Continue with Google"** button with official Google logo.
  - Standard Email / Password Sign Up & Sign In form.
  - Clean role selector toggle (**Investor Login** vs **Trading Firm Staff Admin Login**).

---

### 3.2 Investor Onboarding & Portal Architecture (Dark Mode `#0A0D0C`)

#### 1. Responsive Sidebar Navigation (Desktop, Tablet & Mobile)
- Sleek dark sidebar (`#12161A` background, `#202722` hairline border) styled for **Desktop, Tablet, and Mobile**:
  - Quantovest Capital logo & verified badge top.
  - Navigation links: Overview Dashboard, Copy Traders, Deposit, Withdraw, KYC Verification, Settings.
  - **Quick Sidebar Action Buttons**: Direct action buttons (**Deposit**, **Withdraw**, **Copy Trader**, **ROI Calculator**) embedded right inside the sidebar navigation for instant 1-click access across all portal screens.
  - Mobile bottom navigation bar matching the sidebar icons.

#### 2. Post-Login 5-Step Questionnaire Modal
Upon registration/login, investor completes a 5-step modal wizard before reaching full dashboard:
- **Step 1 — Experience**: "What is your trading experience?" (*Beginner / Intermediate / Pro*)
- **Step 2 — Asset Interest**: "Which markets interest you most?" (*FX / Crypto / Stocks / Multi-Asset*)
- **Step 3 — Capital Goal**: "What is your primary financial objective?" (*Capital Growth / Monthly Passive Income / High Yield*)
- **Step 4 — Target Deposit**: "How much capital do you plan to start with?" (*$500 Starter / $5,000 Growth / $15,000+ Elite*)
- **Step 5 — Risk Tolerance**: "Select your preferred risk appetite:" (*Conservative / Balanced / Aggressive*)

#### 3. Identity Verification (KYC) Pop-up System (Minimal 2-Document Requirement)
- **Required Documents (Strictly Minimal)**:
  1. **Government ID / Passport / Driver's License**
  2. **Proof of Address** (Utility Bill / Bank Statement)
- **State Machine**: User object tracks `kycStatus`: `'unverified' | 'pending' | 'approved' | 'rejected'`.
- **Pop-up Rule**:
  - If `kycStatus !== 'approved'`, a dismissable modal overlay pops up on portal load:
    - *"Identity Verification Required: Please upload your ID Document and Proof of Address to unlock full deposit & copytrading capabilities."*
    - Button: **"Complete Verification Now"** → opens minimal 2-document uploader (`/dashboard/kyc`).
  - If `kycStatus === 'approved'`, no pop-up is shown; user has unhindered access.

#### 4. Simplified Unified Investor Dashboard (`/dashboard`)
- **Header**: Avatar + "Hello, [Investor Name]" + Notification Bell + KYC Badge (*Pending / Verified*).
- **Physical Balance Card**:
  - Dark surface with metallic chip graphic.
  - Masked balance toggle (`••••••` vs `$12,450.80` in JetBrains Mono).
  - Daily & Total ROI badge (`+14.2%` in green text).
- **Interactive Performance & Calculator Chart**:
  - Recharts line graph with animated SVG "Signal Line" drawing daily portfolio value.
  - **Dynamic Admin Update Animations**: When the admin posts a positive (e.g. `+1.35%`) or negative (e.g. `-0.20%`) daily ROI entry, the graph line dynamically animates up (green) or down (red) to reflect the new daily profit/loss curve!
  - Includes interactive **ROI Calculator Overlay** displaying projected growth curves based on deposit amount and selected plan tier.
- **Live Trade Activity & Payout Log**:
  - Color-coded daily percentage entries posted by Admin.

#### 5. Copytrader Hub (`/dashboard/traders`)
- **Trader Profiles** (Created & Managed by Admin):
  - Avatar, Trader Name (e.g. *Alexei Vance — FX Specialist*), Win Rate (e.g. *91.4%*), Risk Score (*2/5*), Total Followers, 30-Day Return (*+24.8%*).
- **"Copy Strategy" Action & Funding Check**:
  - When investor clicks **"Copy Trader"**:
    - **Check Balance**: If account balance is `$0.00` / unfunded:
      - **Modal Alert**: *"Account Funding Required: You need a minimum balance of $500 to copy this master trader."*
      - Button: **"Deposit Funds Now"** → redirects to Deposit page.
    - If account balance is `≥ $500`:
      - Toast notification: *"Successfully copying [Trader Name]! Daily trades will reflect on your dashboard."*

#### 6. Deposit & Withdrawal Flows with Payment Proof Upload (`/dashboard/deposit`, `/dashboard/withdraw`)
- **Deposit Flow**:
  1. Select payment method (Bank Wire Transfer, BTC, ETH, USDT-TRC20).
  2. Display copyable wallet address / bank details + QR code.
  3. Enter deposit amount + **Upload Payment Screenshot Proof**.
  4. Click **"Confirm Payment Deposited"** → status updates to `Pending Admin Approval`.
- **Withdrawal Flow**:
  1. Enter amount, destination bank/wallet address.
  2. Click **"Submit Withdrawal Request"** → status updates to `Pending Admin Approval`.

---

### 3.3 Admin Panel Architecture (Dark Mode `#0A0D0C`)

Accessible via `/admin` or Staff Login:

1. **Admin Dashboard (`/admin`)**:
   - Total Platform AUM ($42.8M), Total Active Investors, Pending Deposits Queue, Pending KYC Requests, Pending Withdrawals Queue.
2. **Daily ROI Percentage Entry (`/admin/performance`)**:
   - Simple, powerful form to enter today's performance percentage (e.g. `+1.25%` or `-0.15%`).
   - Clicking **"Publish Daily ROI"** updates all investor portfolio balances, appends a daily log item, and updates investor dashboard chart animations!
3. **Deposit Approval Queue (`/admin/deposits`)**:
   - Table of pending investor deposit requests.
   - Inspect investor payment screenshot proof, deposited amount, and payment method.
   - Admin clicks **"Approve Deposit"** ➔ Instantly credits the investor's portfolio balance and notifies the investor!
4. **Withdrawal Approval Queue (`/admin/withdrawals`)**:
   - Table of pending withdrawal requests with payout bank/wallet details.
   - Admin clicks **"Approve & Process Withdrawal"** ➔ Deducts amount from investor balance and marks status as `Completed`.
5. **KYC Review Queue (`/admin/kyc`)**:
   - Inspect 2-document uploads (ID + Proof of Address) and click **"Approve"** (removes portal popup) or **"Reject"**.
6. **Master Trader Profile Manager (`/admin/traders`)**:
   - Create, edit, or delete master trader profiles and stats.

---

## 4. Implementation Steps & Milestones

1. **Phase 1: Project Setup & Design Tokens**: Initialize Next.js project with Tailwind CSS, `@iconify/react`, fonts (Inter, JetBrains Mono), and CSS custom properties.
2. **Phase 2: Global State Store (`lib/store.ts`)**: Implement mock database state storing investors, admin actions, daily ROI %, master trader list, KYC status, deposits, and withdrawal queue.
3. **Phase 3: Public Marketing Pages & 3D Phone Hero**: Build Homepage with GSAP 3D phone rotation sequence, Plans page ($500 / $5,000 / $15,000), ROI Calculator, and interior pages.
4. **Phase 4: Auth, Onboarding & KYC Modal**: Build Auth pages, 5-step post-login questionnaire modal, and identity verification prompt logic.
5. **Phase 5: Investor Dashboard & Copytrader Hub**: Build unified dashboard balance card, performance chart, trader cards with funding check modals, deposit/withdrawal forms.
6. **Phase 6: Admin Panel**: Build daily ROI % entry form, trader profile manager, KYC approval queue, and withdrawal queue.
7. **Phase 7: End-to-End Verification**: Run full end-to-end user & admin flow test.
