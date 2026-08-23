# Quantovest Capital — Deployment Guide

Step-by-step guide to deploy to production.

---

## Step 1: Create Supabase Project

1. Go to **https://supabase.com** → Sign up / Log in
2. Click **"New Project"**
3. Fill in:
   - **Organization:** Create new or select existing
   - **Project name:** `quantovest-capital`
   - **Database password:** Choose a strong password (save it)
   - **Region:** Choose closest to your users
4. Click **"Create new project"** — wait 2 minutes for setup

---

## Step 2: Get Supabase Keys

Once project is created:

1. Go to **Settings → API** (left sidebar)
2. Copy these values:

| Key | Where to find it |
|---|---|
| **Project URL** | `Settings → API → Project URL` (looks like `https://xyz.supabase.co`) |
| **Anon/Public Key** | `Settings → API → `anon public` key` |
| **Service Role Key** | `Settings → API → `service_role` key` (keep secret!) |

3. Go to **Settings → Database → Connection string → URI**
4. Copy the **URI** (looks like `postgresql://postgres.xxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres`)

---

## Step 3: Set Environment Variables

Create a `.env.local` file in your project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_MEDIA_BUCKET=quantovest-media

# Database
DATABASE_URL=postgresql://postgres.xxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# App URL
APP_PUBLIC_URL=https://yourdomain.com

# Email (Resend)
RESEND_API_KEY=re_your_key
EMAIL_FROM=Quantovest Capital <notifications@yourdomain.com>

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Push Notifications (optional)
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_EMAIL=mailto:admin@yourdomain.com
```

---

## Step 4: Run Database Migrations

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

This creates all tables in your Supabase database.

---

## Step 5: Seed Investment Plans

Go to **Supabase Dashboard → SQL Editor** and run:

```sql
INSERT INTO "plans" ("name", "minimumDepositCents", "maximumDepositCents", "minRoiBps", "maxRoiBps", "active")
VALUES
  ('Starter', 50000, 4999999, 1500, 1500, 1),
  ('Growth', 500000, 14999999, 2500, 2500, 1),
  ('Elite', 1500000, NULL, 3500, 3500, 1)
ON CONFLICT DO NOTHING;
```

---

## Step 6: Create Admin User

1. Go to **Supabase Dashboard → Authentication → Users**
2 click **"Add user"**
3. Enter email and password (e.g., `admin@yourdomain.com`)
4. After creation, go to **SQL Editor** and run:

```sql
UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'admin@yourdomain.com';
```

Also update the public users table:

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@yourdomain.com';
```

---

## Step 7: Create Storage Bucket

1. Go to **Supabase Dashboard → Storage**
2. Click **"New bucket"**
3. Name: `quantovest-media`
4. Make it **Public** (for avatar images)
5. Click **Create**

---

## Step 8: Set Up Google OAuth (Optional)

1. Go to **https://console.cloud.google.com**
2. Create a new project or select existing
3. Go to **APIs & Services → Credentials**
4. Click **"Create Credentials" → "OAuth client ID"**
5. Application type: **Web application**
6. Authorized redirect URIs: add:
   - `https://your-project.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback` (for dev)
7. Copy **Client ID** and **Client Secret**
8. Go to **Supabase Dashboard → Authentication → Providers → Google**
9. Enable Google provider
10. Paste Client ID and Client Secret

---

## Step 9: Set Up Resend (Email)

1. Go to **https://resend.com** → Sign up (free tier: 100 emails/day)
2. Go to **API Keys** → Create new key → Copy it
3. Go to **Domains** → Add your domain
4. Add the DNS records they give you (MX, TXT, CNAME)
5. Wait for verification (usually 5 minutes)
6. Set `RESEND_API_KEY` and `EMAIL_FROM` in env vars

---

## Step 10: Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy to production
vercel --prod
```

Or connect your GitHub repo:

1. Go to **https://vercel.com**
2. Click **"New Project"**
3. Import your GitHub repo
4. Add all environment variables from Step 3
5. Click **Deploy**

---

## Step 11: Configure Supabase Auth Redirects

1. Go to **Supabase Dashboard → Authentication → URL Configuration**
2. Set **Site URL**: `https://yourdomain.com`
3. Add **Redirect URLs**:
   - `https://yourdomain.com/auth/callback`
   - `https://yourdomain.com/dashboard`
   - `http://localhost:3000/auth/callback` (for dev)

---

## Step 12: Set Up Tawk.to (Live Chat — Optional)

1. Go to **https://tawk.to** and sign in to the existing Quantovest Capital property.
2. Confirm the property is active and configure the production domain restriction after the final domain is purchased.
3. Open **Administration → Chat Widget** and confirm the property and widget IDs match the production property.
4. Add `NEXT_PUBLIC_TAWK_PROPERTY_ID` and `NEXT_PUBLIC_TAWK_WIDGET_ID` to Vercel. Do not hardcode or commit these values in source files.
5. The existing `components/TawkToWidget.tsx` loads the widget only on non-admin routes, prevents duplicate script injection, and applies mobile-safe sizing.
6. Download the Tawk.to mobile app if staff need to respond while away from the dashboard.

---

## Step 13: Generate VAPID Keys (Push Notifications — Optional)

```bash
npx web-push generate-vapid-keys
```

Copy the output into your env vars.

---

## Environment Variables Summary

| Variable | Required | Where to get it |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase Settings → API |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | ✅ | Supabase Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase Settings → API |
| `DATABASE_URL` | ✅ | Supabase Settings → Database → Connection string |
| `APP_PUBLIC_URL` | ✅ | Your deployed URL |
| `NEXT_PUBLIC_TAWK_PROPERTY_ID` | Optional | Tawk.to Administration → Property ID |
| `NEXT_PUBLIC_TAWK_WIDGET_ID` | Optional | Tawk.to Administration → Chat Widget code |
| `RESEND_API_KEY` | ✅ | resend.com → API Keys |
| `EMAIL_FROM` | ✅ | Your verified domain email |
| `GOOGLE_CLIENT_ID` | Optional | console.cloud.google.com |
| `GOOGLE_CLIENT_SECRET` | Optional | console.cloud.google.com |
| `VAPID_PUBLIC_KEY` | Optional | `npx web-push generate-vapid-keys` |
| `VAPID_PRIVATE_KEY` | Optional | `npx web-push generate-vapid-keys` |
| `VAPID_EMAIL` | Optional | Your admin email |

---

## Post-Deploy Checklist

- [ ] Site loads at your domain
- [ ] Signup creates account
- [ ] Login works
- [ ] Google OAuth works (if set up)
- [ ] Dashboard loads with balance
- [ ] Deposit flow works
- [ ] Withdrawal flow works
- [ ] KYC upload works
- [ ] Admin can approve deposits
- [ ] Admin can publish ROI
- [ ] Notifications appear in bell
- [ ] Emails send (check Resend dashboard)
- [ ] Password reset works
- [ ] Mobile responsive
- [ ] Live chat widget appears on intended public routes and is hidden on admin routes
- [ ] Tawk.to property is restricted to the production domain
- [ ] Tawk.to offline form and support mailbox work
