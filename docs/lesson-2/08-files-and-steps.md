# 08 — Files, build order, and the checklist

Line numbers are as of **2026-09-19**, commit `998bf4a` plus the Export row. **Check each anchor before you edit
it** — the surrounding code is what matters, not the number.

## 1. New files — three

| File | What |
|---|---|
| `site/qaida/practice.js` | the engine. No DOM, no storage. `02-practice-engine.md` |
| `site/qaida/lesson-2.js` | the pool, the confusables table, the board, `window.qaida` |
| `site/qaida/lesson-2.html` | the page. Built from `lesson-1.html`, `04-page-and-design.md` §1 |

## 2. Edited files

| File | Near line | Edit |
|---|---|---|
| `shell.js` | 101-102 | `LESSONS[0]` gains `progress: 'letters'` |
| `shell.js` | 103-104 | `LESSONS[1]` gains `href: 'lesson-2.html', built: true, progress: 'drill'` |
| `shell.js` | 132 | the storage-shape comment gains `drill` |
| `shell.js` | 164-172 | `read()` validates `drill` — `03-storage.md` §4 |
| `shell.js` | 187, 192, 220 | `NOTHING` gains a frozen `drill`; `ownState` creates it; `clearLesson` wipes it |
| `shell.js` | 244, 427 | the five new functions, defined and exported — `03-storage.md` §5 |
| `home.js` | 45 | `n === 1` becomes `entry.progress` — `04-page-and-design.md` §7 |
| `index.html` | 107-111 | `data-known` and its `data-words-attr` label |
| `qaida.js` | 175-183 | `.next` goes to `lesson-2.html` when done; drop the `data-standin` branch |
| `qaida.js` | 236 | `window.qaida` gains `kind: 'letters'` |
| `lesson-1.html` | 182-193 | drop `data-standin` and its `data-words-attr` entry |
| `qaida-options.js` | the lesson block | gate on `lesson.kind`, add the drill section — `07-options-panel.md` |
| `qaida.css` | 647, 681, 690 | add `.choice` to the three `--tile-*` selector lists |
| `qaida.css` | after 1830 | a new "Lesson 2 — the drill" block, seven classes |
| `qaida.css` | 1428 | four class names into the reduced-motion list |

**No edit at all:** `trace.js`, `audio.js`, `recordings.js`, `recordings.html`, `audio/manifest.json`. Lesson 2
wants **no new recordings** — it reuses `kind: 'letters'`, and one clip already serves both scripts because
`shell.keyOf` folds ک ہ ی onto ك ه ي. Worth saying out loud, because `QAIDA-BUILD.md` step 9 says each lesson adds
its rows to the recording list, and this one does not.

## 3. Records to update when the code exists

- `QAIDA-BUILD.md` — step 4's status, the step log, and the **Decisions** table
- `design-system/quran-landing/pages/qaida.md` — a new section for Lesson 2, the storage block in §5, the motion
  table, and §7's "Not built" list
- `QAIDA-CONTENT.md` — the interleaving question in "Still open" is answered (`01-what-it-teaches.md`, decision 2)

## 4. Build order

Each step ends with `node --check` on what it touched. Nothing is marked done until the user has previewed it.

1. **`shell.js`** — storage, validation, the five exports, the two `LESSONS` rows. Reload the *existing* pages
   first and check nothing broke: Lesson 1's progress, the home's cards, "Start again", the chooser.
2. **`practice.js`** — the engine alone. Exercise it from the console against a fake pool before there is a page:
   answer right, answer wrong, check a missed item does not come back next, check it comes back sooner than the
   rest, check `ready` fires once.
3. **`lesson-2.html`** — the copied shell only, with an empty `.drill`. Check the top bar, the theme, the chooser,
   the mute switch, the tracer dialog and the skip link all work before any drill logic exists.
4. **`lesson-2.js`** — the pool, the confusables table, the board, the three states.
5. **`qaida.css`** — the drill block, the three `--tile-*` selector lists, the reduced-motion list.
6. **`home.js` + `index.html` + `qaida.js` + `lesson-1.html`** — the card line, and Lesson 1's Next button finally
   going somewhere.
7. **`qaida-options.js`** — the `kind` gate and the drill section.
8. **The records** in §3.

`09-going-in-order.md` can be built with step 1 and step 6, or on its own. Ask the user which.

## 5. Checklist

**Checks you can run**

- [ ] `node --check` passes on `practice.js`, `lesson-2.js`, `shell.js`, `home.js`, `qaida.js`, `qaida-options.js`
- [ ] A script validates the pool: 29 items in both scripts, no repeated `id`, every `name` filled in, every item
      in exactly one confusables group
- [ ] `practice.js` contains no `document`, no `window.` except its own export, and no `localStorage`
- [ ] Every new string has a `data-words` or `data-words-attr` tag (`05-wording.md`)

**Checks the user makes in the browser** — they preview; do not drive a browser yourself

- [ ] A missed letter is **not** the next question, and does come back soon after
- [ ] A letter missed repeatedly raises the "look at it again" line, with both ways out working
- [ ] Getting enough right raises the "you seem ready" line, marks the lesson finished on the home, and **the
      drill keeps working**
- [ ] Switching script mid-drill keeps mastery (ك stays known as ک) and closes the tracing board
- [ ] Switching the names, the theme and the mute switch all still work from the drill page
- [ ] "Start again" takes two taps and clears mastery as well as progress
- [ ] Reload: mastery is still there; the panel's picks are not (expected — Export first)
- [ ] Keyboard only, end to end: skip link, Tab to a choice, Enter, Tab to Next — and focus is never yanked
- [ ] A screen reader announces right and wrong, and the bar reads "17 of 29 letters known"
- [ ] Reduced motion on: nothing animates
- [ ] A phone width and 1440: the 2×2 choices, the strip after a miss, tracing with a finger without the page
      scrolling under the hand
- [ ] Light and dark, both

## 6. Preview

```
node serve.js
```

then `http://localhost:8777/site/qaida/lesson-2.html`. The launch config is called "site". Never
`python -m http.server` — see `WEBSITE-BUILD.md` §0 and `README.md` in this folder.
