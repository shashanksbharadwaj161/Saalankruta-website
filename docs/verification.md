# Verification record

## Release status: 9 October 2026

Saalankruta Coded Storefront **1.1.1** was installed through WordPress on **https://saalankruta.com**, replacing the already-active 1.0.0 theme. The new frontend is publicly visible on the existing Hostinger WordPress installation and uses the same WooCommerce catalogue, accounts, inventory and order store. The existing WooCommerce connection plugin remains in place. No database migration or backend subdomain was introduced.

The Hostinger full backup dated **8 October 2026, 06:42** was verified before replacement. The prior theme ZIP is retained privately for code rollback. Backup availability was checked; this release did not exercise a full production restore.

The historical 6 October development record is preserved in `verification-2026-10-06.md`. Its inactive-theme and sticky-film descriptions refer to that earlier version and are superseded by this record.

## Build and automated checks

- TypeScript checks, PHP syntax checks and the WordPress production build pass. The build includes **183 pre-rendered routes** with theme-relative assets and ordinary root shopping URLs.
- **22 automated tests pass**. Coverage includes real catalogue identities and category mappings; combined search, stock and price filters; variation and quantity boundaries; delayed address restoration without overwriting typed fields; serial wishlist updates and recovery; valid price ranges; shared API session bootstrap; safe session renewal after a pre-operation CSRF rejection; and no automatic checkout retries after ambiguous network failures.
- Cart controls now honor WooCommerce `quantity_limits.minimum`, `maximum`, `multiple_of` and `editable`. Zero available stock and read-only quantities have regression tests.
- Latest build sizes reported by Vite: CSS **104.16 kB / 21.13 kB gzip**; main JavaScript **364.46 kB / 112.06 kB gzip**; lazy shader chunk **1161.04 kB / 293.54 kB gzip**. These are bundle sizes, not measured loading times or Core Web Vitals.

## Isolated commerce integration

Current HTTP contract checks passed through the local PHP gateway on 8092 and the existing isolated WordPress/WooCommerce instance on 8091:

- All **143 products** load. Anonymous `me` returns the unauthenticated shape; anonymous order access is rejected.
- Registration, `me`, billing/shipping address objects, wishlist arrays, sequential wishlist updates and login restoration match the frontend contract.
- Saving an address returns the updated customer; non-India addresses and invalid Indian PIN codes are rejected.
- Cart add, persistent retrieval, quantity changes, product permalink/variation fields, server quantity limits, India shipping rates/selection, invalid coupon rejection, removal and empty-cart cleanup pass.
- Authentication rotates the private session cookie; logout restores anonymous access boundaries. Private customer/cart tokens do not appear in gateway JSON.
- Payment configuration has the expected shape. The pre-existing isolated `saal_test` gateway remained enabled; this run submitted no checkout and created no order.
- The uniquely named test customer and its temporary cart contents were removed. Original local fixtures, stock, orders and configuration were preserved.

Earlier isolated test-gateway checkout/idempotency checks are historical evidence in the archived record, not verification of a real payment gateway for this release.

## Production connection checks

Checks against the deployed theme's same-origin gateway passed:

- The live catalogue contains **143 product IDs**, exactly matching the release snapshot.
- Session cookies carry Secure and HttpOnly protections. Private cart/customer tokens are stripped from responses.
- Guest order access returns **401**; invalid CSRF and origin checks return **403**.
- Production checkout submission remains disabled and returns **409**.
- A separate anonymous test cart added product **1876**, retained it across requests, rejected a read-only quantity change with **400**, rejected an invalid coupon with **400**, and returned to empty after removal.

No production customer account, order or email mutations were performed. Product records and inventory were not edited. Production writes for verification were confined to the separate disposable guest cart/session. The deployment changed theme code, not the WooCommerce database or uploads.

## Public routes and sitemap

- Thirteen representative routes returned their expected status and metadata. Legacy `?p=1876` redirects permanently to its existing product URL. Private pages carry noindex and no-cache headers.
- The final 1.1.1 follow-up confirmed the homepage returns 200, an unknown route returns 404, and the published JavaScript/CSS bytes exactly match the compiled release. Logos, crest, film, poster and fonts return 200.
- The public `/sitemap.xml` returns 200 with XML containing **175 public URLs**, including exactly **143 product URLs**, with no missing products or duplicate URLs. `/wp-sitemap.xml` redirects once to this canonical sitemap.
- Version 1.1.1 fixes WordPress's early sitemap redirect, which previously looped with the theme's canonical redirect. A targeted PHP regression checks the exact sitemap bypass and preservation of unrelated WordPress 404 handling. The corrected public sitemap's bytes match the release.

## Browser and interaction checks

- Local browser checks at actual **320, 390, 768 and 1440 px** viewport widths found no horizontal document overflow.
- The redesigned film plays through native video decoding in ordinary document flow. Pause works; scrolling has no film hold, pin spacer or video seeking. Desktop scroll effects move the composition slightly without trapping page navigation.
- Local navigation, catalogue search/filter interactions and guest wishlist controls were exercised. Product data and functional errors have explicit recovery states; checkout announces its unavailable payment state before address entry.
- The public homepage was inspected at **1440 px** after replacement and visibly served the new interface with no broken images. All **24 category links** were available in the desktop mega menu; Escape closed it and search opened with correct autofocus.
- Hosted search for **“bangles”** normalized to “bangle” and returned **18 results** in both the search interface and full result page.
- Hosted **390 px** collection/product checks covered availability display and gallery zoom with Escape dismissal. At 390 px, the homepage's **375 px content viewport** had no horizontal overflow, the film played, native scrolling reached y844, playback paused offscreen, and the Bangles collection tab changed the displayed content.
- The hosted account page loaded its sign-in form at **320 px**, with no horizontal overflow in the **305 px content viewport**. No storefront console errors were observed during these checks. Desktop/mobile screenshots were saved in the local release outputs.
- Original product photography and script logo remain intact. The transparent crest is reused. The campaign film is labelled as imagined jewellery rather than an exact product representation.

## Remaining checks and business inputs

- A real payment gateway is not connected. Production ordering remains disabled. Gateway success, failure, cancellation, callbacks, duplicate submissions, stock reservations and order emails require end-to-end testing before ordering is enabled.
- Shipping fee/free-delivery threshold, return eligibility/reporting windows and a verified WhatsApp contact remain business inputs.
- All four policy configurations are still unpublished placeholders; approve and publish their business content before enabling orders.
- Existing production customer login/password reset, outbound mail, real transactions and account/order mutations were not tested in production during this release.
- Physical mobile Safari/Android devices, assistive technology and measured Core Web Vitals remain unverified. Browser viewport checks are not real-device performance certification.
- Reduced-motion, reduced-transparency, data-saving and WebGL-failure paths are implemented; their full real-device/browser matrix remains unverified.
- The source catalogue contains **69 products with neither a long nor short description**, **one product without an image**, and **three products with multiple images**. Missing specifications and photography remain content tasks; the interface does not fabricate them.
- Analytics, consent tools and payment-provider JavaScript require explicit integration because the coded theme owns its HTML rather than inheriting the old theme's frontend scripts.

See `deployment.md` for deployment paths, payment gates and rollback.
