# Supabase and Vercel implementation notes

The official Vercel environment-variable documentation states that variables can be scoped to Production, Preview, and Development, and that changes apply only to new deployments. Preview variables are suitable for branch-based staging such as `develop`.

Supabase's SSR guidance uses `@supabase/ssr`, cookie-aware browser/server clients, and a request proxy that refreshes sessions. Server authorization should validate the authenticated user with `getUser()` or `getClaims()` rather than trusting an unvalidated session object.

Supabase's database guidance distinguishes direct, session-pooler, and transaction-pooler connections. Transaction pooling is intended for serverless/edge functions such as Vercel functions, and prepared statements must be disabled in transaction mode. The current `lib/db.ts` therefore uses the `postgres` driver with `prepare: false`, a low connection count, and SSL.

References:

- https://vercel.com/docs/environment-variables
- https://supabase.com/docs/guides/auth/server-side/creating-a-client
- https://supabase.com/docs/guides/database/connecting-to-postgres
