# Quantovest Capital Documentation Catalog

## Source of truth

| File | Keep? | Purpose |
| --- | --- | --- |
| `README.md` | Keep | Repository entry point and links to the maintained documentation set. |
| `PRODUCTION_QA_TEST_PLAN.md` | Keep | Human-style investor/admin regression plan and sign-off matrix. |
| `IMPLEMENTATION_HANDOFF.md` | Keep, review quarterly | Engineering handoff and historical implementation context. |
| `DEPLOYMENT.md` | Keep, update before each release | Supabase, Vercel, authentication, storage, Resend, Tawk, and production deployment requirements. |
| `DOMAIN_TAWK_ZOHO_SETUP_GUIDE.md` | Keep | Namecheap, custom domain, Tawk.to, and Zoho Mail setup. |
| `ENVIRONMENT_PATCH_SANITIZED.txt` | Keep privately | Sanitized variable checklist; never add real secrets. |
| `QA_REPORT.md` | Keep | Root-cause findings and remediation status. |
| `EVIDENCE_LOG.md` | Keep | Timestamped evidence from testing and production review. |
| `UI_DIRECTION.md` | Keep | Product/UI direction and institutional visual recommendations. |
| `DESIGN.md` | Keep if actively used | Current visual language and component conventions. |

## Archive or remove from the active documentation surface

Historical prompts, duplicate audit reports, copied screenshots, and one-off agent notes should not remain in the repository root or be linked as operational instructions. If a historical record is needed, place it under `docs/quantovest/archive/` with a date and a short reason. The QR source screenshots should remain outside the repository unless the owner intentionally stores them as evidence; the application should use QR-only assets and wallet data, not full exchange screenshots.

The file `/home/ubuntu/tawk-support-configuration-research.md` is a sandbox research note rather than repository documentation. It should not be committed. Temporary screenshots, raw `.env` files, browser HTML dumps, and local build logs must remain untracked and outside the repository.

## Documentation rules

Every production-affecting setting must have one owner document. Wallet methods and addresses belong in the deployment/operations section and must be changed through the authenticated admin workflow. Test evidence belongs in `EVIDENCE_LOG.md`. Product behavior and release criteria belong in `PRODUCTION_QA_TEST_PLAN.md`. Provider instructions should include an official URL and a date checked. Real passwords, service-role keys, database URLs with passwords, OAuth client secrets, and Resend API keys must never be committed.

## Current implementation note

The current branch is `fix/quantovest-supabase-workflows-ui`. BTC and USDT TRC-20 are the only approved deposit methods. The supplied QR screenshots are source material; only QR-only crops should be uploaded to private `quantovest-media` through the admin UI. The Google account chooser’s Supabase project label is provider configuration, not an application label; change the Supabase project display name and Google OAuth consent-screen branding separately. Resend sender identity requires a verified custom domain and an `EMAIL_FROM` value such as `Quantovest Capital <notifications@yourdomain.com>`.
