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
   - **Before launch:** point both links at the real pages, and hide the Qaida button if the Qaida isn't live.
6. **Light mode.**
7. **Audit and ship prep:** `web-design-guidelines` audit, MASTER.md checklist, responsive pass, frames → WebP.
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
