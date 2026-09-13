# Veo prompt — hero opening animation (attempt 2)

## History

**Attempt 1** (`The_book_s_front_cover_swings.mp4`, 1280×720, 10s) — rejected. Frame
extraction found: dead first second, cover dissolving into a translucent page at
~5.5s, direction reversing at ~6.4s, camera zooming and drifting right through the
back half, opening past the cover to a middle spread, foxing stains on the paper,
and a Gemini sparkle watermark throughout.

**Centre-split detour** — a symmetric centre split was tried in CSS at the user's
request and rejected on sight: a bound book has no hinge at its centre, so the
motion reads as fake however cleanly it is executed. Settled; do not revisit.

## The mechanic, exactly

The binding is on the **right**. Therefore:

- The spine is a fixed vertical edge on the right of the book.
- The free edge of the front cover is on the **left**.
- Opening lifts that left free edge and sweeps it **rightward**, rotating about the
  spine — the mirror of a Western book.
- Do not confuse this with Arabic *reading* direction, which runs right-to-left. The
  text flows RTL while the physical page travels LTR. Conflating the two produced
  two separate errors earlier in this project.

## Framing — the thing that fixes the drift

Closed, the book is width W. Open, the cover lies flat to the right of the spine and
the pair spans 2W — **all the growth is to the right.**

So: **frame the shot with the spine on the exact horizontal centre.** The closed book
then sits in the left half, and the open spread ends up centred. The camera never
moves, which removes everything the model drifted on last time.

Recentring for the website is then a scroll-driven `translateX` in CSS, from `+W/2`
at rest to `0` when open. Tunable in code, not baked into footage.

## Strategy

**Use first-frame + last-frame interpolation** (Google Flow → *Frames to Video*), not
first-frame-only. Pinning both ends makes direction reversal and camera drift
structurally impossible rather than merely discouraged. Attempt 1 pinned only frame 1
and wandered badly.

**Generate 5–6 seconds, not 10.** Less time is less room to drift. Scroll-scrubbing
cares about frame count and monotonic motion, not clip length.

---

## Prompt

```
A single closed Quran stands upright, centred and facing the camera almost head-on,
its front cover square to the lens. The cover is deep black leather with a subtle
low-relief tone-on-tone embossed pattern, a thin gold double-rule border inset from
the edges, and one small gold roundel at its centre. The binding is on the RIGHT: the
spine is the fixed vertical edge down the right-hand side of the book, and the free
edge of the cover is on the LEFT.

The front cover opens in one single continuous movement. Its free left edge lifts
away from the page block, rises, and sweeps steadily to the RIGHT, rotating about the
fixed spine on the right-hand side, exactly the way an Arabic-bound book opens and
the mirror of how a Western book opens. The cover travels through vertical and
continues over until it comes to rest lying flat and fully open to the right of the
spine, face down.

As the cover lifts, the heavy leather board flexes very slightly along its length and
the page block beneath stays still and intact, its stacked cream page edges visible
along the top and left. The topmost page settles flat. When the cover has come to
rest, the book is fully open and the two visible surfaces read as a clean two-page
spread: the first blank cream page on the left, and the plain cream endpaper lining
the inside of the cover on the right.

The inside face of the cover is plain, smooth cream endpaper. It is completely bare —
no calligraphy, no roundel, no gold border, no reversed or mirrored copy of the front
design, nothing showing through from the front, no pattern, no text.

The gold roundel and the gold border stay crisp and unchanged on the front of the
cover for as long as that face is visible, rotating away with the cover as one solid
object. They never split, never separate, never fade, never become transparent, never
morph, and never change shape.

The camera is completely static and locked off on a tripod for the entire shot. No
zoom, no push in, no pull back, no pan, no tilt, no orbit, no handheld movement, no
parallax, no focal length change.

The spine stays at exactly the same point in the frame from the first frame to the
last and never slides, drifts or shifts. The book never grows or shrinks. The frame is
wide enough that the fully open book sits comfortably inside it, with empty background
on both sides and nothing cropped at any edge.

Every page is completely blank, clean cream paper — no text, no writing, no Arabic
script, no calligraphy, no letters, no page numbers, no headers, no borders, no ruled
lines, no decoration, no stains, no foxing, no yellowing, no aging, no creases.

Lighting is flat, soft and even, and identical from the first frame to the last. No
flicker, no shifting highlights, no moving or growing shadows, no lens flare. The
background is a flat, solid, uniform near-black field that never changes.

Only one thing moves in the entire shot: the front cover. Nothing else in frame
animates. No other pages turn or lift.

The motion runs at a perfectly constant speed from the very first frame to the very
last, with no easing, no acceleration, no deceleration, no pause and no hold. The
cover is already moving on frame one and is still moving on the final frame, coming to
rest exactly as the clip ends. There are no static frames at the start or the end.

Silent clip, no audio.
```

## Negative prompt

```
opening from the centre, splitting down the middle, symmetrical split, double doors,
gatefold, cover parting in two, spine on the left, opening leftward, cover moving
left, reversing, rewinding, looping, mirroring, flipping, changing direction, opening
backwards, camera movement, zoom, dolly, pan, tilt, orbit, handheld shake, scale
change, book growing, book shrinking, drifting, sliding, text, Arabic text, writing,
calligraphy on pages, script, letters, page numbers, mirrored calligraphy, reversed
text, roundel on the inside cover, design showing through, stains, foxing, aged paper,
yellowing, creases, morphing, dissolving, transparency, ghosting, cross-fade, double
exposure, warping, melting, flickering, changing lighting, moving shadows, shifting
highlights, vignette, glow, particles, dust, depth of field, blur, multiple pages
turning, pages fluttering, opening to a middle spread, hands, fingers, table, desk,
surface, props, environment, reflection, watermark, logo, sparkle
```

## Check on delivery

Extract frames with `videos/grab-frames.ps1` and verify in order. Attempt 1 passed a
casual watch and failed six of these.

1. Frame 1 matches `assets/hero/quran-dark.webp` with no colour shift
2. The cover's free edge moves **right** in every single frame — no frame where it
   has jumped back to the left
3. The spine is at the same x in the first and last frame
4. The book's height is the same in the first and last frame
5. No text or marks of any kind on any page
6. The inside of the cover is bare cream — no roundel, no reversed script
7. No translucent or ghosting frames
8. Motion is monotonic, with no static frames at either end

## Watermark

Google AI **Pro** stamps a sparkle bottom-right; **Ultra** via Flow does not.
Otherwise crop it — with the camera locked and the spine centred, the watermark
corner can be cropped away without touching the book.
