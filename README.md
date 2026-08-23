# Quantovest Capital

**"Your Capital. Their Expertise."**

A copytrading and investment platform for FX, Crypto, and Stocks. Investors choose a plan, deposit funds, and an experienced trader executes on their behalf. Investors track performance, holdings, and transactions through a live dashboard.

---

## How the App Works

### The Two Sides

The platform has two user roles: **Investor** and **Admin** (staff). They interact through a shared database — the admin enters data, the investor sees it.

```
┌─────────────────────────────────────────────────────────┐
│                    ADMIN (Staff)                         │
│                                                         │
│  1. Approves deposits    →  Investor balance updates    │
│  2. Publishes daily ROI  →  Investor chart moves        │
│  3. Approves KYC         →  Investor gets verified      │
│  4. Approves withdrawals →  Investor gets paid          │
│  5. Creates traders      →  Investors can copy them     │
│  6. Sends broadcasts     →  Investors get notified      │
└─────────────────────────────────────────────────────────┘
                          │
                    writes to DB
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   INVESTOR                               │
│                                                         │
│  1. Signs up             →  Gets a dashboard             │
│  2. Completes KYC        →  Uploads ID + proof of addr  │
│  3. Submits deposit      →  Waits for admin approval    │
│  4. Gets approved        →  Balance appears, plan active │
│  5. Copies a trader      →  Trades reflect on dashboard │
│  6. Sees daily ROI       →  Balance grows/shrinks       │
│  7. Requests withdrawal  →  Waits for admin approval    │
└─────────────────────────────────────────────────────────┘
```

### Fixed Daily ROI Per Plan

| Plan | Min Deposit | Daily ROI | Monthly (Compounded) | $1,500 Example |
|---|---|---|---|---|
| **Starter** | $1,500 | **15%** | ~1,839% | $1,500 → $225/day |
| **Growth** | $7,500 | **25%** | ~5,682% | $7,500 → $1,875/day |
| **Elite** | $45,000 | **35%** | ~14,554% | $45,000 → $15,750/day |

Admin taps one button per investor — the fixed rate is applied automatically.

### The Full User Flow

#### Investor Journey
1. **Signup** → `/signup` → creates Supabase Auth account + DB user row
2. **Onboarding** → 5-step modal (experience, interests, goals, deposit target, risk tolerance)
3. **KYC** → upload government ID + proof of address → admin reviews
4. **Deposit** → choose method (bank/crypto) → upload payment proof → admin approves → balance credited → plan auto-assigned
5. **Dashboard** → see portfolio balance, performance chart, daily ROI, activity log
6. **Copy Trader** → browse master traders → click "Copy" (requires min $1,500 balance)
7. **Upgrade Plan** → Starter ($1,500) → Growth ($7,500) → Elite ($45,000) — shows how much more you need
8. **Withdraw** → enter amount → 2FA verification if enabled → admin processes → money sent
9. **Close Account** → withdraw entire balance → admin approves → account closed
10. **Settings** → configure 2FA, payout details, notification preferences

#### Admin Journey
1. **Login** → `/admin/login` → Supabase Auth + role check (must be `admin` role in DB)
2. **Dashboard** → total AUM, pending deposits/withdrawals/KYC counts
3. **Deposits** → review proof screenshots → approve (credits balance + assigns plan) or reject
4. **Withdrawals** → review requests → approve (processes payout) or reject (reverses balance)
5. **KYC** → review uploaded documents → approve or decline with reason
6. **Performance** → select investor → tap "Publish 15%/25%/35% ROI" button → done
7. **Traders** → create/edit master trader profiles with images and stats
8. **Notifications** → send broadcasts (all users, specific users, or plan-targeted)
9. **Plans** → manage Starter/Growth/Elite tiers
10. **Investors** → view all investor accounts with details
11. **Settings** → platform configuration

### Key Features

