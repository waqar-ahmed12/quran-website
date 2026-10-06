# Interim audit, 2026-10-06 (cloud session)

*Part of the step 13 audit, run early and read-only. Nothing was removed; the options panels stay until Lesson 29.*

Checked across `site/` against the Web Interface Guidelines (static scan, no real devices):

| Rule | Result |
|---|---|
| `transition: all`, `outline: none`, `user-scalable=no` / `maximum-scale` | none found |
| Images without `width` or `alt` | none found |
| Skip link, one `<h1>` (lessons 1, 16, 22, home, exercise 4) | present |
| `:focus-visible`, `touch-action: manipulation`, `prefers-reduced-motion` in `qaida.css` | present (13, 8 and 14 rules) |
| Radios and inputs without a label | none (they sit inside `<label>`) |
| Empty icon buttons without `aria-label`, clickable `<div>`/`<span>` | none found |

**Not checkable here, still the user's:** real phones, a screen reader, the 44px tap targets in Lesson 21 (39.4px at 375px), the Indo-Pak font licence.
**Not started, by design:** step 10 (needs the teacher's recordings), step 11 (points past Lesson 29), step 12 (polish once, after 29), and removal of the options panels and `recordings.html`.
