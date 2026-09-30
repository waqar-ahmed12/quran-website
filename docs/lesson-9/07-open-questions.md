# 07 — Open questions

Eight questions. **None blocks the build** — each has a recommendation, and the build can start on those the way
lessons 4–8 did. §1 is the one that matters most; §5 is the one a teacher is most likely to answer differently.

## 0. Build now, or after a look at lessons 7 and 8?

**Recommended: a look first — ten minutes, not a gate.** Lessons 7 and 8 were built on 2026-09-27 and neither has
been seen by the user. Lesson 9 is Lesson 7's shape (four parts, twins that change by part) with Lesson 8's wide
tile, and its hardest question — *ulta paish against paish at the tile's size* — is the question the user answered
"hard to tell apart" for Lesson 6 before the tile was enlarged. If the enlarged tile works for بٌ against بٍ on
Lesson 7, it very likely works here; if it doesn't, the fix is in `qaida.css` and it is better made once.

If the user says build, build: nothing in this plan depends on the answer, only the browser checklist does.

## 1. What does a Madani student see?

The two scripts write these marks with **different characters** (`02` §2), which no lesson has had to decide before.

| | What a Madani student sees | For | Against |
|---|---|---|---|
| **a. Their own mushaf's forms** | بَٰ بِۦ بُۥ — zabar with a small alif, zair with a small yaa, paish with a small waw | it is what their Qur'an prints; the lesson prepares them for it | a small yaa and waw on every letter of a table is more than the Madani mushaf ever shows (it writes them almost only on ه) |
| **b. The Indo-Pak marks, in both** | بٰ بٖ بٗ | one lesson, one picture | teaches a Madani student two marks their mushaf does not use |
| **c. Only what the Madani mushaf really uses** | khari zabar on every letter; the small yaa and waw on ه only | honest to the Madani mushaf | the lesson's shape and total change with the script |

**Recommendation: (a).** The table is a drill, as a printed Qaida's is; the "where you will meet it" line (`04` §4)
tells the student the small yaa and waw live on ه. It is one field (`forms`) per row, so (b) is deleting three lines.

## 2. The names

| | khari zabar | khari zair | ulta paish |
|---|---|---|---|
| zabar set (built) | khari zabar | khari zair | ulta paish |
| fatha set — **recommended** | standing fatha | standing kasra | inverted damma |
| fatha set — alternative | small alif | small yaa | small waw |

"Khari zabar" is what an Indo-Pak class says, and it passes the user's plain-names rule (it is not grammar). The
fatha set has no one name in use: the literal translation keeps the pairing with the zabar set; "small alif" is what
a Madani teacher often says and what a Madani page draws, but names the *shape*, not what it does. **Which would the
teacher say?**

## 3. The same-sound tile

**Recommended: show it** — بٰ = بَا on part 1's feature row, never among the answers (`01` §3). Two questions:

- Is **"the same sound"** the right way to say it, or does the teacher say "it is read like an alif"?
- Should it also appear on part 4, on every khari zabar row? Recommendation: no — once is the lesson, every row is
  clutter.

## 4. The words, and where they come from

Fifteen words (`05`), **checked against the mushaf in both scripts before they ship** — stricter than Lesson 8,
because this lesson's spelling *is* the mushaf's (`05` §1). `05` §4 lists the four Claude is least sure of.

**Should the page say these are the Qur'an's spellings?** Recommendation: **one line on the exercise page** —
*"These words are written the way the Qur'an writes them."* — and no surah or ayah. Lesson 8 said nothing, rightly;
this lesson has the opposite reason.

## 5. Where the marks really appear

`02` §5: khari zabar is everywhere; khari zair and ulta paish are almost only on ه, meaning "him" or "it". This is
Claude's reading. **Is it how the teacher explains it?** And is "almost only on ه" too strong — are there words a
beginner meets early where they sit on another letter (دَاوٗدَ is the one in the list)?

## 6. The recordings — fewer than it looks

- **Khari zabar needs none.** Its sound is Lesson 8's "baa, taa, thaa…", 27 clips already listed; this lesson plays
  the same ones.
- **Khari zair and ulta paish need 27 each** — "bii" and "buu". Lessons 13 and 11 teach the same sounds with a yaa
  and a wow, and **reuse these clips**. So this is the only time they are recorded.

**The request, unchanged from Lesson 8**: if the teacher records anything soon, Lesson 4's "ba" and Lesson 8's "baa",
together (56 clips), switch on the by-ear question for **two** lessons at once.

## 7. Hamza and alif

**Recommended: 27, no ا and no ء** (`02` §4), the same as Lesson 8. One field, `skip`.

## 8. Carried over, still unanswered

From `docs/lesson-4/09` to `docs/lesson-8/07`, each applies here unchanged:

- **Recording order** — letter by letter ("ba, baa, bii, buu") or group by group.
- **How much earlier material rides along** — the plain-letter slider is at 0 (the user, 2026-09-20).
- **The Indo-Pak font** — Noto Naskh is a stand-in and draws ہ broken between letters, and ہ is where khari zair
  and ulta paish live. A licensed Indo-Pak face is step 13's, and a launch blocker.
- **How long a mark lesson should take** (the merge note, 2026-09-27) — Lesson 2 asks every letter twice and is
  done; lessons 3–9 keep asking until enough are known.