| Feature | How It Works |
|---|---|
| **Single Active Plan** | Each investor has one plan at a time. Upgrade when balance meets the minimum. |
| **Fixed Daily ROI** | Starter=15%, Growth=25%, Elite=35% — one-click publish from admin |
| **Close Account** | Withdraw entire balance + close account in one action |
| **2FA (TOTP)** | Optional. If enabled, withdrawals require a 6-digit authenticator code |
| **Email System** | 12 templates (deposit, withdrawal, KYC, ROI, security, broadcast) via Resend |
| **Notifications** | In-app bell icon + optional email. Security/financial emails are always-on |
| **ROI Calculator** | Interactive simple-return projection with transparent assumptions and risk disclosure |
| **Mobile Responsive** | Bottom nav on mobile, sidebar on desktop, drawer menus |
| **Legal Pages** | Full Privacy Policy, Terms of Service, Risk Disclosure |

### Architecture

```
Frontend (Next.js App Router)
├── Public Pages (light mode) — Homepage, Plans, FAQ, Legal, etc.
├── Investor Portal (dark mode) — Dashboard, Deposit, Withdraw, Settings, etc.
└── Admin Panel (dark mode) — Dashboard, Deposits, KYC, ROI, Notifications, etc.

API Routes (server-side, 25+ endpoints)
├── /api/auth/* — Signup, session check
├── /api/deposits, /api/withdrawals, /api/kyc — Investor CRUD
├── /api/investor-profile, /api/investor/upgrade — Profile & plan management
├── /api/admin/* — Admin operations (all require admin role)
└── /api/uploads — File upload to Supabase Storage

Database (Supabase Postgres via Drizzle ORM)
├── users — id, email, name, role (investor/admin)
├── investorAccounts — balance, plan, ROI tracking
├── plans — Starter/Growth/Elite with fixed daily ROI
├── deposits, investorWithdrawals — financial records
├── kycApplications — verification documents
├── roiEntries — daily ROI log per investor
├── traderProfiles — master trader cards
├── notifications — in-app messages
├── portfolioLedger — transaction history
└── referral* — referral tracking tables

Auth (Supabase Auth)
├── Email/password signup + Google/Apple OAuth
├── Middleware checks session cookie on every request
├── Route protection (public/investor/admin)
└── Admin role verified from DB (not client-side)

Email (Resend integration)
├── 12 HTML templates (deposit, KYC, withdrawal, ROI, security, broadcast)
├── Falls back to console logging in dev mode
└── Security/financial emails always send (ignores preferences)
```

### Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS + CSS custom properties |
| Database | Supabase Postgres + Drizzle ORM |
| Auth | Supabase Auth (email/password, OAuth) |
| Charts | Recharts |
| Motion | Framer Motion + GSAP/ScrollTrigger |
| Icons | Solar Icons via Iconify |
| Email | Resend (free tier: 100/day) |
| Hosting | Vercel |

---

## Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project (free tier works)

### Setup

```bash
# Clone
git clone https://github.com/Akakaui/quantovest-capital.git
cd quantovest-capital

# Install
npm install

# Configure environment
cp .env.example .env.local
# Fill in your Supabase URL, anon key, and service role key

# Run database migrations
# Apply db/migrations-pg/*.sql in your Supabase SQL editor
# Then run db/seed-plans.sql to seed the 3 plans

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database
DATABASE_URL=postgresql://postgres:password@pooler.supabase.com:6543/postgres

# App
APP_PUBLIC_URL=http://localhost:3000

# Email (optional — logs to console without this)
RESEND_API_KEY=re_your_key
EMAIL_FROM=Quantovest Capital <notifications@yourdomain.com>
```

### Creating an Admin User

