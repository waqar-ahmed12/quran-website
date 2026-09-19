# 05 — Every line of wording

**The user's standing rule: every piece of wording Claude writes gets its own text field in the options panel.**
`qaida-options.js` generates the field automatically — tag the element and the field appears. So tagging is the
whole job, and an untagged string is a bug.

Two tags:

- `data-words="Label"` — the element's **own text** is editable.
- `data-words-attr="attribute|Label;attribute|Label"` — named **attributes** are editable, for strings the page's
  script reads and fills in.

Every string below is a **stand-in**. The teacher checks them all before launch.

## 1. Templates

`{placeholders}` are filled in by `lesson-2.js` with `replaceAll`, the way `qaida.js:141` already does.

| Element | Attribute | Text |
|---|---|---|
| `.ask` | `data-glyph` | `Which letter is this?` |
| `.ask` | `data-name` | `Which letter is {name}?` |
| `.ask` | `data-sound` | `Listen. Which letter is it?` |
| `.verdict` | `data-right` | `Right — {name}.` |
| `.verdict` | `data-wrong` | `That one is {chosen}. This is {name}.` |
| `.progress-text` | `data-template` | `{known} of {total} letters known` |
| `.progress-text` | `data-done` | `All {total} letters known` |
| `.tally` | `data-template` | `{asked} questions · {wrong} to fix` |
| `.sound-note` | `data-none` | `Hearing practice opens when the recordings are in.` |
| `.sound-note` | `data-some` | `{done} of {total} letters recorded.` |
| `.end-line` | `data-before` | `Keep going until these come without thinking.` |
| `.end-line` | `data-after` | `You seem to know these. Lesson 3 is ready when you are.` |
| `.reset` | `data-label` | `Start again` |
| `.reset` | `data-confirm` | `Tap again to clear` |
| `.next` | `data-standin` | `Lesson 3 isn’t built yet.` |

## 2. The two pieces of advice

These carry decision 1 from `01-what-it-teaches.md`, and they are the lines the user will read most carefully.
Keep them **plain, short, and never scolding** — the user teaches children and adults, and a beginner who feels
told off stops.

**Struggling with one letter** — raised by `on.struggling(item)`, one line, the most-missed letter only:

| Element | Attribute | Text |
|---|---|---|
| `.struggle` | `data-template` | `{name} keeps catching you out. It might be worth looking at it again.` |
| `.struggle .back-to-1` | `data-words` | `Look at it in Lesson 1` |
| `.struggle .trace` | `data-words` | `Trace it` |

**Ready to move on** — raised by `on.ready`:

| Element | Attribute | Text |
|---|---|---|
| `.ready-note` | `data-template` | `You seem to know these. Lesson 3 is ready when you are — or stay and keep practising.` |

The second half of that sentence matters: the drill stays open, and the student is told so. Nothing is taken away.

## 3. Plain `data-words`

Each of these is the element's own text.

| Element | Label |
|---|---|
| `.skip` | `Skip link` |
| `h1` | `Lesson title` |
| `.lede` | `Line under the title` |
| `.eyebrow` | `Above the title` |
| `.drill h2.sr-only` | `Heading read to screen readers` |
| `.after .hear` | `Hear it button` |
| `.after .trace` | `Trace it button` |
| `.after .next-question` | `Next question button` |
| `.onward .back` | `Back to the lessons button` |
| `.onward .next` | `Lesson 3 button` |

Plus every string copied in from `lesson-1.html` — the top bar, the tracer dialog and the chooser dialog all carry
their tags already. Copy them with the markup; don't strip them.

## 4. One more, genuinely new

The **confusables table** from `02-practice-engine.md` §6 is Claude's reading of letter *shapes*, and it changes
which wrong answers a student is offered. It gets a field like any other line — a hidden `<span>` that
`lesson-2.js` reads, one line, groups separated by commas:

```html
<span hidden data-words="Look-alike letters (groups, commas)">ب ت ث ن ي, ج ح خ ع غ, د ذ ر ز و, س ش ص ض, ط ظ, ف ق ك, ل ا, م ه, ء و</span>
```

Editing it must re-shuffle the current question's choices, so the teacher can see the effect immediately — the
`data-words-attr` path in `qaida-options.js` already calls `redraw()` for exactly this reason.

## 5. Wording rules carried over

- **Plain language.** The user teaches beginners of any age; `ui-ux-pro-max` lists "complex jargon" as the
  anti-pattern for this product type, and the step-1 design took that as binding.
- **The letters keep their Arabic names in both sets of mark names** — Baa, not Be (the user, 2026-09-18). Lesson 2
  reads them from `shell`, one list, one field. Do not add a second list.
- **No per-letter teaching text.** "Three dots, not two" is a teaching claim, and Claude does not write those
  without the teacher. Generic and correct beats specific and wrong.
- **Never tell the student they are wrong in the page's own voice.** State what the letter is. `That one is Baa.
  This is Taa.` does the whole job.
