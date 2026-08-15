---
name: Quantovest Capital — Design System
version: 1.0
description: One unified design system, light and dark mode, switched via `data-theme`. Same accent, type scale, radius, spacing, and components in both — only surface/text luminance changes. Light mode is default for the public marketing site; dark mode is used for the investor portal, admin panel, and the homepage hero band only.
---

## 0. Principle

There is one system, not two. A card, a button, a heading all use the exact same tokens whether they render in light or dark — only `--bg`, `--surface`, `--text-primary`, `--text-muted`, and `--border-hairline` swap per mode. Everything else (accent, radius, spacing, type scale, motion) is shared. This is the single most important rule when building any new screen: never invent a one-off color or radius — pull from this file.

---

## 1. Color Tokens

### Shared (identical in both modes)
| Token | Value | Use |
|---|---|---|
| `--accent-signal` | `#22C55E` | The one brand color. Primary CTAs, active states, chart lines, focus rings, "Signal Line" motif. Used deliberately, not everywhere. |
| `--accent-signal-active` | `#16A34A` | Press/hover-darken state of the accent. |
| `--accent-signal-soft` | `#22C55E1A` (10% alpha) | Accent-tinted backgrounds — badge fills, subtle highlight panels. |
| `--semantic-up` | `#22C55E` | Price/performance up — text color only, never a background fill. |
| `--semantic-down` | `#CF202F` | Price/performance down — text color only, never a background fill. |
| `--on-accent` | `#FFFFFF` | Text on top of the accent color. |

### Light mode (`data-theme="light"`) — public/marketing pages
| Token | Value | Use |
|---|---|---|
| `--bg` | `#FFFFFF` | Page canvas. |
| `--surface` | `#F7F7F7` | Alternating section bands, secondary buttons. |
| `--surface-strong` | `#EEF0F3` | Search pills, icon plates, badge backgrounds. |
| `--text-primary` | `#0A0D0C` | Headlines, primary nav, strong body. |
| `--text-muted` | `#5B616E` | Default running copy, captions. |
| `--border-hairline` | `#DEE1E6` | 1px dividers, card outlines. |

### Dark mode (`data-theme="dark"`) — investor portal, admin, homepage hero band
| Token | Value | Use |
|---|---|---|
| `--bg` | `#0A0D0C` | Page canvas / hero band background. |
| `--surface` | `#12161A` | Floating cards, elevated panels (balance card, product-UI mockups). |
| `--surface-strong` | `#1A1F24` | Nested/secondary surfaces on top of `--surface`. |
| `--text-primary` | `#FFFFFF` | Headlines, primary numbers. |
| `--text-muted` | `#A8ACB3` | Secondary text, labels, timestamps. |
| `--border-hairline` | `#202722` | 1px dividers on dark surfaces. |

