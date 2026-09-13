# Veo prompt that produced `best yet.mp4` (2026-09-13)

Tool: Google Flow → Video → Frames (Agent off). Output 8 s, 1280×720.

## Result
- ✅ Cover opens left → right and lands on the right
- ✅ No page turns, book does not slide, background stays one colour
- ✅ Roundel intact; inside of cover plain cream
- ❌ Frames ~2.3–3.2 s: thick black band along the cover's left (free) edge as it lifts — reads like a second spine
- ⚠️ 720p; motion only between ~2.1 s and ~5.5 s (still before and after)

Note: in the frame grid the closed book starts **left of centre** (spine on the frame centre line), which matches
`assets/hero/frame-first.png`, even though the prompt text names `dark quran image.png`. When reproducing, check which
start image was actually uploaded.

Later attempts that did worse: cover-then-pages-fold (cover landed face-up, calligraphy mirrored), and "book opens at
its middle as one block" (pages fanned, cover landed face-up).

## Prompt (verbatim)

```
Overhead shot looking straight down at a black leather Quran lying flat on a plain near-black surface.
First frame: the closed Quran (dark quran image.png). Last frame: the same Quran lying open (frame-last.png).

The book lies flat the entire time. It never stands up, tilts or spins, and its side and spine are never seen. We only ever look straight down at the top of the book.

The front cover opens the way a book opens on a table. The cover is hinged along the RIGHT edge of the book. Its LEFT edge lifts up off the pages, rises toward the camera, folds over to the right, and comes down to lie flat on the surface to the RIGHT of the book. On screen, the black cover gets narrower as it rises, shrinking toward the right edge of the book, then widens again as it comes down on the right side, now showing its plain cream inside. As it lifts away, it uncovers the first blank cream page on the left.

The pages lie flat and still under their own weight for the whole clip. No page ever lifts, flutters, fans or turns. Only the cover moves. The thin edge along the right side of the last frame is the thickness of the cover board, not pages.

As the book opens, the camera glides slowly to the right and rises slightly, so the book stays centred and the fully open book fills the frame exactly as in the last frame.

The gold roundel with its calligraphy and the gold double border stay solid on the front of the cover as it lifts away, never morphing, fading or mirroring. The inside of the cover is plain cream with no design.

The cover opens slowly at one even speed across the whole clip, starting on the first frame and landing flat exactly on the last frame. Soft, even light that never changes. The background stays the same near-black colour throughout. Everything sharp. Blank pages with no marks. Silent.

Avoid: book spinning, book rotating, turntable, book standing upright, side of the book, spine facing camera, page edges facing camera, pages fanning, pages turning, cover opening to the left, cover landing on the left, book sliding across the surface, sudden jumps, pauses, morphing, mirrored calligraphy, text on pages, background colour change, flicker, motion blur, hands, watermark.
```
