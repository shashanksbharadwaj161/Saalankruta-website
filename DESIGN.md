---
name: Saalankruta Royal Boutique
description: A cinematic Indian jewellery boutique in rose, wine and gold
colors:
  primary: "#7c3158"
  royal: "#351326"
  gold: "#c5a66f"
  porcelain: "#fff9fc"
  ink: "#351829"
  muted: "#675561"
  line: "#decbd5"
  photograph: "#f0e6ed"
  canvas: "#f5e4ec"
  shaderRose: "#f5e4ec"
  shaderHighlight: "#fce8f1"
  shaderFold: "#dc91b7"
  shaderGold: "#f1dba8"
  glass: "#ffffff"
typography:
  display:
    fontFamily: "Bodoni Moda, Georgia, serif"
    fontWeight: 400
    lineHeight: 1.08
  body:
    fontFamily: "Jost, sans-serif"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  disclosure: "4px"
  control: "0px"
  card: "0px"
  overlay: "4px"
  panel: "0px"
spacing:
  unit: "8px"
---

## Overview

**Creative North Star: "Jewellery in Motion"**

THESIS: An Indian jewellery boutique with cinematic presence and the clarity of a modern shop. OWN-WORLD: one continuous rose canvas, wine typography, polished glass, fine gold edges and accurate product photography. STORY: a horizontal campaign cinema, an editorial introduction, a balanced visual collection index, actual products and the Bengaluru boutique. OPENING: a stable horizontal headline and shopping action sit above the intact film beneath one compact glass header. A short cinema-only pin holds the film, caption and controls beneath the header while native scrolling seeks through the necklace motion; the media scales to fit the viewport without cropping. FORM: consistent page gutters, equal photographic frames, Bodoni headlines and quiet Jost commerce controls. The owner's latest feedback favours a coherent composition with visible, responsive motion over staggered cards, asymmetric featured products and contrasting dark bands.

## Colors

Pink remains the recognisable brand action colour. Wine supplies high-contrast lettering rather than a dark frame around the campaign. A shared pale-rose canvas supports the opening title, horizontal film and its controls. Rose-and-gold shader folds provide ornamental atmosphere around the cinema, behind the boutique introduction and at the visit section. The film and catalogue photographs retain their original colours. Gold marks borders and small details. Porcelain supports accurate photography and readable shopping pages. The footer continues the pale surface language without a contrasting dark band.

## Typography

Bodoni Moda supplies a formal jewellery editorial voice. Jost gives prices, filters and account forms clear contemporary rhythm. Small labels remain readable, with restrained letter spacing.

## Layout

Preserve every category and product route. The owner explicitly requested new headers, layouts and a more organised menu, authorising a new browsing hierarchy. One Collections disclosure opens a six-group mega menu with clear subcategory columns and real photography. Mobile uses a full-screen accordion menu. The original header logo is positioned at the viewport centre independently of unequal left and right controls; narrow phones use a smaller mark to preserve 44px utility targets.

Use the shared `--page-gutter: clamp(18px, 4.5vw, 64px)` for the mobile cinema inset, page content, brand row and footer grid. The narrowest header has a deliberate control inset to prevent overlap. Collection tiles form balanced four-column desktop and two-column mobile grids with equal square photographs. Product edits use equal four-column/two-column grids and consistent 4:5 image frames. Do not stagger card positions or enlarge the first product into an asymmetric feature. Account, cart and checkout headings remain compact; the login form is a direct usable form rather than a large editorial panel. Product and checkout pages prioritise readable information over decoration.

## Elevation & Depth

**The Display Case Rule.** Glass belongs on navigation and photographic overlays. Use translucent porcelain, blur, a fine white highlight and gold edge; maintain an opaque fallback. Shopping forms and product information remain solid surfaces. Shader effects are gated by visibility and document activity. The supplied crest uses an exact-pixel transparent variant in the story page and footer; the purple background is removed without redrawing the white/gold artwork. A softly fading wine scrim supports its contrast, with no hard square background. Its single footer entrance honours reduced motion. The former liquid-logo overlay is inactive. Honour reduced-motion and reduced-transparency preferences with a static CSS atmosphere and the original marks. Checkout has no decorative animation.

