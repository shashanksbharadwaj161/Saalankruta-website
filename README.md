# Saalankruta custom storefront

React, TypeScript and Vite storefront with WooCommerce as the authoritative commerce backend. The source runs without a Node server in production: GitHub Actions builds static pages and the PHP gateway is hosted beside them on Hostinger.

## Local development

Use Node 22 and pnpm 11.25.0.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm test
pnpm build
```

The preview runs at `http://127.0.0.1:5174`. A cached catalogue contains 143 original products and 24 source categories. Real account/cart/checkout operations require the PHP integration. The development proxy targets an isolated PHP gateway at `127.0.0.1:8092`; never point a test gateway at production.

`pnpm catalogue` refreshes public catalogue snapshots from `CATALOGUE_ORIGIN`. `pnpm build` generates the same React storefront as static HTML for the homepage, product and category routes, plus sitemap, canonical metadata, structured data and a PHP legacy product-ID redirect. Private account/cart routes are noindex. Dynamic stock, prices and totals are refreshed through the signed backend.

## Code map

- `src/`: storefront, account and checkout pages, accessible native dialogs and decorative effects.
- `public/`: original branding, catalogue snapshot, verified store information and pending business policies.
- `server/`: same-origin PHP gateway. Private config and persistent session files stay outside the document root.
- `plugin/`: signed WooCommerce bridge, customer sessions, wishlist, order verification, rebuild hooks and isolated test gateway.
- `scripts/`: catalogue reconciliation and build-time React rendering.
- `tests/`: catalogue/purchasing boundary tests and isolated WooCommerce HTTP integration checks.
- `docs/`: deployment, current verification and visual integration records.

Read `PRODUCT.md` and `DESIGN.md` before changing catalogue order or design conventions. Licences for adapted shaders and self-hosted fonts are preserved in `licenses/`.

## Deployment status

The live WordPress site has not been replaced. Hosting/backend migration, staging email delivery, approved shipping/return values and payment gateway testing remain launch tasks. Production checkout is disabled by default in both integration layers.

Follow `docs/deployment.md` rather than uploading source or overwriting the WooCommerce installation. Payment and database secrets must never be committed. The deployment branch contains only compiled public files and the PHP gateway; install the backend plugin separately.

Actions always uploads the verified build artifact. Publishing the `deploy` branch is opt-in through repository variable `PUBLISH_DEPLOY_BRANCH=true`, after its Hostinger destination has been checked. The initial source push therefore does not publish a hosting replacement.

