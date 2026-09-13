# Imagen prompt — open spread (the last asset needed)

This is the layer revealed **behind** the cover halves as they swing outward. It is
not a photograph of an open book — it is just the two blank pages. The cover halves
come from splitting `quran-dark.webp` in code.

Follows the locked asset principle in `PLAN.md`: flat, orthographic, evenly lit,
flat background, no baked-in lighting or perspective. All depth is added in CSS.

## Orientation — state both, every time

- **Canvas:** landscape 16:9. Target 2816×1536 to match the existing pair.
- **Spread:** landscape overall (two portrait pages side by side), centred in that
  canvas with empty background either side, whole and uncropped.

## Critical constraint

The spread must be **exactly as tall as the closed cover** in `quran-dark.webp`
(book height 1350px on a 2816×1536 canvas) and its **centre fold must sit on the
exact horizontal centre of the canvas.** If the height or the fold position drifts,
the pages will visibly jump as the cover parts. Normalise after generating, the same
way the dark/light pair was normalised.

## Prompt — dark mode

```
An open book showing two completely blank facing pages, photographed straight on
from directly in front, perfectly flat and orthographic with no perspective and no
tilt. The centre fold runs vertically down the exact middle of the spread. The two
pages are equal in size and perfectly symmetrical.

The paper is clean, smooth, unmarked cream stock with a faint natural fibre texture.
The pages are completely empty — no text, no writing, no Arabic script, no
calligraphy, no letters, no page numbers, no headers, no borders, no ruled lines, no
decoration, no illustration, no stains, no foxing, no yellowing, no aging, no
creases, no dog-ears.

Lighting is completely flat and even from corner to corner, with no directional
light, no highlights, no gradient across the page, no cast shadow, no drop shadow,
no vignette, no glow, no rim light.

The background is a flat, solid, uniform near-black field (#1C1917) with no
gradient, no texture, no atmosphere, no dust, no particles. The spread is centred in
a landscape frame with empty background on the left and right, fully visible and not
cropped at any edge.

Tight, clean, product-style asset. No hands, no table, no surface, no props, no
environment, no reflections, no depth of field, no bokeh.
```

**Negative prompt:**

```
text, Arabic text, writing, calligraphy, script, letters, words, page numbers,
headers, borders, ruled lines, decoration, illustration, ornament, stains, foxing,
aging, yellowing, creases, tilt, perspective, angle, three-quarter view, rotation,
directional lighting, highlights, cast shadow, drop shadow, vignette, glow, rim
light, gradient background, texture background, dust, particles, atmosphere, hands,
table, desk, surface, props, environment, reflection, depth of field, bokeh, blur,
cropped, cut off, watermark, logo
```

## Light mode

Same asset, warmer/brighter ground to sit on `#FAFAF9`. Identical composition,
proportions, fold position and framing — colourway only, exactly as the closed
cover pair was handled. Not a horizontal flip.

## Check on delivery

1. Fold is on the exact horizontal centre
2. Both pages identical in width
3. Zero marks of any kind on the paper
4. No shadow or gradient anywhere
5. Background reads flat near-black
6. Spread is whole, not cropped at any edge
7. Height normalises cleanly to 1350px against `quran-dark.webp`
