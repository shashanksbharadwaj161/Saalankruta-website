# WordPress / Hostinger deployment and rollback

## Existing WordPress hosting

**Current state, 9 October 2026:** the Saalankruta Coded Storefront theme **1.1.1** is active and publicly visible at **saalankruta.com**. This release replaced active version 1.0.0 through WordPress's theme ZIP replacement flow. The same WooCommerce integration plugin and store remain in place. Production gateway checks confirmed all 143 snapshot product IDs, private sessions, guest access boundaries and disabled checkout. See `verification.md` for exact checks and limits.

The deployment target is **saalankruta.com** on the existing Hostinger Premium PHP plan. The coded frontend is compiled in GitHub Actions and loaded by a minimal WordPress theme. The server requires no Node.js runtime. Keep the current WordPress installation, database, product IDs, stock, customers, orders and uploads in place. Do not use Auto Installer, create a new store, or move the database to a backend subdomain.

The Hostinger GitHub app's Saalankruta repository access was saved and verified on 6 October 2026. Its deployment must use:

- Repository: `shashanksbharadwaj161/Saalankruta-website`
- Branch: `deploy`, containing the **WordPress theme build**
- Directory: `public_html/wp-content/themes/saalankruta`

Never deploy source `main` or compiled files over `public_html`. The earlier `saal-preview` directory and preview subdomain are not required by this WordPress deployment. The Git destination above is the optional code-delivery path; the 1.1.1 release used the WordPress ZIP flow. Installing an additional theme does not activate it, but replacing files in an already-active theme changes the public storefront immediately.

## Backup, preview and compatibility

1. Verify a current full backup and retain the outgoing theme package before replacing active code. The 1.1.1 release verified Hostinger's full backup dated **8 October 2026, 06:42** and retained the previous theme ZIP privately. No new on-demand full backup or production restore exercise is claimed. For later releases, recheck backup age and coverage of the database, uploads, configuration, plugins and active theme. Keep backups outside Git and public webroots.
2. Use an isolated WordPress copy for preview and commerce tests. Disable real gateways, external scheduled integrations and customer mail in the copy. Never import its test users, orders or inventory into production.
3. Verify production PHP extensions, filesystem ownership, TLS, permalink routing, REST support and outbound mail. The direct adapter was tested with isolated WooCommerce 8.8.7 and PHP 8.3; production was inspected at PHP 8.1. Required WordPress/WooCommerce/plugin updates must first be tested in isolation.
4. The coded theme is now active. Review changes in the isolated WordPress environment before replacing its public files. Keep the previous coded-theme package available for immediate rollback; the former Hello Elementor theme is a separate fallback only after confirming it remains installed and usable. Preserve access to `/wp-admin/` and `/wp-json/`.

## Build and install

Run the frozen dependency install, catalogue reconciliation, tests, PHP lint and `pnpm build:wordpress`. The result is `.wordpress-release/saalankruta`. Install the theme folder through Hostinger's deployment connection or an installable theme ZIP. Install `plugin/saalankruta-headless.php` separately inside `wp-content/plugins/saalankruta-headless/` and activate that plugin after the backup and compatibility check.

The theme serves pre-rendered customer pages at ordinary root URLs, including `/shop/` and `/product/<slug>/`. Public branding, fonts, videos and JavaScript use `/wp-content/themes/saalankruta/`. The root sitemap and robots response are served by the theme; WordPress's sitemap entry redirects to `/sitemap.xml`. Version 1.1.1 bypasses WordPress's early sitemap 404 handler for that exact existing compiled file, preventing a redirect loop. Verify the root XML response after deployment. Legacy `?p=` product links redirect using existing product IDs. The root WordPress rewrite configuration stays in place.

