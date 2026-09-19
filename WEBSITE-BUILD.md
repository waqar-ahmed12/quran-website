# Website build instructions — Quran landing page

Written 2026-09-13 as the handoff for the chat that builds the site. **Where this file conflicts with `PLAN.md`
or `design-system/quran-landing/MASTER.md`, this file wins.** Read those two for background.

---

## 0. Safety first — this PC is infected

A file-infecting worm (**Grenam / Renamer**, confirmed on VirusTotal) has replaced hundreds of `.exe` files with
533,504-byte copies of itself. Running an infected program spreads it further.

- **Never run:** `python`, `py`, `pip` (Python 3.11's `python.exe` *is* the worm; 3.12 has no `python.exe` left),
  `ffmpeg`/`ffprobe`, Git Bash, or anything under `C:\ffmpeg-8.1.2-essentials_build\` or `%LOCALAPPDATA%\Programs\`.
- The **Bash tool is broken** (Git's `bash.exe` is infected) — use PowerShell. Grep/Glob may fail — use
  `Get-ChildItem` / `Select-String`.
- **Never** use `dangerouslyDisableSandbox`.
- **Safe:** PowerShell cmdlets, `node` (`C:\Program Files\nodejs\node.exe`, validly signed), Opera GX (signed, the
  default browser). Before running any other `.exe`, check `Get-AuthenticodeSignature` is `Valid` and the size is
  not 533,504 bytes.
- Save images as **PNG or WebP, never `.jpg`** — `.jpg` files in this project have been silently rewritten.
- `PLAN.md` blames a "broken ffmpeg install" and "Python blocked by the sandbox" — both were the worm.
- The user will clean the PC (rescue USB) before launch. Don't install new software until then.

**Working style:** the user prefers to run scripts themselves and paste the output. When a script is needed, save
it and give one copy-paste command. Keep updates short.

---

## 1. What we're building (locked)

A $10k-quality **landing page only** — a visual hook, not the full site. Plain **HTML / CSS / JS, no build tools,
no framework.** Near-zero copy. Must support **dark and light mode** properly.

**Page, in scroll order** (from `PLAN.md`, locked):

1. **Rest** — book closed, centred, quiet wordmark.
2. **Opening** — scrolling opens the cover (free edge on the left sweeps right, pivoting on the right-hand spine).
   The book stays centred. Nothing else happens during this.
3. **Fully open** — book settles open, blank pages. No text yet.
4. **Aayat** — 3–4 verses appear and cycle on the open pages as scrolling continues. Real text, never generated.
5. **Close** — one short line saying what the site is, and two buttons: the free Qaida and one-to-one lessons (the
   user's call, 2026-09-13; this was one entry point).

**Excluded:** feature grids, testimonials, stat counters, newsletter signup, FAQ, link-farm footer.

**Direction:** elegant, restrained, memorable. Premium black + gold. Atmosphere only — subtle floating dust/light,
no literal setting.

**Ignore from `MASTER.md`:** the "Liquid Glass" style and the multi-chapter page pattern (database mismatches).
Use its palettes, fonts, spacing, motion/accessibility rules and pre-delivery checklist.

**Superseded in `PLAN.md`:** the CSS centre-split opening (rejected by the user), the "Opening animation — CSS, not
video" section, and the `frame-first*.png` / `frame-last*.png` / `hero-prototype.html` assets. The prototype's
scroll scaffolding can be reused; its opening mechanic cannot.

---

## 2. The hero asset — retouched video frames

The opening is a **frame sequence**, drawn to a `<canvas>` by scroll position.

| Item | Value |
|---|---|
| Location | `videos/best-yet-frames/f000.png` … `f088.png` (untouched copies in `raw/` — don't use) |
| Frames | 89 PNG, 1280×720, 24 fps, taken from 1.90 s to 5.57 s of `best yet.mp4` |
| Retouched | A fake spine Veo drew on the cover's edge was painted out of frames ~2.15–3.48 s |
| **Skip** | `f039` and `f040` — identical to `f038` (a hold in the source video). Use the other 87. |
| First / last | `f000` = closed book · `f088` = fully open |
| Size | 25 MB as PNG — fine for development, **convert to WebP before launch** (see §7) |

**Geometry (pixels in the 1280×720 frame — re-measure in the browser to confirm):**

- Closed book: x 255–639, centre ≈ 447. The spine sits at x ≈ 640, the frame's centre line.
- Open book (`f088`): x 255–1037 including page edges, fold at ≈ 640, centre ≈ 646.
- Page areas for the aayat overlay: left page ≈ x 262–636, right page ≈ x 645–1020, both ≈ y 80–640.
- **Frame background ≈ `#1F1A18`**, slightly lighter than the locked `#1C1917`. Make the edge invisible: paint the
  hero stage and canvas fill `#1F1A18`, and feather the transition into `#1C1917` (e.g. a soft gradient at the
  hero's bottom), or mask the canvas edges.
- 720p looks soft if stretched well past 1280 CSS px. Don't upscale beyond that on desktop; a 1080p re-export of the
  same take is possible later (the retouch scripts in `videos/` scale automatically).

---

## 3. Hero behaviour spec

**Structure:** a tall hero section (start at `400vh`) containing a `position: sticky` full-viewport stage with the
canvas. Scroll progress `p` runs 0 → 1 across the section. Prefer native scroll + sticky (no dependency); GSAP
ScrollTrigger via CDN is allowed if it clearly helps (MASTER.md's spec: pin only this section, `scrub`, call
`ScrollTrigger.refresh()` after frames load).

**Timeline (starting values — tune by feel with the user):**

| p | What happens |
|---|---|
| 0.00–0.10 | Rest: `f000`, wordmark visible |
| 0.10–0.60 | Opening: frames `f000`→`f088` (skip list applied); wordmark fades out early in this range |
| 0.60–1.00 | Open: `f088` holds; aayat cycle (§4) |

**Centring — do it by moving the source rectangle, not with a CSS transform.** Draw a window of the frame whose
horizontal centre moves from **447 (closed) to 646 (open)** in step with the opening progress. Fill the canvas with
the frame background first, so the part of the window outside the image just reads as background. This keeps the
book centred, avoids an empty strip at the viewport edge, and gives mobile cropping for free.

**Drawing:**

- Preload every frame with `img.decode()`. Draw `f000` immediately so there is never a blank hero.
- Redraw only when the frame index changes, inside `requestAnimationFrame`.
- Size the canvas backing store to CSS size × `devicePixelRatio`, capped at 2.
- Apply a gentle ease (e.g. smoothstep) to the opening range. Speed is set here, not in the footage.
- Pause work when the hero is offscreen.

**Mobile:** the open book only uses x 255–1037, so on narrow screens crop the source window to roughly that span
and scale it to the viewport width. Test at 375 px. Consider every other frame if loading is slow.

**Reduced motion (`prefers-reduced-motion`):** no scrub. Show `f088` open, centred, with the aayat in their final
readable state.

**Optional, last:** a tiny scroll-driven sway (`rotateY` ±2–3°) during the opening, which the user asked for earlier.
Keep it tunable.

---

## 4. Aayat overlay

- **Live text only** — never baked into images. Arabic, `dir="rtl" lang="ar"`.
- **Font:** "Amiri Quran" (Google Fonts) is the easy choice; KFGQPC Uthmanic Hafs is the traditional mushaf font.
- **Text source:** copy the exact Uthmani text from Tanzil.net or Quran.com and keep it unmodified (follow the
  source's terms). **Never type verses from memory or let an AI generate them.** Check the diacritics by eye.
- **Ask the user** which 3–4 aayat, and whether to show a translation and surah:ayah reference.
- Position the text over the page areas in §2 (convert to canvas/CSS coordinates). The **right page is the first
  page** in a mushaf.
- Dark ink on the cream pages; gold only for small accents such as ayah markers. Cross-fade 300–600 ms between verses
  as scrolling continues. Keep the text in the DOM for screen readers.

---

## 5. Rest of the page

- **Tokens:** use MASTER.md's light and dark palettes as CSS variables. Dark: background `#1C1917`, foreground
  `#FAFAF9`, accent `#D4AF37`. Light: background `#FAFAF9`, primary `#1C1917`, accent `#A16207`.
- **Fonts:** Bodoni Moda (headings/wordmark) + Jost (body), from the Google Fonts link in MASTER.md.
- **Theme:** follow `prefers-color-scheme` with a manual toggle. **Until a light-mode animation exists, the hero
  stays dark in both themes**, or light mode shows the static light cover `assets/hero/quran-light.webp`. Ask the
  user which.
- **Atmosphere:** very subtle floating dust/light particles (CSS or a small canvas), low density, off under reduced
  motion.
- **Close section:** one line + two buttons (free Qaida, one-to-one lessons). Where they link comes from the user;
  see §7, phase 5.
- Follow MASTER.md's anti-patterns and pre-delivery checklist: no emoji icons, visible focus states, 150–300 ms
  transitions, 4.5:1 contrast, responsive at 375 / 768 / 1024 / 1440, no horizontal scroll.

---

## 6. Files and local preview

```
site/
  index.html
  styles.css
  main.js
  assets/hero/frames/   ← copy f000–f088 here from videos/best-yet-frames (keep the originals)
```

**Preview:** `node serve.js` in this folder, then open `http://localhost:8777/site/`. `serve.js` has no dependencies
and binds to localhost only. The `.claude/launch.json` config **"site"** runs it for Claude's Browser pane.
**Don't use `python -m http.server`.** To test on a real phone, `node serve.js --phone` shares only `site/` on the
wifi and prints the address to open (Windows asks to allow Node: Private networks only; Ctrl+C when done).

---

## 7. Build order — lock each phase with the user before the next

1. **Hero scrub only:** frames, sticky stage, centring, skip list, preload, reduced motion. Get sign-off on the feel.
   **Signed off by the user 2026-09-13.**
   - *Built 2026-09-13 in `site/`.* The user tried the options on a PC and an iPhone SE-sized screen and chose:
     footage never stretched past its own size ("Big" looked no different on the phone); the whole open book
     always fits, at one size for the whole opening (enlarging the closed book on a phone made the calligraphy
     blurry); the opening runs over `550vh` on screens 768px and wider, `400vh` on phones. Centring follows the
     book's measured right edge in each frame rather than a straight 447→646 slide.
   - **Smoothing — locked 2026-09-13.** Mouse wheels scroll in steps, so the book jumped between frames. The shown
     position now eases toward the scroll position every animation frame (exponential, time-based, `GLIDE = 0.28` s)
     and the two neighbouring frames are cross-faded. The user compared no glide / 0.07 / 0.14 / 0.28 s with blending
     off and on, and chose **0.28 s with blending on**. Not yet tried on a real phone (`node serve.js --phone`).
2. **Rest state:** wordmark, fonts, theme tokens, background matching (§2).
   - *Built 2026-09-13.* The user chose from on-page options: name in **Cinzel** (over Bodoni Moda and Cormorant
     Garamond), **bright gold `#D4AF37`** (over brass `#C9A962` and champagne `#E3CFA0`), name **under the book**, with a
     **small line under it** in Jost 300. The name fades out over the first 8 frames of the opening and stays under
     reduced motion. The page background is the footage's `#1F1A18` everywhere, so no blend is needed.
   - **Words chosen 2026-09-13** (via `agent-skills:idea-refine`): gold headline **"From Alif to Ayah"**, line
     **"A free Qaida you can hear, and a teacher who listens"**. The headline previews what the page does next: the
     closed book opens and aayat appear. The user then said to move on to the next phases, so phase 2 is treated as
     done. The site name will be chosen in a separate chat; it isn't on the page yet. The words can draw on what's coming to the site: a free Qaida with
     audio, playback of the student's own voice, and a whiteboard. The user teaches every age online, one-to-one,
     mostly reading from zero and Tajweed, plus Hifz; they want Western students but never want countries named on
     the page. The first round of plain, factual lines ("One-to-one Qur'an lessons, online" etc.) was rejected.
3. **Aayat overlay.**
   - *Aayat chosen by the user 2026-09-13:* 96:1-5, 55:1-4, 73:4, 54:17, shown in that order. The order follows the
     student's journey: read, He taught the Qur'an, recite with tartil (Tajweed), made easy to remember (Hifz).
     `fetch-aayat.js` copies the exact Uthmani text from the Quran.com API into `site/aayat.json`. It also fetches
     Saheeh International (Quran.com translation 20) for an optional English meaning; check that translation's licence
     before launch.
   - *Built 2026-09-13; the user called it "incredible".* Arabic is in ink (multiply) on the right page with gold
     ayah markers. The left page shows the surah name, or the English meaning (on phones this text sits under the
     book). Long text shrinks to fit the page.
   - **Changed at the user's request:** only **one group per pass**, picked at random each time the pages come into
     view, never the same one twice running. It fades in after the book settles and stays, then the page moves on to
     the next part. The timeline is REST 0.45 · OPEN 2.25 (unchanged) · SETTLE 0.4 · AYAH 1 screens. The hero is
     `510vh` on computers and `373vh` on phones.
   - **Options kept on purpose:** the Arabic lettering (Amiri Quran / Scheherazade New) and left page (surah name /
     English meaning) buttons, and the other chat's headline picker (`wordmark-options.js`), stay until the user has
     asked several people. Settle all the final settings together then.
4. **Atmosphere** particles, then optional sway.
   - *Built 2026-09-13 in `site/atmosphere.js`* with `taste-skill:soft-skill` and `agent-skills:performance-optimization`.
     **Sway is left for later** (the user's call). The user added a request: the book should **move slightly while
     nobody is scrolling**. They want rich effects, but only where the visitor's device runs them smoothly, so where
     the dust appears and whether it follows the mouse are tried on-page. The book and its aayat now sit in
     `.subject` so they move together; the dust is a second canvas over them.
   - **First round, the user's feedback (2026-09-13):** the scroll bar showed · aayat fading in *with* the scroll felt
     awkward · Float and Breathe moved in steps (Drift was smooth) · don't move the dust with the mouse, put a glow on
     the cursor instead · try something other than dust · didn't understand "Quality" · the opening didn't feel smooth
     this time, bring its options back.
   - **Second round:** scroll bar hidden. The aayat now fade in by themselves (600 ms CSS transition) once scrolling
     reaches the open book. Float and Breathe carry a hair of rotation so the browser can't snap the book to whole
     pixels (the cause of the steps). The book only starts moving 0.6 s after `main.js` reports it has stopped gliding
     (`bookmove`/`bookrest` events on `.hero`); before, it could restart between mouse-wheel clicks mid-opening, a likely
     cause of the unsmooth opening. The book only gets its own layer while moving, so the opening costs what it did in
     phase 3. The Quality buttons are gone: stepping down on slow devices happens by itself, and the panel says so in
     plain words, with frames a second shown separately for scrolling and still.
   - *Options to try:* opening glide off / short / medium / long · blend frames · aayat appear as it opens / once open
     · light in the air off / dust / glints / orbs / rays · amount · mouse light off / glow / spotlight · book when
     still off / float / breathe / drift · movement size. Whole-page atmosphere can only be tried once phase 5 adds
     page below the hero.
   - **Third round, the user's feedback:** something dust-like, not orbs or rays; glints are good but not luxurious ·
     the mouse glow is far too wide · **nothing on the Qur'an itself, no dust and no light** · design for light mode too
     (an ivory Qur'an exists as a still photo, no video yet) · sliders for amount, smoothness and movement.
   - **Third round, built:** styles are now **gold dust** (fine specks on a slow current, a few catching the light
     now and then), **gold leaf** (flakes that fall slowly, turn over and flash as they face the light) and glints.
     Dust, orbs and rays are gone. `main.js` reports where the book is each frame (`hero.book`), and `atmosphere.js`
     erases that area, with a soft edge, from its layer every frame. Glow radius now starts at 90 px (was 240).
     Colours have a dark set and a deeper-gold light set, rebuilt when `data-theme` on `<html>` changes. The options
     panel's **Theme preview** sets `data-theme="light"`: MASTER.md's light tokens, and the hero draws
     `assets/hero/quran-light.webp` (copied from `assets/hero/`) closed and still, at the dark book's size, with no
     aayat. Sliders: opening glide (0–0.5 s), amount (0–250%), mouse glow (0–240 px), movement (0–300%).
   - **Fourth round, the user's feedback:** small metal clasps show on the book's left edge as the cover starts to
     lift (a Veo artifact, frames ~f009–f018) · stopping mid-opening looks blurred · a half-open book should open or
     close by itself · no visible difference between the "aayat appear" choices · no movement once fully open, and
     effects gone until a reload (the panel said "switched off" while showing 60 fps) · phones: too much scrolling,
     the headline picker can't collapse, the surah name sits under the book instead of on the page.
   - **Fourth round, built:** held still, the frame cross-fade settles onto the nearer whole frame over 0.25 s (the
     blur was two frames mixed; the source footage also has some motion blur mid-opening). **Half-open book**
     option: stays / nearer end / way you scrolled (default), 180 ms after scrolling stops, eased over 0.45–1.1 s,
     and any wheel, key, click or touch takes over. "Aayat appear" removed; they fade in at 90% of the opening. The
     switch-off was the bug behind both missing effects and missing movement: it counted scrolling and tab switches as
     slow frames. It now judges only 2-second windows while the book is still and the tab is showing (below 45 fps,
     three windows in a row), and choosing any effect option turns effects back on. Phones: both option panels start
     closed and collapse; **Scroll length** long 373vh / medium 310vh / short 250vh (default); **Surah name** under
     the book / on the page (English meaning hidden there, too long).
   - **Clasps:** `videos/fix-clasp-frames.ps1` (PowerShell + System.Drawing, safe on this PC). The first version
     replaced bright pixels with the leather 130 rows above, which for the lower clasp is the upper clasp, so half of
     it stayed. The rewrite finds the gold rule's left edge in each frame, then pixels 16–44 px left of it (rows
     286–506) that differ from the average of the pixels 3 rows above and below: the edge there runs straight up and
     down, so only the curly clasps do. (Comparing with each column's median down the book flagged plain leather in
     every frame, because the edge lines drift a pixel and the light changes slowly.) Each clasp's padded box is
     repainted column by column, blending from the rows above it to the rows below. The
     clasps are in f009–f017 (faint grey outlines at first, bronze by f015, a third small one at the top from f013).
     It always starts from `videos/best-yet-frames/before-clasp-fix/`, puts frames without clasps back byte for byte,
     writes to both frame folders and saves `contact-sheet-clasps.png` (3x, before above, after below). `-DryRun` saves
     only the sheet. **Run by the user 2026-09-14:** clasps repainted in f009–f017, every other frame restored from
     the backups.
   - **Fifth round, the user's feedback (2026-09-14):** mix dust and flakes, with sliders, and add more to the
     background · a smoothness control for the auto-finish · **don't work on light mode yet** · no phone testing for now.
   - **Fifth round, built:** separate 0–250% sliders for gold dust (starts at 100), gold leaf (40) and glints (0), so
     they mix. New background layers, all erased over the book like everything else: **haze** (two layers of soft gold
     wisps drifting different ways, 30%, left out at lite quality), **light behind book** (a warm gold glow round the
     book, 40%) and **gold pattern** off / faint / under the mouse (eight-pointed stars joined by thin lines; "under the
     mouse" shows it only in a soft circle round the pointer). **Auto-finish time** slider, 0.3–3 s (1.1 s for a whole
     screen of scrolling; shorter distances take less).
   - **Light preview removed** (Theme preview buttons, light tokens in `styles.css`, light colours in `atmosphere.js`,
     `site/assets/hero/quran-light.webp`). For phase 6, how it worked: `assets/hero/quran-light.webp` drawn closed and
     still at the dark book's height (the book spans x 33.5–66.4% and y 5.9–92.8% of that photo), MASTER.md's light
     tokens, and deeper golds that show on ivory: speck `rgba(140,95,15)`, leaf `#6B4E0E` → `#D9B44A` → `#A67C1E`,
     glow `rgba(201,160,70)`.
   - **Sixth round, the user's feedback (2026-09-14):** a speed control for the automatic open/close · the aayat move
     clunkily in Drift and Breathe once the book is open (not mentioned for Float, which only slides).
   - **Sixth round, built:** **Auto open/close speed** slider, 25–300%, replacing "Auto-finish time": 100% scrolls one
     screen a second, so a half-open book finishes in about a second, and a finish never takes less than 0.3 s.
     **Aayat while moving**, not seen by Claude (the user previews): *As before* (`.subject` gets `will-change:
     transform` only while moving) · *Fix A*, the default (it keeps it whenever the book may move, so the text should be
     drawn once and moved whole instead of redrawn at each new size and tilt, the suspected cause) · *Fix B* (Fix A plus
     plain ink with no multiply blend, as on phones).
5. **Close section.**
   - *Decided by the user 2026-09-13:* **two buttons**, one to the free Qaida and one to one-to-one lessons. They
     didn't know how the lessons button should work. Claude recommended a simple lessons page of its own, ending in a
     short enquiry form that emails the teacher (a WhatsApp button is the alternative). **Waiting on the user:** that
     page yes or no, form or WhatsApp, and whether the first lesson is free. Claude proposed making the lessons page
     the next phase; **the user said no**, so the order stays: light mode next, then the audit.
   - *Built 2026-09-13* with `taste-skill:minimalist-skill`, `ui-ux-pro-max` (references and data read directly) and
     `agent-skills:idea-refine` for the words (run by Claude without questions, per the user's standing preference).
     `.close` is a screen after the hero: one line in Jost 300, then two links, 48px tall with 4px corners, no
     shadow and a visible focus ring. One is solid gold and leads; the other is a gold outline. The ending rises 12px
     into view over 600ms the first time it scrolls in (not under reduced motion). Both links are stand-ins
     (`#lessons`, `#qaida`); on this PC a click says the page isn't built yet.
   - *Options to try,* in the new **Ending** group at the top of the Options panel (the earlier options are folded
     into **Opening and aayat** and **Atmosphere**): ending **after the book** / **under the book** (computers only:
     at the end of scrolling the open book rises and shrinks, and the ending fades in beneath it) · closing line
     (four) · button words (three pairs) · button look: gold and outline / two outlines / underlined · which button
     stands out · **dust in the ending**: stays with the book / carries on (a second canvas behind the ending shows
     the same air, fixed to the screen while the page scrolls; still never drawn over the book).
   - **Second round, the user's feedback (2026-09-13):** the ending looks dry, not enough to see (they asked whether a
     later phase handles that: no, phases 6 and 7 add nothing to it) · too much scrolling once the Qur'an is fully
     open · a visible line in the colour where the book's screen ends (screenshot).
   - **Second round, built** (`ui-ux-pro-max` data read directly, `taste-skill:minimalist-skill`): the line was the
     "light behind book" glow, cut off at the edge of the book's screen as it scrolled away. atmosphere.js now draws
     that glow on both canvases, positioned in the window, so it carries on past the edge. **Scroll once it opens:**
     as before 1.4 screens / less 0.7 / least 0.35 (default). The hero's height now comes from `--timeline` (set by
     main.js) times `--pace` (1 on computers, 0.666 on phones, 0.512 or 0.366 for the phone scroll-length options), so
     it always matches the timeline. **The ending:** a small gold star between two fine rules above the line (the rules
     draw outward and the star turns into place), then the line, then the buttons, 120ms apart. **Behind the words:**
     nothing / a warm light / the light and a large gold star in thin lines (the default: two squares in a circle, an
     eight-pointed star inside, a small circle; 16% opacity, one turn every four minutes, still under reduced motion).
     **Name at the very end:** show / hide (the headline in small gold Cinzel, standing in for the site name). Under
     the book, the light, star and name are hidden and the words arrive after the book has moved.
   - **Third round, the user's feedback (2026-09-13, screenshots):** the top (resting book) and the ending feel
     empty; there should be some text, buttons or navigation. **This loosens §1's "near-zero copy / excluded" rule.**
     Answers: a **top bar** with Free Qaida and One-to-one lessons; a **bottom** with Free Qaida, One-to-one lessons,
     About the teacher and Contact (About and Contact at the bottom only). Contact is **WhatsApp and an email form**.
     The page may show the teacher's **name** and **how long they've taught** (nothing else personal). How much more
     to add is **Claude's call**, with the skills, shown as on-page options. Still needed: the name and years as
     they should appear, the WhatsApp number (stand-ins until then).
   - **Third round, the user's feedback:** everywhere Claude was choosing words, add a text field — they want control
     over what it actually says, not only a choice between presets.
   - **Third round, built:** a free-text field (`window.addText` in main.js, next to `addOption`/`addSlider`) beside
     every place words are chosen: the headline and the sentence under it (wordmark-options.js), and the closing line,
     both button labels and the name at the very end (ending-options.js). Typing updates the page as you go; the
     preset buttons still work and now fill the matching field in, so they're starting points, not the only way in.
     Left alone on purpose: the Arabic aayat and the surah name, which must stay the exact wording from Quran.com,
     never freely typed (§4).
   - **Fourth round, the user's request (2026-09-13):** work on the top of the page first ("very empty"); Claude
     writes the name, years and contact details as stand-ins for now.
   - **Fourth round, built** with `taste-skill:redesign-skill` (touch targets and focus from `ui-ux-pro-max`'s quick
     reference). The audit of the top found no name or navigation, nothing telling a visitor the page scrolls, and wide
     empty sides round the narrow closed book. Added: a **top bar** (`.topbar`, fixed): a small gold star and the name
     (stand-in "Alif to Ayah") on the left, **Free Qaida** and **One-to-one lessons** (a small gold outline) on the
     right, over a short fade of the background colour, with no blur (blurring the moving canvas costs every frame). It
     slides away while scrolling down and comes back on scrolling up or near the top (`placeTopbar` in main.js); on
     phones under 480px only the star shows beside the links. A **scroll hint** under the headline ("Scroll to open"
     over a fine gold line running down), only where the space under the book holds it (`.roomy`, `fitHint`), not
     under reduced motion. **Beside the book**, 1024px and wider: a small gold heading and a few lines either side,
     "Your teacher: Waqar Ahmed, 12 years teaching" and "Lessons in: Reading from zero, Tajweed, Hifz". **The name and
     years are stand-ins.** The sides and hint fade with the headline; the top bar and sides arrive a beat after load.
     The top bar's stand-in links show the same "not built yet" note as the ending's.
   - *Options to try,* in the new **Top of the page** group (`top-options.js`): top bar off / plain links / lessons as
     a button · scrolling down: bar stays / slides away · scroll hint show / hide · beside the book (computers):
     nothing / teacher and lessons / what and how · text fields for the name, both links, the hint words and each
     side's heading and lines (commas between lines).
   - **Fifth round, the user's feedback (2026-09-13):** the teacher's name and years belong at the bottom of the page,
     not beside the book · add a light and dark switch (phase 6, below). **Built:** the sides say what and how instead,
     "What you learn: Reading from zero, Tajweed, Hifz" and "How you learn: One-to-one, Online, Every age" (presets
     What and how / Shorter). The name and years wait for the footer.
   - **Standing rule from the user (2026-09-14):** every piece of wording Claude writes gets its own text field in the
     options panel (they research what reads well), the form's messages included. Only the aayat and surah names don't.
   - **Sixth round, the bottom of the page (2026-09-14),** with `taste-skill:minimalist-skill` (space, hairlines, no
     cards or shadows, 4px corners, a 12px rise into view 80ms apart; the page's own fonts and gold kept) and
     `ui-ux-pro-max`'s form rules. A `<footer>` after the ending, over a fine rule with the small gold star on it. Two
     columns from 900px (stacked below): **Your teacher**, "Waqar Ahmed", "12 years teaching the Qur'an" and a
     one-sentence about in the first person; **Contact**, "Ask about lessons", a line, a **Message on WhatsApp** button
     (stand-in `#whatsapp`, which shows the "not added yet" note) and, after "or send an email", a **form**: name, email,
     message, all with visible labels, 48px fields, autofill and the right keyboard. `footer.js` shows the reason under a
     field (on leaving it with something typed, as it's fixed, and on sending, focusing the first wrong one), and posts
     to the form's `action` with `fetch`. There's no action yet, so it says nothing was sent. Last row: the star and name,
     the four links (Free Qaida, One-to-one lessons, About the teacher → `#about`, Contact → `#contact`) and "© 2026
     Alif to Ayah". Error red `--color-error`: `#F28B82` dark, `#B42318` light. **Every line is a stand-in**, the name
     and years included. The ending's "Button look" tryout now only restyles the ending's buttons.
   - *Options to try,* in **Bottom of the page** (`footer-options.js`): layout side by side / stacked · email form open /
     behind a button · top edge line and star / line / nothing · a text field for all 21 lines. **Bottom: form
     messages** has fields for the four field errors and the sending / sent / didn't send / not connected messages. The
     light/dark switch's two words got fields too, under Top of the page.
   - **Seventh round, the user's feedback (2026-09-14):** should contact be on the landing page or a page of its own
     (Claude to argue and decide) · the footer has no dust · after the Qur'an, the book should glide up and the "Learn to
     read these pages" screen should lock into place, never rest half scrolled, without the visitor having to fight it.
   - **Seventh round, built.** *Contact:* Claude's call is **a contact page of its own** for the form, reached from a
     "Send an email" link beside the WhatsApp button (stand-in `#contact-page`). Reasons: the landing page is the hook and
     its ending already asks for one decision; a form under it adds a third and fourth way to act; a useful tutoring
     enquiry needs more than name, email and message (who the lessons are for, their level, their time zone), which would
     bloat this page; and one click costs nothing to someone who has already decided to write. WhatsApp stays here as the
     one-tap way. The form is kept on this page as options to compare (**Email form:** on its own page (default) / here,
     open / here, behind a button); the contact page isn't built, and waits for the user's go-ahead. *Dust:* atmosphere.js
     has a third canvas behind the footer (`onFooter`), drawn like the ending's when "Dust in the ending and footer" is
     "Carries on"; form fields are now solid so dust never drifts behind typing. *Lock-in:* `settleEnding` in main.js.
     The ending has three resting places (the open book's whole screen, the ending filling the screen, the footer's top
     at the top of the window); stopped between two, the page carries on to the one the visitor was heading for, using the
     half-open book's machinery: 180 ms after scrolling stops, eased at the **Auto open/close speed**, and any wheel, key,
     click or touch takes over. Below the footer's top it scrolls freely. Not under reduced motion or "Under the book".
     Works in light mode too (between the ivory book's screen and the ending). **Ending locks into place:** yes / no.
   - **Before launch:** point both links at the real pages, and hide the Qaida button if the Qaida isn't live. Connect
     the form to a form service (set `action` on `.enquiry`; Formspree, Web3Forms or the host's own forms, once the host
     is chosen) and test that a message arrives. Put the real WhatsApp number in (`https://wa.me/<number>`). The form
     collects names and emails from visitors abroad, so add a short privacy page and link it from the privacy line.
6. **Light mode.**
   - *Started 2026-09-13 at the user's request* (a light and dark switch in the top bar), during phase 5's fourth
     round. There is still no light video of the book opening, so in light mode the book's screen is a single screen:
     the ivory Qur'an photo (`site/assets/hero/quran-light.webp`, copied from `assets/hero/`) drawn closed and still at
     the dark book's height (`drawIvory` in main.js), no aayat, no scroll hint, then the ending. The 87 frames only load
     once the page is dark. "Under the book" is dark only. Tokens in `:root[data-theme='light']`: background `#F5F4F1`
     (the photo's edges are `#F4F5F2`), text `#1C1917`, muted warm stone `#57534E` (MASTER's slate is a cool grey), gold
     deepened to `#9A5F07` (4.8:1; MASTER's `#A16207` is 4.48:1 on this background). See-through colours now use
     `--rgb-background` / `--rgb-foreground` / `--rgb-accent`. atmosphere.js rebuilds its sprites, haze and pattern in
     deeper golds when `data-theme` changes (`INKS`). The choice is kept in `localStorage` and applied by a small script
     in `<head>` before the page draws; **a first visit is dark**, not the device setting §5 suggested, because only dark
     has the opening. The switch cross-fades the page with View Transitions where the browser has them.
   - *Options to try:* the switch as a half circle that turns over (default) / sun and moon / the word "Light" or "Dark".
   - **The light video is in, 2026-09-14.** `whtie-quran-opening.mp4` (1920x1080, 192 frames) was exported to
     `videos/light-frames/raw/` by `videos/export-light-frames.ps1`. The static ivory photo, `drawIvory` and the
     "single screen, no aayat or scroll hint" CSS are gone: **light now runs the same hero as dark** — same timeline,
     same page height, aayat on the pages, the same lock-in, half-open auto-finish and Tab-through-the-opening.
   - **The two takes are one piece of code.** The light footage is framed almost exactly like the dark one: same
     1280x720, book the same height, in the same place, fold in the middle. So main.js has no separate light drawing
     path — `film()` returns whichever set of frames the theme calls for and one `draw`, `load`, `place` and
     `rightEdge` work off it. All that differs is the files, the left edge (`LIGHT_LEFT` 262 against `BOOK_LEFT` 255)
     and how the right edge is measured. The page positions in styles.css suit both, so **the aayat needed no new
     numbers**: the Arabic text box lands at x 702-995 on screen against a book that runs 282-998.
   - **Why the light right edge is measured offline.** `measureRight` finds the dark book by brightness, which can't
     work here: the ivory book is about three levels darker than its backdrop and its drop shadow is darker still.
     Threshold measurement (the first attempt, from `analyze-light-frames.js`'s `report.txt`) tracked the *shadow*,
     which grows as the book opens — so the book drifted left and up as it went, and sat ~30px off centre. The book's
     own edge is a sharp step where the shadow is a slow ramp, so `videos/make-light-frames.ps1` takes the strongest
     step right of the fold. It reads 653 closed to 995 open, matching the frames by eye.
   - **Build it with:** `powershell -File videos/make-light-frames.ps1` (picks the frames, resizes them into
     `site/assets/hero/light-frames/`, measures each one into `light-frames/edges.json`), then
     `node videos/build-light-geom.js` (writes `rightsLight` into main.js). Don't edit those numbers by hand.
   - **Frames: 63, not 184 (2026-09-14, the user: "it is not smooth").** 184 frames of 1920x1080 is ~57 MB to fetch
     and about **1.5 GB of decoded bitmaps** — four times the dark set, so the browser was throwing frames away and
     decoding them again mid-scroll. Now: frames 0-131 only (the book is open and still by 131; the rest of the video
     is just a light crossing the pages), every second one, at the dark footage's 1280x720 — **63 frames, 12.8 MB,
     ~230 MB decoded**, under the dark set's 320 MB. The light take runs about twice as long as the dark one for the
     same movement, so every second frame lands near the dark set's 87. If it ever reads as steppy, set `$every = 1`
     in the PowerShell script and rebuild.
   - *Two things that cost time, worth not repeating:* System.Drawing's PNG encoder writes files ~7x larger than
     WPF's, and scaling through a WPF render surface leaves a pixel of rounding noise everywhere that PNG can't
     compress — decode straight to the target size instead (`DecodePixelWidth`).
   - **Switching theme keeps the book where it is (2026-09-14, the user: "if the Qur'an is closing in black and I
     change theme, the white Qur'an should be closing as well").** Both takes now run down a page of the same height
     on the same timeline, so the scroll position and the eased position carry straight over; the switch handler must
     not reset `pos` (it used to, which is what made the book jump to a different point in the opening), and it calls
     `waitToFinish` so an auto open/close the click interrupted picks up again. The old scroll-anchoring there is gone
     with it — it only existed because light used to be one screen tall.
   - **Not seen working end to end.** The geometry was checked number by number in the browser (book and page
     rectangles, no console errors, dark unchanged), but the preview pane stops painting and freezes
     `requestAnimationFrame` while the desktop window is minimised, so the light opening and the aayat on the ivory
     pages still want a look on a real screen.
7. **Audit and ship prep:** `web-design-guidelines` audit, MASTER.md checklist, responsive pass, frames → WebP.
   - *Early audit run 2026-09-14 at the user's request* ("where does my landing page stand against $10k sites"). Ahead:
     the opening, scrolling. On par: look and type, navigation, buttons, accessibility, contact. Behind: speed (25.5 MB of
     PNG frames in 87 requests), trust content (photo, qualifications, testimonials, price or free first lesson, which the
     plan puts on the lessons page), no fallback without JavaScript. Missing: search and sharing (title "Qur'an", no
     description, favicon or og:image, so WhatsApp shares are a bare link), launch basics (domain, privacy page, 404,
     analytics, the option panels still shipped). Guideline findings: no skip link (index.html:38), brand name needs
     translate="no" (:48), email input spellcheck="false" (:197), scroll bar hidden (styles.css:58), h1 without
     text-wrap: balance (:118), 11px labels (:152, :219), no safe-area padding on the fixed top bar (:261), no
     touch-action / tap highlight (:48). Suggested order: frames → name/icon/preview → connect links → lessons page with
     proof → remove panels → accessibility polish → still fallback → launch basics → real phones.
   - **Bugs found by the user (2026-09-14), to fix:** (1) **Keyboard:** pressing Tab from the top bar jumps straight to
     the ending's buttons, so the book animation is skipped. Fix: when focus lands in the ending from above, glide the
     page through the opening (the auto-scroll, fast) instead of jumping; arrow keys, Space and Page Down must still
     scrub it. (2) **Theme switch mid-page:** with the lock-in on, scrolled up so the whole black Qur'an shows, then
     switching theme leaves half the book showing. The hero changes height (light is one screen) but the scroll position
     stays. Fix: after the switch, keep the visitor on the same resting place (book or ending) and re-run the lock-in.
     (3) **Very bottom:** the ending ("Learn to read these pages…") shows above the footer; the user doesn't want that.
     (4) **Stuck:** moving between sections feels stuck; wants it smooth, with a slider.
   - **Built (2026-09-14), all four:** (1) `focusin` after a Tab that crosses the opening puts the page back and glides
     through the book at 3 screens/s (`TAB_SPEED`), ending with the ending filling the screen. (2) The theme switch keeps
     the ending's top where it was in the window (no lower than under a whole book; the very top stays the top), then runs
     the lock-in. (3) The footer is at least one screen tall. (4) The wait after scrolling stops is 100 ms (was 180), the
     page's own scrolling starts already moving (sine ease-out, not ease-in-out), and a wheel turned the way it's already
     going no longer stops it. TRYOUTS in **Ending**: **Wait before gliding** slider (0–400 ms), **Glide start** already
     moving / gently (before).
   - **The user is doing** the light-mode and real-phone testing themselves.
   - **First real-phone test, the user's feedback (2026-09-14):** the black Qur'an appeared with its cover upright and
     closed at a low frame rate, then all was smooth · the surah name sits under the book on the phone but on the left
     page on a computer · a hard swipe from the book carries past the open book straight to the ending; it should stop
     at each section and need another swipe · the gold star behind the ending looks small on the phone.
   - **Built (2026-09-14):** (1) *Loading.* All 87 frames were asked for at once, and the open book's frames are a third
     the size of the closed one's, so over wifi they arrived first and the book was drawn from the nearest that had:
     open, then upright, then closing in steps as nearer frames came in. `loadAll` now waits for the frame on screen
     before asking for the rest. Checked with a throttled copy of serve.js (~400 KB/s, a test script kept outside the
     project): before, f088 arrived at 0.9 s and f000 at 1.9 s; after, f000 is the only frame asked for until it
     arrives. (2) *Surah name:* on the page is now the phone default (styles.css); "Under the book" stays as a tryout.
     (3) *Section stops on touch screens* (`hover: none` and `pointer: coarse` only): CSS scroll snapping at the closed
     book, the open book (two `.snap` markers in `.hero`, the second where the book's screen stops being pinned), the
     ending and the footer's top, all `scroll-snap-stop: always`, so a hard swipe can't pass one. The footer is taller
     than the screen, so it scrolls freely inside. The browser does the stopping, so it feels like the phone's own
     scrolling and catches the swipe's momentum, which main.js's lock-in could only correct after it had run out. On
     those screens the half-open finish and the lock-in stand down (their options don't apply there), and snapping
     pauses (`.free-scroll`) while main.js glides the page itself (Tab through the opening). Computers are unchanged.
     Checked in Chromium at 375x812 with touch: one 1000 px scroll from the top stops at the open book (906 px), not
     the ending; stopping a quarter or three quarters into the opening settles on the closed or open book; the footer
     holds any position. **Not yet seen on a real phone.** TRYOUT **Swipe stops at each section:** yes / no (touch
     screens only, under Ending). (4) *Star:* on an upright phone it grows toward the share of the screen's height it
     has on a computer, up to 125% of the width (469 px on a 375 px phone, was 360): the outer ring runs past the sides
     and the star inside stays whole.
   - **Jolt when scrolling starts (the user, 2026-09-18: "a jolt, then the page starts to move ... the speed of scroll
     is different from the automatic").** Found with the Scroll check recording (the user is on **Firefox 156**): the
     browser's own wheel scrolling moved the page 408 px in about 117 ms (peak near 7,800 px/s), then the page stood
     still for the finish wait, then the automatic finish started at full speed (about 1,500 px/s): burst, stop, sudden
     restart. Nothing the page draws was involved, which is why the first changes did nothing: a spring for the book's
     glide, the float settling gently (atmosphere.js: real but small), a speed cap, and a first wheel takeover that was
     **reverted** because it stalled on whole-pixel scroll offsets and broke "Nearer end" / "Way you scrolled".
     **Built (2026-09-19):** the page takes the wheel over (`onWheel`, `stepWheel` in main.js): each notch adds to a
     target and the real scroll position glides to it with a spring, chasing no more than 0.6 of a screen ahead; the
     glide's position is kept in `wheelPos`, never read back from `scrollY`. The automatic finish carries on from the
     wheel glide's position and speed (a Hermite curve in `scrollToY`), is judged from where the wheel is heading
     (`settleEnding(at)`, `targetScroll(at)`), takes its direction from the wheel, and starts `finishWait` + 130 ms
     (`WHEEL_TAIL`, what the browser's own burst used to add) after the last notch. If the finish would have to turn the
     page round or stop it dead, the wheel glide arrives first and the finish runs from rest. Left to the browser: zoom
     and sideways wheels, boxes that scroll themselves, reduced motion, touch screens that snap. TRYOUTS in **Ending:**
     **Wheel scrolling** (Browser's own / Smooth, default Smooth) and **Wheel smoothness** (0.05 to 0.5 s, default 0.2);
     **Glide start** now defaults to Gently (the user's own pick in setting.txt). Also **Atmosphere → Book when
     scrolling starts** (Stops at once / Settles gently, default gently) and **Opening and aayat → Glide feel** (As
     before / Soft start). The **Scroll check** group at the top of the options panel (site/scroll-check.js, temporary)
     records one scroll frame by frame; delete it, its script line in index.html and `window.heroState` in main.js once
     the user is happy. The options panel's `backdrop-filter` blur was removed (it is redone every frame over the moving
     book). **Tests:** `node tools/scroll-sim/checks.js` runs the real main.js in a simulated page (43 checks, including
     600 random gestures that must end where the browser's own wheel ends; the worst one-frame speed change is 780 px/s,
     against over 7,500 for the browser's own); `tools/scroll-sim/trace.js` follows one gesture. Run it after ANY change
     to the scroll, finish or glide code. Not yet seen in a real browser by the user.
   - **Light book sways left and right while the cover swings (the user, 2026-09-19, with a screenshot).** The light take's
     measured right edge wobbles by up to 10 px before the cover passes upright, and the book is centred on it. Fix in
     main.js (`smoothedRights`, `lightFilm.smoothEdge`): the edge is taken as its running maximum, then averaged over 8
     frames each side, the window shrinking to nothing at both ends so the first and last frames stay exact. Backward
     steps of the centre: 12 to 0; jerk 2.5 to 1.0 px a frame. The fastest sideways step barely changes (9.8 to 9.1 px)
     because the cover's edge really does move that fast; if that still reads as sliding, centre less aggressively
     through the swing. The dark take is untouched. TRYOUT **Opening and aayat → Light book sway** (As before /
     Smoothed, default Smoothed). videos/build-light-geom.js rewrites `rightsLight` in main.js (74 frames on 2026-09-19);
     this doesn't depend on those numbers.
   WebP conversion needs a tool; do it after the PC is cleaned (e.g. `sharp` in Node), aiming for a few MB total.
   **Before launch, check the free Qaida is live.** The line under the headline promises it. If it isn't ready, change
   the line so visitors aren't sent looking for something that doesn't exist yet. The site name also needs adding.

**Questions to ask at the start of the relevant phase:** wordmark/site name · which aayat, translation or not ·
closing line and where the entry point links · light-mode hero approach.

**Answers so far (2026-09-13):** the site name isn't decided; the user is researching names and domains. Build phase 2
with a stand-in name that's easy to swap. The user doesn't know about websites and wants Claude to make design calls
using the skills, not ask. So whether there's an Arabic name, or a short line under the name, is decided with the skills
and shown as on-page buttons. Their only design reference is Apple's product pages, for the scroll animations.

**Skills by phase (the user's list):** 1 smoothing: `ponytail`, `agent-skills:review` · 2 wordmark, fonts, colours:
`ui-ux-pro-max`, `taste-skill:minimalist-skill` · 3 aayat: `ui-ux-pro-max`, `taste-skill:soft-skill` · 4 dust and
sway: `taste-skill:soft-skill`, `agent-skills:performance-optimization` · 5 closing line and button:
`taste-skill:minimalist-skill`, `ui-ux-pro-max` · 6 light mode: `ui-ux-pro-max` · 7 launch: `web-design-guidelines`,
`agent-skills:webperf`, `agent-skills:ship`. `ui-ux-pro-max`'s search script needs Python, so don't run it. Read
`references/` and the CSVs in `data/` directly instead.

---

## 8. Skills and plugins installed

**Project skills** (`.claude/skills/`, mirrored in `.agents/skills/`, sources in `skills-lock.json`):

| Skill | Use it for |
|---|---|
| `minimalist-ui` | **Main aesthetic guide** — matches "elegant, simple" |
| `high-end-visual-design` | Polish pass: spacing, typography, motion feel. Don't stack it with `design-taste-frontend` in the same step |
| `design-taste-frontend` | Alternative taste guide; avoid templated-looking output |
| `full-output-enforcement` | When writing complete files, to avoid placeholders |
| `web-design-guidelines` | Audit once a draft exists (phase 7) |
| `ui-ux-pro-max` | Design system — **already generated into `MASTER.md`**. Its search tool can't run right now (see below). Its `references/quick-reference.md` and `references/pro-rules.md` can still be read directly |
| `image-to-code`, `imagegen-frontend-web` | Not needed — the assets exist |

**User-level plugins:** `agent-skills` (useful: `frontend-ui-engineering`, `performance-optimization`, `review`),
`ponytail` (keep the code minimal, no dependencies), `taste-skill` (same family as the project skills),
`frontend-design`, `awesome-design-md`, `codeburn`, `graphify`, `claude-memory-compiler`, `claude-code-setup`.
The last five aren't needed for this build.

### `ui-ux-pro-max` — why the search tool doesn't work, and how to fix it

1. **No working Python.** The tool runs `scripts/search.py`, which needs Python 3. On this PC `python` resolves to
   the infected 3.11. **Do not run it** until the PC is cleaned and Python is reinstalled from python.org.
2. **Path variable.** Its SKILL.md calls
   `python "${CLAUDE_PLUGIN_ROOT}/.claude/skills/ui-ux-pro-max/scripts/search.py"`. `CLAUDE_PLUGIN_ROOT` is only set
   when it's installed as a **plugin**. As a project skill, use the direct path instead:
   `python ".claude/skills/ui-ux-pro-max/scripts/search.py" "<query>" --domain <domain>`.

**After the cleanup**, either use that direct path with a fresh Python, or reinstall it as a plugin from an
interactive `claude` terminal:

```
/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill
/plugin install ui-ux-pro-max@ui-ux-pro-max-skill
```
