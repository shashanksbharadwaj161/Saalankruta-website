---
name: Saalankruta Royal Boutique
description: A contemporary jewellery salon in rose, wine and gold
colors:
  primary: "#7c3158"
  royal: "#3f1830"
  gold: "#c5a66f"
  porcelain: "#fcf8fb"
  ink: "#352b33"
  muted: "#675561"
  line: "#e2cfd9"
  photograph: "#f0e6ed"
  shaderRose: "#f5e4ec"
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
  control: "6px"
  card: "8px"
  overlay: "12px"
  panel: "16px"
spacing:
  unit: "8px"
---

## Overview

**Creative North Star: "The Rose Salon"**

THESIS: An Indian jewellery boutique with the intimacy of a private salon and the clarity of a modern shop. OWN-WORLD: rose silk, polished glass, fine gold edges and accurate product photography. STORY: welcome, explore the original collections, inspect a piece, purchase with confidence. FIRST VIEWPORT: a rose silk editorial introduction beside an original necklace photograph, with a compact glass navigation above. FORM: fine serif headlines, pale pink porcelain product grids, restrained rectangular controls and softly curved glass overlays.

## Colors

Pink remains the recognisable brand action colour. Wine supplies high-contrast lettering and announcement chrome. Rose-and-gold shader folds provide the homepage atmosphere. Gold marks borders and small details. Porcelain supports accurate photography and readable shopping pages.

## Typography

Bodoni Moda supplies a formal jewellery editorial voice. Jost gives prices, filters and account forms clear contemporary rhythm. Small labels remain readable, with restrained letter spacing.

## Layout

Preserve original navigation and homepage collection order. Spacious desktop product grids become two columns on mobile. Compact header controls lead to a full-screen mobile navigation. Product and checkout pages prioritise readable information over decoration.

## Elevation & Depth

**The Display Case Rule.** Glass belongs on navigation and photographic overlays. Use translucent porcelain, blur, a fine white highlight and gold edge; maintain an opaque fallback. Shopping forms and product information remain solid surfaces. The hero shader and footer logo animate slowly only while visible and while the document is active. Honour reduced-motion and reduced-transparency preferences with a static CSS atmosphere and the unchanged original logo. Checkout has no decorative animation.

## Shapes

Glass chrome uses a softly curved rectangle. Editorial photography can use a shallow arch frame. Product cards remain open and unboxed, with a consistent image ratio.

## Components

Desktop navigation uses deliberate dropdown disclosures and mobile uses an accessible full-screen menu. Purchase buttons use brand pink with high contrast. Wishlist controls have touch-sized targets. Image overlays use glass without obscuring product details.

## Do's and Don'ts

- Use original product photography, exact names and authoritative prices.
- Keep category and submenu order unchanged.
- Use liquid glass sparingly where it creates depth.
- Do not fabricate customer proof, product specifications or shipping promises.
- Do not put low-contrast gold text on porcelain or use decorative motion on checkout.

## Implementation dials

Design variance 7, motion intensity 5 on the editorial hero and 0 in commerce forms, visual density 3. Fixed light rose surfaces preserve the supplied brand direction.

Glass highlights use white alpha layers; shadows use low-opacity wine. Circular wishlist/badge shapes and the 160px/125px editorial arch are intentional exceptions to the rectangular control scale.

## Jewellery motion

The Necklace Story uses an Omni-generated campaign film, edited to 5.5 seconds with detailed gold settings and rose stones. The visible caption identifies imagined brand jewellery; it is never an exact SKU representation. Product photography remains unchanged. GSAP seeks the film through three editorial chapters on native scroll. The video loads near the viewport, has frequent keyframes for responsive seeking, and does not render continuously while stationary. A pause control freezes the current frame. Short screens or stages that cannot fit beneath the header use ordinary flow and muted inline playback. Reduced motion retains the poster and static copy. The generated source is 1280x720; the requested higher-resolution Flow export is not represented as completed.
