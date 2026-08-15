# Quantovest Capital — Product Requirements Document
**Version:** 1.2 (Trial/Demo Build)
**Owner:** Akaka (Design, Copy, Frontend)
**Timeline:** 2-week trial delivery → full build on approval

---

## 1. Overview
Quantovest Capital is a copytrading and investment platform for FX, crypto, and stocks. Investors choose a plan, deposit funds, and an experienced trader executes on their behalf in the investor's chosen market. Investors track performance, holdings, and transactions through a live-feeling dashboard.

**Tagline:** "Your Capital. Their Expertise."

## 2. Goals
- **Trial goal:** Deliver a working, polished demo in 2 weeks that convinces the board to award the full contract.
- **Business goal:** Give non-trading investors a transparent, low-friction way to access FX/crypto/stock market returns via expert traders.
- **Design goal:** One unified design system with light and dark modes — same accent color, type scale, radius, and components in both, only surface/text luminance changes. Light mode for marketing pages, dark mode for the investor/admin product and the homepage's hero band. Full spec in `design-system.md`.

## 3. Target Users
| User type | Description |
|---|---|
| Investor | Wants market exposure without personally trading. Cares about trust, transparency, and clear ROI. |
| Admin (Quantovest staff) | Manually enters trades, performance data, approves KYC/withdrawals during demo phase. |

## 4. Scope — Trial Build (2 weeks)

### 4.1 Public Site
- Homepage (light editorial sections + one full-bleed dark hero band with the pinned 3D-rotating phone sequence, stats bar, how-it-works, plans preview, live market ticker, trust/logo bar)
- How It Works
- About Us
- Services (FX / Crypto / Stocks breakdown)
- Investment Plans — **Starter** (8–12% ROI, $250 min, FX only) / **Growth** (14–18% ROI, $1,000 min, FX & Crypto) / **Elite** (20–28% ROI, $10,000 min, all markets)
- FAQ
- Legal: Privacy Policy, Terms of Service, Risk Disclosure, AML/KYC Policy
- Contact / Support
- Login / Signup

Design note: interior pages (About, Services, Plans, FAQ) stay white-canvas throughout; the full-bleed dark hero is reserved for the homepage so it stays a distinctive, memorable moment rather than becoming the default.

### 4.2 Investor Portal (post-login)
- Dashboard overview (portfolio value, ROI, quick stats)
- Live trades / open positions view
- Copytrading / strategy selection
- Holdings detail
- Transaction history
- Deposit flow (manual methods — bank transfer / crypto wallet address; admin marks as completed)
- Withdrawal flow (request → pending → admin-approved)
- KYC flow (document upload → admin manual review/approve/reject)
- Account settings

### 4.3 Admin Panel
- Investor account overview + total AUM
- Manual trade/performance data entry (feeds investor dashboards)
- KYC review queue
- Withdrawal approval queue

### 4.4 Data Strategy (Trial Phase)
All "live" data is admin-entered daily from the backend — no live broker API, no real payment gateway, no automated KYC verification. The UI is built to feel fully live and automated; the engine underneath is manually operated. Real market price data (FX/crypto tickers, charts) is pulled from free public sources (see Tech Notes) since that data genuinely is live and costs nothing.

## 5. Out of Scope (Trial Phase)
- Real broker/exchange execution integration
- Real payment gateway (Stripe/etc.)
- Automated KYC/AML verification service
- Live chat with real support agents (stub or free tool only)
- Multi-currency accounting

## 6. Post-Trial (Full Build — if awarded)
- Real live chat (free-tier tool, mobile-manageable)
- Email notifications
- OTP for withdrawal security
- Potential real broker/payment integration (firm's decision)

## 7. Success Criteria
- Board can log in as investor + admin and complete a full demo flow: signup → KYC submit → deposit request → admin approves → dashboard shows live-feeling performance → withdrawal request → admin approves.
- Site feels premium, fast, and trustworthy — not templated.
- Delivered within 2 weeks.

## 8. Tech Notes
- Suggested stack: Next.js + Supabase (auth, DB, storage) + Tailwind
- Charts: Recharts or hand-rolled SVG (needed for custom draw-in animation and tooltip control)
- Motion: Framer Motion (component transitions) + GSAP/ScrollTrigger (pinned 3D hero sequence) + Lenis (smooth scroll)
- Icons: Solar Icons via Iconify (`@iconify/react`)
- Live market data: TradingView embeddable widgets (free) or CoinGecko/Frankfurter/Twelve Data APIs
- Hosting: Vercel free tier
- Full design tokens: `design-tokens.css`. Full component/pattern spec: `design-system.md`. Full page-by-page detail: `MASTER-BUILD-BRIEF.md`.

## 9. Risks / Notes
- Marketing claims ("94% success rate," ROI projections) carry regulatory risk for FX/crypto platforms in most jurisdictions — pair with risk disclaimer language site-wide, confirm with firm before public launch.
