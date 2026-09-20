# 03 — Storage

Everything the Qaida remembers lives under **one** `localStorage` key, `qaida`, with no accounts
(`shell.js:8`, and `qaida.md` §5). Lesson 2 adds to it; it changes nothing that is already there.

## 1. The shape today

`shell.js:132-136`:

```js
{ v: 1, script, names, grouping, chosen, muted,
  lessons: { "1": { seen: ["ا", "ب", …], done: false } } }
```

`seen` holds **glyphs, not positions**, folded through `keyOf` so ک ہ ی count as ك ه ي — a student who has seen
kaaf has seen kaaf, whichever form it was written in.

## 2. The extension

One new key, **nested** under the lesson:

```js
lessons: {
  "2": {
    seen: ["ا", "ب"],             // unchanged meaning: items shown at least once
    done: false,                  // unchanged meaning: the lesson called setDone
    drill: {
      total:  29,                 // required items in the pool; written by drill.start()
      target: 3,                  // right answers in a row that make an item known; written with `total`, so the
                                  //   home counts "known" the way the lesson does (added at build, 2026-09-19)
      right:  { "ا": 3, "ب": 1 }, // lifetime right answers, by item id
      wrong:  { "ب": 2 },         // lifetime wrong answers, by item id
      streak: { "ا": 2 }          // consecutive right since the last miss — the mastery test
    }
  }
}
```

**Nested rather than three siblings on the lesson**: one key to validate, one key to delete in `clearLesson`, and
it says plainly that those three maps belong to the engine rather than to the lesson. The cost is one extra level
of indirection on every read. That is the whole trade-off.

**`drill.total` matters more than it looks.** With it, the Qaida home can say "17 of 29 letters known" for *any*
drill lesson without knowing anything about that lesson's pool — see `04-page-and-design.md` §6. Without it,
`home.js` would need a hard-coded pool size per lesson, which is the thing being removed.

**The engine keeps `seen` up to date.** The first time an item is shown, call `shell.markSeen(lesson, glyph)`. That
keeps `seen` meaning exactly what it has always meant, and `home.js:116`'s "has anything been started at all" test
keeps working for lesson 2 for free.

## 3. `v` does **not** change

`v` is only ever tested for falsiness, to detect the pre-v1 flat `seen: [0, 1, 2]` (`shell.js:156`). Old data
simply has no `drill` and reads as an empty one. A browser still holding an older `shell.js` — a cached tab — that
reads newer data ignores `drill` entirely and loses nothing but mastery. Bumping `v` would buy nothing and break
that symmetry in both directions.

## 4. Widening `read()` — `shell.js:138-172`

The loop over `saved.lessons` (around `shell.js:164-172`) currently accepts any string in `seen` and nothing else.
It gains a validated `drill`. This is a trust boundary: the value comes out of `localStorage`, which another script
on the same origin, an old version of this one, or a corrupted profile can have written.

Requirements, all of them:

- **Build every map with `Object.create(null)`.** `JSON.parse` creates a genuine own `__proto__` property,
  `Object.entries` hands it back, and assigning it onto a `{}` literal hits the prototype setter instead of making
  a key. A null-prototype object makes that impossible and still serialises normally.
- **Key validation:** keep only `typeof id === 'string'` with `id.length >= 1 && id.length <= 24` (room for a word
  in a later lesson). Reject the literal `'__proto__'` as well, belt and braces.
- **Value validation:** `Number.isFinite(n) && n >= 0`; store `Math.min(Math.floor(n), 9999)`. Reject `NaN`,
  `Infinity`, negatives, strings, objects, arrays.
- **Size cap:** at most 400 keys per map, first 400 in iteration order — so a foreign or corrupted blob under the
  `qaida` key cannot grow storage without bound.
- **`total`:** `Number.isInteger(total) && total >= 0 && total <= 999`, else `0`.
- A `drill` that is **missing, null, an array, or not an object** becomes `{ total: 0, right: ø, wrong: ø,
  streak: ø }` — never `undefined`, so no caller anywhere has to guard.
- **While you are in there:** `seen`'s existing filter should gain the same two caps —
  `typeof g === 'string' && g.length <= 24`, array capped at 400. Same corruption surface, same three lines.

Shape of the replacement block:

```js
const counts = (raw) => {
  const out = Object.create(null);
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
  let kept = 0;
  for (const [id, n] of Object.entries(raw)) {
    if (kept >= 400) break;
    if (typeof id !== 'string' || id.length < 1 || id.length > 24 || id === '__proto__') continue;
    if (!Number.isFinite(n) || n < 0) continue;
    out[id] = Math.min(Math.floor(n), 9999);
    kept += 1;
  }
  return out;
};

const raw = value.drill && typeof value.drill === 'object' && !Array.isArray(value.drill) ? value.drill : {};
state.lessons[key] = {
  seen: [...new Set(seen)],
  done: value.done === true,
  drill: {
    total: Number.isInteger(raw.total) && raw.total >= 0 && raw.total <= 999 ? raw.total : 0,
    right: counts(raw.right),
    wrong: counts(raw.wrong),
    streak: counts(raw.streak),
  },
};
```

`save()` (`shell.js:176-182`) needs no change — it stringifies the whole state and is already try/caught, so a
private window that refuses storage still works for that visit.

## 5. New `shell` exports

Five thin functions, all saving through the existing `save()`:

```js
drillOf(n)                     // -> the frozen empty drill if nothing is saved; never creates
masteredCount(n, target)       // ids in drill.streak with value >= target (default: the drill's own stored target)
recordAnswer(n, id, right)     // right ? right[id]++, streak[id]++ : wrong[id]++, streak[id] = 0
                               //   saves, and returns the new streak
setDrillTotal(n, total, target) // by drill.start(), and again when the pool or the target changes
clearDrill(n)                  // wipes drill; keeps seen and done
```

Supporting edits in the same file:

| Line | Edit |
|---|---|
| `shell.js:187` | `NOTHING` gains a deep-frozen empty `drill`, so `lessonState(n).drill` is always safe to read |
| `shell.js:192` | `ownState` creates `drill` alongside `seen` |
| `shell.js:220` | `clearLesson` wipes `drill` as well as `seen` and `done` |
| `shell.js:427-464` | the five names join the export object |
| `shell.js:132` | the storage-shape comment gains `drill` |

**`isDone` needs no change.** `shell.js:230-233` already special-cases only lesson 1 and returns the stored flag for
everything else, which is exactly what Lesson 2 wants: it owns its own finishing rule and calls `setDone(2, true)`.

## 6. What "Start again" clears

The existing `.reset` link with its two-tap confirm (`qaida.js:164-173`) calls `shell.clearLesson(2)`, which now
clears `seen`, `done` **and** `drill` — all of the student's work on this lesson and nothing else. The home's
"Start again" clears every lesson the same way.

## 7. Privacy, unchanged

Still one key, still this device only, still no accounts, still nothing sent anywhere. A private window that
refuses storage works for that visit and forgets afterwards. Do not add a second key, a cookie, or any call out.
