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

### The Full User Flow

#### Investor Journey
1. **Signup** → `/signup` → creates Supabase Auth account + DB user row
2. **Onboarding** → 5-step modal (experience, interests, goals, deposit target, risk tolerance)
3. **KYC** → upload government ID + proof of address → admin reviews
4. **Deposit** → choose method (bank/crypto) → upload payment proof → admin approves → balance credited → plan auto-assigned
5. **Dashboard** → see portfolio balance, performance chart, daily ROI, activity log
6. **Copy Trader** → browse master traders → click "Copy" (requires min $500 balance)
7. **Upgrade Plan** → Starter ($500) → Growth ($5,000) → Elite ($15,000) — shows how much more you need
8. **Withdraw** → enter amount → 2FA verification if enabled → admin processes → money sent
9. **Settings** → configure 2FA, payout details, notification preferences

#### Admin Journey
1. **Login** → `/admin/login` → Supabase Auth + role check (must be `admin` role in DB)
2. **Dashboard** → total AUM, pending deposits/withdrawals/KYC counts
3. **Deposits** → review proof screenshots → approve (credits balance + assigns plan) or reject
4. **Withdrawals** → review requests → approve (processes payout) or reject (reverses balance)
5. **KYC** → review uploaded documents → approve or decline with reason
6. **Performance** → select investor → enter daily ROI % (validates against plan range) → balance updates
7. **Traders** → create/edit master trader profiles with images and stats
8. **Notifications** → send broadcasts (all users, specific users, or plan-targeted)
9. **Plans** → manage Starter/Growth/Elite tiers (ROI ranges, minimums)
10. **Investors** → view all investor accounts with details
11. **Settings** → platform configuration

### Key Features

| Feature | How It Works |
|---|---|
| **Single Active Plan** | Each investor has one plan at a time. Upgrade when balance meets the minimum. |
| **Plan-Based ROI** | Admin enters a % — system validates it's within the investor's plan range (e.g., Starter: 8-12%/mo) |
| **Daily ROI** | Admin publishes daily performance → all investor balances update → charts animate |
| **2FA (TOTP)** | Optional. If enabled, withdrawals require a 6-digit authenticator code |
| **Close Account** | Investor can withdraw entire balance and close account (admin approval required) |
| **Deposit Instructions** | Admin configures bank details / crypto wallet addresses investors see when depositing |
| **Notifications** | In-app bell icon + optional email. Security/financial emails are always-on |
| **Mobile Responsive** | Bottom nav on mobile, sidebar on desktop, drawer menus |

### Architecture

```
Frontend (Next.js App Router)
├── Public Pages (light mode) — Homepage, Plans, FAQ, etc.
├── Investor Portal (dark mode) — Dashboard, Deposit, Withdraw, etc.
└── Admin Panel (dark mode) — Dashboard, Deposits, KYC, ROI, etc.

API Routes (server-side)
├── /api/auth/* — Signup, session check
├── /api/deposits, /api/withdrawals, /api/kyc — Investor CRUD
├── /api/admin/* — Admin operations (all require admin role)
└── /api/investor-profile — Aggregated investor data

Database (Supabase Postgres via Drizzle ORM)
├── users — id, email, name, role (investor/admin)
├── investorAccounts — balance, plan, ROI tracking
├── plans — Starter/Growth/Elite with ROI ranges
├── deposits, investorWithdrawals — financial records
├── kycApplications — verification documents
├── roiEntries — daily ROI log per investor
├── traderProfiles — master trader cards
├── notifications — in-app messages
└── referral* — referral tracking tables

Auth (Supabase Auth)
├── Email/password signup
├── Google/Apple OAuth
├── Middleware checks session cookie on every request
└── Admin role verified from DB (not client-side)
```

### Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS + CSS custom properties |
| Database | Supabase Postgres + Drizzle ORM |
| Auth | Supabase Auth (email/password, OAuth) |
| Charts | Recharts |
| Icons | Solar Icons via Iconify |
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
# (apply db/migrations-pg/*.sql in your Supabase SQL editor)

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database (via Supabase pooler)
DATABASE_URL=postgresql://postgres:password@host:5432/postgres

# App
APP_PUBLIC_URL=http://localhost:3000
```

### Creating an Admin User

1. Sign up through the normal signup flow
2. In your Supabase SQL editor, run:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
   ```