The generated theme's `api/wordpress-host.php` loads this installation's WordPress and invokes the scoped commerce bridge internally, following the gateway's method, CSRF, origin, size and rate checks. Existing WordPress authentication salt remains server-only. This mode requires no new WooCommerce API keys, shared bridge secret, separate backend domain or remote network bridge. Cart tokens and customer session tokens remain in server sessions and are stripped from browser responses. Store API owns the cart session; ordinary WordPress frontend cart initialization is deferred for these protected requests.

Sessions must be writable outside `public_html`, normally `/home/u574240605/domains/saalankruta.com/saal-sessions`. An explicit `SAALANKRUTA_SESSION_PATH` override must also be outside every public webroot. Cookies are Secure, HttpOnly and SameSite=Lax in production.

The compiled frontend owns its HTML and does not inject the old theme's `wp_head` / `wp_footer` scripts. Existing server-side WooCommerce operations remain, but analytics, consent tools and gateway JavaScript need explicit integration and verification before launch.

## Payments and catalogue updates

The active coded frontend refuses order submission unless `SAALANKRUTA_ORDERING_ENABLED` is explicitly enabled in `wp-config.php`. Leave it false (or undefined) until a gateway adapter and transaction tests are complete. `SAALANKRUTA_PAYMENT_METHODS` must list only verified methods. The 1.1.1 production check confirmed the coded storefront's checkout API rejects submission with **409**. Its browsing, account and bag operations remain available.

For an isolated development installation only, `WP_ENVIRONMENT_TYPE=local`, `SAALANKRUTA_TEST_GATEWAY=true` and `SAALANKRUTA_PAYMENT_METHODS=['saal_test']` enable the no-charge test adapter. It is refused in production.

Actions reconciles the public catalogue every six hours and prepares `deploy`. `CATALOGUE_ORIGIN` should remain the same WooCommerce store origin. Product changes can trigger debounced repository dispatches using an optional narrowly scoped `SAALANKRUTA_GITHUB_TOKEN` stored privately in WordPress configuration. Never place it in the theme, repo or public files. Runtime prices, inventory and cart totals refresh directly from WooCommerce even before a rebuild.

## Requirements before enabling online ordering

- Reconcile all 143 baseline products and additions, category routes, live prices/stock, original media and redirects.
- Supply and approve shipping fee/free-delivery threshold, return/reporting policy and WhatsApp contact. Configure the authoritative WooCommerce India shipping zone and rates.
- Complete guest checkout, optional account creation, existing customer login, password reset, wishlist merging, account ownership, tracking and email verification. Account/address/wishlist contracts passed against the isolated installation; no production account/order/email mutations were performed for the 1.1.1 release.
- Select a gateway compatible with WooCommerce Store API. Implement required payment data, callback/webhook handling and approved redirect origins. Test success, cancellation, failure, retries, duplicate submissions, stock reservations and order emails before enabling ordering.
- Check real mobile Safari and Chrome, keyboard controls, accessibility preferences and measured Core Web Vitals on Hostinger. Previous local layout checks are not a production performance certification.
- For each later theme update, review the isolated preview and verify the rollback package before replacing the active version. Flush WordPress permalink rules only if required; do not replace the root `.htaccess` with the standalone build's file.

## Rollback

For a 1.1.1 frontend regression, replace the active `saalankruta` theme files with the privately retained previous compiled theme ZIP, then recheck the homepage, shopping routes and gateway. This restores code without rolling back customers, inventory or orders. Switching to a separate former WordPress theme is an alternative only after verifying that theme remains usable. Revert bridge code/config independently if the problem is in that layer; this release did not replace the bridge. Never overwrite a production database with an old backup over newer orders or inventory changes; reconcile those changes first.

## Optional separate PHP-hosted mode

`pnpm build` still produces the earlier standalone alternative. It requires a private `server/config.example.php` copy outside the webroot and a matching `SAALANKRUTA_BRIDGE_SECRET` in WordPress. It is not the current deployment target. Do not mix its release or root rewrite file with the WordPress theme build.
