# 02 — The alif after the mark

## 1. The characters

| | Code points | Drawn | Says |
|---|---|---|---|
| Lesson 4's item | ب **U+064E** | بَ | ba |
| **Lesson 8's item** | ب **U+064E** **U+0627** | **بَا** | **baa** |

The zabar sits on the letter, exactly as in Lesson 4. The alif (U+0627) comes after it and carries **nothing** —
no mark, in either script. That is how both a Madani and an Indo-Pak mushaf write a long aa with a full alif.

Two rules from `docs/lesson-4/02` carry over, one of them stretched:

- **Never paste a combining mark into a source file.** Still true, and U+064E is still composed with
  `String.fromCharCode`. **The alif is not a combining mark**, but compose it the same way anyway: the row's
  `tail` is a list of code points (`03` §1), because lessons 10 and 12's tails — a wow or yaa with a sukun on it —
  *do* contain one, and a field that is sometimes pasted and sometimes composed is a field someone gets wrong.
- **The item's id is the Madani letter plus what follows it**: `shell.keyOf(glyph)` + U+064E + U+0627, three
  characters. It can never collide with Lesson 4's بَ (two characters), which rides along in this lesson as the
  wrong answer. `03` §2.

**Names.** The shell already has the lesson's title: `{ fatha: 'Fatha and alif', zabar: 'Zabar and alif' }`. The
mark's names follow it: **"zabar and alif"** / **"fatha and alif"**, so an item reads **"Baa with zabar and
alif"**. Plain words, the way the user asked for on Lesson 7 ("two zabar or two fatha is good") — not "madd",
"alif maddah" or "huroof maddah". Both are text fields; `07` §4 asks how the teacher says it out loud.

## 2. Which letters: 27, not 29

**Alif and hamza are left out**, in both scripts.

- **Alif.** ا + zabar + ا is never written. A long aa at the start of a word is **آ** (alif with a wavy line above,
  U+0622) in ordinary Arabic, and an Indo-Pak mushaf typically writes it with a standing mark on the alif instead —
  both are signs this lesson does not teach (the first is the madd sign, the second is Lesson 9's). A tile reading
  اَا would teach a spelling the student will never see.
- **Hamza.** The Madani mushaf does write hamza, zabar and alif — ءَامَنُوا۟ is one of its commonest words — but
  an Indo-Pak mushaf writes the same word another way, with a sign from Lesson 9. The Qaida's rule is that
  "wherever the two scripts write something differently, the lesson shows the chosen script's version"
  (`QAIDA-CONTENT.md`, Decided). Keeping ءَا for Madani only would make the two scripts' tables different lengths
  (28 and 27). The credit would survive a switch — the ids fold to Madani either way — but the bar's total and the
  board would change under the student.

**Recommendation: 27 in both scripts**, and one line on the board saying why, so the gap is explained rather than
noticed: *"Alif and hamza are not here: a long aa after them is written with a different sign, which comes
later."* The teacher may prefer ءَا in Madani; `07` §2 lays out both, and it is one field (`skip`) either way.

The 27 are `shell.lettersOf()` minus `skip: ['ا', 'ء']`, in the script's own order.

## 3. How the alif joins

The alif joins **only to the letter before it**, never to the one after. So what the student sees depends on the
letter it follows — which is exactly what Lesson 3 taught:

| After | The alif | Letters | Example |
|---|---|---|---|
| a letter that joins forward | joins on, in its end shape; the letter takes its **start** shape | 22 of the 27 | بَا سَا عَا |
| a letter that never joins forward | **stands on its own**; the pair is two separate shapes | **د ذ ر ز و** — Lesson 3's first group, less the alif | دَا رَا وَا |
| laam | **the two become one shape**, لا | ل | لَا |

Two things follow for the page:

1. **This is the first mark lesson where a letter is not drawn alone.** Lessons 4–7 put every letter in its alone
   shape. Here 22 of 27 are in their start shape, which the student met in Lesson 3 and has not been asked to read
   with a mark on it. It is fine — the start shape carries the zabar in the same place — but it is new, and the
   board's joined example says so (`04` §4).
2. **The tiles get wider.** Two letters side by side, and the widest are the joining ones with a wide start shape
   — **سَا شَا صَا ضَا** — and the non-joiners, where there is a gap between the shapes. `03` §6.

`marks.js` holds the five non-joiners as a list (`NEVER_JOIN`), commented back to `docs/lesson-3/`; the mark
lessons do not load `shapes.js`, and one short list is cheaper than a second script tag.

## 4. لَا — the first lam-alif

On 2026-09-18 the user decided that **lam-alif is not taught as a letter of its own** — Lesson 1 has laam, and
the Indo-Pak list has no لا. That decision stands: it is not a letter. **But it arrives here anyway.** Every
Arabic font draws ل followed by ا as one joined shape (a required ligature), and a zabar between them does not
break it. Drawing them apart would need an invisible non-joiner (U+200C) and would be a misspelling — the one
thing a Qaida must never show.

So laam **stays in the table**, and:

- it is **not in part 1** (`03` §4) — the first six letters should show the alif doing its ordinary thing;
- in part 2 the board's joined example shows it beside بَا and دَا, with one line: *"After laam, the two join into
  one shape: لا."* (`04` §4);
- the drill treats it like any other item: **Laam with zabar and alif**, with لَ as its twin.

**Where the zabar goes on لَا is the font's decision.** Scheherazade New (the mark pages' Madani face since
2026-09-27) and Noto Naskh (the Indo-Pak stand-in) will not place it identically. It is on the browser checklist
(`06` §4), not assumed here.

## 5. What the two scripts do differently

**For the lesson itself, nothing in the code.** The same three code points in both; the Indo-Pak forms (کَا ہَا
یَا) come from `shell.lettersOf()` as they already do for every mark lesson, and their ids fold to ك ه ي. As with
Lesson 7, whatever difference the scripts have in how the alif and the zabar are *drawn* is the font's, and the
Indo-Pak face is still the Noto Naskh stand-in (a launch blocker, `QAIDA-CONTENT.md`).

**One known font fault is on this lesson's path.** The fourth round of 2026-09-27 found that Noto Naskh does not
join **ہ** properly *between* two letters (`QAIDA-BUILD.md`, "Fourth round"). Here ہ appears in its **start**
shape, joined to an alif — a position nothing has tested. It is on the checklist; the stop-gap is the same
(Settings → Indo-Pak lettering → Scheherazade New).

**Where the scripts really do differ is in the words**, and it is a spelling difference, not a font one: the
mushaf writes many long-aa words with a standing mark instead of an alif. `05` §4.

## 6. What the student hears

The recordings are of the **sound**, "baa" — never the letter's name — the rule `docs/lesson-4/02` §4 set. One new
recording group, `fatha-alif`, and `audio.js` builds it from `MARKS` on its own once the lesson is built: **27
rows** in `recordings.html` (after the `skip` fix, `03` §8 — without it, 29, two of them for spellings that are
never written).

**A thing the teacher may like, and should decide:** for twelve letters, the long sound *is* the letter's name as
a Qaida recites it — **Baa, Taa, Thaa, Ḥaa, Khaa, Raa, Zaa, Ṭaa, Ẓaa, Faa, Haa, Yaa**. A student who has said
"Baa" since Lesson 1 has been saying بَا all along. That is a good way into the lesson, and the board's feature row
(ب) could say it in a line. It is **not** a reason to reuse the letter-name recordings for this group: a name is
often recited with a catch at the end (*baa'*), and whether the two are the same clip is the teacher's call, not a
file-copying shortcut. `07` §6.