1. Sign up through the normal signup flow
2. In your Supabase SQL editor, run:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
   ```
3. Log in at `/admin/login`

---

## Documentation

All project handoff and QA documentation is consolidated in [`docs/quantovest/`](./docs/quantovest/), including the implementation handoff, sanitized environment patch, deployment notes, QA report, evidence log, UI direction, and calculator review asset.

---

## Project Structure

```
app/
├── page.tsx                    # Homepage with live crypto prices
├── layout.tsx                  # Root layout
├── globals.css                 # Design tokens + global styles
├── how-it-works/               # How It Works page
├── about/                      # About Us page
├── services/                   # Services page (FX/Crypto/Stocks)
├── plans/                      # Investment Plans page
├── faq/                        # FAQ page
├── contact/                    # Contact page
├── legal/
│   ├── privacy/                # Privacy Policy (10 sections)
│   ├── terms/                  # Terms of Service (13 sections)
│   └── risk/                   # Risk Disclosure (10 sections)
├── login/                      # Investor login
├── signup/                     # Investor signup
├── auth/callback/              # Supabase OAuth callback
├── dashboard/
│   ├── page.tsx                # Portfolio balance, chart, activity
│   ├── deposit/                # Deposit with proof upload
│   ├── withdraw/               # Withdraw + close account
│   ├── traders/                # Copy traders
│   ├── settings/               # 2FA, payout details, notifications
│   ├── kyc/                    # KYC document upload
│   └── referrals/              # Referral program
├── admin/
│   ├── page.tsx                # AUM, pending counts
│   ├── login/                  # Admin login
│   ├── deposits/               # Deposit approval queue
│   ├── withdrawals/            # Withdrawal approval queue
│   ├── kyc/                    # KYC review queue
│   ├── performance/            # One-click ROI publish
│   ├── traders/                # Trader management
│   ├── notifications/          # Messaging composer
│   ├── plans/                  # Plan management
│   ├── investors/              # Investor list
│   └── settings/               # Platform settings
└── api/                        # 25+ server-side API routes
    ├── auth/signup/            # User creation + DB row
    ├── auth/me/                # Current user + role
    ├── deposits/               # Investor deposit CRUD
    ├── withdrawals/            # Investor withdrawal CRUD
    ├── kyc/                    # Investor KYC CRUD
    ├── investor-profile/       # Aggregated profile data
    ├── investor/upgrade/       # Plan upgrade
    ├── notifications/          # Notification CRUD
    ├── uploads/                # File upload to Supabase Storage
    └── admin/                  # Admin-only operations
        ├── deposits/           #   Approve/reject deposits
        ├── withdrawals/        #   Approve/reject withdrawals
        ├── kyc/                #   Approve/reject KYC
        ├── roi/                #   Publish fixed daily ROI
        ├── traders/            #   Manage traders
        ├── notifications/      #   Send broadcasts
        ├── plans/              #   Manage plans
        ├── investors/          #   List investors
        └── deposit-instructions/ # Configure payment methods

components/
├── Navbar.tsx                  # Public site navigation
├── Footer.tsx                  # Public site footer
├── InvestorSidebar.tsx         # Investor sidebar + mobile bottom nav
├── AdminSidebar.tsx            # Admin sidebar + mobile bottom nav
├── NotificationCenter.tsx      # Bell icon + notification dropdown
├── OnboardingModal.tsx         # Post-signup wizard
├── KycModal.tsx                # KYC prompt overlay
├── FundingWarningModal.tsx     # Insufficient balance alert
├── RoiCalculatorModal.tsx      # ROI calculator with fixed rates
├── ThreeDPhoneHero.tsx         # Homepage hero
├── SignalLine.tsx              # SVG line animation
├── CountUpNumber.tsx           # Animated counter
└── AllocationRingChart.tsx     # Portfolio donut chart

lib/
├── auth-helpers.ts             # requireAuth() / requireAdmin()
├── db.ts                       # Drizzle database connection
├── email.ts                    # Email templates + Resend sender
├── notifications.ts            # Notification helpers
├── audit.ts                    # Audit logging
├── totp.ts                     # TOTP 2FA helpers
├── uploadRules.ts              # File upload validation
└── supabase/
    ├── client.ts               # Browser Supabase client
    ├── server.ts               # Server Supabase client
    └── identity.ts             # Get current user + role

db/
├── schema.ts                   # Drizzle table definitions (16 tables)
├── seed-plans.sql              # Seed 3 plans with fixed ROI
├── migrations-pg/              # PostgreSQL migrations
└── supabase/policies.sql       # Row-level security policies
```
