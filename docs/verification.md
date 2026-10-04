# Verification record

Verified locally on 4 October 2026. This is a development release, not a production launch certification.

## Completed checks

- TypeScript and Vite production/SSR builds pass. The build pre-renders 183 routes with canonical URLs, sitemap and product structured data.
- Ten catalogue/unit checks pass: 143 published identities, INR, original navigation and homepage category order, descendants, combined search/filter/sort, quantity bounds, variation matching and unavailable prices.
- The signed bridge integration suite passes against isolated WordPress and WooCommerce 8.8.7 on MariaDB and PHP 8.3. It checks unsigned requests, guest/account access, invalid login, wishlist deduplication, India address validation, cart changes, invalid coupons/products, test checkout, duplicate submission, order ownership and verified guest tracking.
- The same-origin PHP gateway suite passes: CSRF, origin checks, operation allowlist, persistent HttpOnly/SameSite cookies, private token stripping, registration, login and logout.
- PHP syntax checks pass for the gateway and plugin.
- Browser checks cover homepage, collection filters, product gallery/zoom, mobile bag action and navigation. Search, stock and price filters combine without dropping the search term. Escape closes the image modal and restores focus.
- Homepage widths 320, 390, 768, 1024, 1280 and 1440px showed no horizontal overflow. Short 320x667 and 375x667 viewports use flowing necklace content with both links reachable.
- The GSAP necklace story now seeks an Omni-generated brand film through three chapters on native scroll. The film was reviewed as a contact sheet and integrated into desktop/mobile layouts. Pause keeps the video mounted and holds its frame during scroll; resuming seeks to the current chapter. At 390x844 the toggle fits within the sticky stage; 320x667 falls back to ordinary flow. The visible caption identifies imagined jewellery, not a specific SKU.

## Limits and launch requirements

- Development test orders and accounts are isolated; no production orders, stock, uploads or database were modified.
- A real payment provider is not connected. Production order submission is disabled. Success/failure/cancellation/callback and transaction/email tests remain required for the selected gateway.
- Shipping fees, free-shipping threshold, return policy and verified WhatsApp details remain business inputs.
- The backend subdomain, Hostinger deployment mapping, backups, SSL, production mail delivery and existing account migration must be verified before launch.
- Mobile Safari, real Android devices, assistive technology and measured Core Web Vitals remain launch checks. The optional Three.js shared chunk is approximately 250KB gzip; no performance score is promised.
- Reduced-motion, reduced-transparency and WebGL-failure paths are implemented, but these preferences/failure modes have not yet been exercised across real devices.
- Independent design review was completed and its material findings addressed. The Impeccable detector ran once and returned style advisories, not an all-clear result; design tokens and documentation were reconciled manually.

See deployment.md for production sequencing and rollback constraints.