3. Log in at `/admin/login`

---

## Project Structure

```
app/
├── page.tsx                    # Homepage
├── layout.tsx                  # Root layout
├── globals.css                 # Design tokens + global styles
├── how-it-works/               # How It Works page
├── about/                      # About Us page
├── services/                   # Services page (FX/Crypto/Stocks)
├── plans/                      # Investment Plans page
├── faq/                        # FAQ page
├── contact/                    # Contact page
├── legal/                      # Privacy, Terms, Risk Disclosure
├── login/                      # Investor login
├── signup/                     # Investor signup
├── auth/callback/              # Supabase OAuth callback
├── dashboard/                  # Investor portal
│   ├── page.tsx                #   Dashboard overview
│   ├── deposit/                #   Deposit flow
│   ├── withdraw/               #   Withdrawal flow
│   ├── traders/                #   Copy traders
│   ├── settings/               #   Settings + 2FA
│   ├── kyc/                    #   KYC verification
│   └── referrals/              #   Referral program
├── admin/                      # Admin panel
│   ├── page.tsx                #   Admin dashboard
│   ├── login/                  #   Admin login
│   ├── deposits/               #   Deposit approval queue
│   ├── withdrawals/            #   Withdrawal approval queue
│   ├── kyc/                    #   KYC review queue
│   ├── performance/            #   ROI publishing
│   ├── traders/                #   Trader management
│   ├── notifications/          #   Messaging composer
│   ├── plans/                  #   Plan management
│   ├── investors/              #   Investor list
│   └── settings/               #   Platform settings
└── api/                        # Server-side API routes
    ├── auth/                   #   Signup, session check
    ├── deposits/               #   Investor deposit CRUD
    ├── withdrawals/            #   Investor withdrawal CRUD
    ├── kyc/                    #   Investor KYC CRUD
    ├── investor-profile/       #   Aggregated profile data
    ├── investor/upgrade/       #   Plan upgrade
    ├── notifications/          #   Notification CRUD
    ├── uploads/                #   File upload to Supabase Storage
    └── admin/                  #   Admin-only operations
        ├── deposits/           #     Approve/reject deposits
        ├── withdrawals/        #     Approve/reject withdrawals
        ├── kyc/                #     Approve/reject KYC
        ├── roi/                #     Publish daily ROI
        ├── traders/            #     Manage traders
        ├── notifications/      #     Send broadcasts
        ├── plans/              #     Manage plans
        ├── investors/          #     List investors
        └── deposit-instructions/ #   Configure payment methods

components/
├── Navbar.tsx                  # Public site navigation
├── Footer.tsx                  # Public site footer
├── InvestorSidebar.tsx         # Investor portal sidebar + mobile nav
├── AdminSidebar.tsx            # Admin panel sidebar + mobile nav
├── NotificationCenter.tsx      # Notification bell + dropdown
├── OnboardingModal.tsx         # Post-signup 5-step wizard
├── KycModal.tsx                # KYC prompt overlay
├── FundingWarningModal.tsx     # Insufficient balance alert
├── RoiCalculatorModal.tsx      # ROI projection calculator
├── ThreeDPhoneHero.tsx         # Homepage hero component
├── SignalLine.tsx              # SVG line animation
├── CountUpNumber.tsx           # Animated number counter
├── AllocationRingChart.tsx     # Portfolio donut chart
├── LiveChatWidget.tsx          # Support chat widget
└── TawkToWidget.tsx            # Tawk.to integration

lib/
├── store.ts                    # DEPRECATED mock store
├── auth-helpers.ts             # requireAuth() / requireAdmin()
├── db.ts                       # Drizzle database connection
├── notifications.ts            # Notification helper functions
├── audit.ts                    # Audit logging helper
├── totp.ts                     # TOTP 2FA helpers
├── uploadRules.ts              # File upload validation
└── supabase/
    ├── client.ts               # Browser Supabase client
    ├── server.ts               # Server Supabase client
    └── identity.ts             # Get current user + role

db/
├── schema.ts                   # Drizzle table definitions
├── migrations-pg/              # PostgreSQL migrations
└── supabase/policies.sql       # Row-level security policies
```
