# User Flows

## Prospect to account

A prospect enters through the public homepage, reviews the platform message and plans, opens the FAQ or how-it-works pages for clarification, then uses Get Started to reach signup. The marketing navigation and CTA must remain available at mobile widths.

## Investor first use

An investor signs in, lands on the dashboard, reads current balance and ROI, discovers traders, starts or stops a copy-trade, submits a deposit or withdrawal request, completes KYC, and reaches settings or support from the investor-only shell. Each route needs a clear active state, a mobile bottom navigation equivalent, and an escape path back to the dashboard.

## Admin operations

Staff enter through the admin login, land on the admin overview, review performance, inspect deposits and withdrawals, process KYC, and manage traders. Admin routes use a distinct navigation and amber operational identity; they must never reuse investor navigation labels as the primary shell.

## Recovery and states

All queue and money-movement actions need visible pending, approved, rejected, empty, and error states. Destructive or consequential actions should remain explicit and should not be hidden behind hover-only controls.
