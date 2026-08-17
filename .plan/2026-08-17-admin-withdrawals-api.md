# Plan: Rewrite Admin Withdrawals Page to Use Real API

## Goal
Replace mock store usage in `app/admin/withdrawals/page.tsx` with real API calls to `/api/admin/withdrawals`.

## File to Modify
- `app/admin/withdrawals/page.tsx`

## Key Differences: Mock vs Real Data

| Field | Mock (`lib/store.ts`) | DB (`investorWithdrawals`) |
|-------|----------------------|---------------------------|
| `id` | string (`'wth-201'`) | number (serial) |
| `userName` | string | `investorId` only (no name) |
| `amount` | number (dollars) | `amountCents` (integer, cents) |
| `destination` | combined string | separate `destinationType` + `destination` |
| `createdAt` | string | `timestamp` with timezone |

## Changes

### 1. Remove imports
- Remove `import { useQuantovestStore } from '@/lib/store'`

### 2. Add state management
- `withdrawals` — array from API response
- `loading` — boolean for skeleton display
- `message` — string for success/error feedback (same pattern as deposits page)

### 3. Fetch on mount
- `GET /api/admin/withdrawals` with `cache: 'no-store'`
- Store result in state
- Show loading skeleton while fetching

### 4. Handle approve/reject
- `PATCH /api/admin/withdrawals` with body `{ withdrawalId: number, action: 'approve' | 'reject' }`
  - **Note:** The API expects `withdrawalId` (not `id` as stated in task), per `route.ts:22`
- After success, refresh the list and show feedback message
- Show error message if the call fails

### 5. Loading skeleton
- Add a simple skeleton with pulsing placeholders matching the card layout (3 skeleton cards)

### 6. Table/card layout
- Show: `investorId` (as "investor name"), `amountCents/100` formatted as dollars, `destinationType`, `destination`, `status`, `createdAt` formatted
- Add both Approve (green) and Reject (red) buttons for pending items
- Non-pending items show status badge (same as current)

### 7. Feedback
- Display `message` state in a styled banner (green for success, red for error), same pattern as deposits page

## Verification
- Run `npm run build` or `next build` to check for type errors
- Visually confirm the page renders with loading skeleton, fetches data, and approve/reject buttons work
