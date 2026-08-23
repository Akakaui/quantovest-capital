# Quantovest Capital — Domain, Live Chat, and Business Email Setup Guide

**Purpose:** Connect a new Namecheap domain to the Quantovest Capital Vercel deployment, install Tawk.to live chat, and configure Zoho Mail business email while preserving correct DNS, email authentication, and production security.

> **Recommended order:** Register the domain → add it to Vercel → configure website DNS → create and verify Zoho Mail → add email DNS records → install Tawk.to → test every service.

## 1. Choose and register the domain at Namecheap

Choose a short, trustworthy name that is easy to say and type. For a financial brand, avoid hyphens, unusual spellings, and unnecessary numbers. A `.com` domain is usually the clearest primary choice when available. Consider registering common misspellings only after the main domain is secured.

1. Open [Namecheap](https://www.namecheap.com/) and search for the preferred domain.
2. Add the domain to the cart and enable domain privacy if it is offered for the selected extension.
3. Create or use the business Namecheap account. Use an account email that the owner controls, not a temporary employee address.
4. Complete payment and confirm the registration email.
5. Turn on two-factor authentication in Namecheap.
6. Do not change nameservers yet. Keeping Namecheap DNS active allows the website, Zoho Mail, and verification records to be managed in one place.

Record these values privately:

| Item | Example | Notes |
| --- | --- | --- |
| Primary domain | `quantovestcapital.com` | Replace with the domain actually purchased. |
| Website host | `www.quantovestcapital.com` | Recommended primary web hostname. |
| Root host | `quantovestcapital.com` | Apex/root domain. |
| Business email | `support@quantovestcapital.com` | Create after Zoho verification. |
| Registrar | Namecheap | Keep registrar login protected with 2FA. |
| DNS provider | Namecheap Advanced DNS | Do not mix conflicting DNS providers. |

## 2. Connect the domain to Vercel

Vercel’s official flow is **Project → Settings → Domains → Add Domain**. For an apex domain, Vercel normally supplies an A-record configuration; for a subdomain, it supplies a CNAME target. The exact values displayed in the Vercel project are authoritative and should be copied exactly because the CNAME target can be project-specific. [1]

### Add the domains in Vercel

1. Sign in to Vercel and open the Quantovest Capital project.
2. Open **Settings → Domains**.
3. Add the root domain, for example `quantovestcapital.com`.
4. Add the `www` domain, for example `www.quantovestcapital.com`.
5. Choose one canonical public URL. A professional default is `https://www.quantovestcapital.com`, with the root domain redirected to it. Vercel can also use the root domain as canonical; consistency matters more than which option is selected.
6. Copy the DNS records Vercel displays for each domain.

### Add Vercel records in Namecheap

In Namecheap, open **Domain List → Manage → Advanced DNS**. Add the exact Vercel values shown in the Vercel dashboard.

| Type | Host | Value | Typical use |
| --- | --- | --- | --- |
| A | `@` | The Vercel IP shown in the project | Root/apex domain. Use Vercel’s current value, not a copied value from an old tutorial. |
| CNAME | `www` | The Vercel CNAME target shown in the project | `www` subdomain. |

Remove or replace conflicting parking records for `@` and `www`. Do not create multiple A records for the same host unless Vercel explicitly instructs you to do so. Leave the email records untouched once Zoho is configured.

Return to Vercel and wait for verification. DNS propagation can be quick or can take longer depending on resolver caches. Once verified, test both the root and `www` addresses in a private browser window and confirm that the selected canonical redirect works.

## 3. Configure HTTPS and production URLs

After Vercel reports the domain as valid, confirm that HTTPS is active and that the browser shows a valid certificate. In the Quantovest project’s Vercel environment variables, update the application’s public URL to the final HTTPS domain if the project uses an `APP_PUBLIC_URL` or equivalent variable.

For Quantovest Capital, also confirm that Supabase Auth redirect URLs include the final domain. Add the following patterns only when they match the real deployment:

```text
https://your-domain.com/auth/callback
https://www.your-domain.com/auth/callback
```

Update the corresponding **Site URL**, allowed redirect URLs, OAuth callback URLs, and email-action URLs in Supabase. Keep the Vercel preview URL available for testing if preview deployments are still used.

## 4. Create Zoho business email for free, if available in your region

Zoho’s public pricing information describes a Forever Free custom-domain plan that can support one domain and up to five users with 5 GB of storage per user. The free plan is web-only and does not include IMAP, POP, or ActiveSync. Availability and eligibility can vary by region and signup flow, so the plan shown in the Zoho signup screen is the final authority. [2]

### Create the Zoho organization

1. Open [Zoho Mail](https://www.zoho.com/mail/) and choose the business/custom-domain signup option.
2. Select the free plan if it is offered for the region and domain.
3. Enter the purchased domain without `https://`, such as `quantovestcapital.com`.
4. Create the organization administrator account. Prefer an address controlled by the business owner during setup.
5. Enter a mobile number for verification and protect the Zoho administrator account with two-factor authentication.
6. Zoho will provide a domain-verification record. Keep the Zoho setup tab open because the exact record value is unique to the organization.

### Verify the domain in Namecheap

In Namecheap, open **Domain List → Manage → Advanced DNS → Host Records**. Add the verification record Zoho provides. Zoho may provide either a TXT or CNAME record.

| Type | Host | Value | Action |
| --- | --- | --- | --- |
| TXT or CNAME | As shown by Zoho, often `@` or a short token | The exact Zoho verification value | Copy exactly; do not add quotation marks unless Zoho explicitly includes them. |

Save the record, wait for DNS visibility, and click **Verify** in Zoho. Namecheap’s documentation confirms that Zoho verification can be completed with a CNAME or TXT record and that mail records are managed from Advanced DNS. [3]

### Add Zoho MX records

After verification, open Zoho’s Admin Console and copy the MX records shown for the account’s data center. Do not blindly use a record set from a different region. Namecheap’s generic example uses `mx.zoho.eu`, `mx2.zoho.eu`, and `mx3.zoho.eu`, but the exact Zoho console values are authoritative. [3]

In Namecheap, go to **Advanced DNS → Mail Settings → Custom MX** and add the Zoho records. Remove Namecheap parking MX records and any old mail-provider MX records so only the intended provider receives mail.

| Type | Host | Mail server | Priority |
| --- | --- | --- | --- |
| MX | `@` | Zoho value 1 from Admin Console | Zoho value 1 |
| MX | `@` | Zoho value 2 from Admin Console | Zoho value 2 |
| MX | `@` | Zoho value 3 from Admin Console | Zoho value 3 |

The lowest numerical priority is preferred. Zoho’s own setup screen should be used for exact hosts and priorities.

### Add SPF, DKIM, and DMARC

Email authentication is essential for deliverability and protection against spoofing.

1. **SPF:** Add the TXT value Zoho supplies. If another SPF record already exists, merge the mechanisms into one SPF record; do not publish two separate SPF records for the same domain.
2. **DKIM:** In Zoho Admin Console, generate a DKIM selector and TXT value. Add the selector host and value to Namecheap DNS, then return to Zoho and verify it.
3. **DMARC:** Start with a monitoring policy while validating legitimate senders. A cautious initial record is commonly structured like this, but the reporting address and policy should be chosen by the business owner:

```text
Host: _dmarc
Type: TXT
Value: v=DMARC1; p=none; rua=mailto:dmarc@your-domain.com; adkim=s; aspf=s
```

After reviewing reports and confirming that Zoho and any other legitimate sender pass SPF/DKIM alignment, the organization can consider moving from monitoring to quarantine or reject. Never publish a strict policy before verifying every legitimate sender, including transactional email services.

### Create practical mailboxes

For a small business, begin with role-based addresses rather than personal addresses:

| Address | Purpose |
| --- | --- |
| `support@your-domain.com` | Customer support and Tawk.to escalation. |
| `admin@your-domain.com` | Restricted operational administration. |
| `compliance@your-domain.com` | KYC and compliance communication. |
| `notifications@your-domain.com` | Automated application email, if the sending provider supports it. |
| `owner@your-domain.com` | Private owner mailbox; do not publish it. |

Keep the owner and admin mailboxes separate. Use aliases or groups where supported, and do not share one password between multiple people. Because the free Zoho plan is web-only, staff should use Zoho Webmail or official web access unless the account is upgraded to a plan that includes the required mail protocols.

## 5. Install Tawk.to live chat

Tawk.to’s official installation flow is **Log in → select the correct property → Administration → Chat Widget → copy Widget Code**. The JavaScript snippet should be loaded on the website, and Tawk.to recommends testing in an incognito/private window after publishing. [4]

### Create the property

1. Open [Tawk.to](https://www.tawk.to/) and create the organization account.
2. Create a property for the final website domain, such as `your-domain.com`.
3. Name the property `Quantovest Capital` so staff do not accidentally use a test property.
4. Invite only the staff who need to respond to chats. Use role-based access where available.
5. Set business hours, timezone, welcome message, offline form, notification email, and escalation instructions.
6. Restrict the widget to the production domain after the site is live. This prevents the widget from appearing on unrelated preview or copied environments.

### Add the widget to Next.js

The Quantovest application uses Next.js App Router. The local agent should add the Tawk snippet through a client-safe script integration, not by executing browser-only code during server rendering. Use the exact snippet generated by the correct Tawk property.

A typical integration pattern is:

```tsx
import Script from 'next/script'

export function TawkWidget() {
  return (
    <Script
      id="tawk-widget"
      strategy="lazyOnload"
      dangerouslySetInnerHTML={{
        __html: `/* paste the exact Tawk.to widget code here */`,
      }}
    />
  )
}
```

The local agent should place this component in the root layout or another shared layout so it appears on the intended public pages. It should not appear on sensitive admin pages unless that is deliberately required. If the app has a strict Content Security Policy, the agent must allow the Tawk.to script and related resources explicitly; otherwise the browser console may report CSP blocks. [4]

### How to use Tawk.to operationally

When a visitor starts a chat, the support agent should greet the visitor, confirm the page or topic, avoid requesting passwords or full payment-card details, and move sensitive account matters to the authenticated portal or official business email. Configure canned replies for common questions, label conversations by topic, assign conversations to the correct staff member, and record support outcomes in the company’s approved workflow.

Use the offline form when no agent is available. Route it to `support@your-domain.com` or the approved support mailbox. Test desktop, mobile, logged-out, and private-browser sessions. Also test that the widget does not overlap the mobile navigation, cookie notice, calculator modal, or other critical controls.

## 6. Final DNS and service test checklist

| Test | Expected result |
| --- | --- |
| `https://your-domain.com` | Loads Quantovest over HTTPS or redirects to the selected canonical host. |
| `https://www.your-domain.com` | Loads or redirects consistently according to the canonical-domain decision. |
| Vercel Domains page | Both domain entries show valid/verified. |
| Zoho domain verification | Verified successfully. |
| MX lookup | Only the intended Zoho MX records are active. |
| SPF check | One valid SPF record exists and includes every legitimate sender. |
| DKIM check | Zoho DKIM selector verifies successfully. |
| DMARC check | `_dmarc` record is visible and reports are monitored. |
| Send to Zoho mailbox | Message arrives in the intended mailbox. |
| Send from Zoho mailbox | Recipient receives the message and authentication passes. |
| Tawk widget | Appears on intended pages and opens on desktop and mobile. |
| Tawk offline form | Captures a message and sends it to the intended support address. |
| Auth callback | Login, logout, password reset, and OAuth redirects use the final HTTPS domain. |
| Production app | No mixed-content, CSP, redirect-loop, or cookie-domain errors appear in the browser console. |

## 7. Security rules

Keep Namecheap, Vercel, Zoho, Tawk.to, Supabase, GitHub, and email accounts protected with unique passwords and two-factor authentication. Never put database passwords, Supabase service-role keys, Zoho admin credentials, or private API tokens in the repository, chat messages, screenshots, or client-side JavaScript. Public website DNS records and Tawk property identifiers are not substitutes for server-side secrets.

For Quantovest specifically, keep financial, KYC, and account-support communication inside authenticated application workflows wherever possible. Tawk.to is appropriate for general support and navigation questions, not for collecting identity documents, passwords, private keys, or payment-card data.

## References

[1]: https://vercel.com/docs/domains/working-with-domains/add-a-domain "Vercel — Adding and Configuring a Custom Domain"

[2]: https://www.zoho.com/mail/zohomail-pricing.html "Zoho Mail — Pricing and edition comparison"

[3]: https://www.namecheap.com/support/knowledgebase/article.aspx/9758/2208/how-to-set-up-zoho-email-for-my-domain/ "Namecheap — How to set up Zoho email for my domain"

[4]: https://help.tawk.to/article/adding-a-widget-to-your-website "Tawk.to — Adding the tawk.to widget to your website"