One fixed `waterPlane` scene connects the homepage and story page and sits behind the glass header. Passive, frame-coalesced pointer, touch and wheel input drive a damped spring and decaying gesture energy. Frequency and density remain stable so folds move smoothly rather than abruptly changing their structure. A parent-held snapshot retains the phase across visibility and route gating; paused scenes restore the frozen composition after remounting. Homepage and story-page Pause motion controls share state. Shopping routes use a static rose header backdrop and solid content surfaces. Physical touch, Safari and measured device performance remain verification work.

## Shapes

Editorial frames and primary shopping controls have sharp corners. Small utility controls may be circular; small glass disclosures use a 4px radius. Product cards remain open and unboxed. Catalogue photographs retain the actual product appearance. The film is always framed at 16:9 without an arch or cropped pendant.

## Components

Desktop navigation uses one compact header: Collections and Our story, the centred original logo, then icon utilities with accessible names. Its mega menu has a keyboard-operable group tab rail, meaningful category columns and an actual product image. Escape and the close control return focus to Collections. Mobile uses a full-screen accordion menu with a persistent close bar. Search has a dedicated dialog. Purchase buttons use brand pink with high contrast. Wishlist controls have touch-sized targets. Image overlays use glass without obscuring product details.

## Do's and Don'ts

- Use original product photography, exact names and authoritative prices.
- Keep category/product URLs and the complete catalogue accessible; presentation may be reorganised.
- Maintain shared gutters, uniform category/product image ratios and balanced grid alignment.
- Keep the pendant visible in the wide cinema crop within the rose canvas; do not introduce a separate dark campaign or footer band.
- Use liquid glass sparingly where it creates depth.
- Do not fabricate customer proof, product specifications or shipping promises.
- Do not put low-contrast gold text on porcelain or use decorative motion on checkout.

## Implementation dials

Design variance 7, motion intensity 6 on editorial browsing and 0 in commerce forms, visual density 3. The owner's request for kinetic luxury is now paired with an explicit preference for uniform composition. Fixed light rose surfaces, a shared rose cinema canvas and wine text preserve the supplied brand direction. Bodoni Moda's fine contrast and formal letterforms suit this jewellery brand; Jost keeps product and form information clear. Glass is a web approximation, not an Apple platform component.

Glass highlights use white alpha layers; shadows use low-opacity wine. Word masks have explicit spacing and descender clearance. One-time word entrances establish hierarchy and image masks introduce collections. The film seeks softly on native scroll; its headline and caption remain stable. The introduction copy aligns beneath its heading rather than floating in a displaced column. Controls and prices stay stable. Native scrolling is retained; motion leaves clean up their observers, GSAP contexts and media queries.

## Jewellery motion

The opening uses an Omni-generated campaign film, edited to 5.5 seconds with detailed gold settings and rose stones. The visible caption identifies imagined brand jewellery; it is never an exact SKU representation. At the owner's request, the Gemini sparkle was removed from an empty background region using contextual interpolation; the jewellery pixels were not retouched. The original master is retained privately. The film fills the shared page gutters. Desktop uses a wide, pendant-focused cinema crop rather than shrinking the whole frame into a narrow column; mobile retains the full image where its natural ratio fits. The title sits above the film rather than overlaying jewellery. A short native sticky track holds the cinema while ordinary scrolling seeks the film, without GSAP pin spacers or scroll interception. Homepage collection grids also fill the shared gutters on wide screens. Video loads near the viewport and does not render continuously while stationary. Pause motion freezes the current film frame and places the shared shader canvas into a demand frame loop. Reduced motion retains the poster and static copy in ordinary flow. The source is 1280x720; no higher-resolution export is claimed. Real-device touch, Safari behaviour and Core Web Vitals remain launch verification work.
