# Quantovest Capital — Master Build Brief
For handoff to AI coding tools (Claude Code, etc.). This consolidates the PRD, design system, page map, component patterns, and motion spec into one reference document.

---

## 1. What We're Building

**Quantovest Capital** is a copytrading and investment platform for FX, crypto, and stocks. Investors choose a plan, deposit funds, and an experienced trader executes on their behalf in the investor's chosen market. Investors track performance, holdings, and transactions through a live-feeling dashboard.

**Tagline:** "Your Capital. Their Expertise."

**Context:** This is a 2-week trial build for the firm's board — if it lands well, it becomes the full engagement. For the trial, the "engine" behind the platform is admin-operated (staff manually enter trades, approve KYC, approve withdrawals), while the UI is built to feel fully live and automated. No real broker integration, no real payment gateway, no automated KYC verification — those come in the full build if awarded.

**Business model:** Investor picks an investment plan (shown with ROI range) → deposits → an experienced trader trades on their behalf in the investor's chosen market (FX / Crypto / Stocks) → investor tracks everything live.

---

## 2. Full Sitemap

### Public site (pre-login)
1. **Homepage** — hero (3D-rotating phone sequence), stats bar, how-it-works, plans preview, live market ticker, trust/logo bar, testimonials placeholder
2. **How It Works** — explains the copytrading model step by step
3. **About Us** — company story, mission, stats
4. **Services** — FX / Crypto / Stocks copytrading explained separately
5. **Investment Plans** — Starter / Growth / Elite tiers with ROI ranges, minimum deposits, market focus
6. **FAQ**
7. **Contact / Support**
8. **Legal:** Privacy Policy, Terms of Service, Risk Disclosure, AML/KYC Policy
9. **Login / Sign Up**

### Investor portal (post-login)
10. **Dashboard (overview)** — greeting header, portfolio balance card, quick actions, performance chart w/ tooltip, recent activity
11. **Portfolio** — allocation breakdown (ring chart), total balance, per-market detail
12. **Live Trades / Open Positions**
13. **Copytrading / Traders** — browse traders by market, follow/copy
14. **Transaction History** — deposits, withdrawals, trade log
15. **Deposit** — method selection (bank transfer / crypto wallet), amount, instructions
16. **Withdrawal** — request flow, status tracking
17. **KYC / Verification** — document upload, status (pending/verified/rejected)
18. **Account Settings** — profile, security, notifications
19. **Support** (stub/live chat placeholder for trial)

### Admin panel (internal)
20. **Admin dashboard** — investor overview, total AUM
21. **Trade/performance entry** — manual data entry that feeds investor dashboards
22. **Investor management** — KYC review/approve/reject
23. **Withdrawal approval queue**

---

## 3. Brand & Design System (v5 — One System, Two Modes)

**Structure:** One design system with light and dark modes, switched via `data-theme` — like standard light/dark mode, not two separate systems. Everything is shared between modes (accent color, type scale, radius, spacing, components) except surface/text luminance. Light mode is default for marketing pages; dark mode is used for the investor dashboard, admin panel, and the homepage's hero band specifically.

**Shared tokens (identical in both modes):**
| Token | Value |
|---|---|
| `--accent-signal` | `#22C55E` |
| `--semantic-up` / `--semantic-down` | `#22C55E` / `#CF202F` — text color only, never a button background |
| Font | Inter (display + body, weight 400 on headlines, never bold), JetBrains Mono (every number) |
| `--radius-pill` | 100px — every CTA button, both modes |
| `--radius-xl` | 24px — every card, both modes |
| `--space-section` | 96px between major marketing sections |

**Mode-specific tokens (the only things that change):**
| Token | Light | Dark |
|---|---|---|
| `--bg` | `#FFFFFF` | `#0A0D0C` |
| `--surface` | `#F7F7F7` | `#12161A` |
| `--text-primary` | `#0A0D0C` | `#FFFFFF` |
| `--text-muted` | `#5B616E` | `#A8ACB3` |
| `--border-hairline` | `#DEE1E6` | `#202722` |

**Icons:** Solar Icons via Iconify, unchanged.

**Signature motion element — "The Signal Line":** a thin animated price-line used throughout — draws itself on scroll/load, underlines counting-up stats, becomes literal chart lines in the dashboard.

---

## 4. Component Patterns

**Marketing/hero patterns:**
- Floating device mockup with glow orbit ring behind it
- Tilted, stacked stat cards with radial glow (trust-stats section)
- Thin circular outline icons for feature rows
- **3D scroll-driven phone sequence** (see Section 5) as the hero's centerpiece

