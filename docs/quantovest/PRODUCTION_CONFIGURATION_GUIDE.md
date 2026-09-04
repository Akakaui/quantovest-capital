# Quantovest Capital Production Configuration Guide

## Business email with Zoho Mail and the quantovests.com domain

The platform uses a single Zoho Mail business mailbox (`support@quantovests.com`) as both the transactional sender and the support inbox. Set up the Zoho Mailbox, then create an app-specific password in Zoho for SMTP authentication (the Zoho sign-in password is not valid for SMTP by default). Configure the Vercel/server environment variables `ZOHO_SMTP_HOST` (`smtp.zoho.com`), `ZOHO_SMTP_PORT` (`465`), `ZOHO_SMTP_USER` (`support@quantovests.com`), `ZOHO_SMTP_PASS` (the app-specific password), and `EMAIL_FROM` (`Quantovest Capital <support@quantovests.com>`). Keep these server-only; never expose them in the browser or commit them.

Add SPF, DKIM, and DMARC exactly as Zoho provides them in the DNS records. Also configure Zoho as the custom SMTP in Supabase **Authentication → SMTP Settings** so signup confirmation and password-reset emails are sent from `support@quantovests.com` rather than a Supabase/Resend default.

Test one message for deposit submission, KYC decision, withdrawal decision, ROI publication, security alert, and admin broadcast. Confirm the visible From address is `support@quantovests.com` and that replies arrive in the Zoho mailbox.

## Google OAuth branding

The text shown in the Google account chooser is not controlled by the button label in the Next.js application. It is controlled by the OAuth provider configuration. Update the Supabase project display/branding name and the Google Cloud OAuth consent-screen application name, support email, authorized domain, logo, and production redirect URI. Then verify the Supabase Google provider uses the correct Google OAuth client and that the callback URL uses the final custom domain. Test in an incognito browser after clearing the old OAuth account chooser state.

Do not put database hostnames, service keys, or Supabase project secrets into the public application label. The application’s visible brand should be Quantovest Capital; provider credentials remain private configuration.

## Session expiry and sign-out

The application branch sets a seven-day cookie max-age for browser and server Supabase clients and keeps global sign-out enabled for both investor and admin sidebars. The production test must still verify actual expiry using the deployed Supabase Auth session policy, because provider refresh-token behavior and existing cookies can outlive a source-code change until the user signs out or the cookie is replaced.

Verify that an expired session redirects to login, that Back does not reveal protected data, that API requests return a safe unauthorized response, and that global sign-out invalidates other sessions according to the selected Supabase policy.

## Tawk.to on a phone

Install the Tawk.to mobile app, sign in with the same account used for the Quantovest Capital property, select the property, and enable push notifications. Keep the agent status Available while monitoring support. Use Inbox to accept a chat, use a saved Shortcut, add a tag, send the response, and close the conversation. Set status Away when you finish support so the website shows the offline form. Do not request passwords, one-time codes, payment-card data, wallet private keys, or identity documents in chat.

## Approved deposit methods

Only these payment methods are supported:

| Asset | Network | Address |
| --- | --- | --- |
| BTC | Bitcoin / BTC | `1E4WHvud9kYYT8vqEYtn9bWR1sVvNjFgLv` |
| USDT | TRON / TRC-20 | `TNFFjVdJCRcwxNjcj3nUJEVxwGfonK8jh2` |

Before production publication, remove any accidental spaces from the USDT transcription only after comparing it against the source wallet and independently scanning the QR code. The final approved address must be entered through the admin Deposit Operations page, paired with the matching QR-only asset, saved, reloaded, and verified from the investor page. Never assume a QR image is correct solely because it looks visually valid; scan it with an independent wallet application and compare both address and network.

## References

[1]: https://www.zoho.com/mail/help/adminconsole/steps-to-configuring-spf-dkim-dmarc.html Zoho Mail SPF/DKIM/DMARC configuration
[2]: https://supabase.com/docs/guides/auth/social-login/auth-google Supabase Google social login  
[3]: https://support.google.com/cloud/answer/10311615 Google OAuth consent-screen configuration  
[4]: https://help.tawk.to/article/tawk-to-mobile-app Tawk.to mobile app documentation  
