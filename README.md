# Saalankruta custom storefront

React, TypeScript and Vite storefront, packaged as a minimal WordPress theme on the existing Hostinger PHP hosting at **saalankruta.com**. GitHub Actions compiles the frontend; WordPress serves it without a Node.js process. The same WooCommerce installation remains responsible for products, stock, customers and orders. No database or backend-domain migration is required.

## Local development

Use Node 22 and pnpm 11.25.0.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm test
pnpm build
pnpm build:wordpress
```

The preview runs at `http://127.0.0.1:5174`. A cached catalogue contains 143 original products and 24 source categories. Real account/cart/checkout operations require the PHP integration. The development proxy targets an isolated PHP gateway at `127.0.0.1:8092`; never point a test gateway at production.

`pnpm catalogue` refreshes public catalogue snapshots from `CATALOGUE_ORIGIN`. Both builds pre-render the homepage, product and category routes with canonical metadata, structured data, sitemap and legacy product-ID redirects. Private account/cart routes are noindex. `pnpm build:wordpress` creates `.wordpress-release/saalankruta`, ready for `wp-content/themes/saalankruta`. `pnpm build` retains the separate PHP-hosted alternative. Runtime prices, stock and cart totals come from WooCommerce.

## Code map

- `src/`: storefront, account and checkout pages, accessible native dialogs and decorative effects.
- `public/`: original branding, catalogue snapshot, verified store information and pending business policies.
- `server/`: protected same-origin PHP gateway and direct WordPress adapter. Persistent session files stay outside the document root; the separate-host alternative also requires a private configuration file.
- `wordpress-theme/`: PHP loader for the compiled frontend. The UI remains coded in React rather than assembled with a WordPress page builder.
- `plugin/`: WooCommerce bridge, customer sessions, wishlist, order verification, rebuild hooks and isolated test gateway.
- `scripts/`: catalogue reconciliation and build-time React rendering.
- `tests/`: catalogue/purchasing boundary tests and isolated WooCommerce HTTP integration checks.
- `docs/`: deployment, current verification and visual integration records.

Read `PRODUCT.md` and `DESIGN.md` before changing catalogue order or design conventions. Licences for adapted shaders and self-hosted fonts are preserved in `licenses/`.

## Deployment status

The live WordPress site has not been replaced. Theme/plugin installation, a verified current backup, preview approval, email delivery, approved shipping/return values and payment gateway testing remain launch tasks. Ordering in the new frontend is disabled by default.

Follow `docs/deployment.md`. Deploy theme files only into `public_html/wp-content/themes/saalankruta`, never over the WordPress root. Keep the existing active theme until review is complete. The deployment branch contains the compiled theme and PHP gateway; install the commerce plugin separately. Never commit payment or database secrets.

Actions uploads the compiled theme artifact. Publishing the `deploy` branch is enabled through `PUBLISH_DEPLOY_BRANCH=true`; this does not activate the WordPress theme or replace the live store. The Hostinger GitHub app now has access to this repository.
