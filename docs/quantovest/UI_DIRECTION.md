# Quantovest Capital UI Direction

## Executive assessment

The current interface has a strong starting point: a restrained dark palette, green accent color, clear product hierarchy, and responsive card-based layouts. It still reads as an early prototype because many surfaces use the same rounded-card treatment, the copy makes unusually strong return claims, metrics feel synthetic, and operational states are not yet presented with the calm precision expected from an institutional trading firm.

The visual target should be **institutional wealth management with a modern execution terminal**, not a promotional crypto dashboard. Every screen should answer three questions immediately: what is my current capital state, what changed since the last visit, and what action is safe and available next.

## Highest-impact improvements

| Priority | Improvement | Why it matters |
| --- | --- | --- |
| 1 | Replace guaranteed-return language with scenario, risk, and benchmark language | Increases credibility and reduces regulatory and trust risk. |
| 2 | Establish a design system with fewer card variants, consistent spacing, and semantic status colors | Makes the product feel deliberate instead of assembled page by page. |
| 3 | Add a real data-status layer: last updated time, source, pending state, and retry action | Makes backend delays understandable instead of looking broken. |
| 4 | Make the portfolio header the command center | Users should see balance, invested principal, available balance, pending actions, and KYC status in one calm summary. |
| 5 | Reduce decorative claims and synthetic market tickers | A smaller set of truthful, timestamped metrics looks more professional than large unsupported numbers. |
| 6 | Use a single primary action per screen | Deposit, upload KYC, approve, and withdraw should each have a clear next step with a visible status trail. |

## ROI calculator

The calculator is the most important UI correction. The current 15–35% daily assumptions compound to extreme values, such as trillions of dollars over six months, which makes the product look mathematically careless even when the formula is operating as written. The calculator should not hide or cosmetically compress that issue; it should be redesigned around transparent scenarios.

The recommended structure is a three-tab model: **Illustrative**, **Simple return**, and **Custom assumptions**. Each tab should show the exact daily rate, number of compounding periods, fees, and whether withdrawals are included. The primary result should be a range rather than a single promise, with a small “assumptions” drawer explaining the calculation. Use compact notation only as a secondary display; the full value should remain available on hover or focus.

The result area should emphasize “Ending value in this scenario” and “Profit before fees,” while presenting “Maximum drawdown,” “Fees,” and “Not guaranteed” as first-class context. Use a neutral blue or violet for the projection line and reserve green for positive realized account movements. Add a timestamp such as “Model updated 23 Aug 2026, 14:10 UTC” only when the underlying rates are actually sourced and versioned.

## Trading-firm visual language

Use a dark graphite foundation, off-white typography, one restrained accent, and a second amber status color. Reduce border radii from ubiquitous large pills to a 10–14px system, reserving pills for statuses and filters. Use tabular numerals for all capital, ROI, dates, and IDs. Pair a neutral sans-serif for headings with a technical mono face only for numbers and metadata. Introduce a consistent 8px spacing scale and a small set of elevation levels rather than custom shadows per component.

Replace the repeated “Live” and “AI” style badges with factual metadata: “Updated 4 min ago,” “Pending review,” “Source: portfolio ledger,” or “Requires KYC.” If a value is unavailable, show an explicit skeleton or unavailable state rather than zero. The empty state should explain why it is empty and provide the next safe action.

## Admin experience

The admin console should be organized around queues and risk. The first screen should show pending KYC, pending deposits, pending withdrawals, failed notifications, database health, and the age of the oldest pending item. Every approval action should display a confirmation drawer with investor, amount, proof, selected plan, resulting ledger changes, notifications to be sent, and an immutable audit note. Destructive or financial actions should never be one-click actions.

## Investor experience

The investor dashboard should lead with account state, not marketing. Use a compact “Account standing” panel containing KYC status, funding status, next review, and any action required. The bottom mobile navigation should contain only the most important destinations: Overview, Portfolio Managers, Deposit, History, and Settings. Put notifications and profile controls in the top bar.

## Motion and accessibility

Use motion only to explain state changes: upload progress, successful submission, filter transitions, and chart range changes. Avoid continuous decorative motion in the primary dashboard. All dialogs should trap focus, close on Escape, restore focus to the trigger, and expose `aria-live` status text for uploads and submission errors. Touch targets should be at least 44px, and all monetary values must remain readable at 320px viewport width.

## Delivery sequence

First stabilize the data and workflow states. Next consolidate tokens and shared components. Then redesign the calculator and portfolio header. After that, refine the admin queues and approval drawers. Finally, perform visual QA at 320px, 375px, 768px, 1024px, and desktop widths with realistic empty, loading, pending, success, rejection, and unavailable states.
