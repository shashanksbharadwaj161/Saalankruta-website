# Hostinger deployment and rollback

## Preserve the existing store

1. Export and verify a restorable database backup, including users, orders, stock and all plugin tables. Back up `wp-content/uploads`, configuration and existing webroot. Keep the backup outside Git/public_html.
2. Create an isolated backend/preview using a copied database. Disable real payment gateways, scheduled external integrations and customer emails in the copy. Test required WordPress/WooCommerce/PHP updates there first. Current integration compatibility was exercised against WooCommerce 8.8.7 with PHP 8.3 and MariaDB; this does not certify the existing production plugins.
3. Verify PHP extensions `curl`, `openssl`, `json`, database connectivity, TLS certificates, working WordPress REST API, outbound email delivery and Hostinger directory ownership.
4. Move the existing WooCommerce installation to the backend webroot as a coordinated migration. Preserve the database, product IDs, order/customer identities and uploads. Update WordPress site/home URLs and media references using a serialization-aware migration tool. Verify existing media URLs or retain redirects. Do not import test orders, customers or stock into production.

## Backend plugin

Install `plugin/saalankruta-headless.php` in its own WordPress plugin directory. Configure privately in the backend's `wp-config.php`:

```php
define('SAALANKRUTA_BRIDGE_SECRET', 'YOUR_RANDOM_SECRET_OF_AT_LEAST_32_BYTES');
define('SAALANKRUTA_STOREFRONT_URL', 'https://saalankruta.com');
define('SAALANKRUTA_ORDERING_ENABLED', false);
define('SAALANKRUTA_PAYMENT_METHODS', []);
```

Generate the secret privately and use the same secret in the PHP frontend config. The optional `SAALANKRUTA_GITHUB_TOKEN` must have only the repository access needed for catalogue rebuild dispatches. It stays on the backend. Product changes trigger a debounced rebuild; Actions also reconciles every six hours. Category/media changes are picked up by scheduled reconciliation.

For an isolated development installation only, `WP_ENVIRONMENT_TYPE=local`, `SAALANKRUTA_TEST_GATEWAY=true` and `SAALANKRUTA_PAYMENT_METHODS=['saal_test']` enable the no-charge test adapter. It is refused in a production WordPress environment.

## Frontend

Copy `server/config.example.php` outside `public_html` as `saalankruta-config.php`; replace placeholder values privately. The default session directory is a private sibling `saal-sessions`, with thirty-day cookie/session storage. Ensure Hostinger can create it, or set `SAALANKRUTA_SESSION_PATH` to an existing private writable directory. Cookies are Secure, HttpOnly and SameSite=Lax in production.

For a nested Hostinger preview, the PHP gateway walks up to the enclosing `public_html` and keeps both default paths outside that main webroot. Explicit path overrides must also remain outside every public webroot. The `preview.saalankruta.com` hostname receives an `X-Robots-Tag: noindex, nofollow` response header.

Hosting inspection on 6 October 2026 created `preview.saalankruta.com` at `/home/u574240605/domains/saalankruta.com/public_html/saal-preview`. Its private default files belong in `/home/u574240605/domains/saalankruta.com/`, not the preview folder or the main WordPress directory. `PUBLISH_DEPLOY_BRANCH=true` enables compiled releases in GitHub; it does not by itself deploy to Hostinger. The existing Hostinger GitHub app currently exposes a different repository and needs Saalankruta-specific access before connection. Do not select that other repository.

Set the repository's `CATALOGUE_ORIGIN` Actions variable to the verified backend origin after migration. Build on `main`; the workflow prepares `deploy` and a downloadable storefront artifact. Connect Hostinger Git to `deploy` in the isolated preview first. Keep build output and the WooCommerce backend in different directories. Hostinger requires no Node process.

Run `pnpm install --frozen-lockfile`, catalogue reconciliation, tests, PHP lint and build before promotion. Retain the previous compiled release as a rollback package. Document the exact Hostinger paths before configuring Git; do not deploy over an existing WordPress webroot until the backend migration and rollback have been verified.

## Launch requirements

- Verify all 143 baseline products and subsequent additions, live prices/stock, all category links, media, canonical URLs, sitemap and legacy `?p=` redirects.
- Supply shipping fee/free-delivery threshold, return/reporting policy and verified WhatsApp number; enter shipping zones/rates in WooCommerce and approve policy content.
- Enable WooCommerce guest checkout and optional account creation; verify password reset/account setup, order emails and existing customer logins on staging.
- Select a gateway compatible with WooCommerce Store API. Add its required payment-data adapter, webhook/callback integration and allowed redirect origins. Test success, cancellation, failure, retries, duplicate submissions, stock reservation and order emails before enabling ordering in both PHP config and backend constants.
- Verify mobile Safari and Chrome, keyboard navigation, reduced-motion/transparency fallbacks, 320–1440px layouts and measured Core Web Vitals on the real Hostinger preview.

## Rollback

Restore the previous compiled frontend and keep checkout disabled if a commerce issue appears. Restore backend code/config independently. Do not restore an old production database over new orders or stock; any database recovery requires reconciliation of activity since the backup. Keep the old storefront release available until the new gateway and email flows are stable.
