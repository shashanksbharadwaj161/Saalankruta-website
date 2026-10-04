# Visual integrations

The storefront uses a custom royal boutique system, retaining the original logo, pink/gold identity and category order.

- Taste: `Leonxlnx/taste-skill`, installed locally as `design-taste-frontend`. Its editorial guidance applies to browsing and brand pages; checkout stays a clear, conventional form.
- ShaderGradient: `@shadergradient/react`, Three.js and React Three Fiber, installed with pnpm. `RoyalAtmosphere` loads a rose/gold shader leaf only when visible and motion is allowed. CSS remains available while loading, if WebGL fails, or with reduced motion/transparency.
- Liquid Glass JS: the MIT rounded-rectangle distance and edge/rim equations from `dashersw/liquid-glass-js` are adapted in `glass-edge.frag`. Native DOM links/buttons and CSS backdrop blur remain functional. The original demo captures the entire document with html2canvas; this storefront does not capture page or customer contents.
- Liquid Logo: the MIT shader from `collidingScopes/liquid-logo` supplies a subtle footer reflection over the unchanged original PNG. It runs only in view and honours reduced motion. Header branding remains the original image.
- Navigation inspiration: [Navbar Gallery](https://www.navbar.gallery/), particularly compact single-row chrome, dropdown disclosures and full-screen mobile navigation.
- Art direction reference: [Basement Studio showcase](https://basement.studio/showcase#list). Borrow deliberate scale, interactive polish and compositional restraint rather than its black studio identity.

These graphics projects are code dependencies or vendored shader adaptations, not ChatGPT account plugins. Taste is a local Codex skill; no claim is made that it was installed into cloud ChatGPT. MIT notices for adapted code are in `licenses/`.

Performance: ShaderGradient is isolated in a dynamic chunk. Its compressed size must be accounted for in launch performance checks. Effects are ornamental, never gate a purchase action, and do not alter product photographs.

## Scroll-driven jewellery motion

The Necklace Story now uses a custom art-directed film generated through the owner-authorised Google Flow workspace using Omni 1.1 Flash, 16:9, eight seconds, 1280x720. It depicts imagined ornamental jewellery, identified in the visible caption, not a purchasable SKU. The first procedural 3D necklace has been replaced. Original catalogue photography remains unchanged. No media or account credentials were embedded in the source. The signed temporary media URL was downloaded through the browser and is not a runtime dependency.

GSAP and ScrollTrigger seek the film through three chapters. The final close-up is trimmed to 5.5 seconds to preserve pendant framing. The muted MP4 is encoded with a keyframe every twelve frames and fast-start metadata, with audio removed. A generated poster stays visible before loading, with reduced motion, or after a media error. The stage uses native CSS sticky positioning; if its complete content cannot fit beneath the header it switches to ordinary flow and inline playback. A motion toggle freezes the current frame rather than resetting it. Video loads only near the viewport and is stopped offscreen or when the document is hidden.

The browser offered a 1080p upscale; its export was requested but had not been retrieved at this verification point. No 1080p or 4K claim is made for the committed 720p film. The final media payload and real-device decode/seeking must be measured at launch.

The references supplied by the owner were reviewed:

- [HorizonX ARQ-01](https://horizonx.so/explore/arq-01-carry-the-horizon): chapter-based product storytelling and scroll-controlled composition. Its paid code/image sequence was not copied.
- [Lapa Ninja ecommerce motion](https://www.lapa.ninja/motion/ecommerce/): product-focused reveal/transition patterns. The gallery was inspected through the browser because web text retrieval was unavailable; several embedded videos reported playback errors.
- [21st.dev](https://21st.dev/): glass and WebGL component composition. The implementation is custom source, without adopting an unrelated template or purchasing a component.
- [GSAP ScrollTrigger documentation](https://gsap.com/docs/v3/Plugins/ScrollTrigger/): scrub, media-query cleanup and viewport-triggered reveals.

Motion preferences are respected at runtime. Without motion or video decoding, the film poster and useful static copy remain visible. Desktop and mobile are composed separately. Small-height windows use a normal flowing section. Checkout, account forms and order verification retain their conventional behaviour.
