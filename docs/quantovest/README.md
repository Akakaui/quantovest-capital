# Quantovest Capital Documentation

This folder contains the reviewed implementation handoff, deployment configuration guidance, QA evidence, UI direction, and supporting design material for Quantovest Capital.

## Document map

| Document | Purpose |
| --- | --- |
| [`IMPLEMENTATION_HANDOFF.md`](./IMPLEMENTATION_HANDOFF.md) | Detailed instructions for merging, configuring, testing, and deploying the fixes. |
| [`ENVIRONMENT_PATCH_SANITIZED.txt`](./ENVIRONMENT_PATCH_SANITIZED.txt) | Sanitized environment patch. Keep all secret values in the private local/Vercel environment. |
| [`QA_REPORT.md`](./QA_REPORT.md) | Production QA report covering investor and admin reproductions before remediation. |
| [`EVIDENCE_LOG.md`](./EVIDENCE_LOG.md) | Detailed request, browser, database, storage, and local-build evidence log. |
| [`UI_DIRECTION.md`](./UI_DIRECTION.md) | Institutional trading-firm UI direction and calculator recommendations. |
| [`DOMAIN_TAWK_ZOHO_SETUP_GUIDE.md`](./DOMAIN_TAWK_ZOHO_SETUP_GUIDE.md) | Setup guide for Namecheap, Vercel, Tawk.to, and Zoho Mail. |
| [`PRODUCTION_CONFIGURATION_GUIDE.md`](./PRODUCTION_CONFIGURATION_GUIDE.md) | Business email, OAuth branding, session expiry, Tawk mobile, and approved deposit configuration. |
| [`PRODUCTION_QA_TEST_PLAN.md`](./PRODUCTION_QA_TEST_PLAN.md) | Comprehensive human-style investor/admin regression plan and release gates. |
| [`DOCUMENTATION_CATALOG.md`](./DOCUMENTATION_CATALOG.md) | Source-of-truth, archival, and temporary-file map. |
| [`DEPLOYMENT.md`](./DEPLOYMENT.md) | Existing project deployment notes. |
| [`DESIGN.md`](./DESIGN.md) | Existing project design notes. |
| [`assets/roi-calculator-ui-review.webp`](./assets/roi-calculator-ui-review.webp) | Screenshot of the updated calculator/plans presentation for visual review. |

## Current implementation branch

The reviewed source changes are on the GitHub branch `fix/quantovest-supabase-workflows-ui`. All current work in this task is being made on that branch only; `master` and `develop` are not modified.

## Recommended handoff order

First merge the branch locally or through a pull request after reviewing the source diff. Next update the local and Vercel environment values using the sanitized patch, keeping the existing secret values private. Then run the build and database smoke checks. After that, perform the authenticated investor/admin workflow tests described in the implementation handoff. Production approval, deposit/withdrawal mutation tests, and any financial workflow test data should be performed only with controlled test accounts and explicit review.

## Secret-handling rule

Never commit `.env.local`, service-role keys, database passwords, OAuth secrets, email API keys, or deployment tokens. The sanitized environment patch intentionally contains placeholders for those values.