**Dashboard/product patterns:**
- Greeting header: avatar + "Hello, [Name]" + notification bell
- Portfolio balance card styled like a physical card (chip graphic, masked number, ROI badge)
- Quick action row: circular icon buttons (Deposit / Withdraw / Copy Trader / Statement)
- Segmented toggle tabs (FX / Crypto / Stocks, or Open / Closed positions)
- Performance chart with interactive tooltip (hover/tap shows exact value + date)
- Allocation ring chart with legend
- Color-coded activity/transaction list (green up / red down, icon avatar, amount, % change)
- Trader card (avatar, name, specialty, performance %) for copytrading list
- Plan card (name, ROI range, min deposit, market focus)
- Bottom nav for mobile: Home / Portfolio / Trades / Profile

---

## 5. Motion System

**Core easing (use everywhere):** `cubic-bezier(0.22, 1, 0.36, 1)` — confident deceleration, no bounce.

**Hero — pinned 3D phone sequence:**
- Phone mockup pins via `position: sticky` while a scroll-triggered timeline (GSAP + ScrollTrigger, `scrub`) plays
- As the user scrolls, the phone rotates in 3D (`rotateY`/`rotateX`) and its screen content crossfades through a sequence: Dashboard → Portfolio → Copy Traders → Investment Plans
- Headline, eyebrow label, and supporting copy beside the phone update in sync with scroll progress
- A thin progress bar + dot indicators track position through the sequence
- On mobile: same technique but with reduced rotation angle and shorter pin distance — full desktop rotation feels like scroll-jacking on touch devices

**Page load (hero):**
1. Signal Line draws itself across the hero (SVG `stroke-dashoffset`, ~1.2s)
2. Headline fades/rises in ~100–150ms after the line starts
3. Ticker strip begins continuous scroll

**Scroll-triggered (general):**
- Stat numbers count up when entering viewport
- Section reveals: fade + 16px rise, staggered ~80ms per element, max ~400ms duration

**Hover/micro-interactions:**
- Cards: lift 4px + border color shift to accent + soft glow, 150ms
- Buttons: brightness shift only, no scale/bounce
- Nav links: underline draws in from left (mini Signal Line motif)

**Dashboard-specific:**
- Live-updating numbers tick/flash briefly on change (green flash up, red flash down)
- Charts draw in on first render (left to right), same technique as Signal Line

**Reduced motion:** wrap non-essential animation in `prefers-reduced-motion` checks; keep counters/reveals, drop continuous rotation/auto-scroll.

**Libraries:** Framer Motion (React component-level transitions), GSAP + ScrollTrigger (orchestrated scroll moments), Lenis (smooth scroll).

---

## 6. Assets

| Need | Source |
|---|---|
| Device mockups | angle.sh (free, needs real dashboard screenshot as input) |
| Hero visual | Prefer live TradingView widget over stock photography |
| Hero/background photography (where needed) | Unsplash/Pexels — avoid generic stock, search "trading terminal close up" style |
| Illustrations | unDraw.co (recolor to `--accent-signal`) |
| Motion/lottie | LottieFiles.com |
| Live market data (crypto) | CoinGecko API (free) |
| Live market data (FX) | Frankfurter API or exchangerate.host (free) |
| Live market data (stocks) | Twelve Data or Finnhub (free tier) |
| Live ticker/chart widgets (fastest path) | TradingView free embeddable widgets |

---

## 7. Tech Stack

- **Frontend:** Next.js + Tailwind CSS
- **Backend/DB/Auth:** Supabase (auth, Postgres DB, storage)
- **Charts:** Recharts or hand-rolled SVG (for Signal Line draw animation control)
- **Motion:** Framer Motion + GSAP/ScrollTrigger + Lenis
- **Icons:** @iconify/react, set `solar`
- **Hosting:** Vercel (free tier)

**Data strategy for trial:** all "live" investor-facing data (trades, balances, KYC status) is admin-entered daily via the admin panel — no live broker/payment integration. Real market ticker/price data comes from the free public APIs above, since that's genuinely free and live.

---

## 8. Trial-Phase Scope Boundaries

**Build for trial:** all pages listed in Section 2, fully navigable, with realistic demo data and the admin panel functional for manual data entry/approval.

**Explicitly out of scope for trial:** real broker/exchange execution, real payment gateway, automated KYC verification service, real live chat (stub UI is fine), multi-currency accounting.

**Post-trial (if awarded):** real live chat integration, email notifications, OTP for withdrawal security, potential real broker/payment integration per firm's decision.

**Compliance flag:** marketing claims like "94% success rate" and ROI projections carry regulatory risk for FX/crypto platforms — pair with risk disclaimer language site-wide.