**Rule of scarcity:** `--accent-signal` appears on primary CTAs, the active nav/tab state, chart lines, and small emphasis moments (a stat's underline, a badge). It never becomes a full-section background — that would flatten the one signal into wallpaper.

---

## 2. Typography

**Families:** Inter (display + body — one family, two roles, never a second display face) · JetBrains Mono (every number: prices, percentages, balances, timestamps in tables).

**The defining choice:** display headings sit at **weight 400**, never 700+. This is what keeps the brand reading as calm/institutional rather than fintech-loud. Bold is reserved for body emphasis and buttons only.

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `display-mega` | 80px / 44px mobile | 400 | 1.0 | -2px | Homepage hero headline only |
| `display-xl` | 64px / 36px mobile | 400 | 1.0 | -1.6px | Subsidiary page heroes (How It Works, About, Plans) |
| `display-lg` | 52px / 32px mobile | 400 | 1.0 | -1.3px | Section heads |
| `display-md` | 44px / 28px mobile | 400 | 1.09 | -1px | CTA-band headlines, dashboard page titles |
| `display-sm` | 36px | 400 | 1.11 | -0.5px | Sub-section heads |
| `title-lg` | 32px | 400 | 1.13 | -0.4px | Card group titles |
| `title-md` | 18px | 600 | 1.33 | 0 | Component titles, trader/plan card names |
| `title-sm` | 16px | 600 | 1.25 | 0 | List labels, nav-adjacent labels |
| `body-md` | 16px | 400 | 1.5 | 0 | Default running copy |
| `body-strong` | 16px | 700 | 1.5 | 0 | Emphasized inline copy |
| `body-sm` | 14px | 400 | 1.5 | 0 | Footer, secondary UI copy |
| `caption` | 13px | 400 | 1.5 | 0 | Timestamps, helper text |
| `caption-strong` | 12px | 600 | 1.5 | 0 | Badge labels, tags |
| `number-display` | 18px | 500 (JetBrains Mono) | 1.4 | 0 | Balances, prices, % change |
| `number-lg` | 32px (JetBrains Mono) | 500 | 1.1 | -0.5px | Portfolio balance card headline figure |
| `button` | 16px | 600 | 1.15 | 0 | All CTA/button labels |
| `nav-link` | 14px | 500 | 1.4 | 0 | Top nav, bottom nav (mobile) |

---

## 3. Spacing & Layout

Base unit: 4px.

| Token | Value |
|---|---|
| `--space-xxs` | 4px |
| `--space-xs` | 8px |
| `--space-sm` | 12px |
| `--space-base` | 16px |
| `--space-md` | 20px |
| `--space-lg` | 24px |
| `--space-xl` | 32px |
| `--space-xxl` | 48px |
| `--space-section` | 96px (48px mobile) — between every major marketing section |

**Grid:** max content width ~1200px centered, full-bleed for hero bands and photography. 12-column editorial grid on marketing pages. Dashboard uses a fixed sidebar (desktop) / bottom nav (mobile) + fluid content column.

**Density split:** marketing pages stay generous (96px section rhythm, lots of air — Bloomberg/FT energy, not a trading terminal). Dashboard/product screens are allowed to be denser — that's where the actual data lives.

---

## 4. Radius Scale

| Token | Value | Use |
|---|---|---|
| `--radius-xs` | 4px | Inline tags |
| `--radius-sm` | 8px | Compact rows, table cells |
| `--radius-md` | 12px | Form inputs |
| `--radius-lg` | 16px | Small/nested cards |
| `--radius-xl` | 24px | Feature cards, portfolio balance card, product-UI mockups, plan cards, trader cards — the default "card" radius |
| `--radius-pill` | 100px | Every CTA button, tabs, search pills, badges |
| `--radius-full` | 9999px | Avatars, asset icon circles, notification dot |

Sharp (0px) corners are essentially unused — this brand has no hard edges anywhere.

---

## 5. Elevation

| Level | Treatment | Use |
|---|---|---|
| Flat | No shadow, no border | Most surfaces, both modes |
| Hairline | 1px `--border-hairline` | Card outlines on light surfaces; dark-mode card separation |
| Soft drop | `0 4px 12px rgba(0,0,0,0.04)` (light) / `0 4px 20px rgba(34,197,94,0.08)` (dark, accent-tinted glow) | Hover-lifted cards, floating dashboard mockups |
| Radial glow | Soft accent-colored radial gradient behind stat cards / device mockups | Homepage trust-stats section, hero phone mockup |

Depth comes from card-on-card layering and the radial glow, never from heavy drop shadows.

---

## 6. Components

### Navigation
- **`nav-light`** — white bg, `--text-primary` text, 64px height. Wordmark left · Cryptocurrencies-style menu (How It Works / Services / Plans / About / FAQ) center-left · Sign In / Get Started right.
- **`nav-dark`** — used on homepage hero band only pre-login. `--bg` dark, `--text-primary` (white) text, same layout.
- **`nav-portal`** — investor/admin app shell. Desktop: fixed left sidebar, dark mode always. Mobile: bottom nav — Home / Portfolio / Trades / Profile, icon + label, active item in `--accent-signal`.

### Buttons
- **`btn-primary`** — `--accent-signal` bg, white text, `button` type, `--radius-pill`, 44px height, 12px×20px padding. Hover/press → `--accent-signal-active`, brightness shift only, no scale.
- **`btn-primary-lg`** — same, 56px height, 16px×32px padding. Homepage hero CTA only.
- **`btn-secondary`** — `--surface-strong` bg, `--text-primary` text, same pill geometry.
- **`btn-outline`** — transparent bg, 1px `--border-hairline` (or white on dark hero), `--text-primary` text.
- **`btn-text`** — transparent, `--accent-signal` text, underline draws in from left on hover (mini Signal Line).
- **`btn-disabled`** — `--accent-signal` at 40% opacity, `not-allowed` cursor.

### Marketing components
- **`hero-band-dark`** (homepage only) — full-bleed dark, pinned 3D-rotating phone mockup with glow orbit ring, Signal Line draws in on load, headline in `display-mega`, stats bar below with count-up numbers.
- **`hero-band-light`** (all other page heroes) — white canvas, `display-xl`, no phone mockup, optional static illustration.
- **`stat-card`** — tilted, stacked cards with radial glow behind, used in trust-stats sections. Big `number-lg` figure + `caption` label + optional Signal Line underline.
- **`feature-card`** — `--radius-xl`, `--space-xl` padding, thin circular outline icon top, `title-md` heading, `body-sm` description.
- **`plan-card`** — plan name (`title-lg`), ROI range in `number-display` + `--accent-signal`, min deposit, market focus badges, CTA. Featured tier (Growth/Elite) gets a dark/elevated variant even inside the light-mode page.
- **`ticker-strip`** — continuous horizontal scroll, live FX/crypto prices in `number-display` (JetBrains Mono), up/down in semantic colors, thin hairline top/bottom border.
- **`logo-bar`** — muted grayscale trust logos, `--text-muted`.

### Dashboard/product components
- **`greeting-header`** — avatar (circle, `--radius-full`) + "Hello, [Name]" (`title-lg`) + notification bell with `--accent-signal` dot.
- **`balance-card`** — physical-card styling: `--radius-xl`, dark `--surface` bg with subtle gradient, masked account number, chip-style graphic, big balance in `number-lg`, ROI badge (`caption-strong` + `--accent-signal-soft` bg).
- **`quick-action-row`** — 4 circular icon buttons (`--radius-full`, `--surface-strong` bg): Deposit / Withdraw / Copy Trader / Statement.
- **`segmented-tabs`** — pill-shaped tab group, active tab `--accent-signal` bg + white text, inactive transparent + `--text-muted`. Used for FX/Crypto/Stocks and Open/Closed positions.
- **`perf-chart`** — Signal Line technique: draws in left-to-right on first render, interactive tooltip on hover/tap shows exact value + date, line in `--accent-signal`.
- **`allocation-ring`** — donut chart, market segments in accent + muted tints, legend below with `caption` labels.
- **`activity-row`** — icon avatar + description (`body-md`) + amount/% in `number-display`, colored by semantic-up/down, right-aligned.
- **`trader-card`** — avatar, name (`title-md`), specialty badge, performance % in semantic color, "Copy" button (`btn-primary`, small).
- **`kyc-status-badge`** — pill, three states: pending (`--text-muted` bg), verified (`--accent-signal-soft` bg + accent text), rejected (semantic-down tint).

---

## 7. Motion System

**Core easing (everywhere):** `cubic-bezier(0.22, 1, 0.36, 1)` — confident deceleration, never a bounce.

**Signature element — "The Signal Line":** a thin animated price-line. It draws itself on scroll/load (SVG `stroke-dashoffset`), underlines count-up stats, and becomes the literal chart line in the dashboard. This is the one motion idea that should recur everywhere — don't invent a second signature motif.

**Homepage hero load sequence:**
1. Signal Line draws across the hero (~1.2s)
2. Headline fades/rises ~100–150ms after the line starts
3. Ticker strip begins continuous scroll
4. Pinned phone sequence takes over as the user scrolls (sticky position, GSAP ScrollTrigger `scrub`, screen content crossfades: Dashboard → Portfolio → Copy Traders → Plans; thin progress bar + dot indicators track position)

**General scroll-triggered:** stat numbers count up on entering viewport; section reveals as fade + 16px rise, staggered ~80ms per element, max ~400ms total.

**Hover/micro-interactions:** cards lift 4px + border shifts to accent + soft glow (150ms); buttons get a brightness shift only; nav links underline-draw from left.

**Dashboard-specific:** live-updating numbers tick/flash briefly on change (green flash up, red flash down); charts draw in left-to-right on first render.

**Reduced motion:** wrap all non-essential animation in `prefers-reduced-motion` checks. Keep counters and fade/rise reveals; drop continuous rotation, auto-scroll ticker, and the pinned 3D phone rotation (show a static frame instead).

**Mobile note on the pinned phone sequence:** reduce rotation angle and shorten the pin distance — full desktop rotation reads as scroll-jacking on touch.

---

## 8. Iconography

Solar Icons via Iconify (`@iconify/react`, set `solar`). Thin/outline weight for feature rows and nav; bold/bold-duotone weight sparingly for active states. Never mix in a second icon set.

---

## 9. Voice & Copy

- Active voice, plain verbs. A person deposits, withdraws, copies a trader — not "initiates a transaction."
- Name things by what the investor controls: "Copy trader," "Withdraw," not backend language.
- Numbers and disclosures are exact and unapologetic — never hedge or oversell in the interface copy itself (marketing pages carry the persuasive language; product UI stays neutral and clear).
- Every ROI/performance claim on marketing pages sits next to risk-disclaimer language — this is a compliance requirement, not a style choice (see PRD §9).
- Empty states are an invitation to act ("No trades yet — copy a trader to get started") not an apology.

---

## 10. Application Map

| Surface | Mode | Notes |
|---|---|---|
| Homepage | Light, except hero band which is dark | Only page where the dark hero appears — keeps it a distinctive, memorable moment |
| How It Works / About / Services / Plans / FAQ / Legal / Contact | Light throughout | No dark sections |
| Login / Sign Up | Light | Matches public site |
| Investor portal (all screens) | Dark | Dashboard, Portfolio, Trades, Copytrading, Transactions, Deposit, Withdrawal, KYC, Settings, Support |
| Admin panel | Dark | Same product tokens as investor portal |
